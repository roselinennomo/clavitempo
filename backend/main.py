import hashlib
import hmac
import json
import os
import re
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator

import bcrypt
from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend.curriculum import CATEGORIES, LEVEL_NAMES, build_lessons
from backend.learning_resources import (
    categories_with_references,
    lesson_with_references,
)


ROOT = Path(__file__).resolve().parents[1]
DATABASE_PATH = Path(os.environ.get("DB_PATH", ROOT / "data" / "tempo.sqlite"))
FRONTEND_DIST = Path(os.environ.get("FRONTEND_DIST", ROOT / "frontend" / "dist"))
MEDIA_DIRECTORY = ROOT / "public" / "media"
SESSION_SECRET = os.environ.get("SESSION_SECRET", "tempo-local-dev-change-me")
COURSE = {
    "id": "tempo-foundations",
    "title": "Le cursus ClaviTempo",
    "description": "Un parcours progressif qui associe piano, solfège, histoire, styles, technique, écoute et création.",
}
LESSONS = build_lessons()
LESSON_BY_ID = {lesson["id"]: lesson for lesson in LESSONS}

app = FastAPI(title="ClaviTempo API", version="2.0.0")


class RegisterPayload(BaseModel):
    name: str
    email: str
    password: str


class LoginPayload(BaseModel):
    email: str
    password: str


class StepPayload(BaseModel):
    lessonId: str
    stepId: str


class CompletePayload(BaseModel):
    score: int | None = None


class AssessmentPayload(BaseModel):
    answers: list[str]


@contextmanager
def database() -> Iterator[sqlite3.Connection]:
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def init_database() -> None:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    with database() as connection:
        connection.execute("PRAGMA journal_mode = WAL")
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                display_name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS lesson_progress (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                lesson_id TEXT NOT NULL,
                score INTEGER NOT NULL,
                completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, lesson_id)
            );
            CREATE TABLE IF NOT EXISTS courses (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS course_lessons (
                id TEXT PRIMARY KEY,
                course_id TEXT NOT NULL REFERENCES courses(id),
                sequence INTEGER NOT NULL,
                title TEXT NOT NULL,
                level INTEGER NOT NULL,
                prerequisites_json TEXT NOT NULL,
                content_json TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS lesson_steps (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                lesson_id TEXT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
                step_id TEXT NOT NULL,
                completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, lesson_id, step_id)
            );
            CREATE TABLE IF NOT EXISTS assessment_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                lesson_id TEXT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
                score INTEGER NOT NULL,
                answers_json TEXT NOT NULL,
                attempted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        connection.execute(
            """
            INSERT INTO courses (id, title, description) VALUES (?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                description = excluded.description
            """,
            (COURSE["id"], COURSE["title"], COURSE["description"]),
        )
        for lesson in LESSONS:
            lesson = dict(lesson)
            lesson["video"] = dict(lesson["video"])
            connection.execute(
                """
                INSERT INTO course_lessons
                    (id, course_id, sequence, title, level, prerequisites_json, content_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    course_id = excluded.course_id,
                    sequence = excluded.sequence,
                    title = excluded.title,
                    level = excluded.level,
                    prerequisites_json = excluded.prerequisites_json,
                    content_json = excluded.content_json
                """,
                (
                    lesson["id"],
                    COURSE["id"],
                    lesson["sequence"],
                    lesson["title"],
                    lesson["level"],
                    json.dumps(lesson.get("requires", []), ensure_ascii=False),
                    json.dumps(lesson, ensure_ascii=False),
                ),
            )


def sign_user_id(user_id: int) -> str:
    return hmac.new(SESSION_SECRET.encode(), str(user_id).encode(), hashlib.sha256).hexdigest()


def set_session(response: Response, user_id: int) -> None:
    response.set_cookie(
        "tempo_session",
        f"{user_id}.{sign_user_id(user_id)}",
        httponly=True,
        samesite="lax",
        secure=os.environ.get("HTTPS", "").lower() == "true",
        max_age=14 * 24 * 60 * 60,
        path="/",
    )


def require_user(request: Request) -> dict[str, Any]:
    token = request.cookies.get("tempo_session", "")
    user_id_text, separator, signature = token.partition(".")
    if not separator or not user_id_text.isdigit() or not hmac.compare_digest(
        signature, sign_user_id(int(user_id_text))
    ):
        raise HTTPException(status_code=401, detail="Connecte-toi pour continuer.")
    with database() as connection:
        user = connection.execute(
            "SELECT id, email, display_name FROM users WHERE id = ?",
            (int(user_id_text),),
        ).fetchone()
    if user is None:
        raise HTTPException(status_code=401, detail="Connecte-toi pour continuer.")
    return dict(user)


def parse_byte_range(range_header: str, file_size: int) -> tuple[int, int] | None:
    unit, separator, value = range_header.partition("=")
    if separator != "=" or unit != "bytes" or "," in value:
        return None
    start_text, separator, end_text = value.partition("-")
    if separator != "-":
        return None

    try:
        if start_text:
            start = int(start_text)
            end = int(end_text) if end_text else file_size - 1
        else:
            suffix_length = int(end_text)
            if suffix_length <= 0:
                return None
            start = max(0, file_size - suffix_length)
            end = file_size - 1
    except ValueError:
        return None

    if start < 0 or start >= file_size or end < start:
        return None
    return start, min(end, file_size - 1)


def stream_file(path: Path, start: int, end: int, chunk_size: int = 1024 * 1024):
    with path.open("rb") as media_file:
        media_file.seek(start)
        remaining = end - start + 1
        while remaining > 0:
            chunk = media_file.read(min(chunk_size, remaining))
            if not chunk:
                break
            remaining -= len(chunk)
            yield chunk


@app.get("/media/{lesson_id}.mp4")
def course_video(
    lesson_id: str,
    request: Request,
    user: dict[str, Any] = Depends(require_user),
) -> Response:
    del user
    if lesson_id not in LESSON_BY_ID:
        raise HTTPException(status_code=404, detail="Cette capsule vidéo n’existe pas.")
    path = MEDIA_DIRECTORY / f"{lesson_id}.mp4"
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Cette capsule vidéo n’est pas disponible.")

    file_size = path.stat().st_size
    common_headers = {
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
    }
    range_header = request.headers.get("range")
    if range_header is None:
        return StreamingResponse(
            stream_file(path, 0, file_size - 1),
            media_type="video/mp4",
            headers={**common_headers, "Content-Length": str(file_size)},
        )

    byte_range = parse_byte_range(range_header, file_size)
    if byte_range is None:
        return Response(
            status_code=416,
            headers={**common_headers, "Content-Range": f"bytes */{file_size}"},
        )

    start, end = byte_range
    return StreamingResponse(
        stream_file(path, start, end),
        status_code=206,
        media_type="video/mp4",
        headers={
            **common_headers,
            "Content-Length": str(end - start + 1),
            "Content-Range": f"bytes {start}-{end}/{file_size}",
        },
    )


def user_progress(user_id: int) -> list[dict[str, Any]]:
    with database() as connection:
        rows = connection.execute(
            """
            SELECT lesson_id AS lessonId, score, completed_at AS completedAt
            FROM lesson_progress WHERE user_id = ? ORDER BY completed_at
            """,
            (user_id,),
        ).fetchall()
    return [dict(row) for row in rows]


def user_lesson_steps(user_id: int) -> dict[str, list[str]]:
    with database() as connection:
        rows = connection.execute(
            "SELECT lesson_id AS lessonId, step_id AS stepId FROM lesson_steps WHERE user_id = ?",
            (user_id,),
        ).fetchall()
    steps: dict[str, list[str]] = {}
    for row in rows:
        steps.setdefault(row["lessonId"], []).append(row["stepId"])
    return steps


def user_assessments(user_id: int) -> list[dict[str, Any]]:
    with database() as connection:
        rows = connection.execute(
            """
            SELECT lesson_id AS lessonId, score, attempted_at AS attemptedAt
            FROM assessment_attempts WHERE user_id = ? ORDER BY attempted_at DESC
            """,
            (user_id,),
        ).fetchall()
    return [dict(row) for row in rows]


def complete_lesson(
    user_id: int,
    lesson_id: str,
    score: int | None = None,
    extra: dict[str, Any] | None = None,
) -> dict[str, Any]:
    lesson = LESSON_BY_ID.get(lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Cette leçon n’existe pas.")
    steps = user_lesson_steps(user_id).get(lesson_id, [])
    if any(step not in steps for step in ("reading", "video", "practice")):
        raise HTTPException(
            status_code=409,
            detail="Lis le cours, regarde la capsule et termine la pratique avant de valider.",
        )
    is_evaluation = lesson["category"] == "evaluation"
    if is_evaluation and (score is None or score < 70 or score > 100):
        raise HTTPException(status_code=400, detail="Le bilan demande au moins 70 % de réussite.")
    recorded_score = score if is_evaluation else 100
    with database() as connection:
        connection.execute(
            """
            INSERT INTO lesson_progress (user_id, lesson_id, score)
            VALUES (?, ?, ?)
            ON CONFLICT (user_id, lesson_id) DO UPDATE SET
                score = MAX(lesson_progress.score, excluded.score),
                completed_at = CURRENT_TIMESTAMP
            """,
            (user_id, lesson_id, recorded_score),
        )
    return {
        "progress": user_progress(user_id),
        "lessonSteps": user_lesson_steps(user_id),
        **(extra or {}),
    }


@app.exception_handler(HTTPException)
async def handle_http_error(request: Request, exc: HTTPException) -> JSONResponse:
    del request
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail}, headers=exc.headers)


@app.on_event("startup")
def startup() -> None:
    init_database()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/register", status_code=201)
def register(payload: RegisterPayload, response: Response) -> dict[str, Any]:
    name = payload.name.strip()
    email = payload.email.strip().lower()
    password = payload.password
    if len(name) < 2 or len(name) > 40:
        raise HTTPException(status_code=400, detail="Ton prénom doit contenir entre 2 et 40 caractères.")
    if len(email) > 254 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        raise HTTPException(status_code=400, detail="Saisis une adresse e-mail valide.")
    if len(password) < 10 or len(password.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Choisis un mot de passe de 10 caractères minimum.")
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=10)).decode()
    try:
        with database() as connection:
            cursor = connection.execute(
                "INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)",
                (email, name, password_hash),
            )
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError as exc:
        if "UNIQUE" in str(exc):
            raise HTTPException(status_code=409, detail="Cette adresse e-mail possède déjà un compte.") from exc
        raise
    if user_id is None:
        raise RuntimeError("SQLite did not return the registered account id.")
    set_session(response, user_id)
    return {
        "user": {"id": user_id, "email": email, "displayName": name},
        "progress": [],
        "lessonSteps": {},
        "assessments": [],
    }


@app.post("/api/login")
def login(payload: LoginPayload, response: Response) -> dict[str, Any]:
    email = payload.email.strip().lower()
    with database() as connection:
        user = connection.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if user is None:
        raise HTTPException(status_code=401, detail="E-mail ou mot de passe incorrect.")
    try:
        password_matches = bcrypt.checkpw(payload.password.encode(), user["password_hash"].encode())
    except ValueError:
        password_matches = False
    if not password_matches:
        raise HTTPException(status_code=401, detail="E-mail ou mot de passe incorrect.")
    set_session(response, user["id"])
    return {
        "user": {"id": user["id"], "email": user["email"], "displayName": user["display_name"]},
        "progress": user_progress(user["id"]),
        "lessonSteps": user_lesson_steps(user["id"]),
        "assessments": user_assessments(user["id"]),
    }


@app.post("/api/logout", status_code=204)
def logout(response: Response) -> Response:
    response.delete_cookie("tempo_session", httponly=True, samesite="lax", path="/")
    response.status_code = 204
    return response


@app.get("/api/me")
def me(user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    return {
        "user": {
            "id": user["id"],
            "email": user["email"],
            "displayName": user["display_name"],
        },
        "progress": user_progress(user["id"]),
        "lessonSteps": user_lesson_steps(user["id"]),
        "assessments": user_assessments(user["id"]),
    }


@app.get("/api/v1/courses")
def list_courses() -> dict[str, Any]:
    with database() as connection:
        rows = connection.execute(
            """
            SELECT c.id, c.title, c.description, COUNT(l.id) AS lessonCount
            FROM courses c LEFT JOIN course_lessons l ON l.course_id = c.id
            GROUP BY c.id ORDER BY c.created_at
            """
        ).fetchall()
    return {"courses": [dict(row) for row in rows]}


@app.get("/api/v1/courses/{course_id}")
def get_course(course_id: str) -> dict[str, Any]:
    if course_id != COURSE["id"]:
        raise HTTPException(status_code=404, detail="Ce parcours n’existe pas.")
    with database() as connection:
        lessons = connection.execute(
            "SELECT content_json FROM course_lessons WHERE course_id = ? ORDER BY sequence",
            (course_id,),
        ).fetchall()
    return {
        "course": COURSE,
        "lessons": [lesson_with_references(json.loads(row["content_json"])) for row in lessons],
        "categories": categories_with_references(CATEGORIES),
        "levels": [{"id": level, "title": title} for level, title in LEVEL_NAMES.items()],
    }


@app.get("/api/v1/lessons")
def list_lessons(category: str | None = None) -> dict[str, Any]:
    with database() as connection:
        rows = connection.execute(
            "SELECT content_json FROM course_lessons WHERE course_id = ? ORDER BY sequence",
            (COURSE["id"],),
        ).fetchall()
    lessons = [lesson_with_references(json.loads(row["content_json"])) for row in rows]
    if category:
        lessons = [lesson for lesson in lessons if lesson["category"] == category]
    return {"lessons": lessons}


@app.get("/api/v1/lessons/{lesson_id}")
def get_lesson(lesson_id: str) -> dict[str, Any]:
    with database() as connection:
        row = connection.execute(
            "SELECT content_json FROM course_lessons WHERE id = ?",
            (lesson_id,),
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Cette leçon n’existe pas.")
    return {"lesson": lesson_with_references(json.loads(row["content_json"]))}


@app.get("/api/v1/progress")
def get_progress(user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    return {
        "completed": user_progress(user["id"]),
        "lessonSteps": user_lesson_steps(user["id"]),
        "assessments": user_assessments(user["id"]),
    }


@app.post("/api/v1/progress/steps")
def save_step(payload: StepPayload, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    lesson = LESSON_BY_ID.get(payload.lessonId)
    if lesson is None or payload.stepId not in {"reading", "video", "practice"}:
        raise HTTPException(status_code=400, detail="Cette étape de cours n’est pas valide.")
    with database() as connection:
        connection.execute(
            "INSERT OR IGNORE INTO lesson_steps (user_id, lesson_id, step_id) VALUES (?, ?, ?)",
            (user["id"], payload.lessonId, payload.stepId),
        )
    return {"lessonSteps": user_lesson_steps(user["id"])}


@app.post("/api/v1/progress/lessons/{lesson_id}/complete")
def complete(lesson_id: str, payload: CompletePayload, user: dict[str, Any] = Depends(require_user)) -> dict[str, Any]:
    return complete_lesson(user["id"], lesson_id, payload.score)


@app.post("/api/v1/assessments/{lesson_id}/attempt")
def submit_assessment(
    lesson_id: str,
    payload: AssessmentPayload,
    user: dict[str, Any] = Depends(require_user),
) -> dict[str, Any]:
    lesson = LESSON_BY_ID.get(lesson_id)
    if lesson is None or lesson["category"] != "evaluation":
        raise HTTPException(status_code=404, detail="Cette évaluation n’existe pas.")
    steps = user_lesson_steps(user["id"]).get(lesson_id, [])
    if any(step not in steps for step in ("reading", "video", "practice")):
        raise HTTPException(status_code=409, detail="Termine les étapes du cours avant le bilan.")
    questions = lesson.get("questions", [])
    if len(payload.answers) != len(questions) or any(
        answer not in question["choices"] for answer, question in zip(payload.answers, questions)
    ):
        raise HTTPException(status_code=400, detail="Réponds à toutes les questions du bilan.")
    score = round(
        sum(answer == question["answer"] for answer, question in zip(payload.answers, questions))
        / len(questions)
        * 100
    )
    with database() as connection:
        connection.execute(
            """
            INSERT INTO assessment_attempts (user_id, lesson_id, score, answers_json)
            VALUES (?, ?, ?, ?)
            """,
            (user["id"], lesson_id, score, json.dumps(payload.answers, ensure_ascii=False)),
        )
    if score >= 70:
        return complete_lesson(
            user["id"],
            lesson_id,
            score,
            {"score": score, "passed": True, "assessments": user_assessments(user["id"])},
        )
    return {"score": score, "passed": False, "assessments": user_assessments(user["id"])}


@app.get("/api/curriculum")
def legacy_curriculum() -> dict[str, Any]:
    return {
        "lessons": [lesson_with_references(lesson) for lesson in LESSONS],
        "categories": categories_with_references(CATEGORIES),
    }


@app.post("/api/complete")
def legacy_complete(
    payload: dict[str, Any],
    user: dict[str, Any] = Depends(require_user),
) -> dict[str, Any]:
    return complete_lesson(user["id"], str(payload.get("lessonId", "")), payload.get("score"))


if not FRONTEND_DIST.is_dir():
    raise RuntimeError(f"Built React frontend not found: {FRONTEND_DIST}")
app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")

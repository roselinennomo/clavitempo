import asyncio
import tempfile
import unittest
from pathlib import Path

from fastapi import HTTPException, Request

from backend import main


def request_with_headers(headers: dict[str, str] | None = None) -> Request:
    return Request(
        {
            "type": "http",
            "http_version": "1.1",
            "method": "GET",
            "scheme": "http",
            "path": "/media/solfege-1.mp4",
            "raw_path": b"/media/solfege-1.mp4",
            "query_string": b"",
            "headers": [
                (key.lower().encode(), value.encode())
                for key, value in (headers or {}).items()
            ],
            "server": ("testserver", 80),
            "client": ("testclient", 50000),
        }
    )


async def response_body(response) -> bytes:
    return b"".join([chunk async for chunk in response.body_iterator])


class VideoStreamTests(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        root = Path(self.temporary_directory.name)
        self.previous_database_path = main.DATABASE_PATH
        self.previous_media_directory = main.MEDIA_DIRECTORY
        main.DATABASE_PATH = root / "test.sqlite"
        main.MEDIA_DIRECTORY = root / "media"
        main.MEDIA_DIRECTORY.mkdir()
        (main.MEDIA_DIRECTORY / "solfege-1.mp4").write_bytes(b"0123456789")

    def create_user(self) -> dict[str, int]:
        main.init_database()
        with main.database() as connection:
            cursor = connection.execute(
                "INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)",
                ("student@example.test", "Student", "test-hash"),
            )
        return {"id": cursor.lastrowid}

    def tearDown(self):
        main.DATABASE_PATH = self.previous_database_path
        main.MEDIA_DIRECTORY = self.previous_media_directory
        self.temporary_directory.cleanup()

    def test_video_requires_an_authenticated_account(self):
        with self.assertRaises(HTTPException) as raised:
            main.require_user(request_with_headers())
        self.assertEqual(raised.exception.status_code, 401)

    def test_video_range_supports_suffixes_and_rejects_unsatisfiable_requests(self):
        response = main.course_video(
            "solfege-1",
            request_with_headers({"range": "bytes=-3"}),
            user={"id": 1},
        )
        self.assertEqual(response.status_code, 206)
        self.assertEqual(asyncio.run(response_body(response)), b"789")

        response = main.course_video(
            "solfege-1",
            request_with_headers({"range": "bytes=10-"}),
            user={"id": 1},
        )
        self.assertEqual(response.status_code, 416)

    def test_authenticated_video_supports_byte_range_requests(self):
        response = main.course_video(
            "solfege-1",
            request_with_headers({"range": "bytes=2-5"}),
            user={"id": 1},
        )
        self.assertEqual(response.status_code, 206)
        self.assertEqual(asyncio.run(response_body(response)), b"2345")
        self.assertEqual(response.headers["content-range"], "bytes 2-5/10")
        self.assertEqual(response.headers["accept-ranges"], "bytes")
        self.assertEqual(response.headers["content-disposition"], "inline")

    def test_unknown_video_returns_not_found_after_authentication(self):
        with self.assertRaises(HTTPException) as raised:
            main.course_video(
                "not-a-lesson",
                request_with_headers(),
                user={"id": 1},
            )
        self.assertEqual(raised.exception.status_code, 404)

    def test_lesson_can_be_completed_before_its_recommended_prerequisites(self):
        user = self.create_user()
        for step_id in ("reading", "video", "practice"):
            main.save_step(main.StepPayload(lessonId="history-1", stepId=step_id), user)

        result = main.complete("history-1", main.CompletePayload(), user)

        self.assertIn("history-1", {item["lessonId"] for item in result["progress"]})

    def test_assessment_can_be_taken_before_recommended_prerequisites(self):
        user = self.create_user()
        lesson = main.LESSON_BY_ID["evaluation-1"]
        for step_id in ("reading", "video", "practice"):
            main.save_step(main.StepPayload(lessonId="evaluation-1", stepId=step_id), user)
        answers = [question["answer"] for question in lesson["questions"]]

        result = main.submit_assessment(
            "evaluation-1",
            main.AssessmentPayload(answers=answers),
            user,
        )

        self.assertTrue(result["passed"])
        self.assertEqual(result["score"], 100)


if __name__ == "__main__":
    unittest.main()

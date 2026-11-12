# Claude Code handoff

This file is the quick-start guide for continuing ClaviTempo if another coding assistant or session is used.

## Product and stack

ClaviTempo is a French piano-learning platform with a 40-lesson, six-level curriculum. The application is a React/Vite frontend served by a FastAPI backend. SQLite stores accounts and per-user lesson progress; Docker Compose runs the application on port 3000.

## Start and verify

From the project root:

```sh
docker compose up --build -d
```

Open `http://localhost:3000`. To stop the service without removing user data, run `docker compose down`. **Never use `docker compose down -v`** unless the user explicitly asks to erase all accounts and progress; the named `tempo_data` volume is persistent.

Useful focused checks:

```sh
npm run build --prefix frontend
docker compose exec -T tempo python -m unittest backend.tests.test_video_stream
cd video && PYTHONPATH=.. .venv/bin/python -m unittest tests.test_video_content
```

Check `GET /api/health` after deployment. The API and authenticated video stream share the same origin; video responses support byte ranges for seeking.

## Source map

- `frontend/src/App.jsx`: application shell, authentication UI, navigation, lesson modal, reusable video controls, and playlist.
- `public/styles.css`: frontend styles, including responsive video and playlist layouts.
- `backend/curriculum.py`: ordered lesson content, objectives, recommendations, illustrations, takeaways, and exported narration sections.
- `backend/learning_resources.py`: optional external references shown alongside lessons.
- `backend/main.py`: FastAPI endpoints, SQLite schema, authentication, lesson progress, assessments, and protected MP4 streaming.
- `public/images/instruments/`: locally served instrument photographs with source and credit metadata in the curriculum.
- `public/media/*.mp4`: generated lesson videos served by the API; do not hand-edit these binaries.
- `video/lesson-video.jsx`, `video/generate_audio.py`, and `video/render.mjs`: Remotion composition, Kokoro narration, and FFmpeg packaging. See `video/README.md` for prerequisites and generation commands.
- `docs/architecture.md`: data flow, persistence, curriculum conventions, and media pipeline.

## Product invariants

- All lessons remain accessible. `requires` describes the suggested learning order; do not restore prerequisite-based locks in the API or interface.
- Lesson completion still requires that learner to complete the reading, video, and practice steps for that lesson. Evaluations are scored by the backend.
- Keep all generated course videos local. The UI suppresses ordinary download controls, while authenticated byte-range streaming enables playback and seeking.
- Video volume and speed are available in lessons and the playlist. The “apply to all” choice synchronizes the current values across videos; when disabled, settings are independently held per lesson for the current app session.
- Playlist autoplay waits five seconds after a video ends and must remain cancelable; if the browser blocks autoplay, expose a clear way to resume manually.
- Preserve the existing SQLite volume and do not commit secrets. Set a strong `SESSION_SECRET` and HTTPS settings before exposing the app publicly.
- Update this handoff and `README.md` when architecture, commands, deployment, or user-facing behavior changes.

For detailed architecture, see `docs/architecture.md`. For generating the MP4 library, see `video/README.md`.

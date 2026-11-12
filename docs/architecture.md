# ClaviTempo architecture

## Runtime

Docker Compose exposes one FastAPI service on port `3000`. FastAPI serves the built Vite application, JSON endpoints, local instrument images, and authenticated MP4 responses. The SQLite database is stored at `/app/data/tempo.sqlite` in the Compose volume `tempo_data`; rebuilding the image does not replace that volume.

The browser uses same-origin requests and an HTTP-only `tempo_session` cookie. User passwords are bcrypt-hashed. Lesson progress, steps, and assessment attempts are associated with the authenticated user. Video requests accept HTTP byte ranges so the player can seek without downloading a whole file first.

## Curriculum and progress

`backend/curriculum.py` is the canonical source for the ordered 40-lesson curriculum. Lesson payloads include content blocks, optional image metadata, `requires` recommendations, practice data, assessment questions, and generated video sections. `backend/main.py` exports these lessons into SQLite at startup.

The suggested sequence is not an access-control mechanism: any lesson can be opened at any time. Completing a lesson still requires its own reading, video, and practice steps. The API validates assessment answers and scores independently of the frontend.

`backend/learning_resources.py` provides optional external study references. Instrument images are served locally from `public/images/instruments/`, with captions, credits, and collection links embedded in the lesson data.

## Frontend

`frontend/src/App.jsx` owns authentication state, API calls, navigation, the course modal, the video player controls, and the playlist. Playback preferences are held at the app level: with “Appliquer ces réglages à toutes les vidéos” enabled, volume and speed changes affect every video; when disabled, values are maintained per lesson for that app session.

The playlist is filtered by lesson category (for example, Solfège or Piano), so each queue contains only that subject's videos in curriculum order. It supports direct selection and manual previous/next navigation and starts a five-second visible countdown when a video ends. Changing the subject resets the queue to that subject's first video and cancels any pending countdown. Canceling the countdown leaves the current video ended; the next video only starts after the countdown completes. If browser autoplay is denied, the player reports that and allows manual playback.

`public/styles.css` contains the responsive application styles. Both lesson and playlist players enter fullscreen with their custom playback controls still available. Keep the playlist usable on narrow screens and ensure the countdown, fullscreen, volume, speed, and apply-to-all controls remain keyboard and screen-reader accessible.

## Generated videos

Lesson data is exported to `video/build/lessons.json`, Kokoro ONNX creates aligned French audio and section timings, Remotion renders animated MP4 scenes, and FFmpeg packages the final videos in `public/media/`. The timing manifest is `public/media/section-timings.json`.

The full pipeline is intentionally separate from Docker builds. Its first run downloads model weights and voice data; it can take a long time to regenerate all 40 videos. Read `video/README.md` before running it. Remove only generated WAV/model intermediates after rendering if disk space is needed; retain the MP4s and section timing manifest.

## Validation and deployment

- Frontend: `npm run build --prefix frontend`
- Backend progression/media tests in Docker: `docker compose exec -T tempo python -m unittest backend.tests.test_video_stream`
- Video content/export tests: `cd video && PYTHONPATH=.. .venv/bin/python -m unittest tests.test_video_content`
- Deployment: `docker compose up --build -d`, then verify `http://localhost:3000/api/health`.

Do not delete the Compose data volume during a rebuild. For an internet-facing deployment, use HTTPS, a strong `SESSION_SECRET`, and a reverse proxy; the default configuration is for local or trusted-network use.

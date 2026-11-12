FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
COPY public/ /app/public/
RUN npm run build

FROM python:3.13-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DB_PATH=/app/data/tempo.sqlite \
    SESSION_SECRET=tempo-local-dev-change-me

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY public/ ./public/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 3000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "3000"]

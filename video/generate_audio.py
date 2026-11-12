import argparse
import hashlib
import json
import re
import shutil
import ssl
import urllib.request
from pathlib import Path
from typing import Any

import certifi
import numpy as np
import soundfile
from kokoro_onnx import Kokoro


ROOT = Path(__file__).resolve().parents[1]
VIDEO_ROOT = ROOT / "video"
BUILD_ROOT = VIDEO_ROOT / "build"
MODEL_ROOT = VIDEO_ROOT / "models"
PUBLIC_ROOT = VIDEO_ROOT / "public"
PUBLIC_MEDIA_ROOT = ROOT / "public" / "media"
MODEL_FILES = {
    "kokoro-v1.0.onnx": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/kokoro-v1.0.onnx",
    "voices-v1.0.bin": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.1/voices-v1.0.bin",
}
VOICE = "ff_siwis"
SECTION_PAUSE_SECONDS = 0.45
NOTE_NAME_PATTERN = re.compile(r"\bdo\b", re.IGNORECASE)


def note_speech_text(text: str) -> str:
    return NOTE_NAME_PATTERN.sub("d'eau", text)


def download_model_file(filename: str, url: str) -> Path:
    target = MODEL_ROOT / filename
    if target.is_file() and target.stat().st_size:
        return target

    MODEL_ROOT.mkdir(parents=True, exist_ok=True)
    temporary = target.with_suffix(f"{target.suffix}.partial")
    print(f"Downloading {filename} from the Kokoro ONNX release…")
    downloaded = 0
    next_report = 50 * 1024 * 1024
    context = ssl.create_default_context(cafile=certifi.where())
    with urllib.request.urlopen(url, context=context, timeout=60) as response:
        with temporary.open("wb") as output:
            while chunk := response.read(1024 * 1024):
                output.write(chunk)
                downloaded += len(chunk)
                if downloaded >= next_report:
                    print(f"  downloaded {downloaded // (1024 * 1024)} MB")
                    next_report += 50 * 1024 * 1024
    if not temporary.is_file() or not temporary.stat().st_size:
        raise RuntimeError(f"Model download was empty: {filename}")
    temporary.replace(target)
    return target


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate French Kokoro narrations for Tempo lessons.")
    parser.add_argument("--force", action="store_true", help="Regenerate existing narration files.")
    parser.add_argument("--limit", type=int, help="Generate narration for only the first N lessons.")
    args = parser.parse_args()
    if args.limit is not None and args.limit < 1:
        parser.error("--limit must be at least 1")

    lesson_path = BUILD_ROOT / "lessons.json"
    if not lesson_path.is_file():
        raise FileNotFoundError("Run video/export_lessons.py before generating narration.")
    lessons: list[dict[str, Any]] = json.loads(lesson_path.read_text(encoding="utf-8"))
    if not lessons:
        raise ValueError("The course export contains no lessons.")
    if args.limit is not None:
        lessons = lessons[:args.limit]

    metadata_path = BUILD_ROOT / "audio-metadata.json"
    previous_metadata: dict[str, dict[str, Any]] = (
        json.loads(metadata_path.read_text(encoding="utf-8"))
        if metadata_path.is_file()
        else {}
    )
    metadata = dict(previous_metadata)
    section_timings_path = PUBLIC_MEDIA_ROOT / "section-timings.json"
    section_timings: dict[str, dict[str, Any]] = (
        json.loads(section_timings_path.read_text(encoding="utf-8"))
        if section_timings_path.is_file()
        else {}
    )
    model_path = download_model_file("kokoro-v1.0.onnx", MODEL_FILES["kokoro-v1.0.onnx"])
    voices_path = download_model_file("voices-v1.0.bin", MODEL_FILES["voices-v1.0.bin"])
    model = Kokoro(str(model_path), str(voices_path))
    audio_root = PUBLIC_ROOT / "audio"
    audio_root.mkdir(parents=True, exist_ok=True)
    PUBLIC_MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
    for index, lesson in enumerate(lessons, start=1):
        lesson_id = lesson["id"]
        video = lesson["video"]
        sections = video.get("sections", [])
        narration = video["script"].strip()
        if not narration:
            raise ValueError(f"Lesson {lesson_id} has no narration script.")
        if not sections:
            raise ValueError(f"Lesson {lesson_id} has no structured video sections.")
        script_hash = hashlib.sha256(narration.encode("utf-8")).hexdigest()

        audio_path = audio_root / f"{lesson_id}.wav"
        cached = previous_metadata.get(lesson_id, {})
        regenerate = (
            args.force
            or not audio_path.is_file()
            or not audio_path.stat().st_size
            or cached.get("scriptHash") != script_hash
            or len(cached.get("sections", [])) != len(sections)
        )
        if regenerate:
            parts: list[np.ndarray] = []
            timed_sections: list[dict[str, Any]] = []
            sample_rate: int | None = None
            current_frame = 0
            for section_index, section in enumerate(sections):
                samples, section_sample_rate = model.create(
                    note_speech_text(section["narration"]),
                    voice=VOICE,
                    speed=0.94,
                    lang="fr-fr",
                )
                if sample_rate is not None and section_sample_rate != sample_rate:
                    raise RuntimeError(f"Kokoro changed sample rate inside {lesson_id}.")
                sample_rate = section_sample_rate
                samples = np.asarray(samples, dtype=np.float32).reshape(-1)
                if samples.size == 0:
                    raise RuntimeError(
                        f"Kokoro produced empty audio for {lesson_id}, section {section_index + 1}."
                    )

                start_frame = current_frame
                parts.append(samples)
                current_frame += samples.size
                if section_index + 1 < len(sections):
                    pause_frames = round(sample_rate * SECTION_PAUSE_SECONDS)
                    parts.append(np.zeros(pause_frames, dtype=np.float32))
                    current_frame += pause_frames
                timed_sections.append(
                    {
                        "title": section["title"],
                        "kind": section["kind"],
                        "startSeconds": start_frame / sample_rate,
                        "endSeconds": current_frame / sample_rate,
                    }
                )

            if sample_rate is None:
                raise RuntimeError(f"Kokoro produced no audio for {lesson_id}.")
            samples = np.concatenate(parts)
            temporary_audio = audio_path.with_name(f"{audio_path.stem}.tmp.wav")
            soundfile.write(temporary_audio, samples, sample_rate, subtype="PCM_16")
            temporary_audio.replace(audio_path)
            lesson_metadata = {
                "audioFile": f"audio/{lesson_id}.wav",
                "durationSeconds": len(samples) / sample_rate,
                "sampleRate": sample_rate,
                "voice": VOICE,
                "scriptHash": script_hash,
                "sections": timed_sections,
            }
        else:
            lesson_metadata = cached

        audio_info = soundfile.info(audio_path)
        if audio_info.frames <= 0 or audio_info.samplerate <= 0:
            raise RuntimeError(f"Kokoro produced invalid audio for {lesson_id}.")
        lesson_metadata["durationSeconds"] = audio_info.duration
        metadata[lesson_id] = lesson_metadata
        section_timings[lesson_id] = {
            "scriptHash": script_hash,
            "sections": lesson_metadata["sections"],
        }
        print(f"[{index}/{len(lessons)}] {lesson_id}: {audio_info.duration:.1f}s")

    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    section_timings_path.write_text(
        json.dumps(section_timings, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Generated or verified {len(lessons)} French narrations.")


if __name__ == "__main__":
    main()

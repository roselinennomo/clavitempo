import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.curriculum import build_lessons


OUTPUT_PATH = ROOT / "video" / "build" / "lessons.json"


def export_lessons() -> list[dict[str, Any]]:
    lessons = build_lessons()
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(lessons, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return lessons


if __name__ == "__main__":
    exported = export_lessons()
    print(f"Exported {len(exported)} lessons to {OUTPUT_PATH}")

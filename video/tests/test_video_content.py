import unittest
from pathlib import Path

from backend.curriculum import ROOT, build_lessons
from phonemizer import phonemize
from video.generate_audio import note_speech_text


class VideoContentTests(unittest.TestCase):
    def test_every_lesson_has_a_teaching_sequence_and_covers_its_content(self):
        lessons = build_lessons()
        self.assertEqual(len(lessons), 40)
        for lesson in lessons:
            with self.subTest(lesson=lesson["id"]):
                video = lesson["video"]
                sections = video["sections"]
                expected_kinds = (
                    ["intro", "roadmap"]
                    + ["chapter"] * len(lesson["blocks"])
                    + ["practice", "takeaways", "recap"]
                )
                self.assertEqual(
                    [section["kind"] for section in sections],
                    expected_kinds,
                )
                chapters = [
                    section for section in sections if section["kind"] == "chapter"
                ]
                for block, chapter in zip(lesson["blocks"], chapters, strict=True):
                    self.assertEqual(chapter["detail"], block["text"])
                    self.assertIn(block["text"], chapter["narration"])
                    for image in block.get("images", []):
                        with self.subTest(image=image["src"]):
                            image_path = Path(image["src"].lstrip("/"))
                            self.assertTrue(
                                (ROOT / "public" / image_path).is_file()
                            )
                            self.assertTrue(
                                (ROOT / "video" / "public" / image_path).is_file()
                            )
                takeaways = next(section for section in sections if section["kind"] == "takeaways")
                self.assertEqual(
                    takeaways["takeaways"],
                    lesson.get("takeaways") or [block["title"] for block in lesson["blocks"]],
                )
                self.assertIn(lesson["practice"]["instruction"], video["script"])
                self.assertEqual(
                    video["script"],
                    " ".join(section["narration"] for section in sections),
                )
                self.assertEqual(
                    video["scenes"],
                    [section["title"] for section in sections],
                )

    def test_note_do_is_phonemized_as_french_do(self):
        spoken = note_speech_text("Do, Ré, Mi, Fa, Sol, La, Si.")
        phonemes = phonemize(
            spoken,
            language="fr-fr",
            backend="espeak",
            strip=True,
            preserve_punctuation=True,
        )
        self.assertIn("d'eau", spoken)
        self.assertIn("do", phonemes)
        self.assertNotIn("duː", phonemes)

    def test_note_replacement_does_not_change_words_containing_do(self):
        self.assertEqual(
            note_speech_text("Do, puis donne le tempo."),
            "d'eau, puis donne le tempo.",
        )


if __name__ == "__main__":
    unittest.main()

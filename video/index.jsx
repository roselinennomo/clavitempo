import React from "react";
import { Composition, registerRoot } from "remotion";
import { LessonVideo, calculateLessonDuration } from "./lesson-video.jsx";

const previewLesson = {
  id: "preview",
  title: "Les sept notes",
  shortTitle: "Les 7 notes",
  level: 1,
  categoryLabel: "Solfège",
  objective: "Relier le nom, le son et le geste.",
  video: {
    title: "Les sept notes prennent vie",
    visual: "scale",
    scenes: ["Voici l’alphabet des sept notes.", "Les notes avancent par pas.", "À toi de les jouer et de les chanter."],
    script: "Bienvenue au piano. Découvrons les sept notes."
  },
  audioFile: "audio/solfege-1.wav",
  audioDurationSeconds: 12
};

function RemotionRoot() {
  return (
    <Composition
      id="ClaviTempoLesson"
      component={LessonVideo}
      width={1280}
      height={720}
      fps={24}
      durationInFrames={calculateLessonDuration(previewLesson)}
      defaultProps={previewLesson}
      calculateMetadata={({ props }) => ({
        durationInFrames: calculateLessonDuration(props)
      })}
    />
  );
}

registerRoot(RemotionRoot);

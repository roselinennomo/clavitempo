import { spawn } from "node:child_process";
import { readFile, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const BUILD_ROOT = path.join(ROOT, "build");
const OUTPUT_ROOT = path.resolve(ROOT, "../public/media");
const FPS = 24;

function runFfmpeg(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(process.env.FFMPEG_PATH || "ffmpeg", [
      "-hide_banner",
      "-loglevel", "error",
      "-y",
      "-i", inputPath,
      "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", "25",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "96k",
      "-movflags", "+faststart",
      outputPath,
    ], { stdio: ["ignore", "ignore", "pipe"] });
    let errorOutput = "";
    ffmpegProcess.stderr.setEncoding("utf8");
    ffmpegProcess.stderr.on("data", (chunk) => { errorOutput += chunk; });
    ffmpegProcess.on("error", reject);
    ffmpegProcess.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg failed with exit code ${code}: ${errorOutput}`));
    });
  });
}

async function main() {
  const force = process.argv.includes("--force");
  const limitIndex = process.argv.indexOf("--limit");
  const limit = limitIndex === -1 ? undefined : Number(process.argv[limitIndex + 1]);
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
    throw new Error("--limit must be followed by a positive integer.");
  }
  const allLessons = JSON.parse(await readFile(path.join(BUILD_ROOT, "lessons.json"), "utf8"));
  const lessons = limit === undefined ? allLessons : allLessons.slice(0, limit);
  const audioMetadata = JSON.parse(await readFile(path.join(BUILD_ROOT, "audio-metadata.json"), "utf8"));
  await mkdir(OUTPUT_ROOT, { recursive: true });

  console.log("Bundling the Remotion composition once for all course videos…");
  const serveUrl = await bundle({
    entryPoint: path.join(ROOT, "index.jsx"),
    publicDir: path.join(ROOT, "public"),
    rootDir: ROOT,
    onProgress: (progress) => {
      if (progress === 100) console.log("Remotion bundle ready.");
    },
  });

  for (const [index, lesson] of lessons.entries()) {
    const outputPath = path.join(OUTPUT_ROOT, `${lesson.id}.mp4`);
    const temporaryPath = path.join(BUILD_ROOT, `${lesson.id}.remotion.mp4`);
    if (!force) {
      try {
        if ((await stat(outputPath)).size > 0) {
          console.log(`[${index + 1}/${lessons.length}] Keeping existing ${lesson.id}.mp4`);
          continue;
        }
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }

    const audio = audioMetadata[lesson.id];
    if (!audio || !audio.durationSeconds || !audio.audioFile) {
      throw new Error(`Missing Kokoro audio metadata for ${lesson.id}.`);
    }
    const inputProps = {
      lesson,
      audioFile: audio.audioFile,
      audioDurationSeconds: audio.durationSeconds,
      audioSections: audio.sections,
    };
    const composition = await selectComposition({
      serveUrl,
      id: "ClaviTempoLesson",
      inputProps,
    });
    console.log(`[${index + 1}/${lessons.length}] Rendering ${lesson.id} (${audio.durationSeconds.toFixed(1)}s narration)…`);
    await rm(temporaryPath, { force: true });
    let lastLoggedProgress = -25;
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      audioCodec: "aac",
      crf: 22,
      outputLocation: temporaryPath,
      inputProps,
      concurrency: 4,
      onProgress: ({ progress }) => {
        const percentage = Math.floor(progress * 100);
        if (percentage >= lastLoggedProgress + 25 || percentage === 100) {
          process.stdout.write(`  render ${lesson.id}: ${percentage}%\n`);
          lastLoggedProgress = percentage;
        }
      },
    });
    process.stdout.write("\n");
    await runFfmpeg(temporaryPath, outputPath);
    await rm(temporaryPath, { force: true });
    console.log(`[${index + 1}/${lessons.length}] Wrote ${path.relative(ROOT, outputPath)}`);
  }

  console.log(`Finished rendering ${lessons.length} lesson videos into ${OUTPUT_ROOT}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

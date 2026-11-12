# ClaviTempo lesson video generation

The React lesson scripts remain the source of truth. This local pipeline exports each lesson's introduction, roadmap, chapter explanations, practice, takeaways and conclusion; creates aligned French narration with Kokoro ONNX; renders the animated lessons with Remotion; and packages web-ready MP4s with FFmpeg. The note name `Do` is phoneticized as the French homophone `d'eau` for speech only; displayed text and notes remain conventionally spelled `Do`.

## Generate the videos

Requirements: Node.js 22, Python 3.13, FFmpeg, and `espeak-ng`.

```sh
python3.13 -m venv video/.venv
video/.venv/bin/pip install -r video/requirements.txt
npm install --prefix video
npm run build-videos --prefix video
```

The first narration run downloads the Kokoro ONNX model and its voice pack into `video/models/`. Generated WAV intermediates and render caches stay under `video/` and are excluded from the Docker build. Only completed MP4 files in `public/media/` are served by ClaviTempo. The section cue points are exported to `public/media/section-timings.json` so the chapter buttons and animated captions stay synchronized with the audio. Rebuilding the full library takes substantially longer than a frontend build; regenerate it only when lesson narration or Remotion visuals change.

To validate the pipeline before generating the full course, export lessons and render the first capsule:

```sh
npm run export-lessons --prefix video
npm run generate-audio --prefix video -- --limit 1
npm run render --prefix video -- --limit 1
```

Use `video/.venv/bin/python video/generate_audio.py --force` and `npm run render --prefix video -- --force` to regenerate the audio and videos after changing a lesson script. No external API key or narration account is required. The in-app video route requires a signed-in account and supports HTTP byte ranges for seeking. It suppresses ordinary download controls but cannot prevent a determined viewer from capturing media delivered to their browser.

## Attributions

- Kokoro ONNX wrapper: MIT, [project](https://github.com/thewh1teagle/kokoro-onnx).
- Kokoro v1.0 model weights: Apache-2.0, [model card](https://huggingface.co/hexgrad/Kokoro-82M).
- French voice `ff_siwis`: SIWIS voice data, identified as CC BY in the [Kokoro voice list](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md).
- Remotion's free license applies to individuals and companies of up to three people; see its [license terms](https://www.remotion.dev/docs/license/pricing).
- FFmpeg is used locally for MP4 encoding and audio normalization; see its [licensing guidance](https://ffmpeg.org/legal.html).

# Smart Video Engine / Motor inteligente de video (alpha.4)

Optional local production tool for trusted, rights-cleared Blender, Wan/ComfyUI or user videos. FFmpeg and FFprobe must be on PATH; FFmpeg must provide libx264 and JPEG encoding. No external API, GPU, model weights or new npm runtime dependency. Encoder binaries are not distributed; review FFmpeg build and codec licensing for your own distribution.

## Usage / Uso

```sh
npm run media:check
npm run video:optimize -- input.mp4 generated/video/coffee
npm run video:optimize -- input.mp4 generated/video/coffee-mobile --profile mobile --max-mib 1
npm run test:video
```

Each command requires a new destination directory. Defaults are per-variant caps, not total transfer guarantees. `--max-mib` overrides the cap for each selected variant. Use `--profile desktop` or `--profile mobile` to produce one variant. Input is limited to a 60-second clip, 512 MiB and 8192 pixels per edge (34 million pixels total). Local common video containers only; HDR and anamorphic input must be normalized explicitly before processing. Audio, subtitles, chapters and source metadata are removed: this is a silent decorative scroll-video pipeline, not a general media editor. Keep informative content and captions separately. Use trusted local assets; no remote URLs.

| Profile | Maximum long edge | FPS | Keyframe interval | Default budget |
|---|---:|---:|---:|---:|
| Mobile | 720 px | 24 | 0.5 s | 2 MiB |
| Desktop | 1280 px | 30 | 0.5 s | 5 MiB |

H.264 MP4, yuv420p, fast-start metadata, no B-frames, fixed GOP, no upscale; aspect ratio maintained subject to even-pixel rounding. Short GOPs improve access to nearby keyframes but can increase file size. The tool increases CRF in bounded steps to fit the configured budget; if it cannot fit, it fails instead of silently trimming or publishing an oversized file. Quality is not guaranteed; inspect the result. The poster is a JPEG with maximum long edge 720 px and 200 KiB cap. The manifest records sizes, SHA-256, dimensions, frame rate, duration, CRF and measured keyframe gaps. Output streams and duration are checked with FFprobe. The source hash is checked again before publishing. Staging is cleaned on failure; destination is reserved exclusively and the manifest is moved last as the completion marker (not a single atomic directory swap). Do not serve incomplete directories.

## Web integration / Integración web

1. Review video and poster, rights, quality and manifest. Copy the whole completed output directory into `public/media/coffee/` explicitly. This path is gitignored by default; include only approved assets in deployment.
2. Run `npm run dev` and open `/examples/video-scroll/index.html` for the optional Vite development example, or use the adapter in your own template. The default coffee 3D page does not load this video. The example is not a separate production build entry.
3. The visitor clicks a button to load the selected variant. Small screens, data saver and slower reported network types prefer mobile; otherwise desktop. Only one variant is requested. Network Information API is optional and not supported by all browsers. A single available variant is accepted. Sources are not switched mid-seek. Reduced motion prevents automatic scrub; a manual playback option is available. Use `mountSmartVideo(video, section, manifestUrl, {engine, scroll:false})` for manual-only playback. Cleanup on unmount.
4. Keep meaningful HTML and accessible static fallback, avoid loading a large video during initial rendering, use HTTP range support at deployment and test actual seek responsiveness on iOS/Android/desktop. The 0.5 s GOP is not a guarantee of browser seek latency. This release does not generate streaming HLS/DASH or adaptive bitrate manifests.

## Verification / Verificación

Tests use actual generated synthetic clips, not commercial footage, and cover output profiles, duration, silence, keyframe cadence, poster, hashes, original preservation, invalid input, budget failure, portrait input and no upscale. Five JS tests cover variant selection. See validation.md for local results. CI video smoke configured, not executed remotely. Browser playback and end-to-end build remain release gates.

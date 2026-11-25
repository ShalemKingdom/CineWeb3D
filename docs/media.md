# Optional multimedia pipeline / Flujo multimedia opcional

No paid API is required. Hardware, electricity and optional cloud GPUs may cost money. The web demo runs independently of these tools.

| Tool | Role | Official upstream |
|---|---|---|
| Wan 2.2 | Local AI video, text/image to video | https://github.com/Wan-Video/Wan2.2 |
| ComfyUI | Optional model workflow runner | https://github.com/Comfy-Org/ComfyUI |
| FFmpeg | Transcode and compress | https://github.com/FFmpeg/FFmpeg |
| Blender | Original 3D models and renders | https://www.blender.org/ |
| CineWeb3D Scroll Engine | Browser scroll-driven playback | src/modules/scroll.js |

## 1. Preflight
Run `python3 scripts/check_media.py`. This reports executable availability and NVIDIA GPU information when available; it does not certify model compatibility. Check upstream requirements for your exact Wan checkpoint, GPU, VRAM, Python and PyTorch versions. Install external tools separately, using their official instructions. Do not install GPU packages or download model weights automatically. Keep ComfyUI bound to localhost unless secured appropriately.

## 2. Produce assets
AI path: install ComfyUI and a compatible Wan 2.2 workflow/checkpoints from official documentation. Load the workflow, select the checkpoint, provide a text prompt or licensed image, and generate a short clip. Export the output as video. See https://docs.comfy.org/ for model-specific workflow instructions. An optional local API connector and direct Wan CLI adapter are now provided; a compatible reviewed API-format graph and weights must be supplied separately. See [step 8](optimization-step-8.md).

Non-AI path: use the [Blender Bridge](blender-bridge.md) for an automated coffee scene, GLB export and optional CPU rendering, or model and animate manually in Blender. Alternatively use a user-provided clip or procedural Three.js animation. This path does not require Wan or ComfyUI.

## 3. Optimize
Use `npm run video:optimize -- input.mp4 generated/video/coffee` with FFmpeg (libx264) and FFprobe on PATH. This produces validated mobile and desktop variants, a JPEG poster and a JSON manifest. The original is preserved. The legacy single-output script is retained for compatibility. See [Smart Video Engine](optimization-step-4.md) for size budgets, half-second keyframes and supported source formats.

## 4. Integrate
Review the generated assets and copy the complete output directory to `public/media/coffee/`. Use the [optional video example](../examples/video-scroll/index.html) or import `mountSmartVideo` from `src/smart-video.js` on user action, with a same-origin manifest. The helper selects a video variant before loading and uses the shared scroll engine if supplied. Reduced motion disables scroll-driven seeking; native manual playback is available. Keep an accessible visible fallback and test with actual mobile browsers and licensed assets.

## 5. Release checks
Audit licenses of exact dependencies, model weights and assets; verify versions and compatibility; commit lockfiles; build and test on desktop and mobile. Do not claim AI generation works until tested on compatible hardware.

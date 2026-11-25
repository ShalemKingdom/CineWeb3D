# AI Multimedia Engine / Motor multimedia IA (alpha.8)

An optional local Python orchestrator, independent of the browser. No new npm dependencies, API keys, subscriptions, model downloads or automatic publication. External tools, hardware, electricity and optional GPU hosting may cost money.

## Preflight / Diagnóstico

`npm run multimedia:check` reports local executables and NVIDIA information (if available). This does not certify CUDA/PyTorch, checkpoint compatibility or free VRAM. Wan direct adapter targets the official TI2V-5B single-GPU CLI; consult current upstream requirements. ComfyUI can use different compatible backends. Without compatible hardware, choose user media, CPU Blender or procedural Three.js. No automatic backend switch or installation.

Every production command defaults to **plan only**. Add `--execute` after reviewing inputs; local executable/workflow backends also require `--trust-local`. Use trusted software and media, not unreviewed custom nodes or Python repositories. The API adapter connects only to 127.0.0.1, refuses redirects and rejects unknown nodes and nodes identified as API-backed by server metadata. This is not a sandbox or a proof that arbitrary custom nodes are offline; use an audited local-only environment. Do not expose ComfyUI publicly.

## 1. Wan 2.2 — text/image to video

Install official Wan2.2 and TI2V-5B weights separately in a compatible environment. Do not download weights without explicit approval. Confirm the checkpoint license, GPU, dependencies and upstream CLI version.

```sh
npm run multimedia:run -- wan --repo /path/to/Wan2.2 --checkpoints /path/to/Wan2.2-TI2V-5B --python /path/to/venv/bin/python --prompt 'Cinematic coffee cup in warm studio light' --output generated/media/wan-coffee
```
Add `--execute --trust-local` to run. Add `--image /path/to/owned-photo.png` for image-to-video. Options: `--frames 49` (4n+1, 5–121), `--seed 42`, `--size '704*1280'` for vertical output, `--timeout 3600` if needed. Uses CPU text encoder and model offload; not a guarantee of low VRAM. Local offline environment hints are set; no prompt extension API is enabled. Repository and checkpoint installation are the user's responsibility.

## 2. ComfyUI — local image/video workflows

Install ComfyUI, choose a compatible official workflow (e.g. Wan 2.2 video or a local image model), load the required weights and export in **API format**, not the normal canvas JSON. Review the graph and every custom node; avoid partner/API nodes. Start local ComfyUI on port 8188. The project does not bundle a checkpoint-specific workflow or weights.

```sh
npm run multimedia:run -- comfy --workflow /path/to/reviewed-api.json --output-node 42 --prompt-node 6 --prompt 'Coffee product on a studio set' --kind video --output generated/media/comfy-coffee
```
Replace node IDs with your graph's IDs. Optional `--image-node 12 --image-name input.png` binds an image already uploaded to the ComfyUI input directory (LoadImage). `--kind image` selects PNG/JPEG/WebP outputs; `--index 0` selects the first saved matching output on the specified node. Add `--execute --trust-local` only after review. Uses local `/object_info`, `/prompt`, `/history/{id}` and `/view` routes; polls the specific job, downloads the selected output to staging with size limits. A timeout does not cancel the server job or interrupt other users; check the local UI before retrying. No auto-retry after submission.

## 3. Blender — non-generative route

```sh
npm run multimedia:run -- blender --config integrations/blender/coffee.json --output generated/media/blender-coffee
```
Add `--execute --trust-local` to invoke the installed Blender Bridge, render the configured coffee scene as PNG frames, assemble a silent video via FFmpeg and prepare the web variants. The exported GLB is included for separate review and Smart Asset validation/optimization. Actual Blender execution not tested locally. CPU rendering may be slow.

## 4. User assets — no AI or GPU required

```sh
npm run multimedia:run -- user --input /path/to/clip.mp4 --output generated/media/user-coffee --execute
npm run multimedia:run -- user --kind image --input /path/to/photo.png --output generated/media/user-photo --execute
```
The input remains unchanged. Videos use existing Smart Video Engine (mobile/desktop MP4, poster and manifest, no audio, up to 60 s); images use FFmpeg to produce an opaque JPEG up to 1280 px and 200 KiB, transparency not retained. Review image quality; choose other image pipeline if alpha is essential. Generated originals remain in the job directory; for user assets the source remains in its original location. Temporary staging is cleaned on failure. Existing destinations are rejected. The receipt contains backend, media type, source SHA-256 and relative web path, not prompts or credentials.

## 5. AI Director → website

Collect product, rights, audience, target devices, aspect ratio, storyboard, prompt and fallback. Run preflight, choose backend with user approval, run plan then execute, review output visually and inspect the receipt. For video, copy only reviewed `web/` contents into `public/media/coffee/` and follow the existing video-scroll example. For image, copy only the reviewed JPEG and supply meaningful alt text. For Blender GLB, use `npm run blender:publish -- generated/media/blender-coffee/scene.glb` after setting up the asset tools. Never publish raw prompts, original generated media, checkpoints or private input files automatically. Keep HTML usable without WebGL or video. See [AI Director recipe](ai-director-multimedia.md).

## Tests / Pruebas

`npm run test:multimedia` runs mocked connector tests and real FFmpeg smoke tests when available. See validation.md. Live Wan, live ComfyUI, Blender, browser playback and licenses of exact weights still need verification on compatible hardware.

Upstream: https://github.com/Wan-Video/Wan2.2 ; https://github.com/Wan-Video/Wan2.2/blob/main/generate.py ; https://docs.comfy.org/development/comfyui-server/comms_routes ; https://github.com/Comfy-Org/ComfyUI/blob/master/script_examples/websockets_api_example.py .

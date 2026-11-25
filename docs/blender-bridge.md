# CineWeb3D Blender Bridge / Puente Blender (experimental)

Optional local tool; no AI, API, subscription, or GPU required for modeling/export. CPU rendering may be slow. Install [Blender](https://www.blender.org/download/) 4.2+ separately on a supported desktop OS (not Android), and Python 3.9+. Do not automatically install Blender or execute third-party Python scripts. Official references: [CLI](https://docs.blender.org/manual/en/latest/advanced/command_line/arguments.html), [glTF export](https://docs.blender.org/api/current/bpy.ops.export_scene.html), [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html).

## Quick start / Inicio

```sh
npm run blender:check
npm run blender:build
npm run assets:setup
npm run assets:optimize -- generated/blender/coffee/scene.glb generated/blender/coffee/web.glb
npm run blender:publish -- generated/blender/coffee/web.glb
npm run dev
```

Open the local Vite URL with `?model=blender` (e.g. `http://localhost:5173/?model=blender`). The original procedural coffee remains the fallback on failure; default demo does not request the GLB. Lite/Accessible modes do not load it. The web uses its existing camera and lights, with embedded model animation scrubbed by scroll. Exported Blender camera is included for future use, not automatically selected on the web. Astro also uses the same scene code. Test the generated file in real browsers before deployment. The generated GLB is ignored by Git by default: deliberately review and include approved web assets in deployment if desired. `.blend` and render frames are never copied into `public`.

## Customize / Personalizar

Copy `integrations/blender/coffee.json` to a new JSON file; change colors, segments, duration, fps, resolution, camera radius/height or rotation. Names are metadata; this first preset always creates a coffee cup, not arbitrary objects. Configuration is data only; unknown keys and invalid ranges are rejected. No AI model or arbitrary scripts are accepted. To use another preset, implement and review a separate Python generator.

```sh
python3 scripts/blender_bridge.py --config integrations/blender/coffee.json --output generated/blender/poster --render poster
python3 scripts/blender_bridge.py --output generated/blender/clip --render frames --timeout 7200
```

Set `--blender /path/to/blender` when not on PATH. On Windows use `py -3` instead of `python3` and pass the executable path. Output directory must not already exist. Output is staged and validated before promotion. The manifest records config, mesh/animation/camera counts and rendering mode; validation checks the GLB header and required collections, not complete glTF conformance. The manual GitHub workflow downloads the official Blender 4.5.16 LTS Linux archive (about 378 MB) and checks its official SHA-256 list. It runs only when explicitly started. No workflow was executed here.

Outputs: `scene.blend`, `scene.glb`, `manifest.json`, optional `poster.png` or PNG sequence `frames/frame-0001.png` etc. Render uses CPU Cycles, original procedural geometry, PBR materials, three area lights, orbit camera, product rotation and handle separation. Area lights do not export to glTF; web uses its own lights. Render animation includes first and last frames, e.g. 97 frames at 24 fps for a 4 s keyframe span.

For optional video, use FFmpeg (set framerate to the configuration fps):

```sh
ffmpeg -framerate 24 -start_number 1 -i generated/blender/clip/frames/frame-%04d.png -c:v libx264 -pix_fmt yuv420p -movflags +faststart generated/blender/clip/coffee.mp4
```

Use existing `src/video-scroll.js` to attach a video to a scroll section. No paid service required. Review assets, exact tool licenses and distribution rights before release. The original procedural source is MIT; Blender is separate GPL software. No Blender binary or third-party source is bundled.

## Validation / Verificación

`npm run test:blender` tests config, command construction, minimal GLB header validation and mocked subprocess success/failure. `npm run blender:check` is read-only. These do not execute Blender or certify rendering. Real Blender export, poster, frame rendering, Three.js browser import and performance are release gates. Manual smoke workflow now includes optimization, Khronos validation and a Chromium import test; not executed here. Poster/frame rendering remains a separate test. See optimization-step-3.md.

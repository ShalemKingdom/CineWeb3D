# Smart Render Engine — step 2 / Motor de renderizado inteligente

## Scope / Alcance
No new packages. `src/modules/smart-render.js` supplies a pure quality controller, resolution cap and demand-driven render scheduler. `src/main.js` applies them to the procedural coffee scene. Retains the optional Blender model, SEO, static poster, reduced motion and prior video/scroll behavior.

| Tier / Nivel | DPR ceiling | Canvas pixels (approx.) | Particles | Geometry segments | Procedural shadows |
|---|---:|---:|---:|---:|---|
| Cinematic | 1.5 | 2,500,000 | 100 | 64 | 512×512 map |
| Balanced | 1.2 | 1,500,000 | 48 | 40 | off |
| Economy | 0.8 | 750,000 | 0 | 24 | off |

DPR is also capped by device DPR and WebGL viewport/renderbuffer/texture limits. These are drawing-buffer budgets, not total GPU memory limits. Geometry changes apply to procedural meshes only. Imported GLB assets retain their original geometry, materials and textures; optimization/validation is step 3. Antialiasing is fixed at context creation. Shadow and particle effects are adjusted; no postprocessing/reflection engine is introduced.

## Adaptation / Adaptación
Cinematic/Balanced selection sets a quality ceiling. Auto starts at a hardware-hint-based ceiling; a narrow viewport alone no longer forces static mode. Known weak devices, saving data, reduced motion and unavailable WebGL retain static fallback. User Lite/Accessible always remain static. Economy is an internal 3D tier, not the static Lite mode.

The controller estimates active render cadence (not GPU execution time) over 12 consecutive frame intervals. Two windows below 36 FPS lower one tier; three above 52 FPS raise one tier within the ceiling. Two measurement windows of cooldown after each change, and a dead band, prevent rapid oscillation. Idle gaps above 250 ms, visibility and explicit resets discard timing history; no synthetic benchmark or idle animation loop is launched. Short or sparse bursts may never yield enough samples, and very slow isolated frames are not interpreted as continuous rendering. The estimated cadence includes scheduling, CPU and GPU effects and does not guarantee 30/60 FPS. A 30 Hz display may settle on Economy. Thresholds are provisional.

Rendering is requested only for progress changes, resize, model load or visibility restoration. Multiple requests coalesce into one frame. No scheduled frames while hidden or after disposal. Geometry GPU buffers are released on tier changes; cached CPU-side geometries and renderer resources are released on teardown. A runtime render failure or context loss returns to the static illustration. The current tier is exposed in the demo status. No telemetry is transmitted.

## Validation / Verificación
39 JS tests and 8 Python tests passed, including 12 new pure logic tests for tier changes, pixel budgets, hysteresis, recovery, idle/hidden cancellation and scheduler/controller integration. Browser test coverage is configured, not executed. npm DNS unavailable; no dependency install, production build, real GPU, battery or FPS measurements. Verify actual Three.js, Lenis and Anime.js integration on desktop and Android; test CPU/GPU throttling, low refresh-rate devices, context loss, mode switching, GLB import and scroll reversal. Compare measured active frame cadence and idle CPU before/after. Do not promise a performance gain without measurements.

Next: Smart Asset Engine — GLB validation and asset optimization, then video encoding, cache, diagnostics, components, AI multimedia and complete release gates.

# Validation / Verificación v0.6.0-alpha.9

2026-11-25: Node 22.16.0 / npm 10.9.2. 113 JavaScript tests and 32 Python tests passed (145 total; 9 new), including SEO file-generation integration and release preflight tests. All previous tests retained; Python includes real FFmpeg tests and simulated external connectors. Both commercial pages regenerated/check passed; public asset budget: 3 SVGs, 2768 bytes, zero violations. JS and Python syntax checks passed. npm package-lock-only and ping failed EAI_AGAIN; no lockfiles generated. Vite and Astro builds failed because dependencies are absent (exit 127). Release gate correctly fails on three missing lockfiles. No installed dependency audit, browser/axe/Lighthouse, real GPU, Blender, codec or Wan/ComfyUI generation verification. No stable release clearance. See optimization-step-9.md.

# Validation / Verificación v0.6.0-alpha.8

2026-11-25. Node 22.16.0. 104 Node tests and 32 Python tests passed (136 total; 16 new). New tests cover API workflow validation, local connector simulation, Wan command, trust and overwrite gates, failure cleanup, plus three real FFmpeg tests (video, image, PNG sequence). Both commercial templates verified; public asset budget check passed. No Blender or NVIDIA detected; no live Wan/ComfyUI execution or GPU generation. npm registry DNS still unavailable; builds, browser, lockfiles and exact license/security audit pending. No new dependencies. See optimization-step-8.md.

# Validation / Verificación v0.6.0-alpha.7

2026-11-25. Node 22.16.0. 104 Node tests (15 new), 8 simulated Blender tests and 8 real FFmpeg tests passed (120 total). Both generated HTML pages verified; public asset audit found 3 original SVGs, 2,768 bytes total, no violations. npm ping failed EAI_AGAIN; Chromium navigation blocked with ERR_BLOCKED_BY_ADMINISTRATOR. No Vite/Astro build, live 3D visual verification, browser accessibility score or real-device measurements. No new dependencies. See optimization-step-7.md.

# Validation / Verificación v0.6.0-alpha.6

2026-11-25. Node 22.16.0. 89 Node tests (12 new), 8 simulated Blender tests and 8 real FFmpeg tests passed (105 total). Local file audit: 955-byte original SVG, zero budget violations. Diagnostics tests use synthetic frame/resource data; no actual GPU memory, FPS or real-user metrics measured. npm DNS lookup unavailable; builds, browser tests, lockfiles and license audit pending. No new dependencies.

# Validation / Verificación v0.6.0-alpha.5

2026-11-25. Node 22.16.0. 77 JavaScript tests (19 new), 8 simulated Blender tests and 8 real FFmpeg tests passed (93 total). New cache tests use injected fetch responses and scheduler doubles; they verify limits, public freshness, deduplication, cancellation, intent policy and progressive scheduling. No browser or production network measurements. npm DNS remains unavailable; build, lockfiles and browser integration gates pending. No new npm dependencies.

# Validation / Verificación v0.6.0-alpha.4
2026-11-25. Node 22.16.0, FFmpeg/FFprobe 7.1.5.

74 tests passed: 58 JavaScript (5 new), 8 previous Blender Python (simulated) and 8 new Python tests using real FFmpeg and FFprobe. Separate 3-second synthetic 1920x1080 clip with audio: source 10,846,571 bytes; mobile 159,987 bytes (720x406, 24 FPS); desktop 671,512 bytes (1280x720, 30 FPS); poster 22,177 bytes. Both MP4s retained 3.0 seconds, no audio, measured maximum keyframe gap 0.5 seconds. This is a synthetic clip, not a general compression guarantee. Files from test runs not bundled. No new npm dependencies. npm DNS lookup still fails; Vite/Astro build, browser seeking, Lighthouse and dependency/license audit remain pending. Video CI configured but not remotely run; earlier real Blender and GLB codec gates remain pending. See optimization-step-4.md.

# Validation / Verificación v0.6.0-alpha.3
2026-11-25. Node 22.16.0 / npm 10.9.2.

53 JavaScript tests (14 new) and 8 Python tests passed. Asset tests use synthetic GLB containers and injected validator/transform doubles; they do not prove real compression or conformance. DNS lookup for npm registry failed; no npm dependency install, lockfile, CLI/validator execution, real Blender export, Vite build or browser test was possible. The manual Blender CI workflow was extended, not executed. No measured compression ratio or GPU gain claimed. See optimization-step-3.md.

# Validation / Verificación v0.6.0-alpha.2
2026-11-25. Node 22.16.0 / npm 10.9.2.

39 JavaScript tests (12 new) and 8 prior Python tests passed. JS syntax checked. DNS lookup for registry.npmjs.org failed (getent exit 2); no npm install/build or actual browser/GPU test performed. No measured performance gain claimed. Blender remains unavailable. See optimization-step-2.md.

# Validation / Verificación v0.6.0-alpha.1
2026-11-25. Node 22.16.0 / npm 10.9.2.

Passed: 27 JavaScript tests (17 previous + 10 regression tests with injected browser/Lenis/media doubles) and 8 prior Python tests. npm ping failed with EAI_AGAIN, so dependencies, lockfiles, actual Lenis/browser behavior, Vite/Astro builds, Lighthouse, real GPU and Blender remain unverified. No measured FPS, battery or CPU savings claimed. See docs/optimization-step-1.md.

# Validation / Verificación v0.5.0
2026-11-25. Node 22.16.0; Python 3.13.5.

Passed: 17 prior JavaScript tests plus 8 Python bridge tests (configuration, minimal GLB check, CLI arguments, dry-run, simulated success/failure/no-overwrite). JavaScript syntax and Python compilation checked. Real Blender unavailable (`which blender` returned none). No Blender scene, GLB, render or video was generated in this environment. Manual smoke CI configured but not run. Browser loading, animation and export remain unverified. npm registry DNS lookup still fails; Vite/Astro build and dependency audit not executed. See previous validation below for earlier results.

# Validation / Verificación v0.4.0
2026-11-25. Node 22.16.0 / npm 10.9.2.

Passed locally:
- 17/17 pure-logic unit tests (`npm test`), including the previous eight tests.
- JavaScript syntax checks for source, scripts, configuration and test files; Python syntax checks for media scripts.
- SEO generator smoke check on copied source HTML in a temporary dist directory: preview noindex without sitemap; explicit HTTPS production origin generated canonical and sitemap. This was not a Vite compilation.
- Archive integrity verified after packing.

Blocked or not run: npm registry DNS failed (EAI_AGAIN); no lockfile, install, Vite/Astro build, Sharp execution, npm audit or installed-package license audit. Chromium refused local HTTP navigation (ERR_BLOCKED_BY_ADMINISTRATOR); no browser results, axe results, Lighthouse scores or real Core Web Vitals measurements. Actual AI video generation and external media tools remain untested. Version ranges are provisional, not verified latest releases.

Release gates: install and review/commit both lockfiles; npm ci; npm test; npm run build; npm run build:astro; npm run test:e2e; npm run quality; npm audit; review exact dependency licenses and media rights; test real mobile devices and WCAG manually; verify production metadata and field performance. Confirm scroll reversal, mode changes, WebGL context loss, video seeking and cleanup. No stable release before gates pass.

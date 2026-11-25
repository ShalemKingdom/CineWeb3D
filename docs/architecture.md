# Architecture / Arquitectura v0.5.0
Core runtime: Three.js, Anime.js, Lenis. React Three Fiber and Drei are optional React adapters, not required for the vanilla demo. One scroll engine per page. The timeline data model uses numeric tracks and milliseconds; an editor can serialize it without binding to a particular renderer. It currently supports linear sampling only.

| Module | Scope / Alcance | Status / Estado |
|---|---|---|
| Core / camera | coffee, lighting, orbit, zoom, exploded handle | source migrated; browser pending |
| Animation | Anime.js seekable timeline; Motion MIT core, React Spring, Tween.js optional | demo adapter written; optional planned |
| Scroll | Lenis, native progress, reverse, video scrub, sticky CSS | source written; sticky example; browser pending |
| Timeline | numeric keyframes, JSON, reverse sampling | unit-tested; editor, playback/audio sync planned |
| Effects | particles, Postprocessing, shaders, bloom, fog, water, liquid transitions | particles retained; advanced planned |
| Physics | Rapier / React Three Rapier, forces and collisions | planned |
| Materials | PBR, HDRI, textures, metal/glass/wood | basic ceramic demo; library planned |
| Audio | Howler, Tone, Web Audio, spatial sound, opt-in playback | planned |
| Multimedia | Wan 2.2, ComfyUI, FFmpeg, Blender, user media | docs, scripts and Blender Bridge source; actual AI and Blender runtime untested |
| Products | Model Viewer, 360, AR, configurators, hotspots, exploded views, showroom | demo handle only; other planned |
| Typography | kinetic/3D titles with HTML fallback | planned |
| Assets | licensed GLB, textures, audio, shaders, attribution | planned |
| Optimization | glTF Transform, Draco, Meshoptimizer, KTX2/Basis, FFmpeg | pixel budgets and FFmpeg script; advanced planned |
| Responsive | mobile camera/quality, reduced motion, static fallback | four modes; full device tests pending |
| Templates | coffee, product, commerce, property, portfolio, agency, hotel, tourism, auto, tech, fashion, story | coffee demo; other planned |
| AI Director | brief, storyboard, prompts, scene planning, code | agent instructions; service not implemented |
| Studio | GrapesJS, Leva, Zustand, visual timeline, undo/export | planned; use permissive runtime |
| CLI | create-cineweb3d, module selection, doctor, build | doctor script; installer planned |

AOS and Locomotive Scroll are optional alternatives, not stacked with Lenis. ScrollReveal and Theatre.js remain license-gated, not core dependencies. No third-party source or weights vendored. External tools run independently. No mandatory subscription. Future package directories are created when meaningful code exists, not as empty placeholders.

## AI Director workflow
Gather brand, audience, product, target devices and asset rights. Produce storyboard with scene id, duration, camera, scroll range, fallback and asset provenance. Build semantic HTML first, then 3D/media enhancements. Test and report actual results.

## v0.4.0 extension (experimental)
SEO Engine: build-time metadata, sitemap, robots, canonical and WebPage JSON-LD; LocalBusiness helper only. Performance: four visual modes, lazy module import and static fallback; field monitoring opt-in. Design: CSS tokens and semantic responsive demo, optional Astro/Tailwind template. Accessibility: keyboard focus, skip link, reduced motion, axe config; manual audit pending. Conversion: project CTA and WhatsApp helper; business integrations planned. Quality: Playwright and Lighthouse CI configurations, Sharp script. Browser, build and package audits remain release gates. See seo-performance.md.

## v0.5.0 extension
Blender Bridge is an external local generator. Validated JSON -> Blender CLI -> staged .blend/GLB and optional PNG frames -> explicit publish of budget-limited GLB -> optional Three.js animation scrub. See docs/blender-bridge.md. No additional npm runtime dependencies.

## v0.6.0-alpha.2 extension
Smart Render Engine: active render cadence, internal quality tiers, pixel/viewport limits, procedural geometry and particle budgets, shadow switching, hysteresis, cooldown and demand-driven frame coalescing. Static fallback retained. Imported GLB geometry optimization is not part of this step. See optimization-step-2.md.

## v0.6.0-alpha.3 extension
Optional Smart Asset Engine: inspect self-contained GLB, validate with Khronos, resize textures, optional simplification and Meshopt/Draco compression, preserve mesh/camera/animation counts, select smaller validated candidate, enforce budget, publish without overwrite. Local Three.js decoders are wired; real codec and browser checks pending. See optimization-step-3.md.

## v0.6.0-alpha.4 extension
Smart Video Engine: optional offline FFmpeg/FFprobe build pipeline, two H.264 profiles, fixed half-second keyframe cadence, size budgets, poster and manifest. User-initiated browser adapter chooses one variant before loading; existing scroll helper retained. No video is added to the default demo. See optimization-step-4.md.

## v0.6.0-alpha.5 extension
Smart Cache Engine: page-local byte/entry/TTL-bounded public GLB and manifest cache, request coalescing and consumer cancellation, poster-first idle scheduling, optional intent-based manifest prefetch. Native browser HTTP caching and range requests remain responsible for videos. No service worker or offline claim. See optimization-step-5.md.

## Smart Diagnostic Engine (alpha.6)
Opt-in page-local active-frame timing, Three.js counters, resource timing, cache stats, bounded event counts and static file budget CLI. No telemetry or new runtime dependencies. See optimization-step-6.md.

## Smart Component Engine (alpha.7)
Dependency-free static renderer and presets generate two original commercial demos; scoped CSS design tokens, accessible landmarks and optional existing coffee 3D hero. Product showcase is static. No new dependencies. See optimization-step-7.md.

## AI Multimedia Engine (alpha.8)
Optional Python orchestration (no runtime dependency): plan → selected trusted local source (Wan TI2V-5B, ComfyUI API workflow, Blender frames or user assets) → FFmpeg optimization → local receipt → manual publication. AI Director instructions included. No bundled weights, no live AI verification yet. See optimization-step-8.md.

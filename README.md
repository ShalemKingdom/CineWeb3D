# CineWeb3D — Cinematic 3D websites

**v0.6.0-alpha.9 · Experimental · Development: sandbox**

[![Build and quality](https://github.com/ShalemKingdom/CineWeb3D/actions/workflows/ci.yml/badge.svg?branch=sandbox)](https://github.com/ShalemKingdom/CineWeb3D/actions/workflows/ci.yml) [![Security and License Shield](https://github.com/ShalemKingdom/CineWeb3D/actions/workflows/security-shield.yml/badge.svg?branch=sandbox)](https://github.com/ShalemKingdom/CineWeb3D/actions/workflows/security-shield.yml) [MIT (original code)](LICENSE)
Build spectacular cinematic websites. / Crea webs 3D cinematográficas.

By ShalemKingdom. Original code MIT. No mandatory paid APIs or subscriptions; hardware, electricity and hosting may cost money.

## Start / Inicio
Clone the development branch (main does not yet contain the engine). Node 22.23.4+ recommended for the full suite; Python 3/FFmpeg are separate for media tests.
```sh
git clone --branch sandbox https://github.com/ShalemKingdom/CineWeb3D.git
cd CineWeb3D
npm run setup
npm run setup -- --install
npm run dev
```
Open the local URL printed by Vite. Try `/examples/the-grounds/` for the commercial concept. For Astro and asset tools use `npm run setup -- --install --all`; then follow [contributor validation](docs/contributor-validation.md). The default setup only prints a plan; installation requires explicit opt-in.
Before release, follow [step 9 / release checklist](docs/optimization-step-9.md). All three exact lockfiles are committed; do not regenerate them without review. CI fails if missing. Optional Astro/Tailwind template (Node 22.23.4+ for Astro 7): `npm --prefix templates/coffee-astro install` then `npm run dev:astro` or `npm run build:astro` (root install also required). Demo is noindex unless configured with an actual public domain and explicit opt-in. See [SEO & performance](docs/seo-performance.md).

## Status / Estado
Experimental source: Three.js coffee scene, Anime.js, Lenis, timeline and video scroll helper retained; semantic HTML, SEO generator, responsive CSS, four visual modes, static SVG alternative, opt-in metrics and quality tooling added. Vite/Astro and desktop/mobile Chromium have passed sandbox CI; physical device and field testing remain separate. Advanced modules remain optional or planned. No external model weights or tools bundled; reviewed decoder assets and license notices are generated with builds. GSAP not included.

- [Integral validation / Release checklist](docs/optimization-step-9.md)
- [AI Multimedia Engine](docs/optimization-step-8.md)
- [Smart Component Engine](docs/optimization-step-7.md)
- [Smart Diagnostic Engine](docs/optimization-step-6.md)
- [Smart Cache Engine](docs/optimization-step-5.md)
- [Smart Video Engine](docs/optimization-step-4.md)
- [Smart Asset Engine](docs/optimization-step-3.md)
- [Smart Render Engine](docs/optimization-step-2.md)
- [Demand-driven scroll and video seeking](docs/optimization-step-1.md)
- [Architecture](docs/architecture.md)
- [Catalog: 37 upstream projects](docs/catalog.md)
- [SEO and performance](docs/seo-performance.md)
- [Blender Bridge (experimental)](docs/blender-bridge.md)
- [Optional multimedia](docs/media.md)
- [Roadmap](ROADMAP.md)
- [Validation](docs/validation.md)
- [Agent skill](.agents/skills/cineweb3d/SKILL.md)

Release gates: install, review/commit lockfiles, npm ci, tests, build, browser and Lighthouse checks, exact dependency/license/security audit and manual accessibility/device review. No claim of measured performance or ranking until verified.

## Blender Bridge / Puente Blender
Optional Python CLI for original coffee geometry, PBR materials, camera and keyframes, GLB export and CPU rendering. Use `npm run blender:check`, `npm run assets:setup` then follow the [guide](docs/blender-bridge.md). No Blender binary included; runtime export and browser playback unverified locally.

## Smart Video Engine / Video inteligente
Optional local FFmpeg/FFprobe pipeline: `npm run video:optimize -- input.mp4 generated/video/coffee` (new output directory). `npm run test:video` runs real synthetic-video tests when the tools are installed. See [step 4](docs/optimization-step-4.md). No video is loaded by the default 3D demo.

## Smart Cache Engine / Caché inteligente
Bounded public asset memory cache, deduplicated GLB/manifest requests, intent-only manifest prefetch and poster-first enhancement. See [step 5](docs/optimization-step-5.md) for deployment HTTP headers, privacy and limitations. No service worker or new npm dependencies.

## Smart Diagnostic Engine / Diagnóstico inteligente
Open Developer diagnostics in the demo footer, start the local session, scroll, then refresh the report. Run `npm run diagnostics:assets -- public --strict` for a file-size budget check. No telemetry or independent animation loop. See [step 6](docs/optimization-step-6.md).

## Smart Component Engine / Componentes comerciales
Generate or check two original concept templates with `npm run components:generate` and `npm run components:check`. Open `/examples/coffee-commercial/` (optional procedural 3D) or `/examples/product-commercial/` (static). Three scoped themes, reusable semantic components and original lightweight SVGs. See [step 7](docs/optimization-step-7.md). Demo metadata remains noindex; no real commerce backend.

## AI Multimedia Engine / Multimedia IA
Optional local orchestration: `npm run multimedia:check` and `npm run multimedia:run -- --help`. Wan TI2V-5B, ComfyUI API graph, Blender frames and user media routes; dry-run by default, explicit execution and review. See [step 8](docs/optimization-step-8.md) and [AI Director recipe](docs/ai-director-multimedia.md). Actual AI generation and Blender remain unverified locally.

## Commercial Showcase / The Grounds
Spanish concept at `/examples/the-grounds/`: scoped interactive coffee scene, original vector art, semantic commercial sections and noindex. See [step 12](docs/commercial-showcase.md). Not the official site; no live menu, orders or bookings.

## AI Skill Engineering / Step 13
Open the repository root in Codex and invoke `$cineweb3d` or explicitly ask the agent to read `.agents/skills/cineweb3d/SKILL.md`. Use `npm run director:plan -- templates/director/coffee-brief.json` for a deterministic plan (not a site generator). See [AI Skill Engineering](docs/ai-skill-engineering.md) for the workflow, checks and limitations.

## Community / Comunidad
[Contributing](CONTRIBUTING.md) · [Code of conduct](CODE_OF_CONDUCT.md) · [Security](SECURITY.md) · [Changelog](CHANGELOG.md) · [Release readiness](docs/release-readiness.md) · [Repository protection proposals](docs/repository-protection.md)

The repository is public, but no stable release is published. Contributions should target sandbox until the first approved release. Do not redistribute third-party assets or tools without reviewing their licenses.

### Experimental portable package (step 14.3)

An unpublished, private local npm package can be assembled for sandbox evaluation; see [portable installation](docs/portable-installation.md). It separates the browser runtime and CLI from the user skill. It is not a published npm release and the checkout-only planner, Blender/AI tools and release gates are not included. The Café Aurora example is a fictional noindex demo.

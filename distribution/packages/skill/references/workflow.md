# Route-specific workflow

Start: inspect the host project, its AGENTS.md, package.json, and installed runtime version. Skill files alone do not contain the engine. The experimental @cineweb3d/core, @cineweb3d/cli and @cineweb3d/templates packages offer browser modules and a scaffold; the repository-only documentation and advanced toolchain below require a compatible checkout. Do not assume they are installed.

| Route | Read in repository | Implementation |
|---|---|---|
| static | docs/optimization-step-7.md | src/modules/commercial-components.js, templates/commercial/presets.js; generate/check presets, or dedicated semantic page |
| coffee-procedural | docs/commercial-showcase.md, docs/optimization-step-2.md | examples/the-grounds/, src/bootstrap.js, src/main.js; adapt only where appropriate |
| custom-procedural | docs/optimization-step-1.md, docs/optimization-step-2.md | new original geometry using existing scroll/render budget helpers; no copied coffee asset unless relevant |
| glb | docs/optimization-step-3.md, docs/blender-bridge.md | inspect, Khronos validate, optimize with meshopt/draco, validate output; adapt src/modules/blender-model.js to correct asset/animation; do not use the coffee-specific publish gate on unrelated models without adapting it |
| video | docs/optimization-step-4.md | trusted local FFmpeg input, optimize variants, review manifest; src/smart-video.js and examples/video-scroll/ |
| local-ai | docs/optimization-step-8.md, docs/ai-director-multimedia.md | multimedia:check then plan chosen backend; explicit authorization before heavy execution; review output and use GLB/video/image route |

Always read docs/optimization-step-5.md for cache and progressive loading, docs/optimization-step-6.md for opt-in diagnostics, docs/security-license-shield.md and docs/distribution-review.md for licenses, docs/seo-performance-shield.md for SEO and performance.

Workflow: brief → storyboard (hero/detail/benefit/action) → semantic page → optional visual enhancement → tests → review. Maintain local same-origin assets, no initial GLB/video transfer on mobile, no extra RAF loop; no fake business data. A new Vite page needs a build input in vite.config.js and browser tests. Generated presets must stay reproducible. Non-English UI may require custom template or localization; existing generic renderer is English. Validate real content without JavaScript. For production, only the root SEO generator is currently wired for explicit indexing; new routes remain noindex unless intentionally designed and approved for publication.

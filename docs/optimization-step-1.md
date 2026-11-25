# Intelligent Optimization — step 1 / Optimización inteligente — paso 1

## Scope / Alcance
Fix two existing runtime defects without adding dependencies: perpetual scroll animation-frame scheduling and lost video targets during an active seek. Keep Blender, SEO, static fallback and prior features. No GSAP or mandatory paid services.

## Scroll engine
`src/modules/scroll-runtime.js` handles demand-driven scheduling. Native scroll, resize, pageshow, ResizeObserver, reduced-motion changes and Lenis virtual input invalidate or wake the scheduler. It continues during smooth scrolling and stops once there is no dirty work or smooth motion. Hidden tabs cancel pending frames. Geometry is read in a batch before invoking subscriber callbacks. `refresh()` explicitly invalidates layout when a custom integration moves content without triggering a resize. Initial progress is delivered on the next frame, not synchronously. Use one shared engine per page; remove subscriptions and call `destroy()` on unmount. The Lenis clock is monotonic and bounded to avoid an idle-time jump. Real Lenis behavior (including wheel/touch/keyboard and smooth settling) must be validated against the resolved version; an upstream animation that never settles may keep the scheduler active.

## Video seek engine
`src/modules/video-seek.js` stores a single latest progress value. It waits for metadata and for any in-flight seek to complete, then applies that value on `seeked`. It suppresses tiny redundant seeks, retains edge positions, discards queued requests when disabled and detaches listeners on cleanup. `src/video-scroll.js` wires this to the scroll engine and reduced-motion preference. This does not change codec, keyframe interval or browser decoding latency; use short, web-optimized, seek-friendly clips. No video or model bundled.

## Validation / Verificación
- `npm test`: 27 unit tests, 10 new tests for idle scheduling, native/smooth scroll, reversal, visibility, layout, reduced motion, cleanup, metadata and seeking.
- `npm run test:blender`: 8 previous simulated bridge tests.
- Test doubles are not equivalent to a real browser or the actual installed Lenis package.
- In a connected environment: install dependencies, review and commit both lockfiles, build, run browser/Lighthouse tests; manually verify wheel and touch scrolling, hidden tab return, scroll reversal, media seeking, mode switching and memory cleanup. Compare idle CPU/frame traces before and after. No measured performance claims yet.

## Next / Siguiente
Adaptive GPU/render budget and diagnostics; GLB asset validation/compression; seek-friendly video encoding; cache/asset loading; real browser/build/lockfile gates; commercial templates and Wan/ComfyUI automation. These are not delivered by this phase.

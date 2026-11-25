# Smart Cache Engine / Caché inteligente — alpha.5

## What is implemented / Qué se implementó
- `src/modules/resource-cache.js`: page-local bounded cache for reviewed same-origin static GLB and JSON. Shares concurrent fetches; consumers receive independent byte buffers. LRU (least recently used), 8 MiB retained bytes, 16 entries, five-minute maximum TTL. Honors explicit `public, max-age`, `Age`, `private`, `no-cache`, `no-store` and `Vary` (conservative: no in-memory retention when Vary is present). Default HTTP browser caching remains enabled. Fetches omit credentials and reject redirects. GLB reads limited to 50 MiB, manifest reads to 64 KiB, including streamed bytes. These are per-response limits, not total process RAM limits. Actual decoded GPU memory and temporary copies are separate. `stats()` exposes local hits/misses/joined/evictions/bytes/pending; no telemetry transmitted.
- GLB loader requests are coalesced and abort when the scene is destroyed and no other consumer remains. Models are parsed independently; no shared mutable Three.js objects. Only publish validated, self-contained GLB from Smart Asset Engine; caching does not replace model validation.
- The static poster loads before the 3D enhancement is scheduled at browser idle (bounded poster wait; timeout fallback). Hidden tabs defer enhancement. Lite and Accessible modes still skip 3D imports.
- Video example prefetches only the small JSON manifest on pointer/focus intent; no speculative MP4 or poster requests. Prefetch respects reduced motion, Save-Data, slow connections and hidden tabs. Explicit load remains possible. Cancel prefetch when intent ends; concurrent active requests survive cancellation of a speculative consumer.
- Vite multi-page configuration includes the video example in production builds. Browser tests added but not executed locally.

## Hosting / Alojamiento
Use ordinary HTTP caching, not a service worker. Configure headers in your static host/CDN, and verify them after deploy. These are examples, not automatically applied by this repo:

| Resource | Suggested Cache-Control |
|---|---|
| HTML, sitemap and robots | `no-cache` |
| Vite content-hashed assets (verify filenames) | `public, max-age=31536000, immutable` |
| Mutable public GLB/JSON paths | `public, max-age=60, must-revalidate` or `no-cache` for immediate updates |
| Versioned immutable video/model/poster assets | `public, max-age=31536000, immutable` |
| Private/authenticated responses | `private, no-store` |

Do not apply immutable caching to mutable `coffee.glb` or manifest paths. Use a new versioned filename/directory when changing assets and update references; do not reuse immutable URLs. Keep videos served by the native browser with Range support (`206 Partial Content`, `Content-Range`, correct MIME) and normal HTTP caching; do not force full video downloads into memory or intercept range requests. The existing FFmpeg fast-start files remain suitable. Avoid a service worker at this stage to prevent stale releases, offline range complexity and SEO deployment surprises. Persistent offline support is not implemented.

## Verification / Verificación
`npm test` runs the pure Node tests. `npm run build` then `npm run test:e2e` verifies the built video example, initial absence of media requests, intent-only manifest, reuse on click and reduced-motion behavior. Test actual hosting headers with `curl -I URL` and `curl -I -H 'Range: bytes=0-1023' VIDEO_URL` (some servers only support Range on GET; use `curl -D - -o /dev/null -H 'Range: bytes=0-1023' VIDEO_URL` when needed). Compare browser Network transfers on initial load, repeated actions and reload, with cache enabled; check mobile Save-Data where supported. No measured bandwidth/LCP improvements are claimed until real browser/hosting tests. No additional dependencies, subscriptions or GitHub mutations.

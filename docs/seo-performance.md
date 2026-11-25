# SEO, performance, accessibility and design / SEO, rendimiento, accesibilidad y diseño

## Start / Inicio
Install root dependencies with `npm install` (commit the generated lockfile after review), `npm test`, `npm run build`, `npm run preview`. For the optional Astro template, first install root dependencies, then `npm --prefix templates/coffee-astro install` and `npm run build:astro`. Use Node 22.12+. Dependency ranges are provisional until network installation and exact license audit.

## SEO publication / Publicación
Default builds are `noindex,follow` to avoid indexing demo/preview content. After replacing copy with accurate commercial content, set the actual public HTTPS origin and explicitly enable indexing: `SITE_URL=https://example.com SITE_INDEXABLE=true npm run build` (replace example.com). Same variables for `npm run build:astro`. Deploy at origin root; subdirectory hosting requires base-path adaptation. Add a real raster social preview with `SOCIAL_IMAGE_URL` (public HTTPS). Vite produces canonical, Open Graph URL, basic WebPage JSON-LD, robots.txt and sitemap when indexable. Astro template produces equivalent static routes (empty sitemap in preview). Verify HTML without JS; submit the production sitemap in Search Console after deployment. LocalBusiness helper needs verified business name, address and URL; it is not emitted for the fictional demo. For multiple pages, add each canonical route to sitemap; configure hreflang only when real localized equivalents exist. No fabricated reviews, claims or contact details.

## Quality modes / Modos
Auto selects by viewport, hardware hints, data-saving and WebGL2 capability. Small screens can now use Balanced 3D unless known weak hardware, reduced motion or data saving calls for static mode. Cinematic and Balanced load Three.js on idle with different pixel/particle/geometry budgets. Lite and Accessible retain the original SVG poster and HTML; no 3D runtime import. Reduced motion, missing WebGL and data saving override conflicting manual selections. Static fallback on runtime errors or context loss. Renderer resources disposed on mode change; rendering paused when document hidden. Device hints are approximate; benchmark before changing defaults. Active-frame cadence now drives an internal Economy/Balanced/Cinematic tier; see optimization-step-2.md. Future work: offscreen intersection scheduling and asset-specific LOD/media budgets.

## Design & conversion / Diseño y conversión
Semantic HTML, keyboard focus, skip link, visible text, responsive navigation, CSS design tokens, and accessible call-to-action to the project. `src/modules/conversion.js` builds WhatsApp links only from a supplied international phone number. Actual business forms, bookings, maps, catalogs and analytics endpoints remain optional future adapters. Do not send personal data without an appropriate lawful basis. No autoplay audio. Add captions for meaningful video, keyboard interaction and equivalent non-3D content.

## Audit commands / Auditoría
- `npm test`: pure JS tests.
- `npm run build`: production bundle and metadata generator.
- `npx playwright install --with-deps chromium`: browser prerequisites (may require OS privileges).
- `npm run test:e2e`: desktop/mobile Chromium, JS-disabled, reduced motion, axe and optional WebGL.
- `npm run quality`: Lighthouse CI local reports, no external upload; SEO score may be lower for intentionally noindex demo. Run production SEO check against an actual staging configuration with correct index setting (do not publish staging).
- `npm run images:optimize -- photo.jpg optimized`: optional Sharp WebP/AVIF variants; choose srcset widths based on source dimensions; retain original.
- `observeVitals(callback,{enabled:true})` measures LCP/INP/CLS only when explicitly enabled; no reporting backend or tracking by default.

Targets: Lighthouse mobile performance >=90, accessibility >=95, best practices >=95, SEO 100 for an indexable production page; warnings for performance/SEO/best practices, accessibility gate error. Field Core Web Vitals at p75: LCP <=2.5s, INP <=200ms, CLS <=0.1. Lighthouse lab cannot establish field INP. WCAG 2.2 AA is a design target, not certification; automated scans cannot replace manual review.

Official references: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics ; https://web.dev/articles/vitals ; https://www.w3.org/TR/WCAG22/ ; https://docs.astro.build/ ; https://github.com/GoogleChrome/lighthouse-ci .

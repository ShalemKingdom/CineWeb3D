# Step 7 — Smart Component Engine / Motor de componentes

## What works in source / Qué se incorpora
A dependency-free HTML renderer (`src/modules/commercial-components.js`) generates two original commercial concept pages from `templates/commercial/presets.js`. The shared scoped CSS (`src/commercial.css`) provides coffee, midnight and light theme tokens, responsive grids, visible keyboard focus, 44px minimum primary controls and hover transitions gated by motion preference. No new JS animation loop or external fonts. Components: navigation, cinematic hero, gallery cards, storytelling, native FAQ, conversion CTA and footer. The coffee hero reuses the existing optional procedural 3D scene and static fallback; the product example is deliberately static (not an independent 3D product configurator). SVG illustrations are original, not Blender renders. No actual commerce, pricing, business identity, inventory or checkout is claimed.

## Run / Uso
```sh
npm run components:generate
npm run components:check
npm run dev
```
Open `/examples/coffee-commercial/` or `/examples/product-commercial/`. Edit the preset content, CTA destinations and `theme` in `templates/commercial/presets.js`; regenerate and commit the resulting HTML. Use `scene: true` only when the existing coffee-specific 3D scene is appropriate. The base Astro example remains independent. New templates use the existing multi-page Vite build; no Astro migration was attempted here.

## Safety, SEO and accessibility / Seguridad, SEO y accesibilidad
Content is escaped; links allow local paths, fragments and HTTPS external URLs only. Image paths are local, dimensions and alt text are required. Templates are `noindex,follow` demos and excluded from the sitemap; production owners must customize metadata, canonical URLs, sitemap entries and verified commercial details before enabling indexing. Static content and FAQ work without JS. The coffee canvas is decorative and optional. The product page has no runtime script. Images after the hero use lazy loading and explicit dimensions. Automated accessibility scans and manual contrast/device/keyboard checks remain release gates; design targets are not certification.

## Validation / Validación
Run `npm test`, `npm run components:check`, `npm run diagnostics:assets -- public --strict`, `npm run build`, `npm run test:e2e`. 15 additional Node tests cover generated markup, links, IDs, images, escape behavior, themes, determinism, and 3D DOM compatibility. Browser scenarios are configured but not run successfully here (administrative navigation block); npm DNS also prevents Vite build and dependency verification. Do not claim measured performance or a fully validated commercial template until browser checks pass. No new npm dependencies.

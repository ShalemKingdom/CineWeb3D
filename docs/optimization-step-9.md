# Step 9 / Paso 9 — Release validation (alpha.9)

**Status: experimental, not cleared for stable release.** Local Node/Python and SEO integration tests passed; dependency installation, real browser and GPU tests did not run. No new npm dependencies or paid services. All eight previous stages retained.

## Reproducible dependency setup / Instalación reproducible
In a trusted, network-enabled development environment (Node 22.12+, Python 3 and FFmpeg/FFprobe), use a separate branch. Review changes before execution:

```sh
npm install --package-lock-only --ignore-scripts
npm --prefix templates/coffee-astro install --package-lock-only --ignore-scripts
npm --prefix tools/assets install --package-lock-only --ignore-scripts
npm run release:check
```

Inspect each lockfile (including the source, integrity and versions), `npm outdated` in each project, the security advisories and licenses. Resolve incompatible or vulnerable versions within their supported release lines; do not apply `npm audit fix --force` blindly. Commit the three reviewed lockfiles only after validation. No fabricated lockfiles are shipped. The CI now fails closed on missing locks; it no longer silently runs npm install. The release inventory reports declared licenses, not legal approval or a substitute for review. Review actual LICENSE/NOTICE files, models, fonts, bundled native binaries and generated artifacts; separate restricted tools and record decisions.

```sh
npm ci
npm --prefix templates/coffee-astro ci
npm --prefix tools/assets ci
npm audit --audit-level=high
npm --prefix templates/coffee-astro audit --audit-level=high
npm --prefix tools/assets audit --audit-level=high
npm run validate:local
npm run build
npm run build:astro
npm run diagnostics:assets -- dist --strict
npx playwright install --with-deps chromium
npm run test:e2e
npm run quality
```

`npm audit --audit-level=high` fails on high/critical findings; review lower severity findings too. `release:check` rejects missing/stale locks, non-registry or integrity-less entries, restricted GSAP and Vite versions affected by the specific upstream advisory GHSA-p4f5-76q4-ffq7. This is not a full vulnerability scanner. Vite 7.3.8 is already the minimum direct range in this project; the installed version and Astro's transitive Vite still need verification. Source: https://github.com/vitejs/vite/security/advisories/GHSA-p4f5-76q4-ffq7 (2026-11-10). Dev servers bind to loopback by default; do not expose them publicly. GitHub workflows use read-only permissions and no persisted checkout token. Pin reviewed action SHAs and enable branch rules/Dependabot alerts after importing.

## Release decision / Criterios pendientes
- Run CI green with all three lockfiles and review exact licenses/third-party notices; verify no outstanding relevant security risks.
- Verify Vite and Astro builds, Playwright on desktop/mobile Chromium, manual WCAG 2.2 AA and real-device tests (including WebGL fallback and video seek).
- Review Lighthouse on a production-like indexable deployment with actual configured domain. Preview/demo `noindex` is intentional; its SEO score is not a production SEO score. Verify field CWV after deployment.
- Execute the optional real Blender workflow and actual GLB compression/validation/import; test Wan and ComfyUI separately on appropriate hardware with approved workflows/model licenses. Mark any still unverified feature experimental; no unqualified stable release.
- Review media rights, asset budgets, screenshots, final reports. Do not publish or tag a stable version automatically.

ES: primero importar el ZIP a una rama sandbox, generar los tres lockfiles, resolver vulnerabilidades, instalar con npm ci y ejecutar las pruebas. Si falla un control, no fusionar ni publicar la versión estable. Las pruebas locales no demuestran el rendimiento en un teléfono real.

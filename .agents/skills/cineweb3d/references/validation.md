# Verification and reporting

Before installing: inspect manifests and committed locks, run npm run release:check and npm run security:stable, audit all three graphs (npm audit --package-lock-only --audit-level=low; repeat with --prefix templates/coffee-astro and --prefix tools/assets). Do not silently regenerate locks, downgrade or add dependencies to bypass controls. Install via npm ci in all three projects if environment permits. Run:

- npm run director:check; npm run validate:local
- npm run build; npm run build:astro; npm run diagnostics:assets -- dist --strict
- npx playwright install --with-deps chromium only if authorized/environment allows; npm run test:e2e
- npm run seo:check after both preview builds; npm run quality
- Run relevant optional tests and dedicated page audits; verify no JS, keyboard, reduced motion, mobile width, resource transfers and 3D fallback. For showcase, npm run quality -- --config=lighthouserc.showcase.cjs.
- npm run security:stable -- --installed; inspect dist/licenses and actual asset provenance.

Targets: mobile initial resources <256 KiB in existing tests, no automatic media requests before intent, Lighthouse median performance >=90, accessibility >=95, best practices >=95, LCP <=2.5s, CLS <=0.1. SEO 100 only for explicit indexable test fixture. Model <=2 MiB by default; video mobile <=2 MiB, desktop <=5 MiB; poster <=200 KiB. These are budgets, not guaranteed scores. Real devices and field INP remain separate. Preview noindex; no stable release or deployment without authorization.

Report: scope/branch/commit; chosen route and assumptions; changes; exact commands and exit status; test counts and skips; actual reports/captures; security/license results; remaining risks and next steps. Mark each gate passed, failed, skipped or not run. Never report a simulated run as real, a dry-run as creation, or a planned gate as passed.

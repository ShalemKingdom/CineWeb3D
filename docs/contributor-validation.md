# Contributor validation

Use a trusted checkout. Default setup is plan-only; install explicitly with `npm run setup -- --install --all`. This verifies committed locks and license policy, audits all three npm graphs before installing, then runs npm ci. It does not install external tools or browsers. Node 22.23.4+ is the recommended full-suite baseline (22/24 LTS). Other OS/runtime combinations are not certified.

For the full test suite install Python 3 and FFmpeg/ffprobe separately with your platform's trusted package manager. Install Chromium for Playwright using `npx playwright install --with-deps chromium` on supported Linux runners (OS package installation may need approval); other supported platforms use the appropriate Playwright installation command.

```sh
npm run community:check
npm run director:check
npm run validate:local
npm run build
npm run build:astro
npm run diagnostics:assets -- dist --strict
npm run test:e2e
npm run seo:check
npm run quality
npm run security:stable -- --installed
```

Use the dedicated showcase, production SEO fixture and Blender workflows where relevant. Preview is noindex; never deploy the reserved fixture. For a real release, record the exact commit, CI links, all skipped/failed checks, installed notices, model/media rights, manual accessibility and physical mobile review. Actual model generation and field CWV require separate evidence. Do not publish a stable version if release criteria are unmet.

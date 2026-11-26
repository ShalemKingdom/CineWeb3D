# Experimental portability: local sandbox distribution

No package is published. Node >=22.12 and npm are required. Review the repository and locks, run its release/security/audit checks, then run `node scripts/package-portable.mjs` and `npm pack ./reports/portable/package --pack-destination ./reports/portable`. Transfer the resulting tgz to a separate directory. It is a local artifact, not a registry package or production release.

In an otherwise empty directory, `npm init -y` and `npm install --ignore-scripts /absolute/path/to/cineweb3d-runtime-0.6.0-alpha.9.tgz`. The installed executable offers:

- `npx cineweb3d doctor`: check Node version and resolution of the three core modules (does not validate WebGL, browsers or the whole environment).
- `npx cineweb3d create ./site`: create a fictional Aurora demo in an empty directory. Then `cd site`, `npm install --ignore-scripts /absolute/path/to/the.tgz`, `npm run build`, `npm run dev`.
- `npx cineweb3d integrate /path/to/existing`: create an isolated `cineweb3d-demo` child, refusing a nonempty target. Install the tarball inside that child; no existing app files are modified. Integrating its UI into an existing app is manual.
- `npx cineweb3d skill-install`, `skill-update`, `skill-uninstall`: manage `~/.agents/skills/cineweb3d`; `--skill-root /absolute/path` provides an isolated test location. The installer checks a receipt and SHA-256 hashes and refuses unowned or edited installations. Update needs an installed newer reviewed tarball. Uninstall removes only unchanged managed files. Existing manual installations are intentionally not adopted.

The runtime package contains the scene, browser helpers, CSS, a static demo and the instruction bundle. It does not contain the repository's planner, audit/release commands, asset pipeline, Blender or AI tools; use a separately reviewed compatible checkout for these. HTML is a concept, remains noindex, uses no paid API, and requires real business facts before deployment. The generated project needs its own lockfile, security/license review, tests and deployment configuration. The installer and package are experimental, not audited for every OS, concurrent operation or hostile filesystem. Do not execute unreviewed npm lifecycle scripts or publish these artifacts.

## Distribution boundaries and trade-offs

The current private tarball is a staging vehicle, not a completed multi-package release. It pins its direct runtime versions but does not provide a committed consumer lockfile; the consumer's first npm install still resolves transitive dependencies and must retain and audit its own lockfile. Its local tarball can be SHA-256 checked after transfer, but no signed release or provenance chain exists yet.

For a future release, evaluate separately versioned packages for the runtime, CLI/scaffolds, skill bundle and optional GLB/video/Blender/AI tooling. A single tarball is easier to install and test while APIs are experimental, but couples their versions and does not meet that modular release architecture. Publishing separate packages would require an explicit compatibility matrix, locked build graphs, verified provenance and notices, upgrade/migration tests, and registry namespace ownership. No public registry names or release dates are promised.

`integrate` currently copies an isolated example into a child directory; it does not wire routing, build configuration, or styles into an existing app. Run its build and browser tests, then integrate modules manually. The Three.js chunk remains above 500 kB uncompressed. Its loading is deferred, but an actual reduction below that threshold remains open. The installer is not a hardened multi-user security boundary; concurrent operations, process interruption, hostile replacement of the receipt, Windows and macOS need further review and tests. A manually installed skill has no managed receipt and is intentionally not overwritten.

## Integrity and proposed platform CI

Generate and check an independent checksum file after packing:

```sh
node scripts/portable-integrity.mjs create reports/portable/cineweb3d-runtime-0.6.0-alpha.9.tgz reports/portable/checksums.json
node scripts/portable-integrity.mjs verify reports/portable/cineweb3d-runtime-0.6.0-alpha.9.tgz reports/portable/checksums.json
```

The checksum protects against accidental changes only when the manifest is obtained through a separately trusted channel. It is not a signature, a software bill of materials, or a provenance attestation. The platform workflow proposes Linux, Windows and macOS checks; the workflow is not evidence that any particular run succeeded. Generate an SBOM from the consumer's actual lockfile and independently verify provenance before distribution.

## Private workspace experiment

`distribution/` contains five private npm workspaces at `0.6.0-alpha.9`. The core owns the browser runtime; CLI owns the installer and demo scaffolding; skill owns its manifest and references; templates owns the Aurora template; tools owns checksum tooling. The CLI depends on skill and templates; templates depends on core. Core pins Three.js, Anime.js, Lenis and web-vitals. Their packages are local alpha artifacts, not npm registry releases.

Run `node scripts/workspace-check.mjs`, `npm audit --prefix distribution --package-lock-only --audit-level=low`, then `npm ci --prefix distribution --ignore-scripts`. Pack locally from `distribution` with `npm pack --workspaces --ignore-scripts --pack-destination ../reports/workspaces`. Test with local tarballs; because none is published, a consumer must provide all needed tarballs to npm. `tests/workspaces.test.js` detects drift between packaged core/skill and the repository and tests a local synthetic upgrade and rollback of skill files. A separate `npm run test:upgrade` builds two synthetic local tarball sets, installs and updates them through npm, simulates a backup interruption, recovers, rolls back and uninstalls. They are test fixtures, not independently released versions; actual cross-release migration and all crash windows remain unverified.

The provenance workflow creates checksums, SBOMs, and requests GitHub's signed build attestations for the five tarballs. Verify an artifact with `gh attestation verify ARTIFACT --repo ShalemKingdom/CineWeb3D` after obtaining it and its attestation from GitHub. A configured workflow is not evidence of a successful or verified attestation; inspect the actual run. CycloneDX SBOMs include development dependencies as enumerated by npm on the runner; compare against lockfiles for platform-specific optional packages. Vite and Next framework fixtures were exercised; full application integration and other GLB asset classes require separate validation.

`node scripts/check-sbom-coverage.mjs` compares CycloneDX component references with every versioned entry in the four lockfiles, including development and optional dependencies. Duplicate lock paths may represent the same component. This coverage check is not a validation of external tools, operating-system packages, media rights or dependency relationships.

### Framework lifecycle evidence

For a client-routed page, `@cineweb3d/core/controller` exports `mountExperience()`, returning an idempotent cleanup function. Invoke it after the page DOM exists and call cleanup when it unmounts. A local Next.js 16.4.6 App Router fixture using this cleanup compiled under webpack and Turbopack and restored the procedural 3D scene after client navigation away and back. Separating the optional decoder loader from the controller removed the previous Turbopack compilation error. A separate fixture subsequently tested one validated Draco-compressed GLB with both Turbopack and webpack, including navigation and failed-decoder fallback. This does not validate every GLB, extension, CSP or hosting configuration.

A separate Astro 7.4.13 static page using the local core tarball compiled and its desktop/mobile browser smoke checks passed; dynamic view transitions and automatic integration into existing projects remain unverified. Vite standalone tarball use has also been tested. No framework configuration or application files are modified automatically.

Example client lifecycle for the tested Next webpack fixture (the page must supply the documented `#scene`, `#scene-poster`, `#quality` and `#quality-status` elements):

```jsx
'use client';
import {useEffect} from 'react';
import {mountExperience} from '@cineweb3d/core/controller';
export function SceneLifecycle() {
  useEffect(() => mountExperience(), []);
  return null;
}
```

The earlier webpack fixture included a `{resourceQuery: /url/, type: 'asset/resource'}` rule for the optional local decoder. The procedural adapter does not import those decoders; do not add a broad asset rule without reviewing its impact. Avoid auto-editing a project's Next config; validate its own build, optional decoder paths, client navigation and cleanup.

### Recover an interrupted skill update

If an update stopped after saving its managed backup but before restoring the target, use `npx cineweb3d skill-recover` (or pass `--skill-root /absolute/path`). Recovery requires the destination to be absent and exactly one `.cineweb3d-backup-<pid>` directory with a valid, unchanged installer receipt. It refuses edited, ambiguous or unowned backups and never replaces an existing destination. Review any remaining stage directories manually. This does not yet provide automatic recovery from every interruption or protect against concurrent hostile filesystem changes.

The local upgrade test defaults to npm offline mode. On a clean CI runner, `CINE_ALLOW_NETWORK=1 npm run test:upgrade` allows npm to retrieve registry metadata for pinned third-party dependencies; the CineWeb3D versions under test remain local synthetic tarballs and installation uses `--ignore-scripts`.

### Framework adapters and optional decoder

The core provides `@cineweb3d/core/adapters/vite`, `/astro`, and `/next`. Invoke the respective mount function after the DOM exists; call the returned cleanup at teardown. The Astro adapter also cleans up on `astro:before-swap`; mount it again after a subsequent page load. The Next adapter belongs in a client component effect, with its return value used as the effect cleanup. These are explicit integration APIs and do not modify project files.

The framework adapters do not automatically import the optional Blender loader. Vite users can explicitly import `loadBlenderModel` from `@cineweb3d/core/blender-vite` and pass it as `loadBlenderModel` to the adapter. The original Vite showcase opts in automatically. Next/Turbopack can opt in to the distinct portable loader described below. Astro and Next applications should use their own CSP and same-origin asset rules. See `docs/physical-device-diagnostics.md` for real-device measurement.

Skill install, update, uninstall and recovery now use an atomic `.cineweb3d-lock` directory to serialize cooperating CLI processes. An existing lock causes a safe refusal. If a process terminates abruptly, inspect the installation and backup state and ensure no operation is running before manually removing a stale empty lock. The lock does not prevent a separate hostile process from modifying files or symlinks; it is not a security boundary against an adversarial local user. Recovery still refuses ambiguous, modified or unowned backups.

## npm organization and scope ownership (step 14.4.2)

The five private workspaces use the intended scope `@cineweb3d`. A public registry search or package 404 does not establish scope availability or ownership. The project owner must authenticate personally at https://www.npmjs.com/, enable two-factor authentication, and choose **Add an Organization** from the account menu. Enter `cineweb3d` and choose the free **Unlimited public packages** plan for this genuine open-source project. Creating an organization does not publish packages. Confirm owner access in the organization dashboard; if the name is unavailable, stop and review npm's naming/dispute policy rather than attempting to claim someone else's scope. Do not register names merely to reserve them.

For local authentication, run `npm login --registry=https://registry.npmjs.org/` and `npm whoami --registry=https://registry.npmjs.org/`. The latter confirms account identity, not organization ownership; check the dashboard separately. Never share credentials, recovery codes or tokens. Keep every workspace's `private: true` flag and do not run npm publish. Local tarballs remain the experimental distribution method; private registry hosting would require a paid plan.

Official references: https://docs.npmjs.com/creating-an-organization/ ; https://docs.npmjs.com/configuring-two-factor-authentication/ ; https://docs.npmjs.com/about-organization-scopes-and-packages/ ; https://docs.npmjs.com/policies/disputes/ .

Scope ownership remains unverified until the owner completes these steps. One local Draco GLB has been exercised under Turbopack; broader asset, browser and production-hosting validation remains open.

### Optional GLB and Draco in Next/Turbopack

For a reviewed, self-contained GLB, install the private experimental `@cineweb3d/core` and `@cineweb3d/tools` tarballs from the same reviewed build. From the application root, create the parent directory `public/cineweb3d`, then run:

```sh
node node_modules/@cineweb3d/tools/decoder-assets.mjs public/cineweb3d/draco
```

The command requires Three.js 0.181.2, checks the SHA-256 of the three upstream Draco files, includes the Apache-2.0 notice and refuses an existing destination. A failure while writing may leave a partial new directory; review and remove it manually before retrying. Set your host's headers and content security policy deliberately; Draco workers may require same-origin decoder access, `blob:` workers and WebAssembly execution. Do not copy private inputs into `public`.

In a Next client component, explicitly opt in and return cleanup from the React effect:

```jsx
'use client';
import {useEffect} from 'react';
import {mountNextExperience} from '@cineweb3d/core/adapters/next';
const loadBlenderModel = (...args) =>
  import('@cineweb3d/core/blender-portable').then(m => m.loadBlenderModel(...args));
export function SceneLifecycle() {
  useEffect(() => mountNextExperience({loadBlenderModel}), []);
  return null;
}
```

Place an approved GLB at `public/models/coffee.glb` for the default URL and use the existing `?model=blender` demo opt-in. If an application uses a non-root base path, supply an explicit same-origin model URL and decoder directory when calling `loadBlenderModel`. The procedural controller does not import the optional loader. The model parser rejects external GLB resources and the decoder path must be same-origin. The repository's asset validation and optimization tools remain optional and should be run on the trusted input before use. Test the app's own CSP, base path, browser and GLB extensions; no decoder binaries, Blender or AI tool is downloaded at runtime.

#### Reproduce the isolated Next/Draco check

With the reviewed repository dependencies and optional Blender/asset toolchain already installed, generate and validate a local model without rendering frames. Use fresh output paths; these commands do not publish the resulting GLB:

```sh
npm run blender:check
npm run blender:build
npm run assets:optimize -- generated/blender/coffee/scene.glb /tmp/cine-coffee-draco.glb --profile balanced --codec draco --max-mib 2
mkdir -p reports/workspaces
(cd distribution && npm pack --workspaces --pack-destination ../reports/workspaces --ignore-scripts)
node scripts/prepare-next-glb-fixture.mjs /tmp/cine-next-glb-fixture
```

The fixture generator refuses an existing target and does not install dependencies. In the fixture directory, generate a lockfile for its pinned Next/React versions and the two reviewed local tarballs, audit it, then install without lifecycle scripts. Replace `/PATH/TO/REPO` with the actual checkout location:

```sh
cd /tmp/cine-next-glb-fixture
npm install --package-lock-only --ignore-scripts /PATH/TO/REPO/reports/workspaces/cineweb3d-core-0.6.0-alpha.9.tgz /PATH/TO/REPO/reports/workspaces/cineweb3d-tools-0.6.0-alpha.9.tgz
npm audit --package-lock-only --audit-level=low
npm ci --ignore-scripts
node node_modules/@cineweb3d/tools/decoder-assets.mjs public/cineweb3d/draco
cp /tmp/cine-coffee-draco.glb public/models/coffee.glb
NEXT_TELEMETRY_DISABLED=1 npx next build --turbopack
NEXT_TELEMETRY_DISABLED=1 npx next start --hostname 127.0.0.1 --port 4185
```

In a second terminal at the checkout root, run `CINE_NEXT_URL=http://127.0.0.1:4185/ node scripts/test-next-glb.mjs`. It checks a real Draco decode, procedural request isolation, navigation, observed WebGL buffer deletion, decoder failure fallback and unmount during an in-flight decoder request. Repeat with `next build --webpack` after stopping the server. Chromium and Playwright must be installed separately. This is a local lab check; physical devices and other GLB extensions remain separate tests.

These unpublished experiments currently reuse version `0.6.0-alpha.9` while contents change. Do not treat that version as an immutable release. When retesting a replaced local tarball, verify its integrity, reinstall it and clear only the fixture's generated Next build cache before comparing results. A future release must assign a new version to changed contents and regenerate its locks and attestations.

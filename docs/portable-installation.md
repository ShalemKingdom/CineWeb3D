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

The provenance workflow creates checksums, SBOMs, and requests GitHub's signed build attestations for the five tarballs. Verify an artifact with `gh attestation verify ARTIFACT --repo ShalemKingdom/CineWeb3D` after obtaining it and its attestation from GitHub. A configured workflow is not evidence of a successful or verified attestation; inspect the actual run. CycloneDX SBOMs include development dependencies as enumerated by npm on the runner; compare against lockfiles for platform-specific optional packages. Existing Vite demonstration works from the local package. Secure Astro/Next adapters and full application integration are not implemented.

`node scripts/check-sbom-coverage.mjs` compares CycloneDX component references with every versioned entry in the four lockfiles, including development and optional dependencies. Duplicate lock paths may represent the same component. This coverage check is not a validation of external tools, operating-system packages, media rights or dependency relationships.

### Framework lifecycle evidence

For a client-routed page, `@cineweb3d/core/controller` exports `mountExperience()`, returning an idempotent cleanup function. Invoke it after the page DOM exists and call cleanup when it unmounts. A local Next.js 16.4.6 App Router fixture using webpack and this cleanup compiled and restored the 3D scene after client navigation away and back. The fixture required a webpack `resourceQuery: /url/` asset rule for the optional local Draco decoders. The default Turbopack build failed on those Vite-style decoder imports; it is not supported by this experiment. The fixture is not a general installer or proof of optional GLB decoder compatibility in Next.

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

For that fixture only, the Next `webpack` configuration appended `{resourceQuery: /url/, type: 'asset/resource'}` to `config.module.rules` and the build used `next build --webpack`. Review existing rules before adopting this: an overly broad rule can change other assets. Avoid auto-editing a project's Next config; validate its own build, decoder paths, client navigation and cleanup.

### Recover an interrupted skill update

If an update stopped after saving its managed backup but before restoring the target, use `npx cineweb3d skill-recover` (or pass `--skill-root /absolute/path`). Recovery requires the destination to be absent and exactly one `.cineweb3d-backup-<pid>` directory with a valid, unchanged installer receipt. It refuses edited, ambiguous or unowned backups and never replaces an existing destination. Review any remaining stage directories manually. This does not yet provide automatic recovery from every interruption or protect against concurrent hostile filesystem changes.

The local upgrade test defaults to npm offline mode. On a clean CI runner, `CINE_ALLOW_NETWORK=1 npm run test:upgrade` allows npm to retrieve registry metadata for pinned third-party dependencies; the CineWeb3D versions under test remain local synthetic tarballs and installation uses `--ignore-scripts`.

### Framework adapters and optional decoder

The core provides `@cineweb3d/core/adapters/vite`, `/astro`, and `/next`. Invoke the respective mount function after the DOM exists; call the returned cleanup at teardown. The Astro adapter also cleans up on `astro:before-swap`; mount it again after a subsequent page load. The Next adapter belongs in a client component effect, with its return value used as the effect cleanup. These are explicit integration APIs and do not modify project files.

The framework adapters do not automatically import the optional Blender loader. Vite users can explicitly import `loadBlenderModel` from `@cineweb3d/core/blender-vite` and pass it as `loadBlenderModel` to the adapter. The original Vite showcase opts in automatically. Next/Turbopack procedural scenes work without that loader; GLB/Draco through Turbopack has not been validated and should not be claimed as supported. Astro and Next applications should use their own CSP and same-origin asset rules. See `docs/physical-device-diagnostics.md` for real-device measurement.

Skill install, update, uninstall and recovery now use an atomic `.cineweb3d-lock` directory to serialize cooperating CLI processes. An existing lock causes a safe refusal. If a process terminates abruptly, inspect the installation and backup state and ensure no operation is running before manually removing a stale empty lock. The lock does not prevent a separate hostile process from modifying files or symlinks; it is not a security boundary against an adversarial local user. Recovery still refuses ambiguous, modified or unowned backups.

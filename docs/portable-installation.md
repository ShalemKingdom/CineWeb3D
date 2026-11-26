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

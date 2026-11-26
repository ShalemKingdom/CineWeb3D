# Third-party notices (preliminary)
Original code MIT. Core dependencies Three.js, Anime.js and Lenis are MIT upstream; verify exact installed versions and retain notices. See docs/catalog.md. No third-party source, model weights or binaries vendored. External tools and optional modules retain their own licenses. Generate exact notices from lockfile and final distribution before publishing.

v0.4.0 adds Astro, Tailwind CSS, Lighthouse CI, Sharp, Web Vitals, Playwright and axe-core to the catalog. They retain their own licenses. Review all resolved package licenses, transitive dependencies, native binaries and notices before release. The SVG coffee poster was authored for this demo and is part of the original project.

Blender Bridge v0.5.0 contains original Python scripts and geometry, not Blender software. Blender is an external GPL tool; its license and any separate asset rights still apply. No additional upstream project added to the catalog.

Alpha 3 adds optional glTF Validator (Apache-2.0 upstream) and glTF Transform CLI (MIT) as isolated build tools. Three.js decoder assets incorporate upstream Meshoptimizer (MIT) and Draco (Apache-2.0); retain upstream notices and audit bundled decoder files and exact tool dependencies before publishing. No decoder binaries or third-party models are included in this ZIP.

## Sandbox lockfile inventory — 2026-11-25
Root runtime (resolved versions): Three.js 0.181.2 (MIT), Anime.js 4.5.0 (MIT), Lenis 1.3.28 (MIT), Web Vitals 5.3.0 (Apache-2.0). Build/test tooling includes Astro 7.4.13 (MIT), Vite 7.3.8 and Astro Vite 8.3.8 (MIT), Lighthouse CI 0.16.1 and Sharp 0.35.5 (Apache-2.0 declarations), axe-core (MPL-2.0), and Sharp platform binaries with LGPL terms. Review actual native-library notices and all nonpermissive or multi-license entries before redistribution. The root dev-only Sentry package (sentry@0.50.0) declares FSL-1.1-Apache-2.0 and is reached via Lighthouse; it is not part of the declared browser runtime, not MIT, and requires review before public stable release. Keep tools separate and never bundle them with generated websites. This inventory of declared licenses does not replace an actual LICENSE/NOTICE review.

## Step 10: license policy and evidence
The Security & License Shield records package declarations, CycloneDX SBOMs and installed LICENSE/NOTICE texts (where present). FSL sentry@0.50.0 is an exact sandbox-only development exception, prohibited by the stable gate. Tooling MPL/LGPL terms require notices and separate distribution review. See docs/security-license-shield.md. No blanket MIT claim for third-party files.

# Portability implementation plan

**Goal:** Prove an unpublished, versioned local package can create and enhance a project without a CineWeb3D checkout.
**Architecture:** A build step assembles the reviewed runtime, static assets and separately managed skill into an npm tarball; the installed CLI stages files without overwriting and tracks skill ownership. The existing repository remains authoritative for advanced toolchains. Split Vite's Three.js module while keeping lazy loading and notices.
**Constraints:** sandbox only; no publishing, paid APIs, model weights or main changes; keep Aurora and original noindex/accessibility features.

- [x] Test safe installation, unchanged reinstallation, changed-file refusal and uninstall in temporary homes.
- [x] Package runtime and CLI, install a tarball in an empty external project, build and run it.
- [x] Split runtime bundle and rerun Aurora/browser, license, build, SEO and performance gates.
- [x] Update mirrored skill and project documentation; record limitations and exact evidence.

Outstanding: the Three.js chunk remains above 500 kB; existing-app wiring, independent package publication and release hardening remain open.

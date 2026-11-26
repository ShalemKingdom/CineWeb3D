# Security
Report suspected vulnerabilities privately through GitHub private vulnerability reporting if enabled; otherwise contact repository maintainers privately. Never publish credentials or exploit details in public issues. Bind local media services to localhost; review custom nodes, model sources and dependency updates. No production security guarantee for this experimental version.

## Dependency and release policy
Report security issues privately. CI pins action commits, uses read-only permissions and audits all three committed lockfiles before installing. Run `npm run security:check` and review the evidence in `docs/security-license-shield.md`. A stable release requires `npm run security:stable -- --installed` plus manual review of distributable files and upstream notices. No stable release while the documented FSL exception remains. Never include credentials, node_modules or unreviewed model weights in published artifacts.

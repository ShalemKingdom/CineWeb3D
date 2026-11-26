# Security policy / Política de seguridad

CineWeb3D is experimental. The current development branch is sandbox (0.6.0-alpha.9); no stable or production support guarantee, SLA or guaranteed patch timeline exists. Earlier snapshots are not maintained.

Report suspected vulnerabilities using GitHub private vulnerability reporting **if enabled**: https://github.com/ShalemKingdom/CineWeb3D/security . If disabled, contact maintainers privately via a channel they have made available, without posting exploit details, credentials or personal data in issues. Include the affected commit, component, reproducible steps, impact and a redacted example. Do not test against third-party or production systems without permission. Coordinate disclosure with maintainers.

## Dependency and release policy

CI pins action commits, uses read-only permissions and audits all three committed lockfiles before installing. Run `npm run security:stable` and review [Security & License Shield](docs/security-license-shield.md). Stable publication requires installed license evidence, distribution notice review, passing tests and explicit maintainer authorization. FSL is blocked in all modes. Keep local media services on loopback, review custom nodes and model rights, and never publish credentials, node_modules or unreviewed weights.

Repository-level rules and private reporting require administrator configuration; see [repository protection](docs/repository-protection.md). A configuration file alone does not activate GitHub settings.

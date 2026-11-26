# Contributing / Cómo contribuir

CineWeb3D is experimental. Contributions are welcome in English or Spanish. Start with an issue describing the problem, proposed solution and acceptance criteria. Read [AGENTS.md](AGENTS.md), the relevant [architecture](docs/architecture.md), [security policy](SECURITY.md) and [code of conduct](CODE_OF_CONDUCT.md).

## Workflow

1. Fork the repository and base a feature branch on the current development branch (`sandbox` while the initial release is prepared). Avoid direct pushes to main.
2. Use Node 22.23.4+ (22/24 LTS recommended), npm and Git. Run `npm run setup` to inspect the plan; `npm run setup -- --install --all` explicitly installs all three reviewed npm graphs after license and vulnerability gates. Review dependency lifecycle scripts in a trusted environment first.
3. Make one focused change. Keep original assets, licenses and source credits. Do not add GSAP, FSL, mandatory paid APIs, automatic model downloads or hidden telemetry.
4. Run tests, both builds, browser checks and appropriate Lighthouse audits. See [validation guide](docs/contributor-validation.md). Include real evidence and skipped checks.
5. Open a pull request targeting sandbox during development. Maintainers review and approve integration; main is reserved for reviewed release candidates. Do not force-push shared branches or bypass checks.

Optional tools (Python, FFmpeg, Blender, GPU models) are separate. Read their guides before installing. Never commit secrets, customer data, private briefs, node_modules, generated heavy assets or unapproved media. Contributions to original code are under the repository MIT license; third-party works retain their own licenses. By submitting, confirm you have the right to contribute the material. Report vulnerabilities privately, not as public issues.

# Contributing to MORVA

MORVA welcomes careful contributions to the research console, protocol specification, and documentation.

## Research Posture

Contributions should be:

- technically precise;
- explicit about assumptions and trust boundaries;
- reproducible where possible;
- restrained in claims;
- consistent with the distinction between simulated and externally verified state.

Do not describe a planned system as deployed, a local fixture as on-chain data, or an interface animation as a cryptographic proof.

## Before Making a Change

Read:

1. [README.md](README.md)
2. [ARCHITECTURE.md](ARCHITECTURE.md)
3. [PROTOCOL.md](PROTOCOL.md)
4. [SECURITY.md](SECURITY.md)
5. the relevant document under `docs/`

Changes to identity derivation, body derivation, commitment encoding, transition serialization, lifecycle rules, or wake verification require a protocol-version discussion.

## Repository Structure

- `dist/` — deployed static research console;
- `docs/` — focused research and implementation notes;
- `scripts/` — dependency-free local validation and preview tools;
- root Markdown files — project overview, architecture, protocol, specimen model, and security policy.

The deployed site currently lives directly in `dist/`. Do not reorganize it merely to imitate a framework layout.

## Local Validation

Use Node.js 22 or newer (Node.js 20 requires at least 20.11):

```bash
npm ci
npx playwright install chromium
npm run check
npm test
npm run dev
```

Before submitting a change, verify:

- the static console loads without console errors;
- desktop and mobile layouts have no unintended horizontal overflow;
- keyboard access remains intact;
- local asset and documentation links resolve;
- simulated state is visibly distinguished from external verification;
- no secret or local-machine path is present.

CI validates the repository, runs the Chromium regression suite and scans Git history with Gitleaks. See [Development](docs/development.md) for the same local commands. Pull requests must explain their simulation/protocol boundary; no deployment credentials are available to CI.

## Documentation Style

For code, preserve native JavaScript, existing module boundaries and nearby formatting. Do not add a framework or runtime dependency to implement a documentation change. Keep fixture-generation inputs stable unless the change explicitly versions and tests them.

For interaction changes, name the renderer under test, record desktop/touch/keyboard behavior, test stress/TUN/wake and verify identity/root invariants. Include private-data-free screenshots for visual changes. Use the bug-report or feature-request templates for reproducible reports.

Use natural, professional English. Prefer definitions, invariants, diagrams, and falsifiable statements over promotional language.

Avoid:

- speculative capability presented as fact;
- artificial urgency or financial language;
- decorative badge walls;
- personal contact details;
- unexplained acronyms;
- biological claims unsupported by the computational model.

## Security and Privacy

Never include private keys, wallet seeds, credentials, deployment tokens, environment files, private email addresses, or personal profiles.

If a credential is discovered in history, do not push. Follow [SECURITY.md](SECURITY.md).

## Change Scope

Keep changes focused. A contribution should explain:

- what behavior or specification changes;
- why the change is necessary;
- what invariant it preserves or modifies;
- how it was verified;
- whether it affects only simulation or also the protocol model.

## License

The owner has confirmed the right to publish and license the project's code and organism images under the existing [MIT License](LICENSE). Contributions must be yours to license under those terms, or carry a clearly identified compatible third-party license. Supply attribution and permission evidence; do not grant rights on behalf of a third party. Read [Third-party notices](THIRD_PARTY_NOTICES.md), including the exclusions for third-party trademarks.

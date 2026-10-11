# Development and Operations

## Stack and source layout

The application is native HTML, CSS and JavaScript with Canvas 2D. No frontend framework, transpiler, backend or package runtime is required. The established editable source is in `dist/`; there is intentionally no duplicated `src/` or `public/` tree.

| Path | Responsibility |
| --- | --- |
| `dist/index.html` | Page content, official links and metadata |
| `dist/assets/organism.js` | Provider, lifecycle, persistence, Terminal and telemetry |
| `dist/assets/amoeba.js` | Retained alternative membrane experiment; not loaded by the current page |
| `dist/assets/visuals.js` | Research instrument visualization and inspection |
| `dist/assets/styles.css` | Layout and visual language |
| `dist/vercel.json` | Production security headers |
| `scripts/serve.mjs` | Loopback-only local preview |
| `scripts/validate.mjs` | Repository, links, brand and basic secret checks |
| `tests/` | Playwright browser regression tests |

## Install and run

Use Node.js 22 or newer. Node.js 20.11+ can run the source, but CI targets 22.

```bash
git clone https://github.com/theovarne/milono.git
cd milono
npm ci
npm run build
npm run dev
```

Open `http://localhost:4173`. `build` validates the existing static source; it does not bundle or regenerate `dist/`. Stop preview with Ctrl-C. The preview is a development server, not a production hosting service.

## Tests

```bash
npx playwright install chromium
npm test
```

On Linux CI use `npx playwright install --with-deps chromium`. Tests launch their own preview on port 4184 unless `MILONO_TEST_URL` is set. Output is under ignored `qa/test-results/`.

The active suites are `tardigrade.spec.mjs`, `brand.spec.mjs` and `terminal.spec.mjs`. The retained amoeba and membrane-interaction suites are historical and excluded by the configuration. Run the build from a clean checkout or release snapshot: local untracked setup notes can intentionally trigger the machine-path/privacy validator and must not be published.

| Environment variable | Purpose | Default |
| --- | --- | --- |
| `MILONO_PORT` | Manual preview port | 4173 |
| `PORT` | Fallback preview port | 4173 |
| `MILONO_CHROME` | Optional installed Chromium/Chrome executable | Playwright Chromium |
| `MILONO_TEST_URL` | Explicit remote test origin | Isolated local preview |

No `.env` is needed. There are no application API keys, RPC endpoints, wallet seeds, database credentials or deployment tokens. Do not add such material to browser source or tests.

PowerShell example for an existing Chrome installation: set `MILONO_CHROME` to its executable path in your own shell, then run `npm test`. Do not commit machine-specific paths.

## Continuous integration

`.github/workflows/ci.yml` runs on pushes to main, pull requests and manual dispatch:

1. **validate-and-test:** locked dependency install, static validation, Chromium setup and browser regression tests.
2. **secret-scan:** full fetched Git history scanned with Gitleaks 8.30.1. The release archive is checked against its published SHA-256 checksum before execution.

Actions are pinned to commit hashes, permissions are read-only, checkout credentials are not persisted, and failed browser artifacts expire after seven days. CI does not deploy and has no deployment secrets. The exact public localStorage namespace exception in `.gitleaks.toml` is not an exemption for arbitrary keys.

Before publishing changes, run the scanner locally as well:

```bash
gitleaks git . --log-opts="--all" --redact
gitleaks git . --staged --redact
```

The validator's keyword checks supplement, not replace, the history scan and manual review. No scanner proves absence of every possible secret. If real secret material is found, stop publication and follow [Security](../SECURITY.md).

## Production deployment

The official origin is `https://milono.xyz/`. The `www.milono.xyz` alias serves the same project; canonical and social metadata use the apex. The previous `www.ameba.life` domain remains available during migration. Vercel serves the contents of `dist/`; no build transformation or runtime environment variables are needed.

For an authorized maintainer with Vercel CLI access:

```bash
cd dist
vercel link
vercel --prod
```

Select the **existing** project, not a new one. Confirm its current production domains before deploying. `.vercel/` contains account-specific linkage and stays ignored. The historical `.openai/hosting.json` is not the active production deployment path. Do not add hosting tokens to GitHub or the static website merely to run CI.

After deployment check HTTPS, redirects, canonical URL, social-image origin, assets, browser errors, mobile layout and interactions. `MILONO_TEST_URL` can point the existing tests at the production origin for this verification.

## Publication scope

Website source, protocol notes, fixtures, tests and operational documentation are public. Legacy storage identifiers and dated historical verification notes may retain previous identifiers for compatibility and provenance; they do not define the current brand. Official links are validated against MILONO's current repository, domain and X account.

No wallet, contract interaction or CA is required to run the project. The header displays the owner-provided public CA `8HzSYtmSxBPQqCDevZHWY5DJvKRB25Lvh7vYYoK2pump`; this is display text, not a wallet integration or an independently verified contract.

As of 2026-10-11, production is intentionally paused in Vercel at the owner's request. HTTP 503 with `DEPLOYMENT_PAUSED` is expected; do not unpause or redeploy merely to migrate development machines. See [Mac migration handoff](../MAC_HANDOFF.md) for the current operational state and transfer checklist.

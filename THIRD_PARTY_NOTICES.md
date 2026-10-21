# Third-Party Notices and Provenance

Inventory updated on 2026-10-22. This document records source evidence and the owner's rights confirmation from the 2026-10-11 review; it is not an independent legal clearance.

## Existing Project License

[LICENSE](LICENSE) already contained an MIT notice before this repository-completion task. That notice is preserved, not newly selected. The package's existing MIT metadata is likewise not proof of ownership of inherited content.

The initial page import records an external source. During the 2026-10-11 review the project owner explicitly confirmed possession of the rights to publicly publish and license the original website code and organism images, and authorized continued MIT licensing, excluding third-party trademarks. This attestation resolves the publication decision for this update; no independent chain-of-title audit was performed.

## Inventory

| Material | Location / use | Evidence and status |
| --- | --- | --- |
| Original page/layout/content and water-bear image | Initial import; `dist/index.html`, CSS; old raster artwork retained in Git history | External-source import; owner confirmed publication/licensing rights on review date |
| Current segmented organism brand | `dist/brand/morva-reference.png`, `morva-mark.png`, `morva-logo.png` | Owner-provided visual reference; dedicated mark prepared with the built-in image tool at owner's request; see [brand system](docs/brand-system.md) |
| Favicon and social exports | `dist/brand/`, `dist/favicon.ico` | Simplified code-native SVG derived from the new reference's double-eye and antenna motifs; deterministic browser exports |
| Amoebic renderer and SVG | `dist/assets/amoeba.js`, `amoeba.svg` | Repository implementation history; not evidence that all input/reference material is owned |
| Console screenshot | `docs/assets/research-console.png` | Fresh browser-only capture of this interface; includes inherited artwork and does not grant independent rights to it |
| Fonts | CSS font stacks | No font binaries or remote font imports; local/system fallback fonts are selected |
| GitHub and X marks | Inline social SVGs in `dist/index.html` | Third-party brand marks; not project-owned artwork or covered by a blanket project grant |
| Playwright tooling | npm development dependency tree | Apache-2.0; installed package LICENSE/NOTICE files retained by npm |

## Development Dependencies

The lockfile pins `@playwright/test`, `playwright` and `playwright-core` at 1.63.0. Their package metadata declares Apache-2.0. They are development tools, not JavaScript libraries shipped to website visitors.

Installed notices credit Microsoft Corporation and note code derived from Puppeteer under Apache-2.0. Consult the dependency's included LICENSE and NOTICE when redistributing it. This repository does not vendor or modify those packages.

Primary reference: [Microsoft Playwright repository](https://github.com/microsoft/playwright). The local lockfile and installed notices are the version-specific inventory evidence.

## Social Marks

The GitHub mark links to the project; it is not the MORVA logo and does not imply endorsement. GitHub identifies its marks as its trademarks and provides social-link usage guidance in its [brand toolkit](https://brand.github.com/foundations/logo).

X's [brand toolkit](https://about.x.com/en/who-we-are/brand-toolkit) supplies its own trademark/resources guidance. The presence of an inline SVG does not establish that the project's MIT notice licenses that mark. Exact asset provenance should be confirmed before redistribution as an asset pack.

## Attribution Policy

Retain the original page/material provenance and the owner's rights confirmation. New contributions should include source and license evidence. Where permission cannot be established, use independently licensed replacements. Do not remove existing copyright notices or assert that all source/assets were originally created for this repository.

No extra blanket license is added by this update. The existing MIT terms continue for material the project owner is authorized to license; third-party dependency terms and trademark rights remain separate.

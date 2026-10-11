# MILONO Repository Publication Review

Review date: 2026-10-11. This is publication hygiene, not a security certification.

## Baseline

The repository was not empty: local and remote main matched commit `f2aef93` when this review began. Its prior CI run completed successfully. Origin is the designated `theovarne/milono`; the legacy remote remains untouched. No new repository is created.

The application is static HTML/CSS/JavaScript under `dist/`, with no runtime package dependency or required application environment variables. The editable source must not be ignored merely because its directory is named dist.

## Secret Scan

The baseline full-history Gitleaks scan covered 24 commits and reported no detected leaks. Tracked sensitive filenames were absent. Keyword matches were reviewed as documentation, fixtures, security checks or conceptual private-substrate notation. Scan results are limited evidence, not proof that no possible secret exists.

Local deployment linkage, dependencies, generated test output and untracked machine setup notes are excluded from publication. Future changes must pass both staged and full-history scans before push.

## Author Privacy — Owner Decision

A historical initial commit contains a non-noreply personal email address and is already reachable from public main. The address is deliberately not reproduced here.

Current repository-local author configuration uses the project name and an existing GitHub noreply address. This protects new commits but does not erase historical metadata. The owner explicitly accepted that the historical email is already public and requested preserving history and continuing publication. No force push or history rewrite is authorized or performed.

## License / Provenance — Owner Confirmation

An existing MIT notice was found and the initial import records an external page source. The owner explicitly confirmed the right to publicly publish and license the original code and organism images and authorized continued MIT licensing, excluding third-party trademarks. This is an owner attestation, not an independent rights audit. Existing notices remain intact.

See [Third-party notices](../THIRD_PARTY_NOTICES.md) for dependency notices, social-mark exclusions and provenance.

## Verification Scope

Build validation, browser interaction tests, official-link checks and a fresh console screenshot can be completed locally without publishing. The current website is not redeployed or switched to the amoebic experiment during this repository work.

The final publication check must confirm remote commit equality and a successful CI run for the exact new commit. Do not reuse the previous green CI run as proof for unpublished changes.

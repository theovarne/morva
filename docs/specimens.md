# MILONO Specimens

A, B and C are public simulation fixtures, not funded wallets, registered DIDs or cryptographic test vectors.

| Fixture | Illustrative identity | Initial reserve | Stability | Bias |
| --- | --- | --- | --- | --- |
| A | `did:milono:7F2A91C4` | 81.72 | 97.2 | 0.41 |
| B | `did:milono:9C81BE30` | 76.48 | 93.8 | 0.63 |
| C | `did:milono:22D4A67E` | 87.16 | 98.4 | 0.28 |

Roots, commitment fixtures and numeric seeds are unchanged by branding.

## Switching

The optimized tardigrade provider starts fresh fixture state when switching specimens and carries session uptime forward. It does not restore separate saved individuals. Refreshing preserves the currently selected specimen and its state. Compare Two previews fixture differences.

## Storage migration

The current key is `milono.simulation.v2`. Startup checks a valid current record first, then `milno.simulation.v2`, then `ameba.simulation.v2`. These old names are compatibility identifiers, not public branding.

Malformed records are skipped. A valid record is copied without altering epoch, history, reserve, lifecycle or specimen. Future writes use only the current key; old backups and historical per-specimen maps are left untouched. Storage failure does not prevent an in-memory session.

Storage remains origin-scoped. This does not move records between domains, provide tamper resistance or ensure cross-device continuity.

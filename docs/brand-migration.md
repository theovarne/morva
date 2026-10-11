# MILONO Brand Migration

Migration date: 2026-10-11.

The owner selected option 1: keep the optimized tardigrade version, existing layout and interactions. This release does not restore the alternative amoeba renderer.

## Official destinations

- Brand: **MILONO**
- Website: https://milono.xyz/ (migrated from the previous `www.ameba.life` hostname after the brand update)
- X: https://x.com/Milono_sol
- Source: https://github.com/theovarne/milono

The existing public target repository was verified with push/admin access. No duplicate repository is created. The legacy Git remote and existing history are retained; origin points to the owner-designated repository.

## Changes

Header, prose, footer, metadata, accessible labels, Live Specimen, console welcome, Terminal prompt, illustrative DID namespace, package identity and documentation use the new brand. Social links open in a new tab with `noopener noreferrer`. The subsequent [brand-system refinement](brand-system.md) replaces the inherited artwork with the owner's ivory/terracotta segmented organism reference, a dedicated favicon and share image.

The existing Vercel project is retained. The subsequent domain migration makes `milono.xyz` the official origin and keeps the old domain available during transition. CA remains TBA. No historical contract address is reintroduced.

## State compatibility

See [Specimens](specimens.md). Legacy storage names remain exclusively to read prior browser state. Valid new records win. Invalid new records may fall back to a valid old record. Legacy backups are not deleted.

## Intentional exceptions

Real production-domain strings, old storage identifiers, historical asset filenames, historical Git commits and the legacy remote are not rewritten into fictional resources. Archived amoebic experiment notes are explicitly marked as historical and do not define the active renderer.

Cryptographic fixture values and deterministic generators are unchanged. Only the illustrative local DID prefix changes; no deployed external DID is modified.

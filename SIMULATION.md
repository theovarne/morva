# MORVA Simulation Boundary

The active website runs **SIMULATED STATE**, not **EXTERNALLY VERIFIED STATE**. This distinction applies to every specimen, root, commitment, proof label and transition shown by the console.

## Actual Execution Path

```text
UI controls / Terminal
          │
          ▼
SimulationProvider ──→ localStorage
          │
          ├──→ live telemetry / lifecycle
          ├──→ bounded transition and reserve histories
          └──→ visuals and shared inspection context
```

There is no API route, database, RPC client, wallet or background agent. Vercel serves static files. Browser storage is origin-scoped and editable by the user.

## Providers in Source

| Class | Current role |
| --- | --- |
| `OrganismProvider` | State access, subscriptions and persistence |
| `SimulationProvider` | Instantiated provider: fixtures, stress, lifecycle, cycles and history |
| `ChainProvider` | Unconnected stub; `start()` throws |

These are actual classes in [organism.js](dist/assets/organism.js). There is no implemented `ExternalProvider` abstraction to configure.

## Capability Matrix

| Surface | Implemented | Not established |
| --- | --- | --- |
| Identity | Stable A/B/C fixture labels | Ed25519 derivation or real DID resolution |
| Body | Seeded public-fixture nodes and weights | Secret-derived HKDF body or trained model |
| Lifecycle | Local stress and manual controls | Consensus, real compromise detection |
| Metabolism | Resource/cost update formula | Biological energy or monetary balance |
| History | Up to 80 mutable local records | Signatures, durable append-only ancestry |
| Proof | Timed UI and local PASS labels | ZK proof generation or verification |
| Persistence | Current state across refreshes | Cross-domain/device transfer or tamper resistance |
| Morphology | Active neural canvas; retained inactive membrane experiment | Physical simulation or autonomous locomotion |

## Determinism

The same specimen and algorithm produce the same fixture parameters. A session also depends on wall-clock time, user input, viewport and stored state, so it is not exactly reproducible from a specimen identifier alone.

Specimen roots are illustrative constants. Neither `hash32()` nor `hexDigest()` is a cryptographic primitive. A displayed LOCAL PASS is not independent verification.

## Persistence and State Overrides

The current key is `milono.simulation.v2`. Compatible older records are read without deleting their backups. See [Specimens](docs/specimens.md).

Normal wake checks TUN and risk below 52. State-model probe buttons deliberately override state for inspection; they are not guarded protocol transitions. Selecting a different specimen starts its fixture state. These behaviors prevent interpreting UI terminality as a security invariant.

## Future External Verification

A future provider needs canonical records, independently verified signatures and ancestry, a network identifier, finality/fork handling and visible provenance. It must preserve distinct simulated, pending, unverified and verified labels. Simply changing the provider name would not satisfy those requirements.

See [Protocol](PROTOCOL.md) for proposed rules, [Architecture](ARCHITECTURE.md) for layers and [detailed simulation notes](docs/simulation.md) for instruments.

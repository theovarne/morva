# MILONO Architecture

## Scope

MILONO separates a protocol model from its present research implementation.

- **Protocol model** describes how a private substrate could bind public identity, deterministic body, commitments, transitions, and historical continuity.
- **Current implementation** is a static browser console backed by deterministic local simulation.

The current code does not hold a production private key, derive a real Ed25519 keypair, run HKDF for a production body, generate a zero-knowledge proof, or read a blockchain. Those are explicit future verification boundaries.

## Layer 01 — Cryptographic Substrate

```text
sk
```

`sk` denotes private genesis material. It is the common origin of identity and body in the protocol model.

Required properties:

- private and non-exportable during normal operation;
- stable across reconstruction of the same organism;
- distinct for independently instantiated organisms;
- never written to transition history.

The browser simulation contains no production `sk`. Specimen identifiers and numeric fixtures are public demonstration data.

## Layer 02 — Identity

```text
sk
 │
 ▼
pk = Ed25519(sk)
```

`pk` is the public identity verifier. A protocol implementation must use a reviewed Ed25519 library and a documented encoding. Identity is stable even when runtime activity is suspended.

The console renders illustrative identity strings. It does not generate or verify Ed25519 signatures.

## Layer 03 — Body

```text
sk
 │
 ▼
W = HKDF(sk, salt, info)
```

`W` is a deterministic parameter field. Domain-separated HKDF expansion is the proposed derivation mechanism; the exact salt, `info` labels, output encoding, dimensions, and quantization must be fixed before interoperability claims are possible.

The console visualizes deterministic specimen-specific weight fields generated from public fixtures. These fields model reproducibility but are not output from production HKDF.

## Layer 04 — Runtime

```text
observe()
    │
    ▼
decide()
    │
    ▼
act()
    │
    ▼
verify()
    │
    ▼
commit()
```

The runtime receives an environment observation, evaluates it against the body, proposes an action, verifies transition invariants, and commits an append-only record.

```text
Environment
     │
     ▼
Observation
     │
     ▼
MILONO BODY / W
     │
     ▼
Decision
     │
     ▼
Action
     │
     ▼
Verification
     │
     ▼
Transition Ledger
```

The diagram is conceptual: the current provider's `cycle()` rotates action labels `observe`, `decide`, `act`, `verify` and appends local records. It does not implement five independently verified functions or actuate external systems. `addTransition()`, `setStress()`, `wake()` and subscriptions are the actual runtime boundaries.

## Layer 05 — History

```text
T₀ → T₁ → T₂ → ... → Tₙ
```

Each transition commits to its predecessor. A verifier accepts continuity only when ancestry is unbroken and every required invariant is satisfied.

The local console retains a bounded browser history for inspection. It is not a durable, externally signed, or independently replicated ledger.

## Components

### Research Console

The static application in `dist/` provides the observation surface:

```text
Live Specimen
├── Body field
├── Identity trace
├── Weight fingerprint
├── Stress chamber
├── Metabolism trace
├── Transition ledger
├── Proof inspector
├── Specimen comparison
└── Laboratory terminal
```

Every panel reads from the same provider state. Inspection context is shared so selecting a node, weight, cycle, or transition can be queried through the terminal.

The current page loads `dist/assets/organism.js` and `dist/assets/visuals.js`. The retained `dist/assets/amoeba.js` is an inactive rendering experiment. The hero is water-bear artwork; there is no live membrane drag surface. [SIMULATION.md](SIMULATION.md) maps implemented capabilities to their verification limits.

### Provider Boundary

```text
OrganismProvider
        │
        ├── SimulationProvider   current
        │
        └── ChainProvider        proposed, not implemented
```

`OrganismProvider` is the in-browser state and event boundary. `SimulationProvider` is the only functioning provider; it performs local state transitions, persistence and fixture generation. The source also contains an unconnected `ChainProvider` stub whose `start()` throws. Fixture values are reproducible, but wall-clock timestamps and user input affect each session's history.

A future `ChainProvider` must not silently replace local labels with claims of external verification. It would need:

- a defined chain and network identifier;
- canonical account and transaction encodings;
- independent signature and commitment verification;
- explicit finality semantics;
- failure and reorganization handling;
- provenance surfaced in every panel.

### Persistence

The console stores non-secret simulation state in browser `localStorage`. Persistence is an interface convenience, not protocol durability. Clearing site storage resets the local model.

No private key, wallet seed, API credential, or deployment token belongs in browser storage.

## Invariants

### I₁ — Identity Continuity

For accepted transitions, the public identity must resolve to the same genesis substrate commitment.

```text
identity(Tₙ₊₁) = identity(Tₙ)
```

### I₂ — Deterministic Body Derivation

The same substrate and derivation parameters must reproduce the same body root.

```text
derive(sk, params) = W
root(W) = committed_weight_root
```

### I₃ — Valid Transition Ancestry

Every non-genesis transition must reference the canonical hash of its immediate predecessor.

```text
Tₙ₊₁.previous_hash = H(Tₙ)
```

### I₄ — Commitment Consistency

Identity, body root, state, and transition data must match the commitment verified for that epoch.

### I₅ — Historical Continuity

The full accepted path from genesis to the current transition must be verifiable without gaps, forks accepted as canonical without a rule, or unaccounted identity replacement.

## Trust Boundaries

| Boundary | Current console | Protocol target |
| --- | --- | --- |
| Secret custody | none | isolated private substrate |
| Identity derivation | illustrative fixture | Ed25519 public key derivation |
| Body derivation | deterministic fixture | domain-separated HKDF |
| Commitment | simulated label and root | canonical cryptographic commitment |
| Proof | timed interface model | independently verifiable proof |
| History | bounded local records | signed, durable transition ancestry |
| External execution | none | explicitly scoped runtime adapter |

## Failure Model

MILONO distinguishes three classes of failure:

1. **Environmental insufficiency** — computation becomes unsustainable; enter `TUN` while preserving continuity.
2. **Transient runtime failure** — execution stops without invalidating identity; recover from the last verified transition.
3. **Continuity failure** — identity, body root, commitment, or ancestry cannot be verified; enter `DEAD`.

`DEAD` is a protocol terminal condition, not a generic UI error state.

## Performance and Interface Constraints

The research console keeps visualization work on the client:

- pointer-heavy drawing is coalesced with animation frames;
- data surfaces use bounded histories;
- hover details are progressive and do not replace primary content;
- mobile interactions convert hover inspection to tap;
- core content remains usable without a backend.

These constraints describe the console, not the eventual protocol execution environment.

## Evolution

Changes that affect identity derivation, body dimensions, commitment encoding, transition hashing, or wake verification require an explicit protocol version. A version change must not be presented as continuity with an earlier specimen unless a migration rule is specified and independently verifiable.

See [PROTOCOL.md](PROTOCOL.md) for the state and transition specification.

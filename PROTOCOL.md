# MILONO Protocol

## Status of This Document

This document is an experimental specification. It defines a research model and vocabulary; it is not a claim of production deployment or interoperability.

The current repository implements an interactive `SimulationProvider`. Normative cryptographic operations described below are proposed requirements for a future conforming implementation.

## Notation

| Symbol | Meaning |
| --- | --- |
| `sk` | private cryptographic substrate |
| `pk` | public identity key |
| `W` | deterministic body parameter field |
| `R_W` | body or weight root |
| `C` | organism commitment |
| `Tₙ` | transition at epoch `n` |
| `Eₙ` | environment observation at epoch `n` |
| `H(x)` | canonical cryptographic hash of `x` |
| `F` | deterministic transition function |

Keywords **MUST**, **SHOULD**, and **MAY** state protocol intent. They do not imply that the current browser simulation satisfies the requirement.

## 1. Genesis

Genesis instantiates one specimen from one private substrate.

```text
seed
 │
 ▼
sk
 ├────────→ pk
 │
 └────────→ W
             │
             ▼
         commitment
             │
             ▼
        genesis state
```

A conforming genesis procedure MUST:

1. obtain sufficient entropy from an approved source;
2. construct `sk` without logging or exporting it;
3. derive `pk` and `W` through domain-separated functions;
4. compute canonical roots and the initial commitment;
5. emit `T₀` with no predecessor;
6. erase unnecessary intermediate secret material.

The exact entropy requirements, canonical encodings, and parameter dimensions remain to be fixed by a versioned cryptographic profile.

## 2. Identity Derivation

The protocol model uses Ed25519:

```text
pk = Ed25519(sk)
```

Identity derivation MUST be deterministic for the same `sk` and protocol version. The public identity representation MUST include enough version and network context to prevent ambiguous interpretation.

The private substrate MUST NOT appear in a public identifier, log, transition, URL, client bundle, or telemetry event.

The current console uses illustrative `did:milono:` values. They are not derived from a live private key.

## 3. Body Derivation

The proposed body derivation is:

```text
W = HKDF(sk, salt, info)
```

Each output region MUST use an explicit domain separator. A conceptual expansion is:

```text
W_identity  = HKDF-Expand(PRK, \"milono/body/identity/v1\", L₁)
W_decision  = HKDF-Expand(PRK, \"milono/body/decision/v1\", L₂)
W_metabolic = HKDF-Expand(PRK, \"milono/body/metabolic/v1\", L₃)
```

A protocol profile MUST define:

- hash function and HKDF variant;
- salt construction;
- `info` labels;
- output lengths;
- byte order;
- numeric mapping and quantization;
- body dimensions;
- root construction.

Without these parameters, two implementations cannot claim body equivalence.

## 4. Commitment

An organism commitment binds the public identity, body root, protocol version, and genesis context:

```text
C = H(
    domain ||
    protocol_version ||
    pk ||
    R_W ||
    genesis_context
)
```

All fields MUST use canonical encoding. Concatenating variable-length values without length or type framing is invalid.

The commitment MUST NOT reveal `sk` or the uncommitted body parameters.

The current UI displays deterministic commitment fixtures. `VERIFIED` in that interface means internally consistent within the simulation unless explicitly labeled as external verification.

## 5. Transition

The abstract transition rule is:

```text
Tₙ₊₁ = F(Tₙ, Eₙ, W)
```

The execution pipeline is:

```text
OBSERVE → DECIDE → ACT → VERIFY → COMMIT
```

A proposed transition envelope is:

```text
transition {
    version
    epoch
    timestamp
    previous_hash
    state
    observation_root
    action_root
    weight_root
    identity_commitment
    signature
}
```

### Canonical Requirements

- `version` MUST identify the encoding and verification rules.
- `epoch` MUST increase according to the selected history rule.
- `previous_hash` MUST equal `H(Tₙ)` for non-genesis transitions.
- `weight_root` MUST match the committed body for the specimen.
- `identity_commitment` MUST remain stable unless a versioned migration explicitly permits change.
- `signature` MUST authenticate all canonical transition fields.

The semantics of `timestamp` are advisory unless the execution environment provides a trusted time source.

## 6. Verification

A verifier evaluates a candidate transition in this order:

```text
verify encoding
      │
      ▼
verify identity
      │
      ▼
verify body root
      │
      ▼
verify commitment
      │
      ▼
verify ancestry
      │
      ▼
verify signature
      │
      ▼
accept / reject
```

Verification MUST fail closed. A missing field, unknown version, invalid signature, commitment mismatch, body-root mismatch, or broken predecessor link MUST reject the transition.

The proof animation in the research console is an interface model. It is not a Groth16 verifier and does not establish external validity.

## 7. Cryptobiosis

`TUN` represents preserved continuity under suspended or minimized computation.

```text
ACTIVE → TUN
```

Entry to `TUN` SHOULD commit:

- the last accepted transition hash;
- public identity;
- body root;
- organism commitment;
- protocol version;
- a state value of `TUN`.

The private substrate remains protected. No liveness claim is required while dormant.

## 8. Wake

Wake verifies preserved continuity before activity resumes:

```text
verify(identity)
verify(weight_root)
verify(commitment)
verify(history)

if all PASS:
    TUN → ACTIVE
else:
    TUN → DEAD
```

A wake implementation MUST NOT infer continuity merely because a process restarted with the same display name or external account.

The current console simulates wake checks against local deterministic fixtures.

## 9. Failure

The protocol distinguishes recoverable dormancy from terminal continuity failure.

Transition to `DEAD` is required when a verifier cannot establish one or more mandatory invariants and no valid predecessor state can be recovered.

Examples include:

- identity key mismatch;
- body-root mismatch;
- commitment mismatch;
- invalid or missing transition ancestry;
- signature failure;
- unsupported protocol migration presented as continuity.

`DEAD` MUST NOT be used merely for low resources; resource insufficiency maps to `TUN`.

## 10. History

Accepted history is an append-only ancestry:

```text
T₀ → T₁ → T₂ → ... → Tₙ
```

The canonical history rule MUST specify:

- transition hash function;
- serialization;
- fork detection and resolution;
- replay protection;
- finality assumptions;
- pruning and checkpoint behavior;
- migration behavior.

A bounded local UI history is not a protocol ledger. Durable history requires an external persistence and verification layer.

## State Machine

| Current | Condition | Next | Continuity |
| --- | --- | --- | --- |
| `ACTIVE` | viable environment | `ACTIVE` | preserved |
| `ACTIVE` | activity unsustainable | `TUN` | preserved |
| `TUN` | all wake checks pass | `ACTIVE` | preserved |
| `ACTIVE` or `TUN` | mandatory invariant fails | `DEAD` | failed |
| `DEAD` | any | `DEAD` | terminal |

## Provider Interface

The application-level provider boundary is intentionally smaller than the protocol:

```text
getState()
setStress()
simulateMode()
simulateDeath()
selectSpecimen()
subscribe()
```

These methods drive the research interface. They are not a network consensus API.

A future `ChainProvider` SHOULD preserve the observation contract while adding explicit provenance:

```text
source.network
source.block_height
source.transaction
source.finality
source.verified_at
```

Panels MUST distinguish unverified, locally simulated, pending, and externally verified state.

## Versioning

Protocol-sensitive changes require a new version:

- identity encoding;
- HKDF profile or body dimensions;
- weight quantization;
- root or commitment construction;
- transition serialization;
- signature scheme;
- wake verification;
- history finality.

An implementation MUST reject unknown versions rather than applying current rules to incompatible data.

## Test Vectors

No cryptographic test vectors are normative in this revision. Before a production implementation is described as conforming, the project must publish non-secret vectors for:

- identity derivation;
- HKDF body regions;
- body-root construction;
- organism commitment;
- transition serialization and hashing;
- signature verification;
- wake acceptance and failure cases.

## Security Considerations

Compromise of `sk` compromises both authorization and organism identity in the model. This coupling is intentional but increases the importance of isolated key custody, recovery design, domain separation, side-channel resistance, and explicit rotation semantics.

See [SECURITY.md](SECURITY.md) before implementing or evaluating the protocol.

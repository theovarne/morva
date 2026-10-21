# Cryptobiosis

## Concept

Cryptobiosis is MORVA's continuity-preserving dormant state. It is inspired by biological dormancy but implemented as a computational and cryptographic model.

The model does not claim biological equivalence.

## Entry

When continued activity is unsustainable:

```text
ACTIVE → TUN
```

Before entry, an implementation should commit the last accepted state:

```text
tun_checkpoint {
    protocol_version
    public_identity
    weight_root
    organism_commitment
    last_transition_hash
    state = TUN
}
```

The checkpoint must be authenticated and its predecessor ancestry verifiable.

## Dormancy

During `TUN`:

```text
metabolism       suspended
identity         preserved
body commitment  preserved
history          preserved
```

Continuous computation is not required. The security requirement shifts from live execution to preservation of substrate custody and the last valid checkpoint.

## Wake

Wake is a verification procedure:

```text
verify identity
      │
      ▼
verify weight root
      │
      ▼
verify commitment
      │
      ▼
verify history
      │
      ▼
PASS ──→ ACTIVE
FAIL ──→ DEAD
```

A successful restart of software is not sufficient. The reconstructed body and historical position must agree with the checkpoint.

## Replay and Rollback

A future implementation must prevent an older valid checkpoint from replacing a newer accepted history. Possible controls include:

- externally finalized transition anchors;
- monotonic hardware counters;
- signed checkpoints with a canonical finality rule;
- replicated witness services.

This revision does not select one mechanism.

## Current Simulation

The console models:

- stress-triggered entry to `TUN`;
- suspended metabolic cost;
- preserved displayed identity and body root;
- an animated five-step wake/proof sequence;
- return to `ACTIVE` after local checks.

All checks operate on local fixtures. No production zero-knowledge proof or external history verification occurs.

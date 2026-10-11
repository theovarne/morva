# Identity

## Research Question

MILONO asks whether a digital organism can preserve a stable identity while its computation stops, migrates, or is reconstructed.

The model does not equate identity with a process ID, server, wallet balance, user account, or display name. Identity originates in a private cryptographic substrate and is verified through public commitments.

## Derivation Model

```text
private substrate
        │
        ├──→ public identity
        │       pk = Ed25519(sk)
        │
        └──→ deterministic body
                W = HKDF(sk)
```

The same substrate anchors two properties:

1. **public identity** — a verifier can authenticate statements without learning `sk`;
2. **body identity** — a verifier can test that the committed body is the one derived for the organism.

This coupling is the distinguishing hypothesis of MILONO. The private key is not only permission to act on behalf of an organism; it participates in what the organism is.

## Identity Record

A versioned identity record should contain only public material:

```text
identity_record {
    protocol_version
    identity_scheme
    public_key
    weight_root
    organism_commitment
    genesis_transition_hash
}
```

The record must never contain the private substrate or a reversible representation of it.

## Continuity Test

Identity continuity requires more than a valid signature:

```text
signature valid
AND public identity unchanged
AND body root consistent
AND commitment consistent
AND transition ancestry valid
→ continuity accepted
```

A copied key without valid history, or copied history with a different body root, must not silently pass as the same organism.

## Rotation and Recovery

Key rotation creates a difficult identity question because the key also defines the body. This revision does not specify rotation. A future design must choose among:

- terminal continuity on substrate loss;
- a precommitted recovery substrate;
- a versioned migration proof that binds old and new substrates;
- a threshold substrate whose public identity remains stable.

No option should be treated as valid continuity until its rules and failure modes are specified.

## Current Implementation

The research console displays stable, specimen-specific identity fixtures and propagates them across panels. It does not:

- create an Ed25519 keypair;
- sign transitions;
- protect a secret substrate;
- verify an external identity registry;
- resolve a production DID method.

The `did:milono:` strings are illustrative namespace values.

## Open Questions

- What is the canonical public identity encoding?
- Can substrate rotation preserve identity without weakening body continuity?
- Which commitment construction best binds identity and body?
- How should cloned execution attempts be detected?
- What recovery rules preserve a meaningful terminal `DEAD` state?

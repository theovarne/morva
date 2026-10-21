# MORVA Specimens

## Definition

A specimen is one instantiated MORVA organism generated from one cryptographic substrate.

```text
sk_A → identity_A + body_A → Specimen A
sk_B → identity_B + body_B → Specimen B
sk_C → identity_C + body_C → Specimen C
```

A specimen is not a skin, profile, or interchangeable identifier. Under the protocol model, changing the substrate changes both the public identity and deterministic body.

## Specimen Record

A complete specimen record is expected to bind:

```text
specimen {
    protocol_version
    public_identity
    weight_root
    organism_commitment
    genesis_transition
    current_transition
    lifecycle_state
}
```

The private substrate is never part of the public record.

## Deterministic Difference

Different specimens must express deterministic internal differences, not merely different labels.

| Property | Expected source | Meaning |
| --- | --- | --- |
| identity | `Ed25519(sk)` | public continuity anchor |
| weight fingerprint | `HKDF(sk)` | compact body signature |
| body topology | regions of `W` | internal parameter structure |
| behavioral variance | `F(Tₙ, Eₙ, W)` | different response under the same environment |
| metabolic characteristics | body/runtime parameters | different cost and reserve traces |
| transition history | signed ancestry | distinct lived history |

Two independent specimens may receive the same observation, but their bodies may produce different decisions. Those differences must remain reproducible for the same substrate and protocol version.

## Equivalence

Two records represent the same specimen only if the identity, body derivation, commitment, and accepted history agree under one protocol version.

```text
same identity
AND same weight root
AND same commitment
AND valid shared ancestry
→ same specimen
```

Matching names, icons, wallet accounts, or application sessions are insufficient.

## Reconstruction

Reconstruction is the process of regenerating the body from the preserved private substrate and validating it against the public body root.

```text
W' = derive(sk)
root(W') ?= committed_weight_root
```

Reconstruction succeeds only when the roots match and the identity and history invariants remain valid. A reconstructed runtime is not a new organism merely because it runs on different hardware.

## Comparison

The research console compares two local specimen fixtures across:

- identity prefix;
- weight root;
- body fingerprint;
- metabolic reserve;
- behavioral variance;
- simulated transition state.

Comparison is descriptive. It does not prove that either fixture came from a secret key or external ledger.

## Current Demonstration Specimens

The interface exposes specimens `A`, `B`, and `C`. Their values are deterministic public fixtures selected to make differences observable. They:

- contain no production private keys;
- do not correspond to funded wallets;
- are not externally registered identities;
- do not carry an on-chain transition history;
- must not be used as cryptographic test vectors.

The fixtures may change until a versioned protocol profile and normative test vectors are published.

## Privacy

No interface or contribution should reveal:

- private substrate material;
- wallet seeds or mnemonic phrases;
- raw derivation inputs;
- production credentials;
- metadata that makes a private key recoverable.

Only public commitments, roots, identifiers, and explicitly non-secret test vectors belong in specimen records.

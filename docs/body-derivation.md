# Body Derivation

## Purpose

The MORVA body is a deterministic parameter field derived from the same substrate as public identity.

```text
W = {w₀, w₁, ... wₙ}
```

The body is not a trained model in the current concept. It is an intrinsic disposition produced at genesis.

## Proposed Construction

```text
PRK = HKDF-Extract(salt, sk)
W   = HKDF-Expand(PRK, info, length)
```

A conforming profile must define `salt`, `info`, `length`, output segmentation, numeric conversion, and body dimensions. Domain separation prevents one region from being confused with another.

```text
milono/body/sensory/v1
milono/body/decision/v1
milono/body/metabolic/v1
milono/body/control/v1
```

These labels are illustrative until a protocol profile is fixed.

## Numeric Mapping

Raw HKDF bytes do not become weights without a canonical mapping. A profile must define:

1. byte grouping and endianness;
2. signed or unsigned interpretation;
3. quantization range;
4. normalization;
5. treatment of invalid or biased values;
6. serialization of the final field.

Changing any step changes the organism. Such a change requires a protocol version.

## Body Root

The public body commitment is represented by a root:

```text
R_W = root(encode(W))
```

The exact root construction is not yet selected. A simple hash may be sufficient for whole-body verification; a Merkle construction may be preferable if partial openings are required.

## Reproducibility

For fixed protocol parameters:

```text
derive(sk, version) = W
derive(sk, version) = W
```

must return byte-identical output.

Different substrates should produce independently distributed bodies:

```text
sk_A ≠ sk_B  ⇒  W_A ≠ W_B
```

This is a cryptographic expectation, not a guarantee that every high-level behavior will differ.

## Body and Behavior

The transition model consumes both environment and body:

```text
Tₙ₊₁ = F(Tₙ, Eₙ, W)
```

To demonstrate a meaningful specimen difference, the runtime should expose reproducible variation in at least one behaviorally relevant dimension, rather than changing only an ID or color.

## Current Implementation

The console uses deterministic public specimen fixtures to generate:

- a body visualization;
- a 16 × 16 weight fingerprint;
- node-level inspection values;
- metabolic curves;
- comparison metrics.

These fixtures demonstrate interaction and reproducibility. They are not derived through production HKDF and are not normative test vectors.

## Validation Requirements

Before production claims are made, body derivation needs:

- a versioned cryptographic profile;
- cross-language test vectors;
- statistical inspection of output mapping;
- deterministic root construction;
- side-channel review;
- documented behavior when a body cannot be reproduced.

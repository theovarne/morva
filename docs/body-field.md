# MORVA Body Field

## Active tardigrade console

`dist/assets/visuals.js` provides deterministic public-fixture body nodes and a 256-cell fingerprint (32 columns on desktop, 16 on narrow screens). Its `weightAt(specimen, index)` seeds a pseudo-random generator using the specimen and index, yielding repeatable display values, layer/block labels, entropy and stability. These are not measured neural weights or cryptographic outputs.

The console displays 18,432 as a conceptual parameter count. It does not implement production HKDF over secret material. The active fingerprint contains 256 generated samples, not the alternative renderer's full cached membrane field.

The brand migration does not change fixture seeds, generator algorithms, numeric values, roots or commitments. It changes only public labels and the illustrative DID namespace.

## Alternative amoebic experiment

The retained `dist/assets/amoeba.js` implements a different 18,432-value field and twelve membrane regions. That script is not loaded on the current website. Its rendering notes remain useful research material, not a statement about shipped tardigrade behavior.

See [Body derivation](body-derivation.md) for the proposed cryptographic model.

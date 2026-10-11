# Amoebic body model

> Historical amoebic renderer experiment. The current MILONO release uses the optimized tardigrade console; the results and interactions below apply to the earlier experiment, not current production. See [current interaction contract](../INTERACTION.md).

MILONO is a soft cryptographic organism. Its visible form is mutable; its proposed origin is invariant. This document describes the browser implementation, not biological evidence or an implemented on-chain cryptographic protocol.

## Field and membrane

The console generates reproducible fixture values from a specimen identifier using the existing FNV/xorshift fixture generator. This is **not HKDF**. `W = HKDF(sk)` remains protocol notation; no real private seed is present.

The field contains 18,432 fixture weights, divided into 12 membrane regions with 1,536 values each. Each region's mean and population variance affect its local radial field. Its inspection entropy is the normalized Shannon entropy of a 16-bin histogram. Membrane extension and core proportions distinguish A, B, and C. A specimen always resolves to the same fixture values.

The fingerprint shows 256 evenly spaced indices across the field, including its endpoints. Each sampled weight maps to `floor(index / 1536)`. Hover, focus, or pin a cell to illuminate that region. Body regions can also be selected directly, by touch, or with arrow keys and Enter.

The Canvas 2D renderer separates membrane pressure, cytoplasmic flow, and nuclear activity. Twelve locally phased pressure fields combine quintic-interpolated seeded value noise with a phase-shifted pressure oscillator. The pressure amplitude is 55% higher than the previous quiet renderer. Small asymmetric pseudopods explore on deterministic, variable 3–7 activity-second intervals; each extends, holds, and retracts, with at most two simultaneous exploratory extensions. Stress slows that activity clock. No whole-body breathing scale, looping time reset, per-frame randomness, additive glow, or external animation library is used.

An uneven translucent cortex and short inner membrane folds replace nested contour rings. Sparse granules, short flow traces, and translucent compartments follow bounded local advection rather than orbiting an emitter. A specimen-specific, fixed pattern of short chromatin folds sits inside a stable nuclear envelope; activity modulates its density subtly without rotating or regenerating its identity pattern. This is visual fixture symbolism, not a cryptographic verification mechanism.

## Pointer interaction

The five main organism canvases are interactive; state and specimen thumbnails remain ordinary buttons. Hit testing uses the current deformed polygon. Physics uses CSS pixels, with DPR applied once to the rendering transform. Decorative captions and inspection overlays do not intercept membrane input.

- **Approach/hover:** a document-level pointer field starts within approximately 210 CSS pixels of the nominal membrane, even outside its canvas. The nearest membrane arc gradually orients and extends by up to 10 pixels; nearby internal advection responds. The organism center does not chase the pointer.
- **Click:** a roughly 900 ms response first contracts the local membrane, transfers a subtle pressure disturbance through the cytoplasm, pulses the nucleus, then rebounds. It is not a button ripple or whole-body scale animation.
- **Drag:** a primary pointer inside the organism captures the pointer and loads a local damped spring. Angular falloff spreads displacement over neighboring membrane regions. Pointer velocity is smoothed by 0.1 and contributes a bounded transient extension. A tension-dependent tanh distance limit and available canvas room prevent unlimited stretching. The nucleus shifts only 9% of the membrane displacement.
- **Release/cancel:** the spring recoils with small overshoot and settles in approximately 0.8–1.8 seconds. Pointer cancellation, lost capture, Escape, window blur, hidden documents, state changes, and specimen switches release capture safely. A drag does not pin the body inspector.

Space activates a local response for keyboard users. Body arrow-key inspection and Enter-to-pin remain unchanged. Touch uses the same pointer and coordinate model. Only interactive canvases reserve touch movement for membrane manipulation; the rest of the page remains scrollable.

## Environment and state

The shared provider combines latency, noise, compute scarcity, resource scarcity, and external pressure into a bounded risk score:

`risk = clamp(0.16 latency + 0.18 noise + 0.23 (100-compute) + 0.27 (100-resource) + 0.18 pressure, 0, 100)`

- ACTIVE: membrane extensions and cytoplasmic flow respond continuously to risk. Elevated risk reduces motility before suspension.
- TUN: risk 70 or a manual suspension retracts extensions and compresses the membrane. The identity core persists. Wake requires risk below 52.
- DEAD: simulated continuity failure fragments the boundary, interrupts flow, and reduces core coherence to zero. Proof and terminal readings report local failure.

Morphology approaches state targets with exponential interpolation; its animation phase slows without restarting. Stress continuously tightens the membrane and reduces extension, flow, and visible signal density. Suspension raises membrane tension faster than body contraction. Wake is a roughly 3.2-second sequence: nuclear activity first, internal flow after 200 ms, membrane opening after 450 ms, then exploratory extensions and normal motility. TUN suppresses local pressure amplitude by 96% and baseline pseudopod extension by 98%, with near-silent flow and a small nuclear pulse approximately every 11 seconds (with smooth timing variation). DEAD fades coherence and motion toward zero.

Identity, root, and weights remain fixed across ACTIVE/TUN transitions. Per-specimen local state is retained when switching individuals, so switching away and back does not revive a DEAD specimen. Browser storage can be cleared and is not a security or durable-history boundary.

Comparison thumbnails show ACTIVE reference forms of A/B/C. Ordinary selection resumes that individual's local state. The explicit Compare Two control compares fixtures without changing the selected identity.

## Rendering and access

One animation scheduler targets approximately 60 frames per second, carrying timing remainder to avoid halving the effective rate on 75 Hz displays. Offscreen views are skipped, hidden documents suspend scheduling, and DPR is capped at 2. Pointer events update only local simulation data; membrane painting happens in the shared RAF loop. Physics is substepped independently of frame rate.

Reduced-motion mode retains low-amplitude life at about 20 fps, slower internal motion, diminished hover/exploration, and lower, more heavily damped drag response. It does not freeze the organism or disable interaction. A textual inspection panel accompanies canvas-based body regions. Existing cryptographic diagrams, ledger, proof interface, and terminal retain their technical presentation.

The favicon is an SVG membrane with a central core. The social image is exported from the same canvas renderer used by the site.

## Verification

Run `npm run build` for repository and resource checks.

Run `npx playwright install chromium` once, then `npm test` for browser regression tests. The tests start the local server on port 4184 when needed. To use an installed browser, set `MILONO_CHROME` to its executable path. `MILONO_TEST_URL` can point the checks at a deployed copy.

The regression suite covers asset loading and CA preservation; weight-to-region mapping and keyboard inspection; continuous stress contraction and identity preservation through wake; distinct specimens and explicit comparison; irreversible local DEAD state and failed proof; terminal procedures; reduced-motion activity; and 320/390/768-pixel layouts. Interaction tests use actual browser mouse input and Chrome touch input to check outside-canvas approach, click contraction, local drag, pointer capture outside the canvas, cancellation, release recovery, DPR 2 coordinates, specimen switching, keyboard feedback, and inspector/thumbnail conflicts.

Automated WCAG A/AA scanning on the upgraded console reported no violations. Some pre-existing SVG text-overlap contrast checks remain inconclusive and require manual review; this is not a claim of comprehensive accessibility certification.

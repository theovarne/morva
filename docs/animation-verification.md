# Organism animation verification — 2026-09-28

> Historical amoebic renderer experiment. The current MILONO release uses the optimized tardigrade console; the results and interactions below apply to the earlier experiment, not current production. See [current interaction contract](../INTERACTION.md).

Historical verification of the quiet renderer. Its 3 px hover limit, static reduced-motion behavior, and 30 fps scheduling were superseded by the interactive membrane revision; see [the current model](amoebic-body.md).

Scope: refine the existing Canvas 2D organism only. Page markup, styles, navigation, contract address, state-provider rules, and console layout are unchanged. The shared renderer updates all eleven organism views. The share image is re-exported from that renderer.

## Requested acceptance checklist

Visual judgments below are implementation review, not user-study results.

1. **Life-like motion:** independently phased local membrane pressure and alternating soft extensions replace synchronized whole-body breathing. Temporal samples show different local changes.
2. **Less generic AI-blob styling:** remove nested contour rings and orbital particles; add membrane cortex, bounded cytoplasmic compartments, and fixed nuclear folds.
3. **No excessive glow:** no additive blending, bloom, blur, luminous shadows, or external halo.
4. **No excessive cyber styling:** retain low-saturation gray/green and black, with no blue/purple gradients.
5. **ACTIVE/TUN distinction:** ACTIVE extends and flows; TUN contracts, thickens its membrane, retracts pseudopods, and retains a quieter nucleus.
6. **State expressed by shape:** continuous contraction and tension changes; DEAD fragments and fades with motion tending to zero.
7. **Stress continuity:** risk interpolates contraction, tension, motility, and internal flow; stress/wake tests preserve identity and fixture weights.
8. **Restrained hover:** damped approach/release, local displacement bounded to 3 CSS pixels, negligible opposite-edge response.
9. **Not a webpage pet:** no chasing, jumping, elastic click response, or pointer-driven nucleus displacement.
10. **Organism rather than decoration:** morphology and internal activity are driven by the existing state and environmental model; nucleus geometry persists across suspension and wake.
11. **Performance:** no added runtime dependency; one visibility-aware scheduler, roughly 30 fps, DPR capped at 2, reduced-motion support. On the local Chrome workstation at DPR 2, a 180-frame forced redraw benchmark of all eleven views measured mean 2.39 ms and P95 3.20 ms. This is not a guarantee for all devices. Normal rendering skips offscreen views.
12. **Existing research presentation retained:** HTML and CSS untouched. Region inspection, fingerprint, proof, comparison, terminal, and 320/390/768 px layouts pass regression tests.

## Verification results

- Build: 25 required-file checks passed.
- Browser regression: 12 tests passed locally and on the production domain.
- Production: `https://www.milno.live/` returns HTTP 200; its renderer matches the local source.
- Root domain: `https://milno.live/` redirects to the canonical www domain.
- Mobile: 390 px document width at a 390 px viewport; contract address unchanged.
- Runtime visual tests: no uncaught page errors.
- Deployment: `dpl_23xEHzSM47BGKLX8rzxWQuCDukuz`, production alias `www.milno.live`.

The first production test run encountered a Node request-context connection reset while the browser loaded the site normally. Asset checks were moved into the actual browser network context; the full rerun passed.

At the time of this historical test, the then-configured repository was inaccessible and synchronization was blocked. This is not a finding about the current official repository; see [the current migration record](brand-migration.md).

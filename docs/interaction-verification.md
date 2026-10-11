# Interactive membrane verification — 2026-09-29

> Historical amoebic renderer experiment. The current MILONO release uses the optimized tardigrade console; the results and interactions below apply to the earlier experiment, not current production. See [current interaction contract](../INTERACTION.md).

## Diagnosis before changes

The production hero's hit-test target was the canvas, with `pointer-events: auto`; there was no blocking transparent overlay. At DPR 2, its 280 × 240 CSS-pixel box correctly used a 560 × 480 backing buffer. The component was vanilla Canvas, not React.

The missing behavior was in the component: only pointer movement/leaving were handled, without press, capture, drag, release, or cancellation. Hover displacement was capped at 3 pixels, baseline motion was too slow, and reduced-motion mode stopped continuous life. The old interval threshold also skipped too many frames on the workstation's display refresh cadence.

## Implementation

The current component retains the existing membrane, nucleus, fixture weights, state provider, site layout, and visual palette. Added behavior is local simulation state inside the same RAF loop: proximity sensing, click pressure, captured damped dragging, velocity feedback, bounded tension, recoil, nuclear coupling, independent exploration, and staged waking. No runtime dependencies or glow effects were added.

Five main specimens support manipulation. State and specimen thumbnail canvases deliberately remain selection buttons, so dragging does not replace their existing function. Mobile touch, CSS-pixel/DPR mapping, keyboard Space, capture cancellation, Escape, blur, and specimen switching have regression coverage.

## Actual production observation checklist

Performed with browser mouse input on `https://www.milno.live/`, Chrome, 1440 × 1000 viewport, DPR 2. Numerical measurements are from this workstation/session, not a promise for every device.

| Requested check | Observed result |
| --- | --- |
| 1. Watch idle for 15 seconds | Local contour movement reached 7.8 CSS px by about 2 seconds and 11.8 px over 15 seconds; one exploratory pseudopod was active at the sample. |
| 2. Approach slowly | The pointer field activated outside the canvas, then strengthened continuously on approach. |
| 3. Hover inside | A nearby membrane arc extended; the whole organism did not follow the pointer. |
| 4. Single click | Automated shape comparison measured over 3 px of local contraction; internal pressure and nuclear response completed within the response cycle. |
| 5. Pull the left membrane | Actual membrane displacement reached approximately -56 px; pointer capture remained active outside the canvas. |
| 6. Pull the right side quickly | Actual membrane displacement reached approximately +53 px. A separate equal-distance test confirmed a fast pull produces more extension than a slow pull. |
| 7. Release | Displacement recovered to less than 0.001 px after 1.5 seconds in the sampled release, without teleporting back on pointer-up. |
| 8. Raise stress | Continuous contraction reached 0.995 of the TUN target; flow and motility fell. |
| 9. Observe TUN | Motility fell to approximately 0.006 during the transition; a 12-second sample captured the retained nuclear pulse. |
| 10. Wake | Core activity recovered first; flow followed, then the membrane opened. Compactness fell from almost 1 at 0.19 s to 0.319 at 1.68 s and 0.0014 at 3.50 s. |
| 11. Rapid alternating manipulation | About 60.04 rendered fps, hero draw P95 1.7 ms. Frame-interval P95 was 26.8 ms on this display cadence. |
| 12. Console errors | No uncaught page errors or error-level browser console messages in the production interaction session. |

The nucleus moved 9% of the dragged membrane displacement (about -5.1 px during the left pull). Tension limits remained bounded. Tests also exercised real touch input at DPR 2, reduced-motion drag and keyboard feedback, cancellation, and prevention of accidental inspector pinning.

## Build and release

- Static validation: 25 required files checked successfully.
- Final production regression: all 20 tests passed across `tests/amoeba.spec.mjs` and `tests/interaction.spec.mjs`.
- The final reduced-motion timing correction ensures shared-provider notifications do not artificially advance the animation clock.
- Final production deployment: `dpl_57bQFfKgsyAfkjJHJTZStcmesdLX`.
- Canonical site: `https://www.milno.live/`.
- Contract address unchanged: `4cjLraGqbJciiaRbW8UFvntta84eBMeZ53zXB43Kpump`.

The optional double-click inspection was not added; the main interactions and existing research inspection controls remain the focus.

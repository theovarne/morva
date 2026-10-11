# MILONO Interaction Model

This describes the current optimized tardigrade console. The site loads [organism.js](dist/assets/organism.js) and [visuals.js](dist/assets/visuals.js), not the retained amoeba renderer.

## Current Input Map

| Surface | Input | Actual response |
| --- | --- | --- |
| Water-bear hero | View | Static artwork; no membrane simulation |
| Neural Body | Pointer movement near a node | Region probe and visual emphasis |
| Neural Body | Click near a node | Pin node details and share Terminal context |
| Weight Fingerprint | Hover/focus | Inspect generated value, layer, entropy and stability |
| Weight Fingerprint | Click/Enter | Toggle pin and shared inspection context |
| Weight Fingerprint | Arrow keys | Move focus through 256 cells |
| Identity Trace | Hover/click | Inspect a conceptual lineage node |
| Stress Chamber | Five controls | Update provider risk, reserve and lifecycle |
| States | State probe / confirmed failure | Explicit simulation override / local DEAD |
| Metabolism | Pointer inspection | Select a local reserve sample |
| Ledger | Select record / previous record | Inspect retained ancestry |
| Proof Inspector | Verify | Timed local fixture demonstration |
| Specimen Comparison | A/B/C selection | Initialize selected fixture context |
| Terminal | Submit command | Inspect or mutate the same local provider |

The body canvas has no dedicated keyboard node-navigation handler; the weight grid does. A native button can be activated by keyboard, but that is not a claim of full accessibility certification.

## Lifecycle Feedback

ACTIVE and UNSTABLE permit ordinary cycles. TUN suspends ordinary activity and reduces neural-field intensity; DEAD marks failure and reduces rendering further. The normal wake path requires TUN and risk below 52. The States panel can override presentation/state for research inspection and is not a protocol guard.

The active wake has no staged nucleus → flow → membrane sequence. That sequence belongs to the alternative renderer.

## Alternative Amoebic Experiment — Inactive

The retained [amoeba.js](dist/assets/amoeba.js) explores this mapping:

| Input/state | Experimental response |
| --- | --- |
| Idle | Continuous asymmetric local membrane drift |
| Pointer approach/hover | Bounded local orientation and response |
| Click | Local contraction and internal disturbance |
| Drag | Local displacement and pseudopod-like extension |
| Release/cancel | Damped elastic recovery |
| Stress | Reduced activity and flow |
| TUN | Contracted, low-activity form |
| Wake | Nuclear activity, flow and membrane activity recover progressively |

These are code experiments, not current production acceptance claims. The old renderer tests depend on their original page wiring; loading the script alone does not restore that version. See [Morphology](docs/morphology.md).

## Terminal and Verification

`milono@organism:~$` is a browser command interface, not an operating-system shell. Supported procedures are documented in [Terminal](docs/terminal.md).

`npm test` runs the active tardigrade, brand/storage and Terminal suites. It checks browser errors, responsive widths, shared inspection context, stress/TUN/wake, specimen and proof views, and compatibility storage. Historical membrane suites are excluded rather than presented as passing tests for a renderer that is not loaded.

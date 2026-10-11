# Metabolism

## Computational Model

MILONO treats computation as metabolic activity. The model tracks a reserve that changes with computational cost and environmental input:

```text
reserve(t + 1)
    =
reserve(t)
    -
compute_cost(t)
    +
resource_input(t)
```

This is an experimental control abstraction, not a biological claim.

## Variables

| Variable | Interpretation |
| --- | --- |
| `reserve` | available computational capacity |
| `compute_cost` | cost of one active transition cycle |
| `resource_input` | replenishment available to the runtime |
| `risk` | combined environmental pressure |
| `viability` | margin above the dormancy threshold |

The model may include resource availability, network conditions, integrity, and environmental pressure as normalized inputs.

## State Coupling

```text
viability ≥ threshold
        │
        ▼
     ACTIVE

viability < threshold
        │
        ▼
       TUN
```

While `TUN`, ordinary transition cost is modeled as zero or near zero. Identity verification and protected storage may still have real infrastructure cost in a future implementation.

## Determinism and Noise

A research model should distinguish:

- deterministic response derived from specimen body parameters;
- environment input supplied by an operator or sensor;
- presentation noise used only for visualization.

Presentation noise must not affect committed protocol state.

## Current Implementation

The browser simulation:

- stores a bounded reserve history;
- computes a local risk score from stress controls;
- interpolates displayed telemetry for readability;
- suspends active metabolism in `TUN` and `DEAD`;
- links chart inspection to the terminal context.

Values are illustrative and have no financial, biological, or external operational meaning.

For the current `SimulationProvider`, risk is clamped to 0–100 and calculated as:

```text
risk = 0.16 * latency + 0.18 * noise
     + 0.23 * (100 - compute) + 0.27 * (100 - resource)
     + 0.18 * pressure
cost = 0.0014 + risk * 0.000031
input = (resource - 50) * 0.0007
delta = input - cost * (1 + risk / 80)
```

ACTIVE reserve updates clamp `reserve + delta` to 18–99 and round to three decimals. TUN and DEAD use zero delta. At most 72 reserve samples are retained. These are per-update simulation coefficients, not calibrated units or costs per real second. Stress-control changes also request a reserve update.

## Calibration Questions

Before the model can support experimental comparison, the project must define:

- units for reserve and cost;
- sampling interval;
- threshold selection;
- normalization of environment inputs;
- invariants across specimen bodies;
- how restarts and missing samples are represented;
- which values, if any, enter the signed transition record.

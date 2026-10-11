# Lifecycle

## States

MILONO defines three conceptual lifecycle states:

```text
ACTIVE
TUN
DEAD
```

### ACTIVE

The organism may observe, decide, act, verify, and commit transitions.

### TUN

The organism preserves identity and history while ordinary metabolic computation is suspended or minimized. `TUN` is a continuity-preserving state, not a failure.

### DEAD

One or more required continuity invariants have failed. `DEAD` is terminal for that specimen under the current protocol version.

## State Machine

```text
                    viability restored
               ┌────────────────────────┐
               │                        │
               ▼                        │
            ACTIVE ── unsustainable ──→ TUN
               │                        │
               └── invariant failure ───┤
                                        ▼
                                      DEAD
```

The `TUN → ACTIVE` edge is accepted only after wake verification. No transition exits `DEAD`.

## Transition Guards

| Transition | Required guard |
| --- | --- |
| `ACTIVE → ACTIVE` | environment viable and invariants valid |
| `ACTIVE → TUN` | activity unsustainable, continuity still valid |
| `TUN → ACTIVE` | wake verification passes |
| `ACTIVE → DEAD` | mandatory continuity invariant fails |
| `TUN → DEAD` | wake or preserved-state verification fails |

## Continuous Uptime Is Not Required

An organism can stop computing without losing identity. Runtime suspension, process restart, or hardware migration are not themselves death events.

Continuity is evaluated from cryptographic and historical evidence:

- public identity;
- body root;
- organism commitment;
- transition ancestry;
- required signatures and proofs.

## Current Simulation

The Stress Chamber computes a local risk value from latency, noise, compute scarcity, resource scarcity and external pressure. Integrity is an output of the lifecycle model, not an input to the risk formula. Thresholds drive an illustrative state response:

- while active, risk below 52: `ACTIVE`;
- while active, risk from 52 to below 70: `UNSTABLE`;
- risk at least 70: enter `TUN`;
- while dormant, risk below 52: manual wake is permitted; recovering the environment alone does not wake the organism.

The separate entry and wake thresholds provide hysteresis. The optimized tardigrade runtime retains `UNSTABLE` as an additional simulation state. The code's `wake()` checks local mode and risk, not a cryptographic signature or proof.

The interface also exposes explicit state controls for research inspection. `DEAD` requires confirmation and sets integrity to zero for the selected local specimen state.

The ACTIVE state-model probe is an explicit override: `simulateMode("ACTIVE")` can set an ordinary non-DEAD session to ACTIVE without the normal `wake()` risk guard. This is an inspection tool, not protocol enforcement. Selecting a different specimen reinitializes its local state; switching away and back is not durable terminality.

These controls are not an external consensus mechanism.

## Failure Semantics

Temporary unavailability should not be confused with `DEAD`. A verifier should attempt recovery from the last accepted transition. Only failure to establish required continuity produces the terminal state.

The protocol still needs a complete policy for:

- partial history availability;
- competing histories;
- substrate recovery;
- clock and finality assumptions;
- migration between protocol versions.

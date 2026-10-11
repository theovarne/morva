# MILONO Terminal Reference

Source: `terminalCommand()` in [organism.js](../dist/assets/organism.js). This is a browser parser, not a shell, AI chat or RPC console. Input is trimmed, lowercased and whitespace-normalized.

## Supported Commands

| Command | Actual output or effect |
| --- | --- |
| `help` | Implemented procedure list |
| `status` | SIMULATION, mode, specimen, epoch, reserve and risk |
| `inspect` | Last selected node/weight/cycle/transition context, or no-selection message |
| `inspect identity` | Illustrative DID, public-key fixture, commitment fixture and source |
| `inspect body` | Protocol notation, conceptual 18,432 count, variance and displayed drift |
| `inspect weights` | Fixture root and selected specimen |
| `inspect metabolism` | Reserve, computed cost and display mode |
| `inspect history` | Last five retained transition summaries |
| `inspect transition <n>` | Number, timestamp, state edge, action and hash-shaped label, or not-retained message |
| `derive weights` | SIMULATED DERIVATION message and existing fixture root; no HKDF execution |
| `verify commitment` | LOCAL PASS label; no proof or signature verification |
| `stress <0..1>` | Set all five environmental controls and report resulting state |
| `enter tun` | Request dormancy without changing the specimen fixture |
| `wake` | Request TUN → ACTIVE; requires risk below 52 |
| `clear` | Clear Terminal output only; does not reset simulation or storage |

Stress accepts forms such as `0`, `0.72`, `1` and `1.0`; values outside the interval and shorthand `.72` are not accepted by the current parser. It applies the five controls sequentially, so one command can append intermediate local transitions.

The active parser does **not** support `inspect membrane`, `inspect core`, `inspect nucleus` or `inspect motility`. Unknown commands report `unknown procedure`.

## Reproducible Walkthrough

```text
milono@organism:~$ inspect identity
did:milono:7F2A91C4
... public fixture and commitment fixture ...

milono@organism:~$ stress 1
stress applied 1.00 / state TUN

milono@organism:~$ wake
wake denied / recover environment below risk 52 first

milono@organism:~$ stress 0
stress applied 0.00 / state TUN

milono@organism:~$ wake
LOCAL PASS / simulated continuity confirmed / ACTIVE
```

This assumes specimen A and an ordinary non-DEAD session. Epochs, timestamps and reserves vary. The recovery command does not automatically wake the specimen. Query history after the sequence to see the local wake transition.

## Known Display Limits

`inspect metabolism` prints SUSPENDED only for TUN; its display mode says NORMAL for DEAD even though the computed cost is zero. `enter tun` uses the same “already dormant” message for an already DEAD state. These are existing display limitations, not evidence that DEAD has revived.

No command can validate a production private substrate or external history. Never paste secrets into the Terminal. See [Simulation](../SIMULATION.md).

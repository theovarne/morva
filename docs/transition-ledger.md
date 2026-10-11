# MILONO Transition Ledger

## Implemented Record

The active `SimulationProvider` in [organism.js](../dist/assets/organism.js) stores these exact fields:

```text
{
  number,       // local epoch
  timestamp,    // Date.now(), milliseconds
  from,         // previous lifecycle label
  to,           // next lifecycle label
  action,       // local action description
  sensor,       // hash-shaped fixture label
  previous,     // predecessor's hash-shaped identifier
  hash          // current hash-shaped identifier
}
```

There is no stored signature, observation root, action root, body root or commitment field on these records. The selected specimen has separate root and commitment fixtures. Inspector-generated labels must not be mistaken for signed record fields.

## Sequence and Retention

`initialState()` supplies four illustrative transitions, numbered 1839–1842, with actions observe, decide, act and verify. Later ordinary cycles use those four action names according to the epoch. Stress, wake, failure and state probes may add other action descriptions.

`addTransition()` increments the epoch, references the last retained identifier and appends a record. History is capped at 80; older records are removed. The UI can inspect records and predecessor links, and the Terminal can request `inspect history` or `inspect transition <number>`.

This is a **bounded editable browser log**, not append-only durable history.

## Integrity Boundary

`hexDigest()` is a non-cryptographic FNV/xorshift-style formatter. Its output does not authenticate a canonical serialization. Editing local storage can alter the history, and missing old records cannot be reconstructed from the retained window.

Fixture inputs are repeatable, but timestamps, interactions, persistence and scheduler timing make a complete session nondeterministic. Local PASS/VALID labels are demonstration results, not external attestation.

## Proposed Protocol

The future history model would require canonical encoding, signatures, identity/body binding, data availability, finality and fork rules. A proposed envelope could include version, epoch, timestamp, previous_hash, state, observation_root, action_root, body_root, identity_commitment and signature.

These fields and requirements belong to [Protocol](../PROTOCOL.md); they are not the current browser schema. No durable store, chain execution or independently verified ancestry is implemented.

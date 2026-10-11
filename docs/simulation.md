# Simulation

Start with the [capability and trust-boundary matrix](../SIMULATION.md). These detailed notes describe the active tardigrade console; the retained membrane experiment is not loaded.

## Purpose

The current MILONO website is a research interface for exploring the protocol model without a production cryptographic or blockchain backend.

It intentionally separates:

```text
SIMULATED STATE
```

from:

```text
VERIFIED EXTERNAL STATE
```

Only simulated state is implemented in this repository.

## Provider Structure

```text
OrganismProvider
        │
        ├── SimulationProvider   implemented
        │
        └── ChainProvider        proposed
```

`OrganismProvider` owns shared state and publishes updates to the console. `SimulationProvider` advances local cycles, calculates stress response, retains a bounded history, and persists non-secret state in `localStorage`.

`ChainProvider` exists only as a stub class: its `start()` method throws an error. It is not instantiated by the console and provides no network adapter or blockchain verification.

## Console Modules

### Live Specimen

Displays the selected fixture's current local state, identity, epoch, reserve, integrity, body root, and last transition age.

### The Body

Renders a deterministic canvas field with inspectable regions and nodes. Stress changes the visual contraction and signal intensity.

### Identity Trace

Shows the conceptual lineage from private substrate through public identity and deterministic body to commitment and history. Private-key and proof nodes are explanatory, not live secret or proof material.

### Weight Fingerprint

Renders 256 deterministic cells for each specimen fixture, arranged in 32 columns on desktop and 16 on narrow screens. Cells support hover, keyboard navigation, click locking, and terminal inspection.

### Stress Chamber

Exposes normalized environmental controls. Threshold markers explain when local state behavior changes.

### Metabolism

Plots bounded reserve history. Pointer or tap inspection reveals a simulated cycle, cost, state, and timestamp.

### Transition Ledger

Displays recent local transition fixtures and predecessor relationships. It is not durable external storage.

### Proof Inspector

Runs a timed interface sequence for substrate, body-root, commitment, identity, and history checks. A passing animation indicates local fixture consistency only.

### Specimen Comparison

Compares deterministic fixture outputs for specimens `A`, `B`, and `C`. It demonstrates internal difference without making a cryptographic provenance claim.

### Laboratory Terminal

Provides commands over the same provider state and inspection context. It is a browser form, not an operating-system shell.

## Data Classification

| Data | Source | Status |
| --- | --- | --- |
| specimen identity | public fixture | simulated |
| weight grid | deterministic fixture | simulated |
| body nodes | deterministic fixture | simulated |
| reserve history | local runtime | simulated |
| transition hashes | local deterministic formatter | simulated |
| proof result | interface procedure | simulated |
| blockchain height | absent | not implemented |
| external signature | absent | not implemented |
| private substrate | absent | not implemented |

## Local Persistence

The provider writes non-secret UI state under a versioned browser-storage key. This permits continuity across refreshes on one browser profile.

Local persistence does not provide:

- tamper resistance;
- cross-device continuity;
- independent verification;
- durable archival;
- consensus finality.

## Replacing the Provider

A future external provider must preserve clear provenance. Every externally sourced value should carry:

```text
source
network
block or checkpoint
transaction or record identifier
verification status
verification time
```

The interface must not collapse `simulated`, `pending`, `unverified`, and `verified` into one label.

## Validation

The repository validator checks required files, local asset references, the production URL, the GitHub link, and explicit simulation labeling. Browser verification is still required for layout, interactions, and console errors.

## Limits

The simulation is suitable for:

- interface research;
- protocol explanation;
- deterministic interaction experiments;
- specimen comparison;
- state-machine demonstrations.

It is not suitable for:

- custody;
- financial decisions;
- identity authentication;
- proof verification;
- on-chain monitoring;
- production autonomous action.

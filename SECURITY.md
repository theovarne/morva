# MILONO Security

## Experimental Status

MILONO is experimental software. The current repository contains a browser-based research console and protocol documentation, not a production key-management, proof, or blockchain system.

Do not use the interface to custody significant funds, production credentials, sensitive identity material, or any private key whose compromise would cause harm.

## Current Security Boundary

The deployed console:

- uses deterministic public fixtures;
- stores non-secret simulation state in browser `localStorage`;
- has no backend in this repository;
- has no live blockchain connection;
- does not perform production Ed25519, HKDF, or zero-knowledge proof operations;
- does not require a wallet connection.

Labels such as `VERIFIED`, hashes, commitments, and proof steps describe internal simulation consistency unless an external source is explicitly identified.

## Secrets

Never commit:

- private keys;
- wallet seeds or mnemonic phrases;
- API keys;
- database credentials;
- deployment tokens;
- RPC credentials;
- environment files;
- certificates or signing keys;
- browser exports or credential stores.

The repository ignores common secret file formats, but ignore rules are not a security control. Inspect staged content and history before every publication.

If a secret enters Git history, stop. Removing the visible file is insufficient. Revoke or rotate the credential first, then rewrite the affected history before publishing.

## Threat Model

The protocol model couples identity and body to the same substrate. A future implementation must account for:

- substrate theft or unauthorized signing;
- side-channel leakage during body derivation;
- weak entropy at genesis;
- domain-separation failure;
- ambiguous or non-canonical serialization;
- transition replay;
- ancestry substitution or truncation;
- commitment collision or equivocation;
- rollback after cryptobiosis;
- false provenance in user interfaces;
- compromised external providers;
- denial of access to reconstruction material.

## Cryptographic Implementation

Future cryptographic code should:

- use reviewed, maintained libraries;
- publish a versioned cryptographic profile;
- use explicit domain separators;
- define canonical encodings;
- include deterministic non-secret test vectors;
- fail closed on unsupported versions;
- keep private material outside the browser UI;
- undergo independent review before production use.

Custom cryptographic primitives are out of scope.

## Reporting a Vulnerability

Do not open a public issue containing exploit details, private keys, credentials, or information that would put users at risk.

Use [GitHub private vulnerability reporting](https://github.com/theovarne/milono/security/advisories/new) when available. If the private reporting form is unavailable to your account, withhold sensitive details until a project-controlled private channel is available.

This repository does not publish a personal email address as a security contact.

## Supported Versions

No release is currently designated production-supported. Security fixes may be applied to the latest revision of the experimental console and specification without backport guarantees.

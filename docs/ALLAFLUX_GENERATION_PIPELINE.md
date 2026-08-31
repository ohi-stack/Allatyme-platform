# ALLAFLUX™ Generation Pipeline

## Goal

Provide a controlled, model-agnostic music creation path in which the model is an inference component and ALLAFLUX remains responsible for orchestration, metadata, artist identity, processing, storage, and delivery.

## Request Lifecycle

```text
Creator
  ↓
ALLAFLUX Web UI
  ↓
Generation API
  ↓
Validate artist + rights attestation + generation parameters
  ↓
PostgreSQL generation_jobs
  ↓
Redis queue
  ↓
Worker
  ↓
Model Gateway
  ↓
Approved model runtime
  ↓
Generated artifact
  ↓
Audio Processing
  ↓
Media Ingestion
  ↓
SHA-256 + provider/model/process metadata
  ↓
Object Storage
  ↓
Catalog / Player / Download / Commerce
```

## Generation Inputs

The creator workflow should support, as applicable:

- Song title
- Artist ID
- Lyrics
- Creative direction
- Genre/subgenre
- Mood
- Language
- BPM
- Key
- Time signature
- Duration
- Candidate count
- Output format
- Model selection
- Enhanced planning/options
- Rights attestations

## Artist-Aware Generation

When an artist is selected, the generation request may resolve that artist's sound profile. The profile informs creative parameters but must not be treated as a license to imitate a real person's voice or style without appropriate rights.

## Processing Integrity

432 Hz delivery is a processing state, not a marketing label. If the required FFmpeg capability is unavailable, the pipeline must fail rather than claim that 432 Hz processing occurred.

Every processed artifact should retain:

- Input artifact reference
- Output artifact reference
- SHA-256 checksum
- Provider/model identifier
- Processing operations
- Processing timestamp
- Delivery/reference tuning metadata
- Generation job ID
- Rights-attestation state

## Model Gateway

The gateway isolates application logic from model implementations. This allows ALLAFLUX to add or replace model runtimes without rewriting the creator application or catalog layer.

Current repository documentation identifies ACE-Step 1.5 as the configured model runtime path. Future runtimes should be added through explicit adapters/contracts.

## Rights & Compliance Gate

Generation should not proceed when required rights attestations are missing. The system should distinguish:

- User-owned material
- Licensed material
- Public-domain material
- Original/generated material
- Reference material requiring review
- Restricted or disallowed inputs

The repository should store attestations and provenance metadata, not copyrighted source material that the platform is not authorized to retain.

# ALLAFLUX™ — Product & Architecture Specification

**Brand:** ALLAFLUX™ by ALLATYME™
**Repository:** `ohi-stack/Allatyme-platform`
**Status:** Canonical platform direction
**Date:** 2026-08-31

## 1. Purpose

ALLAFLUX™ is the music-creation, artist-development, media, catalog, discovery, commerce, and audience platform layer of ALLATYME™. It is intended to turn the existing ALLATYME music stack from a collection of independent features into one coherent artist-centered system.

ALLAFLUX is not a copy of a third-party music generator. External model runtimes may be adapters behind a model gateway; ALLAFLUX owns the workflow, artist identity, catalog metadata, processing policy, provenance, user experience, and delivery pipeline.

## 2. Product Pillars

1. **Create** — music-generation and creator workflows.
2. **Artist** — canonical artist identity and sound profiles.
3. **Catalog** — tracks, releases, albums, playlists, genres, and metadata.
4. **Flux** — discovery, recommendations, trending, playlists, and audience movement.
5. **Media** — audio, video, artwork, visualizers, and publishing assets.
6. **Commerce** — WooCommerce-connected sales, downloads, memberships, and artist stores.
7. **Community** — follows, favorites, libraries, rewards, and audience engagement.
8. **Analytics** — plays, engagement, conversion, catalog performance, and creator insights.
9. **Provenance** — checksums, processing metadata, rights attestations, and auditable artifact history.

## 3. Canonical Architecture

```text
ALLATYME™
   │
   └── ALLAFLUX™
        │
        ├── Web / Creator Experience
        ├── Artist Identity System
        ├── Music Catalog
        ├── Generation API
        ├── Generation Worker
        ├── Model Gateway
        │     └── ACE-Step 1.5 / future approved runtimes
        ├── Audio Processing
        ├── Media Ingestion
        ├── Discovery / Flux Engine
        ├── Commerce Integration
        ├── Membership & Rewards
        ├── Analytics
        └── Provenance / Rights Metadata

Infrastructure:
PostgreSQL → source of truth
Redis → durable queue accelerator
MinIO/S3 → controlled media object storage
FFmpeg → audio processing
```

## 4. System Boundaries

### ALLAFLUX owns
- Artist identity and artist sound profiles.
- Generation job contracts and lifecycle.
- Catalog relationships.
- Media artifact metadata and checksums.
- Audio delivery policy, including explicit 432 Hz processing where configured.
- Discovery and audience-facing presentation.
- Creator workflow and application UX.
- Rights-attestation capture.

### External systems may provide
- Model inference runtimes.
- Payment processing.
- WooCommerce commerce primitives.
- WordPress presentation and publishing.
- Object-storage infrastructure.

No external provider is the canonical source of ALLAFLUX artist identity or catalog state.

## 5. Current Foundation vs Target

The repository already contains the generation-oriented foundation: web application, generation API, worker, model gateway, audio processing, media ingestion, PostgreSQL, Redis, MinIO/S3-compatible storage, artist sound profiles, and an ACE-Step 1.5 runtime contract.

The ALLAFLUX specification extends that foundation into the complete product. Items not yet implemented must be treated as roadmap work rather than represented as production functionality.

## 6. Non-Negotiables

- Never commit model weights, secrets, credentials, private training corpora, or production media binaries.
- Never label audio as 432 Hz unless the processing pipeline actually completed the required transformation.
- Preserve source/provider/model metadata for generated artifacts.
- Keep artist identity canonical and reusable across catalog, discovery, commerce, and media.
- Separate WordPress presentation concerns from deterministic application services.
- Keep proprietary source and internal business logic private where appropriate.

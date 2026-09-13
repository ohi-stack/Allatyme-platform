# ALLAFLUX™ — Product & Architecture Specification

**Brand:** ALLAFLUX™ by ALLATYME™  
**Permanent ODIN:** `ODIN-P-AE1001`  
**Canonical Node:** `https://flux.allatyme.com`  
**Repository:** `ohi-stack/Allatyme-platform`  
**Status:** Canonical platform direction  
**Originally dated:** 2026-08-31  
**Identity update:** 2026-09-12

## 1. Purpose

ALLAFLUX™ by ALLATYME is the music creation, studio, social publishing, artist catalog, and creator platform for `flux.allatyme.com`.

It is intended to turn the existing ALLATYME music stack from a collection of independent features into one coherent artist-centered system spanning creation, artist development, media, catalog, discovery, commerce, community, analytics, and provenance.

ALLAFLUX is not a copy of a third-party music generator. External model runtimes may be adapters behind a model gateway; ALLAFLUX owns the workflow, artist identity, catalog metadata, processing policy, provenance, user experience, publishing controls, and delivery pipeline.

## 2. Product Pillars

1. **Create** — music-generation and creator workflows.
2. **Studio** — browser-based recording, editing, arrangement, and production workflows.
3. **Artist** — canonical artist identity and sound profiles.
4. **Catalog** — tracks, releases, albums, playlists, genres, and metadata.
5. **Flux** — discovery, recommendations, trending, playlists, and audience movement.
6. **Media** — audio, video, artwork, visualizers, and publishing assets.
7. **Social Publishing** — public/private/unlisted release controls, follows, engagement, and creator publishing.
8. **Commerce** — WooCommerce-connected sales, downloads, memberships, and artist stores.
9. **Community** — follows, favorites, libraries, rewards, and audience engagement.
10. **Analytics** — plays, engagement, conversion, catalog performance, and creator insights.
11. **Provenance** — checksums, processing metadata, rights attestations, and auditable artifact history.

## 3. Canonical Architecture

```text
ALLATYME™
   │
   └── ALLAFLUX™ — ODIN-P-AE1001
        │
        ├── Web / Creator Experience
        ├── Browser Studio
        ├── Artist Identity System
        ├── Music Catalog
        ├── Generation API
        ├── Generation Worker
        ├── Model Gateway
        │     └── ACE-Step 1.5 / future approved runtimes
        ├── Audio Processing
        ├── Media Ingestion
        ├── Social Publishing
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

## 4. Canonical Node & Service Topology

- `https://flux.allatyme.com/` — public ALLAFLUX application
- `https://api.flux.allatyme.com/` — application/API layer
- `inference.flux.allatyme.com` — authenticated model/inference gateway
- `media.flux.allatyme.com` — media delivery origin when enabled

Application routes include `/create`, `/studio`, `/library`, `/discover`, `/upload`, `/record`, `/voices`, `/artists`, `/plans`, `/account`, and `/admin` as the target platform map.

## 5. System Boundaries

### ALLAFLUX owns
- Artist identity and artist sound profiles.
- Generation job contracts and lifecycle.
- Catalog relationships.
- Media artifact metadata and checksums.
- Audio delivery policy, including explicit 432 Hz processing where configured.
- Discovery and audience-facing presentation.
- Creator workflow and application UX.
- Public/private/unlisted publishing controls.
- Rights-attestation capture.
- Platform identity under `ODIN-P-AE1001`.

### External systems may provide
- Model inference runtimes.
- Payment processing.
- WooCommerce commerce primitives.
- WordPress presentation and publishing.
- Object-storage infrastructure.

No external provider is the canonical source of ALLAFLUX artist identity, catalog state, or platform identity.

## 6. Current Foundation vs Target

The repository already contains the generation-oriented foundation: web application, generation API, worker, model gateway, audio processing, media ingestion, PostgreSQL, Redis, MinIO/S3-compatible storage, artist sound profiles, and an ACE-Step 1.5 runtime contract.

The ALLAFLUX specification extends that foundation into the complete product. Items not yet implemented must be treated as roadmap work rather than represented as production functionality.

## 7. Registry Rule

`ODIN-P-AE1001` is the permanent platform identifier for ALLAFLUX™ by ALLATYME. Components that are independently registered as separate technologies, engines, models, protocols, or infrastructure may receive their own ODIN identifiers, but should retain a parent/reference relationship to `ODIN-P-AE1001` where applicable.

See `docs/ALLAFLUX_IDENTITY.md` for the canonical identity record.

## 8. Non-Negotiables

- Never commit model weights, secrets, credentials, private training corpora, or production media binaries.
- Never label audio as 432 Hz unless the processing pipeline actually completed the required transformation.
- Preserve source/provider/model metadata for generated artifacts.
- Keep artist identity canonical and reusable across catalog, discovery, commerce, and media.
- Separate WordPress presentation concerns from deterministic application services.
- Keep proprietary source and internal business logic private where appropriate.
- Preserve `ODIN-P-AE1001` anywhere ALLAFLUX platform identity is represented.

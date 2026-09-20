# ALLATYME™ Platform — ALLAFLUX™

**ALLAFLUX™ by ALLATYME™** is the music creation, studio, social publishing, artist catalog, and creator platform for `https://flux.allatyme.com`.

**Permanent ODIN:** `ODIN-P-AE1001`  
**Canonical web node:** `https://flux.allatyme.com`  
**Canonical API node:** `https://api.allatyme.com`  
**Canonical implementation repository:** `ohi-stack/allaflux-platform`  
**Registry key:** `allaflux`  
**Record date:** September 12, 2026  
**Topology update:** September 19, 2026

## Repository role

`ohi-stack/Allatyme-platform` is retained as an ALLATYME source/provenance repository and historical implementation source for ALLAFLUX components. New ALLAFLUX production development should be normalized into `ohi-stack/allaflux-platform`.

## What ALLAFLUX Is

ALLAFLUX turns the existing ALLATYME music stack into one artist-centered platform. It separates the creative application and catalog system from third-party inference providers while allowing approved model runtimes to plug into the model gateway.

The permanent platform identifier is **ODIN-P-AE1001**. ALLAFLUX-specific services, manifests, deployment records, and integration documents should retain that parent platform reference unless a component receives its own separately registered identifier.

## Canonical production topology

ALLAFLUX currently uses two public nodes:

```text
https://flux.allatyme.com
  └── Web / Creator Experience

https://api.allatyme.com
  └── Public Backend Gateway
        ├── Application API
        ├── Generation/audio requests
        ├── Billing/webhooks
        ├── Controlled media access
        └── Private backend services
```

Generation API, worker, model gateway, model runtime, audio processing, media ingestion, PostgreSQL, Redis, and object storage may remain separate services internally, but they do not require separate public hostnames.

`audioflux.allatyme.com` is reserved for a possible future dedicated audio/GPU node and is not part of the current production topology.

## Current Executable Generation Path

```text
apps/web
  → services/generation-api
  → PostgreSQL + Redis
  → apps/worker
  → services/model-gateway
  → ACE-Step 1.5 runtime
  → services/audio-processing
  → services/media-ingestion
  → ALLATYME object storage
  → durable generation history
```

In production, public backend access to this chain is consolidated behind `api.allatyme.com`.

PostgreSQL remains the source of truth for generation state/history. Redis is the queue accelerator. Processed audio is stored with checksums and processing metadata.

## ALLAFLUX Product Layers

- **Create** — controlled music-generation workflows.
- **Studio** — browser-based recording, editing, arrangement, and production workflows.
- **Artist** — canonical artist identity and sound profiles.
- **Catalog** — tracks, releases, albums, playlists, genres, credits, and metadata.
- **Flux** — discovery, search, trending, recommendations, and audience movement.
- **Media** — audio, video, artwork, visualizers, and publishing assets.
- **Social Publishing** — public/private/unlisted releases, follows, engagement, and creator publishing.
- **Commerce** — integration with the ALLATYME/WooCommerce commerce layer.
- **Community** — follows, favorites, libraries, memberships, and rewards.
- **Analytics** — listening, engagement, conversion, and catalog intelligence.
- **Provenance** — checksums, model/provider metadata, processing history, and rights attestations.

## Repository Architecture

```text
allatyme-platform/
├── apps/
│   ├── web/                 # Creator/user application
│   ├── admin/               # Platform administration
│   └── worker/              # Generation/background jobs
├── packages/
│   ├── ui/
│   ├── artists/             # Canonical artist/sound identity
│   ├── music/               # Catalog domain
│   ├── generation/          # Generation contracts
│   ├── audio/               # Audio contracts
│   ├── auth/
│   └── database/
├── services/
│   ├── generation-api/
│   ├── model-gateway/
│   ├── audio-processing/
│   └── media-ingestion/
├── models/                  # Manifests/config only; never model weights
├── docs/
├── infrastructure/
├── scripts/
└── tests/
```

## Canonical Documentation

- `docs/ALLAFLUX_IDENTITY.md`
- `docs/ALLAFLUX_ARCHITECTURE.md`
- `docs/ALLAFLUX_ARTIST_IDENTITY.md`
- `docs/ALLAFLUX_GENERATION_PIPELINE.md`
- `docs/ALLAFLUX_DISCOVERY.md`
- `docs/ALLAFLUX_ROADMAP.md`
- `docs/MUSIC_GENERATION_RUNTIME.md`
- `docs/PRODUCTION_PIPELINE.md`

The current authoritative implementation and deployment documentation should be taken from `ohi-stack/allaflux-platform` when the two repositories differ.

## Audio Integrity

The 432 Hz delivery path is an actual processing state. The system must never label audio as 432 Hz unless the configured processing operation succeeds. If required FFmpeg capabilities are unavailable, processing fails explicitly.

## Security & IP Boundary

Do not commit model weights, secrets, credentials, private training corpora, production databases, or private media binaries. Keep proprietary implementation and sensitive business data protected according to deployment requirements.

## Implementation Status

This repository contains a working source foundation for the generation-oriented architecture. The canonical ALLAFLUX repository now owns production normalization and deployment. Features must be marked implemented only after their code path, persistence, integration, and tests are actually present.

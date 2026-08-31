# ALLATYME™ Platform — ALLAFLUX™

**ALLAFLUX™ by ALLATYME™** is the product direction for the ALLATYME music-creation, artist, catalog, media, discovery, commerce, community, and analytics platform.

## What ALLAFLUX Is

ALLAFLUX turns the existing ALLATYME music stack into one artist-centered platform. It separates the creative application and catalog system from third-party inference providers while allowing approved model runtimes to plug into the model gateway.

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

PostgreSQL remains the source of truth for generation state/history. Redis is the queue accelerator. Processed audio is stored with checksums and processing metadata.

## ALLAFLUX Product Layers

- **Create** — controlled music-generation workflows.
- **Artist** — canonical artist identity and sound profiles.
- **Catalog** — tracks, releases, albums, playlists, genres, credits, and metadata.
- **Flux** — discovery, search, trending, recommendations, and audience movement.
- **Media** — audio, video, artwork, visualizers, and publishing assets.
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

- `docs/ALLAFLUX_ARCHITECTURE.md`
- `docs/ALLAFLUX_ARTIST_IDENTITY.md`
- `docs/ALLAFLUX_GENERATION_PIPELINE.md`
- `docs/ALLAFLUX_DISCOVERY.md`
- `docs/ALLAFLUX_ROADMAP.md`
- `docs/MUSIC_GENERATION_RUNTIME.md`
- `docs/PRODUCTION_PIPELINE.md`

## Audio Integrity

The 432 Hz delivery path is an actual processing state. The system must never label audio as 432 Hz unless the configured processing operation succeeds. If required FFmpeg capabilities are unavailable, processing fails explicitly.

## Security & IP Boundary

Do not commit model weights, secrets, credentials, private training corpora, production databases, or private media binaries. Keep proprietary implementation and sensitive business data protected according to deployment requirements.

## Implementation Status

The repository contains a working foundation for the generation-oriented architecture. The ALLAFLUX documents define the larger product target. Features must be marked implemented only after their code path, persistence, integration, and tests are actually present.

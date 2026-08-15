# ALLATYME Platform

Core application repository for the ALLATYME music ecosystem, including the music-creation platform, artist infrastructure, generation orchestration, catalog workflows, media tools, administration, background workers, APIs, and user-facing applications.

## Executable Generation Path

```text
apps/web
  → services/generation-api
  → Postgres + Redis durable queue
  → apps/worker
  → services/model-gateway
  → ACE-Step 1.5 runtime
  → services/audio-processing
  → services/media-ingestion
  → ALLATYME object storage
  → durable generation history
```

Postgres is the source of truth for generation state and history. Redis is the queue accelerator. Processed audio is copied into ALLATYME-controlled S3-compatible object storage with checksum and processing metadata.

## Repository Architecture

```text
allatyme-platform/
├── apps/
│   ├── web/                 # ALLATYME application
│   ├── admin/               # AMG administration
│   └── worker/              # generation/background jobs
│
├── packages/
│   ├── ui/                  # shared ALLATYME components
│   ├── artists/             # AMG artist identities/sound profiles
│   ├── music/               # tracks, albums, playlists
│   ├── generation/          # music-generation orchestration
│   ├── audio/               # audio processing contracts
│   ├── auth/
│   └── database/
│
├── services/
│   ├── generation-api/
│   ├── model-gateway/
│   ├── audio-processing/
│   └── media-ingestion/
│
├── models/
│   └── README.md            # model architecture/config only
│
├── docs/
├── infrastructure/
├── scripts/
├── tests/
└── README.md
```

## Architecture Rule

Large model weights, generated audio binaries, secrets, credentials, production databases, and private training corpora must not be committed to this repository. The `models/` directory stores architecture, configuration, model manifests, integration contracts, and documentation only.

## Local Infrastructure

`docker compose up -d` starts PostgreSQL, Redis, and MinIO. Apply `packages/database/schema.sql` before starting the generation API. ACE-Step runs separately on the configured GPU/local model runtime.

The 432 Hz delivery path requires FFmpeg with the `rubberband` filter. If that capability is missing, processing fails explicitly rather than mislabeling audio.

See `docs/PRODUCTION_PIPELINE.md` and `docs/MUSIC_GENERATION_RUNTIME.md` for the current implementation boundary and remaining production gates.

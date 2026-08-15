# ALLATYME Platform

Core application repository for the ALLATYME music ecosystem, including the music-creation platform, artist infrastructure, generation orchestration, catalog workflows, media tools, administration, background workers, APIs, and user-facing applications.

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
│   ├── artists/             # AMG artist identities/profiles
│   ├── music/               # tracks, albums, playlists
│   ├── generation/          # music-generation orchestration
│   ├── audio/               # audio processing
│   ├── auth/
│   └── database/
│
├── services/
│   ├── generation-api/
│   ├── model-gateway/
│   ├── audio-processing/
│   └── media-ingestion/
│
├── models/                  # manifests/config only; never large weights
├── docs/
├── infrastructure/
├── scripts/
├── tests/
└── README.md
```

## Current Executable Music-Generation Path

The repository now contains a working V0.1 orchestration path for an independently operated music-model runtime:

```text
apps/web
  -> services/generation-api
  -> apps/worker
  -> services/model-gateway
  -> ACE-Step 1.5 REST runtime
```

Current V0.1 supports full-song and instrumental generation requests with lyrics, creative direction, language, genre, mood, BPM, key, time signature, duration, output format and 1–8 candidates. The web application submits the request, the worker dispatches it through the model gateway, the gateway translates it to the ACE-Step asynchronous API contract, and the browser monitors the ALLATYME job until generated artifacts are returned.

Advanced ACE-Step capabilities such as cover, repaint, complete/extend, add-layer, stems and reference-audio conditioning remain behind the trusted service boundary until the authenticated media layer can resolve authorized source assets safely.

See [`docs/MUSIC_GENERATION_RUNTIME.md`](docs/MUSIC_GENERATION_RUNTIME.md) for setup, runtime flow, rights controls and production gaps.

## Quick Local Start

Prerequisites:

- Node.js with native `fetch` support
- pnpm
- Docker for PostgreSQL/Redis
- A separately installed/configured music-model runtime

```bash
cp .env.example .env
docker compose up -d postgres redis
pnpm dev
```

The initial ACE-Step adapter expects the model runtime at `http://localhost:8001` unless `MODEL_RUNTIME_URL` is changed.

Local ALLATYME endpoints:

- Web — `http://localhost:3000`
- Generation API — `http://localhost:4100`
- Model gateway — `http://localhost:4200`

## Architecture Rule

Large model weights, generated audio binaries, secrets, credentials, production databases, and private training corpora must not be committed to this repository. The `models/` directory stores architecture, configuration, model manifests, integration contracts, and documentation only.

The upstream model runtime and exact checkpoint terms must be reviewed independently at deployment. A software repository license must not be assumed to govern every externally distributed model weight.

## Rights Boundary

ALLATYME generation requests require rights attestations for user-supplied creative direction and lyrics. Reference/source audio is not enabled merely because a model technically accepts it; it must pass through the authenticated media layer with explicit ownership or authorization before the worker may provide it to a runtime.

Do not use scraped music, unauthorized artist recordings, third-party generated catalogs, or private voice material as model-training/reference material without appropriate rights.

## 432 Hz Policy Boundary

The generation request supports `masterTuningHz`, with 432 Hz as the platform default and 440 Hz as a compatibility option. At V0.1 this records the requested mastering policy only. Raw model output must not be represented as 432 Hz-treated until `services/audio-processing` actually performs and records the required post-processing operation.

## Application Boundaries

- `apps/web` — primary ALLATYME user-facing application and current song-generation interface.
- `apps/admin` — AMG administration and operational control surfaces.
- `apps/worker` — asynchronous/background generation and processing jobs.
- `packages/*` — reusable domain and infrastructure packages.
- `services/generation-api` — public generation request/status boundary and current V0.1 queue.
- `services/model-gateway` — model-provider abstraction and ACE-Step adapter boundary.
- `services/audio-processing` — post-generation audio/mastering boundary.
- `services/media-ingestion` — controlled ingestion into ALLATYME-owned media storage/catalog.
- `models` — model specifications and integration metadata only.
- `infrastructure` — deployment and environment infrastructure definitions.
- `docs` — product, technical, operational, and architecture documentation.
- `scripts` — repository automation and developer utilities.
- `tests` — cross-platform integration and end-to-end tests.

## V0.1 Production Gaps

The current code is an executable development foundation, not a production-complete hosted music service. Required next work includes durable PostgreSQL/Redis queueing, user authentication and authorization, object-storage ingestion, media-asset resolution, mastering/audio processing, rate limiting, observability, retries/dead-letter handling, automated tests, GPU/runtime deployment and exact checkpoint-license review.

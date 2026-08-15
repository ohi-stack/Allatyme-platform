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

## Application Boundaries

- `apps/web` — primary ALLATYME user-facing application.
- `apps/admin` — AMG administration and operational control surfaces.
- `apps/worker` — asynchronous/background generation and processing jobs.
- `packages/*` — reusable domain and infrastructure packages.
- `services/*` — independently deployable platform services.
- `models` — model specifications and integration metadata only.
- `infrastructure` — deployment and environment infrastructure definitions.
- `docs` — product, technical, operational, and architecture documentation.
- `scripts` — repository automation and developer utilities.
- `tests` — cross-platform integration and end-to-end tests.

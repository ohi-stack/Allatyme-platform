# ALLATYME Music Generation Runtime

## Purpose

This document defines the first executable ALLATYME-owned music-generation path.

```text
apps/web
  -> services/generation-api
  -> apps/worker
  -> services/model-gateway
  -> ACE-Step 1.5 REST runtime
  -> generated audio artifacts
```

The public application never calls the model runtime directly. This boundary keeps model-provider details, runtime credentials, and future model substitutions behind ALLATYME-controlled services.

## Current V0.1 Capability

Implemented now:

- Full-song text/lyrics generation
- Instrumental generation
- 1–8 candidate outputs
- BPM, key, time-signature, duration, language, format, genre and mood controls
- Optional model override
- Enhanced planning (`thinking=true`)
- Job submission, worker dispatch, provider polling, completion/failure state and browser playback
- Prompt and lyrics rights attestations
- Model runtime isolated behind `model-gateway`

Architecturally defined but not yet enabled in the public UI until authorized media assets are resolvable to the model host:

- Cover generation
- Repaint/edit
- Extend/complete
- Add layer / LEGO
- Stem extraction
- Reference-audio conditioning

## 1. Start Data Services

From the repository root:

```bash
docker compose up -d postgres redis
```

The current generation queue is intentionally marked `memory-v1`; PostgreSQL/Redis durability is the next queue migration. PostgreSQL and Redis are already reserved in the repository infrastructure.

## 2. Start ACE-Step 1.5

ACE-Step 1.5's upstream project currently documents Python 3.11–3.12 and provides a REST server command:

```bash
git clone https://github.com/ace-step/ACE-Step-1.5.git
cd ACE-Step-1.5
uv sync
uv run acestep-api
```

The upstream REST runtime defaults to `http://localhost:8001` and exposes asynchronous submission through `/release_task`, status polling through `/query_result`, model discovery through `/v1/models`, and generated audio through `/v1/audio`.

Do not commit ACE-Step model weights into this repository. Keep weights on the GPU/runtime host or an approved model cache.

## 3. Configure ALLATYME

Copy the environment template:

```bash
cp .env.example .env
```

Minimum local runtime values:

```dotenv
GENERATION_API_URL=http://localhost:4100
MODEL_GATEWAY_URL=http://localhost:4200
MODEL_PROVIDER=ace-step
MODEL_RUNTIME_URL=http://localhost:8001
ACESTEP_MODEL=acestep-v15-xl-turbo
INTERNAL_SERVICE_TOKEN=replace-this
```

If the ACE-Step API is protected with its own API key, set:

```dotenv
MODEL_RUNTIME_TOKEN=your-ace-step-api-key
```

## 4. Start ALLATYME Services

Use separate terminals or the root recursive development command:

```bash
pnpm dev
```

Expected local endpoints:

- Web: `http://localhost:3000`
- Generation API: `http://localhost:4100`
- Model gateway: `http://localhost:4200`
- ACE-Step runtime: `http://localhost:8001`

## 5. Generation Flow

1. The browser submits a generation request to `POST /v1/generations`.
2. The generation API validates basic request structure and rights attestations.
3. The worker leases the next queued job from the generation API.
4. The worker dispatches the normalized request to `POST /v1/inference` on the model gateway.
5. The ACE-Step adapter maps ALLATYME fields to the upstream `/release_task` contract.
6. The worker polls provider state through the model gateway until success/failure.
7. Completed artifact URLs are recorded on the ALLATYME generation job.
8. The browser polls `GET /v1/generations/:id` and renders the returned audio candidates.

## 6. Rights Boundary

The generation API requires a prompt-content rights attestation. If lyrics are supplied, it also requires an explicit lyrics-rights attestation.

Reference or source audio must not be routed into the model until:

- the asset exists in the authenticated ALLATYME media layer;
- ownership or authorization is recorded;
- the worker resolves it to a trusted runtime-accessible path; and
- the request carries the required reference/source-audio attestation.

Do not use third-party generated catalogs, scraped audio, unauthorized artist recordings, or private voice material as training/reference data merely because they are technically accessible.

## 7. 432 Hz Policy

Generation requests currently carry `masterTuningHz` with 432 Hz as the ALLATYME default and 440 Hz as a compatibility option.

This value is a requested mastering policy at V0.1; it is **not yet proof that the raw model output has been post-processed to that reference**. The production pipeline must route successful masters through `services/audio-processing` before marking a 432 Hz treatment as completed.

## 8. Production Gaps

Before public production deployment, complete these items:

1. Replace the in-memory job map with PostgreSQL + Redis-backed durable queueing.
2. Add authenticated users and ownership scoping to generation jobs.
3. Resolve authorized media assets for reference/source-audio modes.
4. Copy provider output to ALLATYME-controlled object storage instead of exposing runtime-local URLs.
5. Implement audio-processing/mastering and verified tuning metadata.
6. Add rate limits, quotas, idempotency keys, request size limits and audit logging.
7. Add model/runtime health supervision and retry/dead-letter handling.
8. Verify the exact model/checkpoint license and deployment terms for every runtime weight set used.
9. Add automated contract, integration and end-to-end tests.
10. Add production observability and cost/GPU utilization telemetry.

## Upstream Basis

The initial adapter follows the ACE-Step 1.5 upstream REST API contract documented by its project: asynchronous `/release_task` submission, `/query_result` status polling, multi-model selection, 10–600 second duration controls, batch generation up to 8, metadata controls, editing task types, and audio result URLs.

The upstream GitHub software repository is MIT licensed. Model/checkpoint terms should be reviewed separately for the exact weights selected for deployment.

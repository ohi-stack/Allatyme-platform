# ALLATYME Generation Production Pipeline

## Runtime path

Web → Generation API → Postgres + Redis queue → Worker → Model Gateway → ACE-Step runtime → Audio Processing → Media Ingestion → ALLATYME object storage → Generation history.

## Source of truth

Postgres is authoritative for job state and history. Redis is a fast queue index. If a Redis enqueue is lost, the Generation API repairs from the oldest queued Postgres job.

## Audio integrity

Provider output is not automatically described as 432 Hz. When a request specifies the ALLATYME 432 Hz delivery reference, the audio-processing service applies a 432/440 pitch ratio using FFmpeg's rubberband filter while preserving duration, then performs delivery loudness normalization. If the required filter is unavailable, the job fails rather than mislabeling output.

This processing stage is a reproducible delivery pipeline, not a claim that automated normalization equals a human mastering engineer.

## Storage

Processed artifacts are copied into ALLATYME-controlled S3-compatible storage. Local development uses MinIO. Each stored artifact records its S3 URI, object key, SHA-256 checksum, MIME type, processing metadata, model metadata, and provider-source URI.

## Rights boundary

Prompt/lyrics rights attestations remain mandatory. Reference/source audio remains disabled from the public V0.1 form and must enter through an authenticated media workflow with an explicit authorization record before model use.

## Artist sound profiles

The `packages/artists` sound-profile contract is the next layer above the foundation model. Approved profiles can encode each artist's genre lane, instrumentation, arrangement, vocal character, recurring intro/ad-libs, BPM range, and negative directions without fine-tuning a model. Model training or LoRA personalization is a separate action and requires independently authorized training assets.

## Production gates still open

- Apply database schema/migrations automatically during deployment.
- Replace local development credentials and require service-to-service tokens.
- Deploy Postgres/Redis/object storage with backups and encryption.
- Deploy ACE-Step on a GPU runtime and pin exact software/checkpoint versions after license review.
- Add durable processing leases/recovery for workers interrupted after provider dispatch.
- Add authenticated reference/source-audio asset resolution.
- Add artist sound-profile resolution in the generation API/model gateway.
- Add waveform/stem indexing, release approval, observability, metrics, alerting, and retention policies.
- Add CI tests and deployment health gates.

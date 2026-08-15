# Media Ingestion Service

Internal service that moves generated/processed media into ALLATYME-controlled S3-compatible object storage.

Security rules:
- internal bearer token in production
- source origins must be explicitly allowlisted
- object keys are sanitized
- file size is bounded
- SHA-256 is recorded for each ingested object

Local development uses MinIO from the root `docker-compose.yml`; production may use any compatible private object-storage provider.

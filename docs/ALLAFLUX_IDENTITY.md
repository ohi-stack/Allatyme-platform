# ALLAFLUX™ by ALLATYME — Canonical Identity Record

**Permanent ODIN:** `ODIN-P-AE1001`  
**ODIN series:** `ODIN-P`  
**Registry key:** `allaflux`  
**Parent platform:** ALLATYME™  
**Canonical web node:** `https://flux.allatyme.com`  
**Canonical API node:** `https://api.allatyme.com`  
**Canonical implementation repository:** `ohi-stack/allaflux-platform`  
**Record date:** September 12, 2026  
**Topology update:** September 19, 2026  
**Development status:** Active development

## Canonical Description

ALLAFLUX™ by ALLATYME is the music creation, studio, social publishing, artist catalog and creator platform for `flux.allatyme.com`, with `api.allatyme.com` serving as the canonical public backend gateway.

## Classification

- Music Creation
- Browser Studio
- Social Publishing
- Artist Catalog
- Creator Platform

## Registry Rule

`ODIN-P-AE1001` is the permanent platform identifier for ALLAFLUX™ by ALLATYME. ALLAFLUX-specific application, service, deployment, catalog, publishing, and integration records should carry this identifier where platform identity is represented.

A technology, model, engine, protocol, service, or infrastructure component may receive its own separate ODIN identifier when independently registered. Where applicable, such a record should retain a parent/reference relationship to `ODIN-P-AE1001`.

## Canonical Public Topology

ALLAFLUX currently uses two public production nodes:

- `https://flux.allatyme.com/` — ALLAFLUX web application and creator experience.
- `https://api.allatyme.com/` — canonical public backend gateway for application APIs, generation/audio traffic, billing/webhooks, controlled media access, and routing to private backend services.

Generation API, worker, model gateway, model/GPU runtime, audio processing, media ingestion, PostgreSQL, Redis, and object storage may remain independently deployable behind private networking. They do not require separate public hostnames.

For the current Sites integration, `api.allatyme.com` should preserve `/capabilities`, `/jobs`, `/jobs/{id}`, `/jobs/{id}/audio`, and `/jobs/{id}/stems` as trusted audio-engine compatibility routes.

`audioflux.allatyme.com` is reserved for a possible future dedicated audio/GPU deployment and is not active or required in the current topology.

## Canonical Application Routes

- `/create` — song and instrumental creation
- `/studio` — browser studio / DAW
- `/library` — creator projects and generations
- `/discover` — public music feed
- `/upload` — audio upload
- `/record` — microphone and voice recording
- `/voices` — authorized voice profiles
- `/artists` — ALLATYME / AMG artist integration
- `/plans` — Free / Pro / Everything
- `/account` — creator account and billing
- `/admin` — administration console

When this provenance repository conflicts with current production architecture, `ohi-stack/allaflux-platform` is authoritative.

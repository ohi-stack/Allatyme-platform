# ALLAFLUX™ by ALLATYME — Canonical Identity Record

**Permanent ODIN:** `ODIN-P-AE1001`  
**ODIN series:** `ODIN-P`  
**Registry key:** `allaflux`  
**Parent platform:** ALLATYME™  
**Canonical node:** `https://flux.allatyme.com`  
**Record date:** September 12, 2026  
**Development status:** Active development

## Canonical Description

ALLAFLUX™ by ALLATYME is the music creation, studio, social publishing, artist catalog and creator platform for `flux.allatyme.com`.

## Classification

- Music Creation
- Browser Studio
- Social Publishing
- Artist Catalog
- Creator Platform

## Registry Rule

`ODIN-P-AE1001` is the permanent platform identifier for ALLAFLUX™ by ALLATYME. ALLAFLUX-specific application, service, deployment, catalog, publishing, and integration records should carry this identifier where platform identity is represented.

A technology, model, engine, protocol, service, or infrastructure component may receive its own separate ODIN identifier when independently registered. Where applicable, such a record should retain a parent/reference relationship to `ODIN-P-AE1001`.

## Canonical Application Topology

- `https://flux.allatyme.com/` — public ALLAFLUX application
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

Recommended service topology:

- `api.flux.allatyme.com` — application/API layer
- `inference.flux.allatyme.com` — authenticated inference/model gateway
- `media.flux.allatyme.com` — media delivery origin when enabled

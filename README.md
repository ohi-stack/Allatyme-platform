# ALLATYME™ Platform — Provenance / Historical Source

**ALLAFLUX Permanent ODIN:** `ODIN-P-AE1001`  
**ALLAFLUX creator node:** `https://flux.allatyme.com`  
**ALLATYME API / control-plane node:** `https://api.allatyme.com`  
**Canonical active implementation repository:** `ohi-stack/allaflux-platform`  
**Record date:** September 12, 2026  
**Topology update:** September 27, 2026

## Repository role

`ohi-stack/Allatyme-platform` is retained as an ALLATYME source/provenance repository and historical implementation source for earlier ALLAFLUX and platform components.

Active production development for ALLAFLUX backend services and the expanding `api.allatyme.com` control plane belongs in:

**`ohi-stack/allaflux-platform`**

This provenance repository should not become a competing production authority.

## Current canonical topology

```text
allatyme.com
  └── Public ALLATYME platform / publishing / commerce

flux.allatyme.com
  └── ALLAFLUX creator experience

world.allatyme.com
  └── ALLATYME WORLD 3D runtime / campus / simulation

api.allatyme.com
  └── ALLATYME API™ Master Technical Control Plane
        ├── API gateway / registry
        ├── authenticated Command Center
        ├── MCP registry / tool explorer
        ├── connectors / external services
        ├── webhooks / events / jobs / queues
        ├── ALLAFLUX operations
        ├── ALLATYME WORLD integration
        ├── artist / catalog / media integrations
        ├── infrastructure / storage / databases
        ├── observability / alerts / logs / metrics
        ├── deployments / environments
        ├── users / roles / permissions / secrets
        └── audit / developer operations
```

## Control-plane expansion

`api.allatyme.com` was originally defined primarily as the public backend gateway for ALLAFLUX generation/audio, application APIs, billing/webhooks, and controlled media delivery.

As of September 27, 2026, that node is expanded into the **master technical control plane for ALLATYME** while preserving compatibility with existing ALLAFLUX backend routes.

The control plane manages and observes ALLATYME systems but does not replace product-specific authoritative runtimes. For example, `ohi-stack/allatyme-world` remains canonical for the ALLATYME WORLD runtime, while `ohi-stack/allaflux-platform` remains canonical for ALLAFLUX backend services and control-plane implementation.

The governing specification is maintained in the active repository:

`ohi-stack/allaflux-platform/docs/ALLATYME_API_CONTROL_PLANE.md`

## Historical ALLAFLUX context

ALLAFLUX turns the existing ALLATYME music stack into an artist-centered music creation, studio, social publishing, catalog, and creator platform. It separates creator/product logic from interchangeable inference/model providers.

The permanent platform identifier remains **ODIN-P-AE1001**.

Historical source in this repository may include:

- creator-facing web code;
- administration source;
- workers/background jobs;
- artist/catalog domain packages;
- generation contracts;
- audio contracts;
- authentication/database code;
- generation API source;
- model gateway source;
- audio-processing source;
- media-ingestion source;
- architecture and roadmap documentation.

Where this repository conflicts with current production architecture, use `ohi-stack/allaflux-platform` as the implementation authority.

## Security and IP boundary

Do not commit model weights, secrets, credentials, private training corpora, production databases, or private media binaries. Historical provenance does not make sensitive production material appropriate for this repository.

## Status

**Historical/provenance repository.**

The active ALLATYME API/control-plane architecture and ALLAFLUX production normalization are maintained in `ohi-stack/allaflux-platform`.

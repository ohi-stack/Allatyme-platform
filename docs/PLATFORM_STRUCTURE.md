# ALLATYME Platform Structure

This document maps the public ALLATYME website structure to repository-level platform domains.

## 1. Music

Public site role:

- Music discovery
- Official artist roster
- Artist pages
- Music store
- Releases and catalog presentation

Repository alignment:

- `packages/artists/`
- `packages/music/`
- `services/media-ingestion/`
- `services/audio-processing/`
- `apps/web/`

## 2. Artists

The public site uses an official artist navigation organized by genre and provides dedicated artist/store destinations.

Repository alignment:

- `packages/artists/` for artist identities and sound profiles
- `packages/music/` for catalog relationships
- `apps/admin/` for roster administration
- `apps/web/` for public artist presentation

## 3. Commerce

The public site contains a Store/Shop pathway and visible product listings. Artist stores are also exposed through navigation.

Repository alignment:

- Catalog and product metadata should remain distinct from media-generation infrastructure.
- WooCommerce integration should be treated as a commerce boundary rather than the canonical source for core artist identity or generation state.

## 4. Marketplace / Business

The public site provides Marketplace, Submit Your Business, Promote My Business, and business discovery pathways.

Repository alignment:

- Business discovery and promotion interfaces belong under the application layer.
- Business records should be modeled separately from AMG artist records.

## 5. Events / Media

Events, latest news, YouTube highlights, and video/media content are visible public-site content areas.

Repository alignment:

- `services/media-ingestion/`
- `apps/web/`
- future media/content modules under `packages/`

## 6. Administration

The existing repository architecture already defines `apps/admin/` for AMG administration and `apps/worker/` for background jobs. Those components should remain separate from public marketing/content presentation.

## 7. Generation infrastructure

The existing repository README defines an executable generation path through the web application, generation API, durable queue, worker, model gateway, audio processing, media ingestion, object storage, and generation history.

The public website snapshot does not by itself establish that every generation component is deployed on allatyme.com. Deployment state must therefore be tracked separately from published website content.

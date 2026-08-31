# ALLATYME Content and Source Migration Register

**Purpose:** Track material being moved into `ohi-stack/Allatyme-platform` without confusing published website content with source code or future architecture.

## Public website source

- `https://allatyme.com/` — public homepage and current navigation
- `https://allatyme.com/about/` — platform overview, structure, flagship project, and founder information
- `https://allatyme.com/marketplace/` — marketplace positioning and business categories
- `https://allatyme.com/artists/` — public artist destinations where available

## Existing project artifacts available for migration

The project workspace contains ALLATYME source artifacts including:

- ALLATYME Media Engine ZIP packages
- WordPress WXR/XML exports
- ALLATYME catalog CSV data
- ALLATYME category CSV data
- Artist registry and artist-profile documents
- Platform strategy and growth documents
- Homepage and navigation specifications
- ALLATYME YouTube documentation

## Migration rule

Text-based source can be committed directly through the GitHub Contents API. Binary packages and large media assets should be migrated through an appropriate Git transport or release/artifact workflow rather than being silently converted into text.

## Provenance rule

Every migrated item should retain enough provenance to identify whether it came from:

1. the live public website;
2. an uploaded project source artifact;
3. an existing repository implementation; or
4. a proposed/future specification.

Do not merge those categories without labeling them.

## Current status

Initial site-derived documentation has been committed. The next migration layer should prioritize the actual ALLATYME Media Engine/plugin source, WordPress exports, catalog data, and platform documentation that can be converted or transported without loss.

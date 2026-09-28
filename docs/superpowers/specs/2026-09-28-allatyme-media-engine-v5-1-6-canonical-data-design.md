# ALLATYME Media Engine™ V5.1.6 — Canonical Artist / Genre / Media / Catalog Data Design

**Date:** 2026-09-28  
**Product:** ALLATYME Media Engine™  
**Release:** V5.1.6  
**Release purpose:** Finish the canonical artist, genre, media, and music-catalog data layer while preserving existing ALLATYME WordPress compatibility.

## 1. Outcome

V5.1.6 is a data-integrity and integration release. It does not replace the Media Engine with a new application and does not move ALLATYME WORLD runtime concerns into WordPress.

The release is complete when the Media Engine has one stable, queryable source of record for:

- artist identity;
- artist-to-genre relationships;
- artist media roles;
- albums, tracks, playlists, releases, and featured releases;
- artist-to-catalog relationships;
- artist-store and commerce linkage metadata;
- data-completeness state;
- API-ready normalized representations.

The governing rule is:

> **One canonical identity per artist, one stable AMG code, relational genres, typed media, explicit catalog relationships, backward-compatible WordPress presentation.**

## 2. Existing baseline to preserve

The existing Media Engine catalog model already uses:

- `amg_track` post type;
- `amg_album` post type;
- `amg_playlist` post type;
- `amg_artist` taxonomy;
- `amg_genre` taxonomy.

V5.1.6 preserves these public objects and existing shortcodes/URLs wherever possible.

The Artist Record 2.0 import already establishes 70 `amg_artist_record` posts plus matching artist taxonomy terms and stable AMG identifiers. V5.1.6 treats that structure as the canonical identity foundation rather than creating a second artist database.

### 2.1 Executable-source baseline requirement

The canonical GitHub repository currently preserves V4.6.0 documentation and a checksum manifest that references the historical PHP/assets, but those executable files are not present in the checked repository directory. Therefore:

- V5.1.6 may use the documented V4.6.0 contracts and Artist Record 2.0 fixture for design and test preparation;
- a claim that V5.1.6 is a verified in-place/drop-in upgrade requires the actual current executable Media Engine source or a current installed plugin package to be inspected and tested;
- if that executable baseline is not available, V5.1.6 must be produced as a clean-room compatibility implementation against the documented contracts and fixtures;
- a clean-room package must be labeled **staging/release-candidate pending compatibility verification**, not production-certified, until tested against the live/current WordPress installation;
- missing historical source must never be silently reconstructed and represented as the original source.

This source-baseline rule does not change the V5.1.6 data architecture; it controls the accuracy of compatibility and release claims.

## 3. Source-of-record boundaries

### 3.1 Media Engine owns

The Media Engine is authoritative for:

- AMG code / artist ID;
- public artist name and slug;
- Artist Record publication state;
- country;
- division;
- languages;
- primary and secondary genres;
- profile/hero/editorial media relationships;
- featured release;
- albums, tracks, playlists, releases and videos;
- artist-store URL/category linkage;
- public profile URL;
- related artists;
- discovery metadata;
- catalog/media completeness;
- commercial/public artist metadata.

### 3.2 Media Engine does not own

The following remain outside V5.1.6 canonical ownership:

- ALLATYME WORLD avatar IDs;
- residence assignments;
- runtime location;
- simulation state;
- world memory/relationships;
- show continuity;
- autonomous behavior.

Those systems reference the same AMG identifier but do not redefine the artist.

## 4. Canonical artist identity

### 4.1 Immutable key

`amg_code` is the immutable synchronization key.

Examples:

- `AA0001`
- `AA0002`
- `AA0701`

Names and slugs may change. AMG codes must not be regenerated from names.

### 4.2 Canonical Artist Record

Each registered artist has exactly one published or administratively managed `amg_artist_record` post.

Required canonical fields:

```text
record_schema
amg_code
odin_identifier
artist_name
artist_slug
entity_type
country
division
languages
primary_genre
secondary_genres
tagline
profile_url
store_url
store_category
onboarding_stage
featured_release_id
featured_release_title
related_artist_ids
publication_status
updated_at
```

### 4.3 Compatibility mirror

`amg_artist` taxonomy remains available for legacy shortcodes, filtering, archive URLs and catalog queries.

The taxonomy term is a **projection of the Artist Record**, not an independent identity authority.

On save/sync:

1. Resolve the Artist Record by AMG code.
2. Resolve or create the matching `amg_artist` term.
3. Synchronize approved compatibility fields.
4. Never create a second artist merely because a slug/name changed.
5. Preserve legacy slugs as aliases/redirect metadata.

## 5. Identity reconciliation rules

Migration must be idempotent and non-destructive.

When an imported/legacy record and a current record share the same AMG code:

- AMG code wins as the identity key;
- current non-empty canonical fields are preserved;
- legacy values are retained as aliases/history when useful;
- conflicting non-empty identity values are logged for review;
- no silent duplicate artist is created;
- no automatic artist rename occurs solely from a seed file.

This is especially important where historical artist names or slugs differ from current public names.

## 6. Canonical genre system

`amg_genre` becomes a true relational taxonomy rather than a loose text label system.

Each genre term supports:

```text
genre_id
name
slug
description
parent_genre
featured_image_id
hero_image_id
icon_media_id
seo_title
seo_description
world_enabled
api_identifier
sort_order
status
```

Artists support:

- exactly one primary genre relationship;
- zero or more secondary genre relationships;
- division as a separate organizational field, not a substitute for genre.

Legacy text such as:

`Amapiano • Afrohouse • Afrobeats • Afro-Fusion`

must be parsed and reconciled against canonical `amg_genre` terms. Unknown values are logged and may create a review candidate, but are not silently mapped to an unrelated term.

## 7. Canonical media model

Media must be role-based and attachment-first.

### 7.1 Artist media roles

```text
profile_image      3:4
hero_banner        16:9
editorial_image    3:2
album_cover         1:1
single_cover        1:1
video_thumbnail    16:9
logo_mark          variable/transparent
```

Canonical fields store WordPress attachment IDs where the media exists in the Media Library. URL fields may remain as compatibility mirrors/fallbacks.

### 7.2 Media record attributes

Each media relationship should expose:

```text
attachment_id
url
role
artist_id
catalog_object_id
mime_type
width
height
aspect_ratio
alt_text
caption
credit
status
updated_at
```

### 7.3 Ratio validation

V5.1.6 validates the expected ratio for canonical media roles and reports mismatches in Artist Completeness. Validation should warn by default rather than deleting or cropping existing media automatically.

## 8. Canonical catalog relationships

The release keeps existing catalog post types but standardizes their relationship fields.

### 8.1 Track

Each `amg_track` should support:

```text
track_id
artist_ids
primary_artist_id
featured_artist_ids
album_id
release_id
genre_ids
primary_genre_id
title
slug
status
release_date
audio_attachment_id
cover_attachment_id
duration
isrc
explicit
track_number
licensing_status
store_product_id
updated_at
```

### 8.2 Album

Each `amg_album` should support:

```text
album_id
artist_ids
title
slug
album_type
release_date
cover_attachment_id
track_ids
genre_ids
status
store_product_id
updated_at
```

### 8.3 Playlist

Each `amg_playlist` should support:

```text
playlist_id
title
slug
owner_type
owner_id
track_ids
cover_attachment_id
visibility
status
updated_at
```

### 8.4 Featured release

Artist featured release stores a stable catalog object ID. `0` or empty means automatic latest eligible release.

The display title is derived from the related catalog object when possible rather than being treated as an independent title authority.

## 9. Stable internal identifiers

V5.1.6 separates stable IDs from display slugs.

Recommended patterns:

```text
Artist     AA0701
Genre      genre-amapiano
Track      track-<uuid-or-stable-id>
Album      album-<uuid-or-stable-id>
Playlist   playlist-<uuid-or-stable-id>
Media      WordPress attachment ID + role
```

Existing WordPress post IDs remain valid database identifiers but should not be the only cross-system contract.

## 10. Canonical data service

Implement a single internal service layer so admin UI, shortcodes, API, WORLD sync and future integrations do not each reconstruct artist data differently.

Recommended classes/modules:

```text
CanonicalArtistRepository
CanonicalGenreRepository
CanonicalMediaRepository
CanonicalCatalogRepository
ArtistDataNormalizer
GenreNormalizer
MediaRoleValidator
CatalogRelationshipResolver
ArtistCompletenessService
MigrationService
```

All outward representations should consume these services.

## 11. REST/API representations

V5.1.6 should expose normalized read resources under a versioned namespace.

Recommended WordPress REST namespace:

`/wp-json/allatyme/v1`

Read endpoints:

```text
GET /artists
GET /artists/{amg_code}
GET /genres
GET /genres/{genre_id}
GET /tracks
GET /tracks/{id}
GET /albums
GET /albums/{id}
GET /playlists
GET /media
GET /catalog/search
GET /completeness/artists
```

API responses use stable IDs and normalized relationships. Legacy meta-key names should not leak into the public contract.

Write endpoints are out of scope unless already required by an existing Media Engine workflow. Existing WordPress admin remains the primary editor for V5.1.6.

## 12. Artist completeness

Completeness must be deterministic and explainable.

Recommended checks:

### Identity

- AMG code present and unique;
- canonical artist name;
- country;
- division;
- primary genre;
- languages;
- public status.

### Media

- 3:4 profile image;
- 16:9 hero image;
- optional editorial media;
- media attachment resolution valid.

### Catalog

- at least one catalog relationship where expected;
- featured release resolves or automatic-latest rule applies;
- no dangling track/album/playlist references.

### Commerce

- artist store relationship resolves where enabled;
- product/category references do not point to missing records.

### Public profile

- biography/content present;
- profile URL resolves structurally;
- related artist IDs point to valid artists.

Completeness output includes:

```text
score
status
missing_required
missing_recommended
warnings
conflicts
last_checked_at
```

The dashboard must not fabricate completion values.

## 13. Migration from legacy/meta-box data

V5.1.6 ships an explicit migration routine.

Migration sequence:

1. Inventory all `amg_artist_record` posts and `amg_artist` terms.
2. Index them by AMG code.
3. Detect duplicates and missing codes.
4. Normalize identity fields.
5. Normalize genre text into `amg_genre` relationships.
6. Resolve artist media URLs to attachment IDs where possible.
7. Normalize store/profile URLs.
8. Normalize featured-release references.
9. Normalize related-artist relationships to AMG codes.
10. Normalize track/album/playlist artist relationships.
11. Run integrity checks.
12. Persist migration version and audit summary.

Required migration properties:

- idempotent;
- resumable;
- dry-run capable;
- capability-protected;
- nonce-protected when launched from admin;
- no destructive delete by default;
- conflict log downloadable/exportable.

## 14. Backward compatibility

V5.1.6 must preserve existing public behavior unless the behavior conflicts with canonical data integrity.

Compatibility targets:

- existing shortcodes continue resolving artists/catalog;
- existing `amg_artist` and `amg_genre` archive/filter behavior remains available;
- existing artist/store/profile URLs are preserved where valid;
- legacy meta values may continue to be mirrored for one release cycle;
- canonical services become the preferred internal read path.

The release must not require ALLATYME WORLD or `api.allatyme.com` to be online in order for normal WordPress catalog pages to function.

## 15. Admin changes

Add or complete these operational surfaces:

```text
ALLATYME
├── Artist Records
├── Artists Registered
├── Artist Completeness
├── Genres
├── Media
├── Tracks
├── Albums
├── Playlists
├── Data Migration
├── Integrity Report
└── API / Data Status
```

### Data Migration

Displays:

- records scanned;
- canonical artists;
- duplicate AMG codes;
- missing AMG codes;
- genre mappings;
- media resolved;
- unresolved media;
- catalog relationships fixed;
- conflicts;
- warnings;
- last migration version.

### Integrity Report

Must support filtering by:

- artist;
- AMG code;
- problem type;
- severity;
- data domain.

## 16. Security

All data-changing admin actions require:

- capability checks;
- nonce verification;
- sanitized input;
- escaped admin output;
- safe redirects;
- no public migration endpoints;
- no secrets in client-side JavaScript;
- no unauthenticated write REST routes.

Read REST routes may be public only for data already intended for public artist/catalog pages.

## 17. Auditability

Material canonicalization actions generate an audit record containing:

```text
timestamp
actor_user_id
action
entity_type
entity_id
amg_code_if_applicable
before_hash
after_hash
result
conflict_count
migration_version
```

V5.1.6 must make it possible to explain why a record changed.

## 18. Seed-data policy

The existing 70-record Artist Record 2.0 WXR can be used as a reconciliation seed and test fixture.

It must not blindly overwrite an already-populated current production record.

Seed precedence:

1. current non-empty canonical WordPress record;
2. explicitly approved current registry value;
3. import/seed value;
4. legacy compatibility value.

Conflicts are logged, not guessed.

## 19. Testing strategy

### Unit / service tests

- unique AMG-code enforcement;
- artist lookup by AMG code;
- slug change does not create duplicate artist;
- genre parsing and normalization;
- media-role validation;
- featured-release resolution;
- catalog relationship resolution;
- completeness calculation;
- migration idempotency;
- conflict detection.

### WordPress integration tests

- existing CPT/taxonomy registration still works;
- existing shortcodes render from canonical services;
- admin save mirrors compatibility fields correctly;
- REST resources return normalized contracts;
- migration dry run changes nothing;
- migration apply produces the same result on repeated execution.

### Data fixture tests

Use the 70-record Artist Record 2.0 fixture to verify:

- exactly 70 unique AMG codes are discovered from the fixture;
- every Artist Record maps to at most one artist taxonomy term;
- no duplicate AMG identity is created;
- invalid/dangling related artists are reported;
- genre values are either resolved or explicitly reported as unresolved.

## 20. Release artifacts

V5.1.6 release should produce:

- installable WordPress plugin ZIP;
- source directory;
- `README.txt`;
- `CHANGELOG.md`;
- `docs/DATA-SCHEMA.md`;
- `docs/MIGRATION.md`;
- `docs/REST-API.md`;
- `docs/TESTING.md`;
- canonical data fixture/export JSON;
- genre seed JSON;
- integrity report example;
- SHA-256 source/release manifest.

## 21. Release acceptance criteria

V5.1.6 may be called complete only when:

1. stable AMG IDs are enforced as artist identity keys;
2. Artist Record and artist taxonomy are reconciled without duplicate identity;
3. genre relationships are canonical `amg_genre` relationships rather than text-only labels;
4. artist media roles resolve to structured media records/attachment IDs where possible;
5. artist/catalog relationships are explicit for tracks, albums and playlists;
6. featured releases resolve deterministically;
7. Artist Completeness reports missing/invalid data without invented metrics;
8. normalized REST read contracts exist for artists, genres, catalog and media;
9. legacy shortcodes/public catalog remain compatible;
10. migration is idempotent and produces a conflict/integrity report;
11. tests and static checks relevant to the plugin pass;
12. the release ZIP is generated from the verified source tree and has a checksum manifest.

## 22. Deferred from V5.1.6

The following are intentionally not part of this release:

- ALLATYME WORLD simulation/runtime ownership;
- artist autonomous behavior or memory;
- show production tools;
- major commerce-engine rewrite;
- replacing WooCommerce accounting;
- continuous external API synchronization;
- a new standalone database that duplicates WordPress records;
- destructive automated artist renames;
- automatic image cropping/re-encoding.

## 23. Implementation approach selected

Three approaches were considered:

1. **Compatibility-first WordPress canonicalization — selected.** Preserve existing CPTs/taxonomies and add canonical repository/normalization services plus migrations.
2. **New custom SQL tables as the primary store.** Cleaner relationally but creates an unnecessary migration and compatibility burden for V5.1.6.
3. **External API/database becomes the primary source of truth.** Appropriate for a later platform phase, but would make normal WordPress operation depend on external infrastructure.

Approach 1 is selected because V5.1.6 is specifically intended to finish canonical data without breaking the established Media Engine surface.

## 24. Authorship / project attribution

Project originator and product author attribution should remain consistent with the existing ALLATYME project records and plugin metadata. V5.1.6 documentation should credit One Gregory Onegodian™ as project originator/author where that attribution is already established by the project source, without converting that attribution into a claim about third-party legal registration or external certification.

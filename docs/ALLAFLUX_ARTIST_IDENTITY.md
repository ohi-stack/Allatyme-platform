# ALLAFLUX™ Artist Identity & Catalog Contract

ALLAFLUX™ treats the artist as an authoritative entity. A track, release, playlist, video, store, and discovery surface should resolve the artist from the canonical artist record rather than duplicating identity fields.

## Canonical Artist Record

Required/standard fields:

- Artist name
- Slug
- AMG registry code
- Profile image (3:4)
- Hero/banner image (16:9)
- Country
- Country code / flag
- Region
- AMG division
- Primary genre
- Secondary genres
- Languages
- Tagline
- Biography
- Backstory
- Signature introduction
- Featured release
- Canonical profile URL
- Store URL
- Social/profile references
- Verification/status metadata

## Sound Profile

The sound profile should capture the repeatable musical identity used by generation and creative workflows:

- Primary/secondary genres
- BPM range
- Key preferences where applicable
- Instrument palette
- Vocal character
- Production character
- Mood/emotional lane
- Language
- Recurring phrases/ad-libs
- Intro formula
- Reference constraints
- Negative constraints

## AMG Identity Standard

The established ALLATYME identity system uses recognizable introductions and artist-specific cultural/language cues. The standard begins with **OneGodian...** for the applicable AMG creative universe, followed by the artist's language/cultural cue and **ALLA-TIME...** where the artist specification calls for it.

Examples documented for the AMG system include English and multilingual variants such as Xhosa/South African and Zambian cues. These are identity/creative standards, not claims of linguistic authority.

## Catalog Relationships

```text
Artist
 ├── Tracks
 │    ├── Audio asset
 │    ├── Cover/featured image
 │    ├── Lyrics
 │    ├── Genre
 │    ├── Credits
 │    ├── Rights attestations
 │    └── Processing/provenance metadata
 ├── Releases
 ├── Albums
 ├── Playlists
 ├── Videos
 ├── Store products
 ├── Membership/community relationships
 └── Analytics
```

## Artist Page Resolution

A public artist page should be generated from the canonical record and dynamically resolve:

1. Hero identity
2. Biography/backstory
3. Featured music
4. Discography
5. Videos
6. Collaborations
7. Store/merchandise
8. News/stories
9. Follow/favorite actions
10. Audience/analytics elements permitted for public display

This eliminates static duplication and makes artist changes propagate consistently across ALLAFLUX and ALLATYME surfaces.

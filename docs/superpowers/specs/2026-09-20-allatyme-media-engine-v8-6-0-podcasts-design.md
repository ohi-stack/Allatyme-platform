# ALLATYME Media Engine V8.6.0 — Podcasts & Original Audio Design

## Purpose

Upgrade the current ALLATYME Media Engine V8.5.5 package into V8.6.0 by adding Podcasts as a native Media Engine subsystem while preserving the existing Artist Records, canonical same-artist queue behavior, Artist Record archive, WooCommerce membership bridge, and replace-in-place WordPress plugin identity.

The podcast subsystem must convert the existing static ALLATYME Podcasts presentation into database-driven shows and episodes without requiring a separate podcast plugin.

## Current Baseline

The V8.5.5 installable package currently contains:

- `allatyme-play-next-artist-records-hotfix.php` — plugin bootstrap, same-artist queue behavior, REST next-track endpoint, Artist Record archive helpers, and plugin integrations.
- `includes/woocommerce-membership-bridge.php` — Fan+ / VIP WooCommerce membership product mapping and entitlement lifecycle.
- `templates/archive-amg_artist_record.php` — Artist Record archive rendering.
- `README.txt` — package documentation.

The physical plugin folder currently retains the V8.5.4 folder name for replace-in-place continuity. V8.6.0 may preserve this folder name if required for WordPress replacement compatibility, but all runtime/header/version metadata must report `8.6.0` consistently.

## Release Identity

- Plugin name: `ALLATYME Media Engine — Artist Records + Canonical Queue + Membership + Podcasts`
- Version: `8.6.0`
- Release title: `ALLATYME Media Engine V8.6.0 — Podcasts & Original Audio`
- Minimum WordPress: 6.2
- Minimum PHP: 7.4
- Existing hooks, shortcodes, REST endpoints, WooCommerce behavior, and Artist Record rendering must remain backward compatible.

## Core Podcast Data Model

### Podcast Show

Register a public custom post type: `allatyme_podcast_show`.

Required fields/meta:

- show title and slug
- show description/content
- 1:1 show artwork via featured image
- host names
- show category/topics
- featured status
- explicit-content flag
- external links: Apple Podcasts, Spotify, YouTube, website
- optional sponsor name and sponsor URL
- show feed enabled/disabled

Public archive/permalink support must be enabled.

### Podcast Episode

Register a public custom post type: `allatyme_podcast_episode`.

Required fields/meta:

- episode title and slug
- show relationship (`_allatyme_podcast_show_id`)
- season number
- episode number
- publish date from WordPress post date
- runtime/duration
- 16:9 episode artwork via featured image
- audio URL and/or audio attachment ID
- video URL / YouTube URL
- host names
- guest names
- related Artist Record IDs
- related track IDs
- related album IDs
- transcript / show notes using post content and optional transcript meta
- sponsor name, sponsor URL, sponsor disclosure
- explicit-content flag
- access level: `public`, `fan_plus`, or `vip`

An episode may be audio-only, video-only, or both. A published episode must remain renderable even when one media type is absent.

## Relationships

The canonical relationship chain is:

`Podcast Show → Podcast Episode → Host / Guest → Related Artist → Related Songs / Albums → Video → Audio → Story → Sponsor`

Podcast relations must use WordPress post IDs and sanitized post meta rather than duplicating Artist Record, track, or album identity data.

## Membership Access

Podcasting must work without WooCommerce or paid memberships enabled.

- `public` episodes are available to everyone.
- `fan_plus` episodes require a logged-in user whose ALLATYME membership level is `fan_plus` or `vip`.
- `vip` episodes require `vip`.
- If the membership bridge is unavailable, restricted content must fail closed and render a branded access message instead of exposing protected media URLs.

The podcast module must read the existing membership user meta written by the V8.5.5 WooCommerce bridge and must not create a second membership database.

## Native Shortcodes

Implement the previously defined shortcode surface:

- `[allatyme_podcasts]` — combined podcast landing experience with featured shows and recent episodes.
- `[allatyme_podcast_shows]` — show discovery grid.
- `[allatyme_podcast_episodes]` — latest episodes grid/list.
- `[allatyme_podcast_featured]` — featured show/episode output.
- `[allatyme_podcast_player]` — player for a specified/current episode.
- `[allatyme_podcast show="the-allatyme-podcast"]` — single-show experience by show slug.

Shortcodes must render branded empty states rather than blank output when no podcast records exist.

## Podcast Player

Provide a native player that supports:

- HTML5 audio playback for audio episodes
- embedded YouTube/video output for video episodes
- episode artwork, show name, episode title, duration, and description
- previous/next episode links within the same show
- access enforcement before protected media URLs are emitted

Playback-speed controls and cross-page persistence are desirable but are not required to declare V8.6.0 operational. They may be added only if they can be implemented without destabilizing the existing Media Engine player.

## RSS / Distribution

Provide a standards-oriented RSS 2.0 podcast feed for each show.

Required behavior:

- feed URL based on the show slug
- channel title, description, site URL, artwork, language, and explicit flag
- episode GUID
- publication date
- title and description
- enclosure element for valid public audio URLs
- duration when available
- episode/season numbers when available

Restricted Fan+/VIP episode audio must not be exposed in public RSS feeds.

The feed implementation should be compatible with common podcast directories, while avoiding unsupported claims of directory certification.

## Admin Experience

Add an `ALLATYME → Podcasts` admin entry that exposes:

- Podcast Dashboard
- Shows
- Episodes
- Sponsors / sponsor metadata guidance
- RSS / distribution status
- Settings / documentation links where appropriate

The dashboard must report real WordPress counts for published/draft shows and episodes. It must not display invented analytics.

The native WordPress Show/Episode editors must expose structured meta boxes for required fields.

## Media Standards

- Show artwork: 1:1 recommended.
- Episode artwork: 16:9 recommended.
- Audio URLs must be sanitized and validated.
- Attachment IDs must resolve through WordPress media APIs.
- YouTube/video URLs must be escaped before output.

V8.6.0 may warn about non-recommended image ratios but must not destructively crop user media.

## Security

All podcast admin writes must use:

- capability checks
- WordPress nonces
- sanitization appropriate to each field
- escaped frontend/admin output
- safe URL validation
- no direct PHP file access

Restricted episode rendering must verify membership before media URLs are returned.

Public REST/feed functionality must not expose draft/private episodes or protected Fan+/VIP media.

## REST/API

Register read-only public REST endpoints only where they materially support the podcast frontend.

If included, public endpoints must return published public records only by default. Restricted episode data must require authenticated access and membership validation.

A large separate API layer is not required for V8.6.0.

## Frontend Design

Use the existing ALLATYME visual language already established on the podcast page:

- deep navy / near-black backgrounds
- ALLATYME yellow/gold accents
- red accent where appropriate
- high-contrast white typography
- responsive cards
- 16:9 episode media
- 1:1 show artwork

The plugin shortcodes should replace static page placeholders without requiring the entire WPBakery page to be rewritten.

## Backward Compatibility

V8.6.0 must preserve:

- `allatyme-next/v1/next/<track_id>` behavior
- Artist Record archive support
- canonical artist queue helpers
- WooCommerce membership bridge behavior
- existing membership user-meta keys
- existing Artist Record / track / album post types and taxonomies
- existing install/replace workflow

No existing artist, track, album, membership, or queue data may be migrated destructively.

## Documentation

Update `README.txt` with:

- V8.6.0 release identity
- podcast CPTs
- podcast shortcodes
- podcast feed behavior
- membership access behavior
- admin location
- installation/update instructions
- test/validation notes

Add a changelog section describing the V8.6.0 podcast subsystem and the fact that existing V8.5.5 behavior is preserved.

## Testing / Definition of Done

V8.6.0 is complete only when all of the following are verifiably true:

1. Plugin header/runtime version is 8.6.0.
2. Existing V8.5.5 PHP files still pass syntax validation after integration.
3. Show and Episode CPTs register successfully.
4. Structured podcast meta saves only with valid capability + nonce checks.
5. All six podcast shortcodes are registered.
6. Shortcodes render safe empty states with no podcast records.
7. A public audio episode renders a playable audio source.
8. A video episode renders its video/embed path without requiring audio.
9. Fan+ and VIP restrictions block unauthorized media URLs.
10. A VIP user can access Fan+ and VIP episodes; a Fan+ user cannot access VIP episodes.
11. Public RSS excludes draft/private/restricted episodes.
12. Public RSS emits enclosure metadata only for valid public audio episodes.
13. Podcast admin screens load and report real show/episode counts.
14. Existing same-artist next-track behavior is not removed.
15. Existing WooCommerce membership bridge hooks remain present.
16. PHP syntax validation passes for every PHP file in the package.
17. The final ZIP contains one installable WordPress plugin directory and no development-only artifacts.

## Non-Goals for V8.6.0

The following are explicitly outside the required V8.6.0 scope:

- proprietary podcast hosting/CDN infrastructure
- automatic submission to Apple Podcasts or Spotify accounts
- fabricated listener analytics
- dynamic ad insertion engine
- automatic transcription service
- remote recording studio
- replacing ALLAFLUX or the existing music-generation stack
- rebuilding the entire ALLATYME frontend

These can be future releases after the native podcast data model is operational, documented, and repeatable.

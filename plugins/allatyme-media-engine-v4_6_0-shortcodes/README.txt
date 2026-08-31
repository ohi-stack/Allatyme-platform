ALLATYME Media Engine V4.6.0 — Shortcode Expansion
==================================================

V4.6.0 keeps the V4.5.1 dashboard, player, analytics, upload manager,
royalty metadata, Gutenberg blocks, and legacy cleanup while expanding the
front-end catalog system to 20 shortcodes.

CORE SHORTCODES
---------------
[allatyme_player id="123"]
[allatyme_artist_dashboard]
[allatyme_upload_manager]
[allatyme_royalty_metadata id="123"]
[allatyme_analytics]
[allatyme_release_widget artist="artist-slug" genre="amapiano"]
[allatyme_stats_widget]

V4.6.0 DISCOVERY + CATALOG SHORTCODES
-------------------------------------
[allatyme_artist_grid limit="12" columns="4"]
[allatyme_artist_profile artist="artist-slug" tracks="6"]
[allatyme_track_grid limit="12" columns="3" artist="artist-slug" genre="amapiano"]
[allatyme_latest_releases limit="6" columns="3"]
[allatyme_album_grid limit="12" columns="3"]
[allatyme_playlist_grid limit="12" columns="3"]
[allatyme_genre_grid limit="24" columns="4"]
[allatyme_artist_releases artist="artist-slug" limit="8" columns="4"]
[allatyme_featured_artist artist="artist-slug" tracks="4"]
[allatyme_music_library limit="24" columns="4"]
[allatyme_trending_tracks limit="10"]
[allatyme_search placeholder="Search ALLATYME..."]
[allatyme_registry columns="4"]

WHAT CHANGED
------------
- Version updated to 4.6.0.
- 20 total shortcodes.
- Player supports explicit track IDs and slugs.
- Royalty metadata supports explicit track IDs.
- Featured release widget supports artist and genre filtering.
- New artist grid, artist profile, registry, genre, track, album, playlist,
  search, latest-release, featured-artist, artist-release, music-library,
  and trending components.
- New responsive front-end card/grid styles.
- Gutenberg block registry expanded to match the 20 front-end components.
- Upload Manager now uses Cover Image URL when it matches an existing WordPress
  Media Library attachment.
- Legacy cleanup now recognizes and can deactivate V4.5.1 when V4.6.0 is activated.

DATA MODEL NOTE
---------------
The catalog shortcodes use the plugin's existing WordPress data model:
- amg_track post type
- amg_album post type
- amg_playlist post type
- amg_artist taxonomy
- amg_genre taxonomy

Artist images fall back to the newest published track cover when no artist-specific
term image metadata exists.

UPGRADE RECOMMENDATION
----------------------
1. Back up WordPress before upgrading.
2. Install and activate V4.6.0.
3. Confirm Tracks, Albums, Playlists, Artists, and Genres appear only once.
4. Run ALLATYME > Legacy Cleanup if the older V4.5.1 plugin remains active.
5. Visit ALLATYME > Widgets to copy shortcode examples.

# v0.1 validation

Validated in cloud Chromium on 2026-10-28.

- **12 passing rules tests:** legal actions and chakra checks; distinct hero resources; guard restoration and mitigation; interrupt cancellation; poison/Thunderclaw synergy; skill prerequisites and costs; equipment stats; boss enrage and party-wide attack; idempotent rewards and level-up; a complete three-encounter tactical simulation; weakest-target archers and acolyte healing; venom guard and cleansing; defeat.
- **Browser campaign:** all three encounters won using visible target and ability buttons, in 8 / 16 / 17 hero actions. Tested build purchases, signature unlock, XP rewards, equipment, reload persistence, JSON download and import, invalid import rejection, cancellation of a new expedition, and unavailable-storage warnings. No browser JavaScript errors.
- **Portable build:** source assets embedded in `index.html`; browser requested no separate scripts, styles, images, fonts or external services. No runtime fetch or XHR. Procedural graphics and Web Audio need no downloaded assets.
- **Presentation:** inspected title, battlefield and build screenshots at 1440 × 900; checked 900 × 700 camp layout for horizontal overflow. Desktop landscape is the supported first-version target.
- **Repository:** `git diff --check` clean. Generated build rebuilt from formatted source.

The managed cloud Chromium policy blocks `file://` navigation. Browser tests therefore use an ephemeral loopback HTTP server strictly as a test harness. Direct file launching on Windows has not been executed in this environment. The delivered build contains no imports, fetches, remote fonts or other file-origin-dependent loading; opening `index.html` in a current Windows browser is the intended launch method. File-origin save persistence varies by browser, so JSON export/import is included.

This verifies a playable first chapter and permanent progression foundation. It does not establish long-campaign balance, touch-screen support, painted-art fidelity, or behavior in every browser. The current artwork is original vector illustration.

## Illustrated rendering update

- Combat / progression implementation (`src/engine.js`) is unchanged. All 12 rules tests still pass.
- Full campaign regression on PixiJS's Canvas backend won the three encounters in 8 / 16 / 17 visible hero actions. Skill unlock, equipment, levels, reload saves, backup export/import, invalid import rejection, new-game cancellation and unavailable-storage warning passed, with no JavaScript errors.
- Dedicated renderer regression passed on **Canvas and WebGL**. All five embedded images decoded; each hero has five atlas poses; transparent and opaque source pixels were verified. Every pose state was rendered, including a real Guard-button defense event, damage feedback and reduced motion.
- Inspected actual first-scene screenshots for idle, attack, damage, defense and special poses. Adjusted floor alignment, portrait layout and foreground placement after visual inspection. Tristan's generated special and particle palette is hazel / earthy olive / brown / bronze-gold. Artwork is detailed illustrated raster art rather than geometric character reconstruction.
- The first scene now has independent painted aqueduct and transparent foreground images, different parallax motion and particles. Niek's idle puppet is a separate animated layer. The manifest and containers support further layered parts and additional atlas frames.
- The self-contained build is approximately 13 MiB, including the pinned local PixiJS bundle. Browser tests observe no external asset requests. Build-time validation requires RGBA character PNGs, five required states and in-bounds atlas rectangles. All original source PNGs remain available for future art changes.
- Visual scope deliberately stops at the three protagonists, their portraits, title and first combat environment. Existing enemy illustrations and later backgrounds remain as before. The current atlases provide five painted key poses each, not dense frame-by-frame animation or complete separate-limb rigs.
- The existing Windows / direct-file-launch limitation above still applies: cloud browser policy prevents a direct `file://` test. The new bundle embeds image data URIs and vendor code, uses classic scripts, and does not fetch assets or require a server. Existing v0.1 save schema and key remain unchanged.

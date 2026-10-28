# v0.1 validation

Validated in cloud Chromium on 2026-10-28.

- **12 passing rules tests:** legal actions and chakra checks; distinct hero resources; guard restoration and mitigation; interrupt cancellation; poison/Thunderclaw synergy; skill prerequisites and costs; equipment stats; boss enrage and party-wide attack; idempotent rewards and level-up; a complete three-encounter tactical simulation; weakest-target archers and acolyte healing; venom guard and cleansing; defeat.
- **Browser campaign:** all three encounters won using visible target and ability buttons, in 8 / 16 / 17 hero actions. Tested build purchases, signature unlock, XP rewards, equipment, reload persistence, JSON download and import, invalid import rejection, cancellation of a new expedition, and unavailable-storage warnings. No browser JavaScript errors.
- **Portable build:** source assets embedded in `index.html`; browser requested no separate scripts, styles, images, fonts or external services. No runtime fetch or XHR. Procedural graphics and Web Audio need no downloaded assets.
- **Presentation:** inspected title, battlefield and build screenshots at 1440 × 900; checked 900 × 700 camp layout for horizontal overflow. Desktop landscape is the supported first-version target.
- **Repository:** `git diff --check` clean. Generated build rebuilt from formatted source.

The managed cloud Chromium policy blocks `file://` navigation. Browser tests therefore use an ephemeral loopback HTTP server strictly as a test harness. Direct file launching on Windows has not been executed in this environment. The delivered build contains no imports, fetches, remote fonts or other file-origin-dependent loading; opening `index.html` in a current Windows browser is the intended launch method. File-origin save persistence varies by browser, so JSON export/import is included.

This verifies a playable first chapter and permanent progression foundation. It does not establish long-campaign balance, touch-screen support, painted-art fidelity, or behavior in every browser. The current artwork is original vector illustration.

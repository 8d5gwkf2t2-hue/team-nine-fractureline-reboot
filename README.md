# TEAM NINE: FRACTURELINE — v0.1

An original, standalone side-view tactical RPG. Three shinobi follow a mysterious signal through the Ashen Aqueduct. A compact first chapter with replayable encounters and permanent builds.

## Play on Windows — no installation

1. Download and extract the project ZIP, or use the supplied portable ZIP.
2. Double-click **index.html** and open it in a current Edge, Chrome or Firefox browser.
3. Choose **New expedition**. Open **Field manual** for combat rules.

`index.html` is the complete playable build. It embeds every script, style, vector drawing and synthesized sound. You may copy this single file anywhere. No server, npm, account, CDN, font download or network connection is needed to play. Desktop / laptop landscape is recommended (900 × 700 minimum; 1440 × 900 ideal). Browser zoom out can help on smaller displays.

## Included

- Only Tristan, Roy and Niek are playable. Original animated procedural characters preserve their core features: dark spiky hair, glasses and black layers; close-cropped sandy hair and blue-gray clothing; eye-covering hair, tan clothing, burgundy sash and puppet.
- Tristan's kinetic effects use olive, bronze and warm gold. Roy has pale lightning, dash trails and a lightning-cat silhouette. Niek manipulates threads and venom.
- Five techniques per hero: four initially available, one unlocked through progression, plus Guard. Separate chakra and Momentum / Charge / Threads resources.
- Three encounters: patrol, armored foundry defenders, and the Hollow Warden. Boss-wide Rupture, interruptible wind-up and accelerated enrage below half HP.
- Poison / lightning-cat combinations, exposed damage windows, armor, team defense and recovery.
- Levels, XP, six skill nodes per hero across three branches, per-technique mastery, four equipment patterns, salvage, a forge and paid respecs.
- Autosave, JSON backup export / import, sound toggle and reduced-motion option.

### Combat tips

Every living hero acts once per round. Choose a target above the battlefield and a technique below. Wind-up decreases in the enemy phase; a hit resolves when it reaches zero. An interrupt that reduces wind-up to zero **before** the enemy phase cancels that attack instead. The Warden accelerates below half HP, so break its wind-up or guard before Rupture. Its acolyte heals it for 32 HP. Rift archers target the weakest living hero. The stalker applies venom to unguarded heroes; Niek’s Repair weave cleanses it.

Quick attacks restore 5 chakra and build one resource. Guard restores 12 chakra, builds one resource, and reduces the next incoming hit by 60%. Each round restores 3 chakra. Tristan's Propulsion consumes 2 Momentum for extra damage. Roy and Niek consume 3 Charge / Threads on a technique to refund 8 chakra. Poison bypasses armor and enables 50% stronger Thunderclaw. Exposed adds 25% incoming damage.

Use **Character builds** at camp to spend points and equip patterns. Equipment patterns may be used by multiple heroes. The forge offers Field charm for salvage; other patterns come from mission rewards. Level requirements rise by 60 XP each level. Every level grants two points; each hero starts with one. Mastery builds separately for each technique and adds up to 10% damage at 100 uses. Replays award full rewards. All heroes recover at camp. Defeat has no permanent penalty.

## Saves

Camp progress, equipment, skills, mastery, settings and rewards autosave in the browser. Battles are not resumed midway: reopening returns to the title and camp. Browser storage is tied to browser/profile and may depend on the HTML file's location. Moving the file, using private browsing, clearing browser data or browser restrictions may lose access to a save. Use **Save backup** at camp before moving or replacing the build, and **Import expedition** on the title to restore it. Storage failures produce a visible warning and the game remains playable with JSON backups.

New expedition asks before replacing an existing save. Save import validates v0.1 data and rejects invalid files. Older FRACTURELINE implementations are neither used nor supported.

## Development

No runtime dependencies. Source is organized as:

- `src/engine.js`: pure combat rules, character data, progression and rewards.
- `src/art.js`: procedural battlefield, character rendering and animation effects.
- `src/game.js`: screens, action sequencing, audio and persistence.
- `src/style.css`: interface and responsive layout.
- `src/shell.html`: HTML entry template.
- `tools/build.py`: embeds the sources into the deliverable `index.html`.

After source changes run `python tools/build.py`. Commit source and generated `index.html` together. Never edit only the generated build.

Validation:

```sh
node tests/combat.test.js
node tests/browser.test.js
```

The browser test requires Playwright and Chromium as **development-only** tools. It uses a temporary loopback server because the cloud image's browser policy blocks file URLs; the delivered game does not need that server. `CHROMIUM_PATH` can select a different Chromium executable. The rules tests use only Node's standard library. Windows itself is not available in the development environment, so a Windows double-click launch has not been exercised here.

## Scope and next steps

This is a small, complete chapter and extensible foundation. Art is original stylized vector illustration rather than high-resolution painted animation. Advanced technique evolution, more individual branch nodes, additional equipment slots, longer missions and further chapters are future work. No third-party game assets or prior FRACTURELINE code are included.

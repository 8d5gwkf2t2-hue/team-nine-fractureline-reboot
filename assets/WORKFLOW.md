# Illustrated asset pipeline

## Current art pass

This change replaces the three protagonists and the title / first-combat setting. Combat rules, save format, progression and rewards are unchanged. Enemy art and the later environments intentionally remain in `src/legacy-scene.js` until the first illustrated scene is evaluated.

The PNGs are real generated illustrations created with the image-generation tool using the supplied Team Nine design reference and Tristan's chakra reference. They are not rasterizations of the previous geometric figures. Each hero atlas contains five painted key poses: idle, attack, damage, defense, and special. The current animation system sequences those poses, interpolates movement, and composites particles. It does not claim dozens of independently painted in-between frames.

| Asset | Dimensions | Alpha | Design requirements |
| --- | --- | --- | --- |
| characters/tristan.png | 2202 × 714 | RGBA | Spiky dark hair, glasses, black tactical layers; olive / brown / bronze chakra with gold highlights |
| characters/roy.png | 2172 × 724 | RGBA | Short sandy-blond hair, blue eyes, blue-gray outfit; pale storm energy and spectral cat |
| characters/niek.png | 2172 × 724 | RGBA | Dirty-blond hair over eyes, tan tunic, burgundy sash; marionette and strings |
| environments/aqueduct.png | 1774 × 887 | RGB | Painted aqueduct, waterfalls, twilight haze and flat stone battle terrace |
| environments/foreground.png | 1774 × 887 | RGBA | Separate near-plane ruined pillars and ivy; transparent center |

## Generation / import contract

1. Start from the canonical Team Nine reference. Generate or commission large, detailed, three-quarter side-view illustrations facing right. Preserve the listed clothing, faces and hair; Tristan must never use blue/cyan chakra or conventional yellow lightning.
2. Request full-body poses with footwear, consistent proportions and foot baseline, transparent backgrounds, no text, and clear space between poses. A shared sheet helps consistency but does **not** guarantee uniform cells. Review actual output and author atlas rectangles and pivots rather than assuming equal columns.
3. Inspect every pose on both light and dark backdrops. Confirm actual alpha rather than a painted checkerboard. Reject cropped limbs, visible Niek eyes, missing glasses, wrong hair / clothing, and inconsistent chakra color. Keep source PNGs unchanged; the renderer samples atlas cells without destructive cutting or resizing.
4. Save approved illustrations under `assets/characters/` or `assets/environments/`. Imported PNGs may replace generated art using the same manifest contract. Never put a remote URL or CDN requirement into the runtime build.
5. Update `manifest.json`: image aliases, each frame's pixel `rect: [x,y,width,height]`, local foot `pivot: [x,y]`, and optional polygon `mask`. The source dimensions are intentionally larger than the on-screen characters. Match their foot pivot and scale, not each cell's width.
6. A frame can contain optional `layers` with its own source rectangle, offset, pivot, name, and `motion`. Niek's idle marionette is an actual separate composited layer from the atlas, excluded from the body by a mask, with an independent pendulum transform. This is the first layered asset, not a claim that all limbs have already been separated. The container structure accepts future torso / arms / head / cloth layers.
7. Add as many named frames as required, then reference them in `animations[state].frames`, with `fps` and `loop`. The current five states are idle, attack, damage, defense, special. Repeated frame names intentionally hold key poses; future hand-painted in-betweens can be inserted without touching combat rules. Current shared sequences require corresponding frame names for all heroes.
8. For environments, paint distant scenery and transparent foreground objects as separate illustrations. Register each image alias and add the layer in `makeScene`; each layer gets its own parallax motion. Particle graphics supplement the illustration; they do not replace character art.
9. Run `python tools/build.py`. The build checks PNG RGBA hero sources, required states, and atlas bounds, then embeds every asset and the pinned PixiJS bundle into `index.html`. No image fetches, modules, workers or servers are needed at runtime. The complete single-file build is around 13 MiB; retain the source atlases for future edits.
10. Run `node tests/combat.test.js`, `node tests/browser.test.js`, and `node tests/renderer.test.js`. Inspect `/tmp/illustrated-{canvas,webgl}-idle.png` and the attack / damage / defense / special screenshots. Play the first encounter with full motion as well as reduced motion before expanding the art pass.

## Rendering and game integration

`src/art.js` owns textures, layered `CharacterView` containers, pose playback, camera parallax, bounded particles, damage feedback and diagnostics. It reads a battle snapshot and never changes combat stats. `game.js` dispatches `choreograph` for actions (including Guard) and `reactToEnemy` for HP loss. Reduced motion honors both the game preference and the operating system preference. Portraits sample the illustrated atlas, so menus do not fall back to the old geometric faces.

PixiJS chooses WebGL when available; the bundled legacy build supplies Canvas fallback. `?renderer=canvas` forces that fallback for troubleshooting. Hardware-accelerated rendering should be preferred on supported machines; headless software WebGL is materially slower, so full campaign regression uses Canvas while a separate test exercises both backends. Asset-decode or renderer failures produce a visible message rather than silently restoring geometric heroes.

For a quick pose inspection, the browser console API `IllustratedRenderer.playState('tristan', 'special')` plays a state without changing combat. `IllustratedRenderer.ready` resolves after decoding all assets. `diagnostics` reports backend, frame names, states and errors. These are inspection tools; normal combat animation uses the existing UI.

## Provenance

Generation prompts asked for detailed hand-painted anime RPG illustrations, transparent full-body five-pose atlases, consistent canonical designs and no geometric / chibi / pixel-art treatment. The environment prompt described an original ruined aqueduct, distant waterfalls, an open horizontal stone terrace, teal-indigo twilight, and warm fireflies. A second generation used that environment as reference for a transparent ivy / pillar foreground overlay. No artwork was copied from Ruined King or Battle Chasers.

Generated originals were copied from tool outputs ending `7be5e2d6` (Tristan), `72486cad` (Roy), `637811cc` (Niek), `219eb237` (aqueduct), and `f2e1a7bc` (foreground); the checked-in PNGs are the source of truth for reproducible builds.

PixiJS legacy 7.4.3 was obtained from the npm registry package `pixi.js-legacy@7.4.3`, with normal TLS and package integrity checks, and vendored under its MIT license. The source-map URL was removed to avoid a missing external development file; the license banner and license text remain. There is no npm dependency required to play or rebuild.

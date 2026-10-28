// Development-only Playwright validation. The runtime build has no dependencies.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
const http = require("node:http");
const fs = require("node:fs");
let server;
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  server = http.createServer((req, res) => {
    const file = path.resolve(
      __dirname,
      "..",
      "." + (req.url === "/" ? "/index.html" : req.url),
    );
    try {
      res.setHeader(
        "Content-Type",
        file.endsWith(".js")
          ? "text/javascript"
          : file.endsWith(".css")
            ? "text/css"
            : "text/html",
      );
      res.end(fs.readFileSync(file));
    } catch {
      res.statusCode = 404;
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [],
    requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("http://127.0.0.1:" + server.address().port);
  await page.screenshot({ path: "/tmp/fracture-menu.png" });
  await page.getByRole("button", { name: "New expedition" }).click();
  await page.getByRole("button", { name: "Character builds" }).click();
  await page.locator('[data-action="unlock:0"]').click();
  assert.equal(await page.evaluate(() => save.heroes[0].points), 0);
  await page.getByRole("button", { name: "Back to camp" }).click();

  async function fight(mission) {
    await page.locator('[data-action="mission:' + mission + '"]').click();
    await page.evaluate(() => {
      save.settings.reduced = true;
    });
    if (!mission) await page.screenshot({ path: "/tmp/fracture-combat.png" });
    let actions = 0;
    while (
      (await page.evaluate(() => screen === "combat")) &&
      actions++ < 200
    ) {
      // State chooses a strategy; every combat action is performed through the UI.
      const pick = await page.evaluate(() => {
        const h = b.heroes[b.active],
          target = b.enemies.findIndex((e) => e.hp > 0),
          e = b.enemies[target];
        let a = 0;
        if (b.active === 2 && !e.poison && h.chakra >= 14) a = 1;
        else if (
          b.active === 1 &&
          b.heroes.some((h) => h.hp > 0 && h.hp < h.maxhp * 0.6) &&
          h.chakra >= 12
        )
          a = 3;
        else if (e.wind <= 2 && h.chakra >= 18) a = 2;
        else if (h.chakra >= 30 && save.heroes[b.active].nodes.includes(3))
          a = 4;
        else if (h.chakra >= 15) a = 1;
        return { a, target };
      });
      await page.locator('[data-action="target:' + pick.target + '"]').click();
      await page.locator('[data-action="ability:' + pick.a + '"]').click();
      await page.waitForTimeout(140);
    }
    assert.equal(
      await page.evaluate(() => b.result),
      "victory",
      "encounter " + mission,
    );
    await page.getByRole("button", { name: "Return to camp" }).click();
    console.log(
      "PASS browser encounter " +
        (mission + 1) +
        " victory with " +
        actions +
        " visible actions",
    );
  }
  await fight(0);
  assert.equal(await page.evaluate(() => save.heroes[0].level), 2);
  await page.reload();
  await page.getByRole("button", { name: "Continue expedition" }).click();
  assert.equal(await page.evaluate(() => save.cleared.includes(0)), true);
  assert.equal(
    await page.evaluate(() => save.heroes[0].nodes.includes(0)),
    true,
  );
  await page.getByRole("button", { name: "Character builds" }).click();
  await page.locator("#gear").selectOption("Bronze talisman");
  await page.locator('[data-action="unlock:3"]').click();
  assert.equal(
    await page.evaluate(() => save.heroes[0].nodes.includes(3)),
    true,
  );
  await page.screenshot({ path: "/tmp/fracture-build.png" });
  await page.getByRole("button", { name: "Back to camp" }).click();
  await fight(1);
  await fight(2);
  assert.equal(await page.evaluate(() => save.cleared.length), 3);
  assert.equal(
    await page.evaluate(() => save.inventory.includes("Warden plate")),
    true,
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save backup" }).click();
  const file = await download;
  await file.saveAs("/tmp/fracture-test-save.json");
  const backup = JSON.parse(fs.readFileSync("/tmp/fracture-test-save.json"));
  assert.equal(backup.cleared.length, 3);
  await page.getByRole("button", { name: "Title", exact: true }).click();
  await page.getByRole("button", { name: "New expedition" }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  assert.equal(await page.evaluate(() => save.cleared.length), 3);
  await page.locator("#import-file").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":0}'),
  });
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => save.cleared.length), 3);
  await page
    .locator("#import-file")
    .setInputFiles("/tmp/fracture-test-save.json");
  await page.waitForTimeout(100);
  assert.equal(await page.evaluate(() => screen), "camp");
  assert.equal(await page.evaluate(() => save.gold), backup.gold);
  await page.reload();
  assert.equal(
    await page.evaluate(() => save.heroes[0].gear),
    "Bronze talisman",
  );
  assert.equal(await page.evaluate(() => save.cleared.length), 3);
  assert.equal(errors.length, 0, errors.join("\n"));
  assert(requests.every((u) => u.startsWith("http://127.0.0.1:")));
  assert(!requests.some((u) => /\.(js|css|png|jpg|woff)/.test(u)));
  await page.setViewportSize({ width: 900, height: 700 });
  await page.getByRole("button", { name: "Continue expedition" }).click();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({ path: "/tmp/fracture-small.png" });
  console.log(
    "PASS skill unlock, equipment, rewards, level-up, reload saves, export/import, invalid import, new-game cancel, embedded assets and 900px layout; no browser errors",
  );
  // Storage failures must leave a playable game with an explicit backup warning.
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new Error("Storage unavailable");
    };
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue expedition" }).click();
  assert(
    await page
      .getByRole("status")
      .innerText()
      .then((t) => t.includes("Export a save")),
  );
  await page.getByRole("button", { name: "Begin encounter" }).count();
  console.log(
    "PASS unavailable browser storage gives a visible warning without crashing",
  );
  await browser.close();
  server.close();
})().catch((e) => {
  console.error(e);
  if (server) server.close();
  process.exit(1);
});

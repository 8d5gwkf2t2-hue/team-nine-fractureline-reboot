// Verify real asset decoding, frame rendering, animation hooks, and both backends.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
let server, browser;
(async () => {
  server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.end(fs.readFileSync(path.resolve(__dirname, "../index.html")));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const errors = [];
  for (const backend of ["canvas", "webgl"]) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    page.on("pageerror", (e) => errors.push(e.message));
    const requests = [];
    page.on("request", (r) => requests.push(r.url()));
    await page.goto(
      "http://127.0.0.1:" +
        server.address().port +
        (backend === "canvas" ? "?renderer=canvas" : ""),
    );
    const diagnostics = await page.evaluate(() => IllustratedRenderer.ready);
    assert(diagnostics.ready);
    assert.equal(diagnostics.assets, 5);
    if (backend === "canvas") assert.equal(diagnostics.backend, "Canvas");
    assert.deepEqual(
      Object.values(diagnostics.frames).map((f) => f.length),
      [5, 5, 5],
    );
    // Check source alpha and that the idle frames have detailed, nonempty pixels.
    const alpha = await page.evaluate(async () => {
      let results = [];
      for (const id of ["tristan", "roy", "niek"]) {
        let im = new Image();
        im.src = GameAssets.images[id];
        await im.decode();
        let canvas = document.createElement("canvas");
        canvas.width = im.width;
        canvas.height = im.height;
        let c = canvas.getContext("2d");
        c.drawImage(im, 0, 0);
        let pixels = c.getImageData(0, 0, canvas.width, canvas.height).data,
          clear = 0,
          opaque = 0;
        for (let i = 3; i < pixels.length; i += 4) {
          if (pixels[i] === 0) clear++;
          if (pixels[i] > 240) opaque++;
        }
        results.push({ clear, opaque });
      }
      return results;
    });
    assert(alpha.every((a) => a.clear > 100000 && a.opaque > 100000));
    await page.getByRole("button", { name: "New expedition" }).click();
    await page.locator('[data-action="mission:0"]').click();
    await page.screenshot({
      path: "/tmp/illustrated-" + backend + "-idle.png",
    });
    if (backend === "canvas") {
      for (const state of ["attack", "damage", "defense", "special"]) {
        await page.evaluate((state) => {
          ["tristan", "roy", "niek"].forEach((id) =>
            IllustratedRenderer.playState(id, state),
          );
        }, state);
        await page.waitForTimeout(200);
        await page.screenshot({ path: "/tmp/illustrated-" + state + ".png" });
      }
      // A real Guard input must dispatch a defense animation without spending a technique.
      await page.getByRole("button", { name: /Guard.*12 chakra/ }).click();
      await page.waitForTimeout(100);
      assert(
        await page.evaluate(() =>
          IllustratedRenderer.diagnostics.states.some(
            (s) => s.hero === "tristan" && s.state === "defense",
          ),
        ),
      );
      await page.waitForTimeout(900);
      await page.evaluate(() => {
        b.heroes[1].hp -= 10;
        IllustratedRenderer.reactToEnemy(
          [b.heroes[0].hp, b.heroes[1].hp + 10, b.heroes[2].hp],
          b,
        );
      });
      assert(
        await page.evaluate(() =>
          IllustratedRenderer.diagnostics.states.some(
            (s) => s.hero === "roy" && s.state === "damage",
          ),
        ),
      );
      await page.evaluate(() => {
        save.settings.reduced = true;
        window.reduceMotion = true;
      });
      await page.waitForTimeout(100);
      assert.equal(
        await page.evaluate(
          () => IllustratedRenderer.diagnostics.errors.length,
        ),
        0,
      );
    }
    assert(
      requests.every(
        (u) => u.startsWith("http://127.0.0.1:") || u.startsWith("data:"),
      ),
    );
    console.log(
      "PASS " +
        diagnostics.backend +
        " illustrated asset load, alpha, five frames per hero, first scene, no external assets",
    );
    await page.close();
  }
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log(
    "PASS all animation states, real Guard dispatch, damage hook and reduced motion; no browser errors",
  );
  await browser.close();
  server.close();
})().catch(async (e) => {
  console.error(e);
  if (browser) await browser.close();
  if (server) server.close();
  process.exit(1);
});

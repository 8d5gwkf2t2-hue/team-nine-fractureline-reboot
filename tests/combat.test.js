const assert = require("node:assert/strict");
const N = require("../src/engine.js");
let count = 0;
function test(name, f) {
  f();
  count++;
  console.log("PASS " + name);
}
test("fresh party has three distinct heroes", () => {
  let b = N.battle(N.fresh(), 0);
  assert.equal(b.heroes.length, 3);
  assert.equal(new Set(b.heroes.map((h) => h.resource)).size, 3);
});
test("invalid and locked actions preserve turn", () => {
  let s = N.fresh(),
    b = N.battle(s, 0);
  assert.equal(N.act(s, b, 4, 0), false);
  b.heroes[0].chakra = 0;
  assert.equal(N.act(s, b, 1, 0), false);
  assert.equal(b.active, 0);
  assert.equal(N.act(s, b, 0, 99), false);
});
test("guard restores chakra and mitigates a hit", () => {
  let s = N.fresh(),
    b = N.battle(s, 0);
  b.heroes[0].chakra = 0;
  N.defend(b);
  assert.equal(b.heroes[0].chakra, 12);
  assert.equal(b.heroes[0].guard, true);
  b.phase = "enemy";
  b.enemies = b.enemies.slice(0, 1);
  b.enemies[0].wind = 1;
  b.round = 3;
  N.enemyTurn(b);
  assert.equal(b.heroes[0].hp, b.heroes[0].maxhp - Math.round(14 * 0.4));
  assert.equal(b.heroes[0].guard, false);
});
test("interrupt cancels telegraphed attack", () => {
  let s = N.fresh(),
    b = N.battle(s, 0);
  N.act(s, b, 2, 0);
  assert.equal(b.enemies[0].wind, 0);
  b.phase = "enemy";
  b.enemies = b.enemies.slice(0, 1);
  N.enemyTurn(b);
  assert(b.log.some((x) => x.includes("cancelled")));
  assert(b.heroes.every((h) => h.hp === h.maxhp));
});
test("poison enables lightning-cat synergy", () => {
  let s = N.fresh(),
    b = N.battle(s, 2);
  b.active = 1;
  let before = b.enemies[0].hp;
  N.act(s, b, 1, 0);
  let normal = before - b.enemies[0].hp;
  b = N.battle(s, 2);
  b.active = 1;
  b.enemies[0].poison = 3;
  before = b.enemies[0].hp;
  N.act(s, b, 1, 0);
  assert(before - b.enemies[0].hp > normal * 1.4);
});
test("branch prerequisites, point costs and stats", () => {
  let s = N.fresh();
  assert.equal(N.unlock(s, 0, 3), false);
  assert(N.unlock(s, 0, 0));
  assert.equal(s.heroes[0].points, 0);
  s.heroes[0].points = 2;
  assert(N.unlock(s, 0, 3));
  assert.equal(N.unlock(s, 0, 3), false);
  s.heroes[0].gear = "Field charm";
  assert.equal(N.stats(s, 0).chakra, 60);
});
test("boss enrages and hits all living heroes", () => {
  let b = N.battle(N.fresh(), 2);
  b.enemies = b.enemies.slice(0, 1);
  b.enemies[0].hp = 200;
  b.enemies[0].wind = 2;
  b.phase = "enemy";
  N.enemyTurn(b);
  assert(b.heroes.every((h) => h.hp < h.maxhp));
  assert(b.log.some((x) => x.includes("RUPTURE")));
});
test("reward is idempotent and levels everyone", () => {
  let s = N.fresh(),
    b = N.battle(s, 0);
  b.result = "victory";
  N.reward(s, b);
  assert.equal(s.gold, 45);
  assert(s.heroes.every((h) => h.level === 2 && h.points === 3));
  N.reward(s, b);
  assert.equal(s.gold, 45);
  assert(s.inventory.includes("Bronze talisman"));
});
test("all three encounters winnable with progression and tactical auto-policy", () => {
  let s = N.fresh();
  for (let mission = 0; mission < 3; mission++) {
    for (let i = 0; i < 3; i++) {
      if (!s.heroes[i].nodes.includes(0)) N.unlock(s, i, 0);
      if (s.heroes[i].points >= 2 && !s.heroes[i].nodes.includes(3))
        N.unlock(s, i, 3);
      s.heroes[i].gear = s.inventory.includes("Bronze talisman")
        ? "Bronze talisman"
        : "Scout wraps";
    }
    let b = N.battle(s, mission),
      actions = 0;
    while (!b.result && actions++ < 300) {
      if (b.phase === "enemy") {
        N.enemyTurn(b);
        continue;
      }
      let h = b.heroes[b.active],
        target = b.enemies.findIndex((e) => e.hp > 0),
        e = b.enemies[target],
        a = 0;
      if (b.active === 2 && !e.poison && h.chakra >= 14) a = 1;
      else if (
        b.active === 1 &&
        b.heroes.some((h) => h.hp > 0 && h.hp < h.maxhp * 0.6) &&
        h.chakra >= 12
      )
        a = 3;
      else if (e.wind <= 2 && h.chakra >= 18) a = 2;
      else if (h.chakra >= 30 && s.heroes[b.active].nodes.includes(3)) a = 4;
      else if (h.chakra >= 15) a = 1;
      assert(N.act(s, b, a, target));
    }
    assert.equal(b.result, "victory", "mission " + mission);
    N.reward(s, b);
    console.log(
      "  encounter " +
        (mission + 1) +
        ": " +
        b.round +
        " rounds, " +
        actions +
        " actions",
    );
  }
  assert.equal(s.cleared.length, 3);
});
test("archer targets weakest hero and acolyte heals the boss", () => {
  let b = N.battle(N.fresh(), 2);
  b.heroes[2].hp = 10;
  assert.equal(N.enemyTarget(b, { name: "Rift archer" }).id, "niek");
  b.enemies[0].hp = 300;
  b.enemies[0].wind = 0;
  b.enemies[1].wind = 1;
  b.phase = "enemy";
  N.enemyTurn(b);
  assert.equal(b.enemies[0].hp, 332);
});
test("venom is blocked by guard and cleansed by Repair weave", () => {
  let s = N.fresh(),
    b = N.battle(s, 1);
  b.enemies = b.enemies.slice(1, 2);
  b.enemies[0].wind = 1;
  b.heroes[2].guard = true;
  b.phase = "enemy";
  N.enemyTurn(b);
  assert(!b.heroes[2].poison);
  b.phase = "enemy";
  b.enemies[0].wind = 1;
  N.enemyTurn(b);
  assert(b.heroes.some((h) => h.poison));
  b.phase = "player";
  b.active = 2;
  N.act(s, b, 3, 0);
  assert(b.heroes.every((h) => !h.poison));
});
test("defeat is reported when the last hero falls", () => {
  let b = N.battle(N.fresh(), 2);
  b.heroes.forEach((h) => (h.hp = 1));
  b.enemies[0].wind = 1;
  b.phase = "enemy";
  N.enemyTurn(b);
  assert.equal(b.result, "defeat");
});
console.log(count + " tests passed");

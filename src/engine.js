/* Pure combat and progression rules. Shared by the browser and Node tests. */
(function (root) {
  const HEROES = [
    {
      id: "tristan",
      name: "Tristan",
      role: "KINETIC VANGUARD",
      color: "#b9b36c",
      resource: "Momentum",
      hp: 150,
      atk: 22,
    },
    {
      id: "roy",
      name: "Roy",
      role: "STORM RUNNER",
      color: "#8db9d0",
      resource: "Charge",
      hp: 115,
      atk: 20,
    },
    {
      id: "niek",
      name: "Niek",
      role: "THREAD ARCHITECT",
      color: "#c5a08c",
      resource: "Threads",
      hp: 125,
      atk: 18,
    },
  ];
  const ABILITIES = {
    tristan: [
      ["Drive strike", 0, 1, "Build 1 Momentum. Recover 5 chakra.", "basic"],
      ["Propulsion", 15, 1.7, "Spend 2 Momentum for +60% damage.", "burst"],
      [
        "Retraction",
        18,
        1.05,
        "Interrupt: remove 2 enemy wind-up.",
        "interrupt",
      ],
      [
        "Iron resolve",
        12,
        0,
        "Guard the whole team for the next hit.",
        "teamguard",
      ],
      [
        "Faultbreaker",
        30,
        2.6,
        "Unlocked: 2 wind-up break + exposed.",
        "ultimate",
      ],
    ],
    roy: [
      ["Flash cut", 0, 1, "Build 1 Charge. Recover 5 chakra.", "basic"],
      [
        "Thunderclaw",
        15,
        1.5,
        "Lightning-cat strike. +50% vs poisoned targets.",
        "cat",
      ],
      [
        "Static snare",
        18,
        0.8,
        "Interrupt: remove 2 wind-up. Apply exposed.",
        "interrupt",
      ],
      ["Storm shelter", 12, 0, "Restore 28 HP to each ally.", "heal"],
      [
        "Steel tempest",
        30,
        2.5,
        "Unlocked: ignore armor; gain guard.",
        "ultimate",
      ],
    ],
    niek: [
      ["Needle volley", 0, 1, "Build 1 Thread. Recover 5 chakra.", "basic"],
      [
        "Venom marionette",
        14,
        0.85,
        "Poison: 10 damage for 3 enemy turns.",
        "poison",
      ],
      ["Tripwire", 16, 0.8, "Interrupt: remove 2 wind-up.", "interrupt"],
      ["Repair weave", 12, 0, "Restore 28 HP to each ally.", "heal"],
      [
        "Thousand threads",
        30,
        2.3,
        "Unlocked: poison, exposed, and 2 wind-up break.",
        "ultimate",
      ],
    ],
  };
  const MISSIONS = [
    {
      name: "The Broken Approach",
      subtitle: "A patrol gone silent",
      desc: "Find the missing scouts beneath the shattered aqueduct.",
      enemies: [
        ["Ash prowler", 95, 14, 1],
        ["Rift archer", 80, 17, 2],
      ],
      xp: 70,
      gold: 45,
    },
    {
      name: "Threads in the Fog",
      subtitle: "Something pulls the strings",
      desc: "Armored sentries guard the foundry. Poison ignores their plating.",
      enemies: [
        ["Iron sentinel", 150, 22, 2, 6],
        ["Venom stalker", 115, 19, 1],
        ["Rift archer", 100, 18, 2],
      ],
      xp: 100,
      gold: 70,
    },
    {
      name: "The Hollow Warden",
      subtitle: "Break the heart of the fracture",
      desc: "Break its wind-up to stop Rupture. Below half health, its fury accelerates.",
      enemies: [
        ["Hollow Warden", 460, 30, 3, 7],
        ["Ash acolyte", 120, 18, 2],
      ],
      xp: 150,
      gold: 110,
    },
  ];
  const NODES = [
    {
      name: "Sharpened intent",
      desc: "+15% technique damage",
      cost: 1,
      branch: "Power",
    },
    {
      name: "Deep reservoir",
      desc: "+15 maximum chakra",
      cost: 1,
      branch: "Control",
    },
    {
      name: "Unbroken form",
      desc: "+30 maximum HP",
      cost: 1,
      branch: "Resolve",
    },
    {
      name: "Signature evolution",
      desc: "Unlock the fifth technique",
      cost: 2,
      requires: 0,
      branch: "Power",
    },
    {
      name: "Efficient flow",
      desc: "Techniques cost 4 less chakra",
      cost: 2,
      requires: 1,
      branch: "Control",
    },
    {
      name: "Second breath",
      desc: "Recover 8 HP after every action",
      cost: 2,
      requires: 2,
      branch: "Resolve",
    },
  ];
  function fresh() {
    return {
      version: 1,
      gold: 0,
      cleared: [],
      heroes: HEROES.map((h) => ({
        id: h.id,
        xp: 0,
        level: 1,
        points: 1,
        nodes: [],
        gear: "Scout wraps",
        mastery: 0,
        masteries: [0, 0, 0, 0, 0],
      })),
      inventory: ["Scout wraps"],
      settings: { sound: true, reduced: false },
    };
  }
  function stats(save, i) {
    let p = save.heroes[i],
      h = HEROES[i];
    return {
      hp:
        h.hp +
        (p.level - 1) * 14 +
        (p.nodes.includes(2) ? 30 : 0) +
        (p.gear === "Warden plate" ? 35 : p.gear === "Field charm" ? 15 : 0),
      atk: h.atk + (p.level - 1) * 3 + (p.gear === "Bronze talisman" ? 5 : 0),
      chakra:
        50 +
        (p.nodes.includes(1) ? 15 : 0) +
        (p.gear === "Field charm" ? 10 : 0),
      armor: p.gear === "Warden plate" ? 4 : 0,
    };
  }
  function battle(save, mission) {
    return {
      mission,
      round: 1,
      active: 0,
      phase: "player",
      selected: 0,
      log: ["Team Nine enters the fracture."],
      heroes: HEROES.map((h, i) => ({
        ...h,
        ...stats(save, i),
        maxhp: stats(save, i).hp,
        maxchakra: stats(save, i).chakra,
        resourceValue: 0,
        guard: false,
        down: false,
      })),
      enemies: MISSIONS[mission].enemies.map((e, i) => ({
        id: i,
        name: e[0],
        hp: e[1],
        maxhp: e[1],
        atk: e[2],
        wind: e[3],
        maxwind: e[3],
        armor: e[4] || 0,
        poison: 0,
        exposed: 0,
        guard: false,
      })),
      acted: [],
      result: null,
    };
  }
  function log(b, s) {
    b.log.unshift(s);
    b.log = b.log.slice(0, 25);
  }
  function act(save, b, index, target) {
    if (b.phase !== "player" || b.result) return false;
    let h = b.heroes[b.active],
      p = save.heroes[b.active],
      a = ABILITIES[h.id][index];
    if (!a || h.hp <= 0 || (index === 4 && !p.nodes.includes(3))) return false;
    let cost = Math.max(0, a[1] - (p.nodes.includes(4) && a[1] ? 4 : 0));
    if (h.chakra < cost) return false;
    let e = b.enemies[target];
    if (a[2] && (!e || e.hp <= 0)) return false;
    h.chakra -= cost;
    let kind = a[4];
    if (kind === "heal") {
      b.heroes.forEach((x) => {
        if (x.hp > 0) x.hp = Math.min(x.maxhp, x.hp + 28);
        if (h.id === "niek") x.poison = 0;
      });
      log(b, h.name + " restores the team.");
    } else if (kind === "teamguard") {
      b.heroes.forEach((x) => {
        if (x.hp > 0) x.guard = true;
      });
      log(b, "Team Nine braces behind Tristan.");
    } else {
      let mult = a[2];
      if (kind === "burst" && h.resourceValue >= 2) {
        mult += 0.6;
        h.resourceValue -= 2;
      }
      if (kind === "cat" && e.poison) mult *= 1.5;
      let dmg = Math.max(
        1,
        Math.round(
          h.atk *
            mult *
            (p.nodes.includes(0) ? 1.15 : 1) *
            (1 + Math.min((p.masteries || [])[index] || 0, 100) * 0.001) *
            (e.exposed ? 1.25 : 1),
        ) - (kind === "ultimate" ? 0 : e.armor),
      );
      e.hp = Math.max(0, e.hp - dmg);
      log(b, h.name + " · " + a[0] + " → " + e.name + " −" + dmg);
      if (kind === "poison" || (kind === "ultimate" && h.id === "niek"))
        e.poison = 3;
      if (kind === "interrupt" || kind === "ultimate") {
        e.wind = Math.max(0, e.wind - 2);
        log(b, e.name + " wind-up broken!");
      }
      if ((kind === "interrupt" && h.id === "roy") || kind === "ultimate")
        e.exposed = 2;
      if (kind === "ultimate" && h.id === "roy") h.guard = true;
      if (kind === "basic") {
        h.resourceValue = Math.min(5, h.resourceValue + 1);
        h.chakra = Math.min(h.maxchakra, h.chakra + 5);
      } else if (h.resourceValue >= 3 && h.id !== "tristan") {
        h.resourceValue -= 3;
        h.chakra = Math.min(h.maxchakra, h.chakra + 8);
        log(b, "Flow resonance: +8 chakra.");
      }
    }
    if (p.nodes.includes(5)) h.hp = Math.min(h.maxhp, h.hp + 8);
    p.mastery++;
    p.masteries = p.masteries || [0, 0, 0, 0, 0];
    p.masteries[index]++;
    advance(b);
    return true;
  }
  function defend(b) {
    if (b.phase !== "player" || b.result) return false;
    let h = b.heroes[b.active];
    h.guard = true;
    h.chakra = Math.min(h.maxchakra, h.chakra + 12);
    h.resourceValue = Math.min(5, h.resourceValue + 1);
    log(b, h.name + " guards · +12 chakra.");
    advance(b);
    return true;
  }
  function advance(b) {
    if (b.enemies.every((e) => e.hp <= 0)) {
      b.result = "victory";
      return;
    }
    b.acted.push(b.active);
    let next = b.heroes.findIndex((h, i) => h.hp > 0 && !b.acted.includes(i));
    if (next < 0) b.phase = "enemy";
    else b.active = next;
  }
  function enemyTarget(b, e) {
    const alive = b.heroes.filter((h) => h.hp > 0);
    if (e.name === "Rift archer")
      return alive.reduce(
        (weak, h) => (!weak || h.hp < weak.hp ? h : weak),
        null,
      );
    return alive[(b.round + e.id) % alive.length];
  }
  function enemyTurn(b) {
    if (b.phase !== "enemy" || b.result) return;
    for (let e of b.enemies) {
      if (e.hp <= 0) continue;
      if (e.poison) {
        e.hp = Math.max(0, e.hp - 10);
        e.poison--;
        log(b, e.name + " suffers 10 poison.");
        if (!e.hp) continue;
      }
      if (e.exposed) e.exposed--;
      if (e.wind === 0) {
        e.wind = e.maxwind;
        log(b, e.name + " staggers; attack cancelled.");
        continue;
      }
      let furious = e.name === "Hollow Warden" && e.hp < e.maxhp / 2;
      e.wind -= furious ? 2 : 1;
      if (e.wind <= 0) {
        if (e.name === "Ash acolyte") {
          const boss = b.enemies.find(
            (x) => x.name === "Hollow Warden" && x.hp > 0,
          );
          if (boss) {
            boss.hp = Math.min(boss.maxhp, boss.hp + 32);
            e.wind = e.maxwind;
            log(b, "Ash acolyte mends the Warden for 32 HP.");
            continue;
          }
        }
        let rupture = e.name === "Hollow Warden";
        let alive = b.heroes.filter((h) => h.hp > 0);
        let targets = rupture ? alive : [enemyTarget(b, e)];
        for (let h of targets) {
          if (!h) continue;
          let dmg = Math.max(
            1,
            Math.round(e.atk * (rupture ? 1.2 : 1) * (h.guard ? 0.4 : 1)) -
              h.armor,
          );
          h.hp = Math.max(0, h.hp - dmg);
          if (e.name === "Venom stalker" && !h.guard) h.poison = 2;
          h.guard = false;
          log(
            b,
            e.name +
              " " +
              (rupture ? "RUPTURE" : "strikes") +
              " → " +
              h.name +
              " −" +
              dmg,
          );
        }
        e.wind = e.maxwind;
      } else log(b, e.name + " gathers force.");
    }
    for (const h of b.heroes) {
      if (h.hp > 0 && h.poison) {
        h.hp = Math.max(0, h.hp - 6);
        h.poison--;
        log(b, h.name + " suffers 6 venom damage.");
      }
    }
    if (b.heroes.every((h) => h.hp <= 0)) b.result = "defeat";
    else if (b.enemies.every((e) => e.hp <= 0)) b.result = "victory";
    else {
      b.round++;
      b.acted = [];
      b.active = b.heroes.findIndex((h) => h.hp > 0);
      b.phase = "player";
      b.heroes.forEach((h) => (h.chakra = Math.min(h.maxchakra, h.chakra + 3)));
    }
  }
  function reward(save, b) {
    if (b.result !== "victory" || b.rewarded) return;
    b.rewarded = true;
    let m = MISSIONS[b.mission];
    save.gold += m.gold;
    for (let p of save.heroes) {
      p.xp += m.xp;
      while (p.xp >= p.level * 60) {
        p.xp -= p.level * 60;
        p.level++;
        p.points += 2;
      }
    }
    if (!save.cleared.includes(b.mission)) save.cleared.push(b.mission);
    let item = ["Bronze talisman", "Field charm", "Warden plate"][b.mission];
    if (!save.inventory.includes(item)) save.inventory.push(item);
  }
  function unlock(s, i, n) {
    let p = s.heroes[i],
      node = NODES[n];
    if (
      !node ||
      p.nodes.includes(n) ||
      p.points < node.cost ||
      (node.requires !== undefined && !p.nodes.includes(node.requires))
    )
      return false;
    p.points -= node.cost;
    p.nodes.push(n);
    return true;
  }
  const api = {
    HEROES,
    ABILITIES,
    MISSIONS,
    NODES,
    fresh,
    stats,
    battle,
    act,
    defend,
    enemyTurn,
    enemyTarget,
    reward,
    unlock,
  };
  root.Nine = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

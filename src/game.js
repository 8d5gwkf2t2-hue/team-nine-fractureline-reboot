/* UI and persistence. Classic scripts intentionally support file:// without a server. */
const N = Nine,
  app = document.querySelector("#app"),
  KEY = "team-nine-fractureline-v01";
let save = N.fresh(),
  screen = "menu",
  tab = 0,
  b = null,
  busy = false,
  modal = "",
  notice = "",
  saveError = false,
  hasSave = false;
function valid(s) {
  return (
    s &&
    s.version === 1 &&
    Array.isArray(s.heroes) &&
    s.heroes.length === 3 &&
    s.heroes.every(
      (p, i) =>
        p.id === N.HEROES[i].id &&
        Number.isInteger(p.level) &&
        p.level > 0 &&
        Number.isFinite(p.xp) &&
        Number.isInteger(p.points) &&
        p.points >= 0 &&
        Array.isArray(p.nodes) &&
        p.nodes.every((n) => Number.isInteger(n) && n >= 0 && n < 6) &&
        typeof p.gear === "string" &&
        Number.isFinite(p.mastery) &&
        p.mastery >= 0 &&
        (p.masteries === undefined ||
          (Array.isArray(p.masteries) &&
            p.masteries.length === 5 &&
            p.masteries.every((v) => Number.isFinite(v) && v >= 0))),
    ) &&
    Array.isArray(s.cleared) &&
    s.cleared.every((n) => [0, 1, 2].includes(n)) &&
    Array.isArray(s.inventory) &&
    s.inventory.every((x) =>
      [
        "Scout wraps",
        "Bronze talisman",
        "Field charm",
        "Warden plate",
      ].includes(x),
    ) &&
    Number.isFinite(s.gold) &&
    s.settings &&
    typeof s.settings.sound === "boolean" &&
    typeof s.settings.reduced === "boolean"
  );
}
try {
  let raw = localStorage.getItem(KEY);
  if (raw) {
    let parsed = JSON.parse(raw);
    if (!valid(parsed)) throw Error("Invalid save");
    save = parsed;
    hasSave = true;
  }
} catch (e) {
  notice =
    "Save unavailable or damaged. You can still play and export a backup.";
  saveError = true;
}
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
    hasSave = true;
    saveError = false;
  } catch (e) {
    saveError = true;
    toast(
      "Browser storage is unavailable. Export a save from camp to keep progress.",
    );
  }
}
function toast(s) {
  notice = s;
  render();
  setTimeout(() => {
    if (notice === s) {
      notice = "";
      render();
    }
  }, 4000);
}
function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
let audio;
function sound(kind) {
  if (!save.settings.sound) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    let o = audio.createOscillator(),
      g = audio.createGain();
    o.type = kind === "tristan" ? "triangle" : "sine";
    o.frequency.setValueAtTime(
      kind === "roy" ? 680 : kind === "niek" ? 320 : 150,
      audio.currentTime,
    );
    o.frequency.exponentialRampToValueAtTime(65, audio.currentTime + 0.2);
    g.gain.setValueAtTime(0.07, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.3);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.3);
  } catch (e) {}
}
const button = (label, action, cls = "", disabled = false) =>
  `<button class="${cls}" data-action="${action}" ${disabled ? "disabled" : ""}>${label}</button>`;
function portrait(i) {
  let hair = ["#18201f", "#b8a179", "#b09a70"][i],
    coat = ["#242c2d", "#566d80", "#a68d65"][i];
  return `<svg class="portrait" viewBox="0 0 64 64" aria-label="${N.HEROES[i].name} portrait" role="img"><rect width="64" height="64" fill="#263a40"/><path d="M6 64L13 45 26 40 39 40 52 47 60 64" fill="${coat}"/><path d="M22 27Q17 48 32 49Q48 47 44 27" fill="#c5a487"/><path d="${i === 0 ? "M17 29L13 15 21 19 20 6 29 14 36 3 39 16 51 11 45 27 36 21 27 26Z" : i === 1 ? "M18 29L17 20 23 12 39 12 47 20 46 29 40 23 24 23Z" : "M15 37L16 18 25 9 42 14 49 24 47 41 39 31 34 42 28 32 22 42Z"}" fill="${hair}"/>${i === 0 ? '<g stroke="#111c20" fill="none" stroke-width="2.5"><rect x="20" y="29" width="10" height="7"/><rect x="34" y="29" width="10" height="7"/><path d="M30 31H34"/></g>' : i === 1 ? '<path d="M23 32H28M35 32H40" stroke="#83bddd" stroke-width="2"/>' : ""}<path d="M28 41H35" stroke="#805f50"/><path d="M22 48L32 54 43 47 42 59 22 59" fill="${i === 2 ? "#663c43" : "#29383f"}"/></svg>`;
}
function head() {
  return `<div class="top"><div class="brand">TEAM NINE <span style="color:#788b90">/</span> FRACTURELINE</div><div class="row"><span class="tag">TACTICAL RPG · V0.1</span>${screen !== "menu" ? button("Guide", "guide") : ""}${button(save.settings.sound ? "♫ Sound on" : "♫ Sound off", "sound", "", false)}</div></div>`;
}
function menu() {
  return `<div class="hero-copy"><div class="eyebrow">THREE SHINOBI. ONE FRACTURED WORLD.</div><h1>Every fracture<br>has a <em style="color:var(--gold)">breaking point.</em></h1><p class="muted">Chase the signal beneath the ruins. Master your techniques. Bring everyone home.</p><div class="menu-actions">${button("Continue expedition <span>↗</span>", "camp", "primary", !hasSave)}${button("New expedition <span>→</span>", "new")}${button("Field manual <span>＋</span>", "guide")}${button("Import expedition <span>↑</span>", "import")}</div></div><div class="foot"><span>THE ASHEN AQUEDUCT · CHAPTER 01</span><span>OFFLINE · SINGLE PLAYER · NO INSTALLATION</span></div>`;
}
function camp() {
  return `<section class="screen"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">EXPEDITION / THE ASHEN AQUEDUCT</div><h2>Beyond the fracture</h2><p class="muted">The team rests between missions. HP and chakra are fully restored.</p></div><div class="row"><span class="badge">◈ ${save.gold} salvage</span>${button("Character builds", "build")}${button("Save backup ↓", "export")}${button("Title", "menu")}</div></div><div class="cards">${N.MISSIONS.map(
    (m, i) => {
      let locked = i > 0 && !save.cleared.includes(i - 1);
      return `<article class="panel mission"><span class="eyebrow">${save.cleared.includes(i) ? "✓ COMPLETED" : locked ? "LOCKED" : "MISSION AVAILABLE"}</span><div class="number">0${i + 1}</div><h3>${m.name}</h3><span class="badge">${m.subtitle}</span><p class="muted">${m.desc}</p><span class="hint">${m.xp} XP / hero · ${m.gold} salvage · equipment</span>${button(locked ? "Complete previous mission" : save.cleared.includes(i) ? "Replay encounter ↗" : "Begin encounter ↗", "mission:" + i, "primary", locked)}</article>`;
    },
  ).join(
    "",
  )}</div><p class="hint">Replay missions for experience. No permanent loss on defeat. Progress saves after rewards and build changes.</p><div class="row">${save.heroes.map((h, i) => `<span class="turn">${N.HEROES[i].name} · Lv ${h.level} · ${h.points} skill points</span>`).join("")}</div></section>`;
}
function builds() {
  let p = save.heroes[tab],
    s = N.stats(save, tab);
  return `<section class="screen"><div class="row" style="justify-content:space-between"><div><div class="eyebrow">PERMANENT PROGRESSION</div><h2>Power takes a shape.</h2></div>${button("Back to camp", "camp")}</div><div class="tabs">${N.HEROES.map((h, i) => button(h.name + " · Lv " + save.heroes[i].level, "tab:" + i, i === tab ? "chosen" : "")).join("")}</div><div class="panel"><div class="row" style="justify-content:space-between"><div><span class="eyebrow">${N.HEROES[tab].role}</span><h3>${N.HEROES[tab].name} · ${p.points} skill points</h3></div><div class="badge">${s.hp} HP · ${s.chakra} chakra · ${s.atk} attack · ${p.mastery} mastery</div></div><p class="muted">${["Propulsion turns stored Momentum into crushing force. Retraction tears an enemy’s attack apart.", "Charge accelerates chakra recovery. Lightning-cat attacks exploit Niek’s poison.", "Threads become traps, venom and precision. Poison bypasses armor."][tab]}<br>${p.xp} / ${p.level * 60} XP to next level · each technique earns mastery for up to +10% damage.</p><div class="nodes">${N.NODES.map(
    (n, i) => {
      let owned = p.nodes.includes(i),
        locked = n.requires !== undefined && !p.nodes.includes(n.requires);
      return `<button class="node ${owned ? "owned" : ""}" data-action="unlock:${i}" ${owned || locked || p.points < n.cost ? "disabled" : ""}><span class="eyebrow">${n.branch} ${n.requires !== undefined ? "II" : "I"}</span><b>${i === 3 ? N.ABILITIES[p.id][4][0] : n.name}</b><span class="muted">${n.desc}</span><small>${owned ? "✓ LEARNED" : locked ? "Requires " + N.NODES[n.requires].name : n.cost + " skill points"}</small></button>`;
    },
  ).join(
    "",
  )}</div><div class="equipment row"><span class="eyebrow">EQUIPMENT</span><select id="gear" aria-label="Equip item">${save.inventory.map((g) => `<option ${p.gear === g ? "selected" : ""}>${g}</option>`).join("")}</select><span class="muted">${gearText(p.gear)}</span></div><p class="hint">Loadouts are permanent until changed. Respec costs 25 salvage. Gear is shared; each hero may use any unlocked pattern.</p>${button("Reset skill tree · 25 salvage", "respec", "", save.gold < 25 || !p.nodes.length)}${button("Forge Field charm · 60 salvage", "forge", "", save.gold < 60 || save.inventory.includes("Field charm"))}</div></section>`;
}
function gearText(g) {
  return (
    {
      "Scout wraps": "Balanced starting equipment.",
      "Bronze talisman": "+5 attack.",
      "Field charm": "+10 chakra and +15 HP.",
      "Warden plate": "+35 HP and reduce incoming damage by 4.",
    }[g] || ""
  );
}
function bar(value, max, cls = "") {
  return `<div class="bar ${cls}"><i style="width:${Math.max(0, (value / max) * 100)}%"></i></div>`;
}
function combat() {
  let h = b.heroes[b.active],
    p = save.heroes[b.active];
  return `<div class="combat-title"><div><span class="eyebrow">ENCOUNTER 0${b.mission + 1} / ROUND ${b.round}</span><h2>${N.MISSIONS[b.mission].name}</h2></div>${button("Retreat", "retreat")}</div><div class="timeline"><span class="eyebrow">INITIATIVE →</span>${b.heroes.map((h, i) => `<span class="turn ${i === b.active && b.phase === "player" ? "active" : ""}">${h.hp <= 0 ? "× " : b.acted.includes(i) ? "✓ " : ""}${h.name}</span>`).join("")}<span class="turn ${b.phase === "enemy" ? "active" : ""}">Enemy phase</span></div><div class="telegraphs">${b.enemies.map((e, i) => `<button class="enemy ${b.selected === i ? "selected" : ""}" data-action="target:${i}" ${e.hp <= 0 ? "disabled" : ""}><strong>${e.name}</strong>${bar(e.hp, e.maxhp)}<span class="tag">${e.hp} / ${e.maxhp} HP</span><small>${e.hp <= 0 ? "DEFEATED" : e.wind === 0 ? "STAGGERED · attack cancelled" : (e.name === "Hollow Warden" ? "RUPTURE · ALL ALLIES" : e.name === "Ash acolyte" && b.enemies.some((x) => x.name === "Hollow Warden" && x.hp > 0) ? "MEND WARDEN +32" : (e.name === "Venom stalker" ? "VENOM → " : "STRIKE → ") + (N.enemyTarget(b, e)?.name || "")) + " · " + e.wind + " wind-up"}</small><small>${e.poison ? "☠ Poison " + e.poison + " " : ""}${e.exposed ? "◇ Exposed " : ""}${e.armor ? "▰ Armor " + e.armor : ""}${e.name === "Hollow Warden" && e.hp < e.maxhp / 2 ? " · ENRAGED" : ""}</small></button>`).join("")}</div><div class="battle-bottom"><div class="party">${b.heroes.map((h, i) => `<div class="hero-card ${b.active === i ? "active" : ""}"><header><div class="row">${portrait(i)}<b>${h.name}</b></div><small>Lv ${save.heroes[i].level} ${h.guard ? " / GUARDED" : ""}${h.poison ? " / VENOM " + h.poison : ""}</small></header>${bar(h.hp, h.maxhp)}<small>${h.hp}/${h.maxhp} HP</small>${bar(h.chakra, h.maxchakra, "chakra")}<small>${h.chakra} chakra · ${h.resource} ${"◆".repeat(h.resourceValue)}${"◇".repeat(5 - h.resourceValue)}</small></div>`).join("")}</div><div class="commands"><div class="panel"><div class="eyebrow">${busy ? "RESOLVING ATTACK…" : h.name.toUpperCase() + " / CHOOSE AN ACTION"}</div><p class="hint">Select an enemy above. Interrupts at 0 wind-up cancel its next attack.</p><div class="abilities">${N.ABILITIES[
    h.id
  ]
    .map((a, i) => {
      let cost = Math.max(0, a[1] - (p.nodes.includes(4) && a[1] ? 4 : 0));
      return `<button class="ability" title="${a[3]}" data-action="ability:${i}" ${busy || b.phase !== "player" || h.chakra < cost || (i === 4 && !p.nodes.includes(3)) ? "disabled" : ""}><b>${a[0]}</b><small>${i === 4 && !p.nodes.includes(3) ? "SKILL TREE UNLOCK" : cost ? cost + " CHAKRA" : "QUICK / +5 CHAKRA"}</small><small style="display:block;margin-top:5px">${a[3]}</small><small style="display:block;margin-top:5px;color:var(--gold)">Mastery ${(p.masteries || [])[i] || 0} / 100</small></button>`;
    })
    .join(
      "",
    )}${button("Guard<br><small>+12 chakra · 60% mitigation</small>", "guard", "ability", busy || b.phase !== "player")}</div></div><div class="log" role="log">${b.log.map(esc).join("<br>")}</div></div></div>`;
}
function result() {
  let win = b.result === "victory",
    m = N.MISSIONS[b.mission];
  return `<section class="result panel"><div class="eyebrow">${win ? "ENCOUNTER COMPLETE" : "THE FRACTURE HOLDS"}</div><h1 style="font-size:64px">${win ? "Still standing." : "Regroup. Return."}</h1><p class="muted">${win ? (b.mission === 2 ? "The Warden falls. The signal goes quiet. Team Nine returns together. Chapter one is complete; refine your builds or replay any encounter." : "The path ahead opens. Your techniques grow stronger with every battle.") : "No progress was lost. Spend skill points, change equipment, or use Guard to rebuild chakra. Interrupt dangerous attacks and poison armored targets."}</p>${win ? `<p class="badge">+${m.xp} XP to each hero · +${m.gold} salvage<br>Pattern recovered: ${["Bronze talisman", "Field charm", "Warden plate"][b.mission]}</p><div class="row">${save.heroes.map((p, i) => `<span class="turn">${N.HEROES[i].name} · Lv ${p.level} · ${p.points} points</span>`).join("")}</div>` : ""}<div class="row" style="margin-top:25px">${button("Return to camp", "camp", "primary")}${!win ? button("Retry encounter", "mission:" + b.mission) : button("Develop techniques", "build")}</div></section>`;
}
function guide() {
  return `<div class="modal"><div class="panel"><span class="eyebrow">FIELD MANUAL</span><h2>Read the fight.</h2><p class="muted">Each living hero acts once, then enemies resolve their telegraphs. Select a target, then a technique. Quick attacks recover chakra and build a unique resource. Every round restores 3 chakra.</p><p><b>Break their rhythm.</b> Retraction, Static snare and Tripwire reduce wind-up by 2. At zero, the enemy loses its next attack and resets. The archer targets your weakest ally; guard blocks the stalker’s venom, and Niek’s Repair weave cleanses it. The acolyte heals the Warden. The Warden’s Rupture hits everyone. Below half HP, it consumes 2 wind-up each turn.</p><p><b>Set up a combination.</b> Niek’s venom deals 10 damage over 3 enemy turns, bypassing armor. Roy’s Thunderclaw hits poisoned enemies 50% harder. Exposed targets take 25% more damage.</p><p><b>Use your resources.</b> Tristan spends 2 Momentum on Propulsion for bonus force. Roy and Niek consume 3 Charge / Threads when using a technique to regain 8 chakra. Guard restores 12 chakra and reduces the next hit by 60%.</p><p><b>Grow permanently.</b> Earn XP and skill points, unlock signature techniques, equip patterns and build mastery. Heroes revive and fully recover at camp. Replays award full rewards. Defeat costs nothing.</p><p class="muted">Autosaves happen at camp and after rewards or build changes. Battles restart after closing the game. Export a JSON backup for transfers or if your browser restricts file storage. Keep all game files together. Sound and reduced motion are optional.</p><div class="row">${button("Understood", "close", "primary")}${button(save.settings.reduced ? "Motion: reduced" : "Motion: full", "motion")}</div></div></div>`;
}
function render() {
  window.currentBattle = screen === "combat" ? b : null;
  window.reduceMotion = save.settings.reduced;
  app.innerHTML =
    head() +
    (screen === "menu"
      ? menu()
      : screen === "camp"
        ? camp()
        : screen === "build"
          ? builds()
          : screen === "combat"
            ? combat()
            : result()) +
    (modal === "guide"
      ? guide()
      : modal === "new"
        ? `<div class="modal"><div class="panel"><h2>A new expedition?</h2><p>This replaces your saved progress. Export a backup from camp first if you want to keep it.</p><div class="row">${button("Start fresh", "confirm-new", "primary")}${button("Cancel", "close")}</div></div></div>`
        : modal === "retreat"
          ? `<div class="modal"><div class="panel"><h2>Return to camp?</h2><p>This encounter will restart. Your permanent progress is safe.</p><div class="row">${button("Retreat", "confirm-retreat")}${button("Keep fighting", "close", "primary")}</div></div></div>`
          : "") +
    (notice ? `<div class="notice" role="status">${esc(notice)}</div>` : "") +
    `<input type="file" id="import-file" accept="application/json,.json" hidden>`;
  document.querySelector("#gear")?.addEventListener("change", (e) => {
    save.heroes[tab].gear = e.target.value;
    persist();
    render();
  });
  document.querySelector("#import-file").addEventListener("change", importSave);
}
function start(i) {
  if (i > 0 && !save.cleared.includes(i - 1)) return;
  b = N.battle(save, i);
  busy = false;
  screen = "combat";
  render();
}
function finish() {
  if (b.result) {
    if (b.result === "victory") N.reward(save, b);
    persist();
    screen = "result";
    busy = false;
    render();
    return true;
  }
  return false;
}
function resolve(index, guard = false) {
  if (busy || screen !== "combat" || b.phase !== "player") return;
  let hero = b.active,
    target = b.selected;
  if (!guard && !N.act(save, b, index, target)) return;
  if (guard && !N.defend(b)) return;
  busy = true;
  sound(N.HEROES[hero].id);
  if (!guard)
    choreograph(hero, target, N.ABILITIES[N.HEROES[hero].id][index][4]);
  render();
  setTimeout(
    () => {
      if (finish()) return;
      if (b.phase === "enemy") {
        N.enemyTurn(b);
        if (finish()) return;
      }
      if (b.enemies[b.selected].hp <= 0)
        b.selected = b.enemies.findIndex((e) => e.hp > 0);
      busy = false;
      render();
    },
    save.settings.reduced ? 100 : 850,
  );
}
function exportSave() {
  persist();
  let blob = new Blob([JSON.stringify(save, null, 2)], {
      type: "application/json",
    }),
    a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "team-nine-expedition.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
async function importSave(e) {
  let f = e.target.files[0];
  if (!f) return;
  try {
    if (f.size > 100000) throw Error();
    let s = JSON.parse(await f.text());
    if (!valid(s)) throw Error();
    save = s;
    persist();
    screen = "camp";
    toast("Expedition restored.");
  } catch (e) {
    toast(
      "That file is not a valid v0.1 expedition. Your current save is unchanged.",
    );
  }
}
app.addEventListener("click", (e) => {
  let el = e.target.closest("[data-action]");
  if (!el || el.disabled) return;
  let [a, v] = el.dataset.action.split(":");
  if (a === "sound") {
    save.settings.sound = !save.settings.sound;
    persist();
    toast(save.settings.sound ? "Sound enabled" : "Sound muted");
  } else if (a === "motion") {
    save.settings.reduced = !save.settings.reduced;
    persist();
    render();
  } else if (a === "guide") {
    modal = "guide";
    render();
  } else if (a === "close") {
    modal = "";
    render();
  } else if (a === "new") {
    if (hasSave) {
      modal = "new";
      render();
    } else newGame();
  } else if (a === "confirm-new") newGame();
  else if (a === "camp" || a === "menu" || a === "build") {
    screen = a;
    modal = "";
    b = null;
    persist();
    render();
  } else if (a === "mission") start(+v);
  else if (a === "tab") {
    tab = +v;
    render();
  } else if (a === "unlock") {
    if (N.unlock(save, tab, +v)) {
      persist();
      render();
    }
  } else if (a === "respec") {
    let p = save.heroes[tab];
    if (save.gold >= 25) {
      save.gold -= 25;
      p.points += p.nodes.reduce((sum, n) => sum + N.NODES[n].cost, 0);
      p.nodes = [];
      persist();
      render();
    }
  } else if (a === "forge") {
    if (save.gold >= 60 && !save.inventory.includes("Field charm")) {
      save.gold -= 60;
      save.inventory.push("Field charm");
      persist();
      render();
    }
  } else if (a === "target") {
    if (!busy) {
      b.selected = +v;
      render();
    }
  } else if (a === "ability") resolve(+v);
  else if (a === "guard") resolve(0, true);
  else if (a === "retreat") {
    if (!busy) {
      modal = "retreat";
      render();
    }
  } else if (a === "confirm-retreat") {
    screen = "camp";
    modal = "";
    b = null;
    persist();
    render();
  } else if (a === "export") exportSave();
  else if (a === "import") {
    document.querySelector("#import-file").click();
  }
});
function newGame() {
  save = N.fresh();
  persist();
  screen = "camp";
  modal = "";
  b = null;
  render();
}
render();

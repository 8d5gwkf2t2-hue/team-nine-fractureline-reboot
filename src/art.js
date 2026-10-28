/* Illustrated sprite renderer. Combat remains entirely in engine.js.
 * PixiJS 7 legacy provides WebGL plus a Canvas fallback, both served locally.
 */
(function () {
  "use strict";
  const P = PIXI,
    data = GameAssets,
    W = 1440,
    H = 900;
  const ids = ["tristan", "roy", "niek"];
  const status = document.querySelector("#art-status");
  const diagnostics = {
    ready: false,
    backend: null,
    assets: 0,
    frames: {},
    states: [],
    particles: 0,
    errors: [],
  };
  let pixi, root, backgrounds, actors, foregrounds, effects, selection;
  let currentBattle = null,
    time = 0,
    activeAction = null,
    enemyViews = [],
    previousScene = "";
  const images = {},
    textures = {},
    heroes = [],
    particles = [],
    feedback = [];
  const enemyTextures = new Map();
  let pointer = { x: 0, y: 0 },
    livePointer = { x: 0, y: 0 };
  const motion = () =>
    !window.reduceMotion &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hex = (c) => parseInt(c.slice(1), 16);
  const api = (window.IllustratedRenderer = { diagnostics, ready: null });

  function loadImage(id, src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        images[id] = image;
        textures[id] = P.Texture.from(image);
        diagnostics.assets++;
        resolve();
      };
      image.onerror = () =>
        reject(new Error("Could not decode illustrated asset: " + id));
      image.src = src;
    });
  }
  function texture(id, rect) {
    return new P.Texture(textures[id].baseTexture, new P.Rectangle(...rect));
  }

  // Each pose is a reusable layered container. Frame sequences can reference as
  // many independently authored atlas cells as an artist supplies in the manifest.
  class CharacterView extends P.Container {
    constructor(id, index) {
      super();
      this.id = id;
      this.index = index;
      this.config = data.characters[id];
      this.poses = {};
      this.state = "idle";
      this.started = 0;
      this.transientUntil = 0;
      this.scale.set(this.config.height / 650);
      for (const [name, frame] of Object.entries(this.config.frames)) {
        const pose = new P.Container(),
          body = new P.Sprite(texture(id, frame.rect));
        body.position.set(-frame.pivot[0], -frame.pivot[1]);
        pose.addChild(body);
        if (frame.mask) {
          const mask = new P.Graphics()
            .beginFill(0xffffff)
            .drawPolygon(frame.mask)
            .endFill();
          mask.position.copyFrom(body.position);
          pose.addChild(mask);
          body.mask = mask;
        }
        pose.parts = [];
        for (const layer of frame.layers || []) {
          const part = new P.Sprite(texture(id, layer.rect));
          part.name = layer.name;
          part.pivot.set(...(layer.pivot || [0, 0]));
          part.position.set(...layer.offset);
          part.rest = [...layer.offset];
          part.motion = layer.motion;
          pose.parts.push(part);
          pose.addChild(part);
        }
        pose.visible = false;
        this.poses[name] = pose;
        this.addChild(pose);
      }
      diagnostics.frames[id] = Object.keys(this.poses);
      this.setState("idle", true);
    }
    setState(state, restart = false) {
      if (!restart && this.state === state) return;
      this.state = state;
      this.started = performance.now();
      diagnostics.states.push({ hero: this.id, state });
      if (diagnostics.states.length > 80) diagnostics.states.shift();
    }
    transient(state, ms = 500) {
      this.setState(state, true);
      this.transientUntil = performance.now() + ms;
    }
    update(now, guard, down) {
      if (
        now > this.transientUntil &&
        (!activeAction || activeAction.hero !== this.index)
      )
        this.setState(guard ? "defense" : "idle");
      const anim = data.animations[this.state] || data.animations.idle;
      let step = Math.floor(((now - this.started) / 1000) * anim.fps);
      step = anim.loop
        ? step % anim.frames.length
        : Math.min(step, anim.frames.length - 1);
      const name = motion()
        ? anim.frames[step]
        : this.state === "damage"
          ? "damage"
          : this.state === "defense"
            ? "defense"
            : this.state === "special"
              ? "special"
              : this.state === "attack"
                ? "attack"
                : "idle";
      for (const [key, pose] of Object.entries(this.poses)) {
        pose.visible = key === name;
        if (pose.visible)
          for (const part of pose.parts) {
            part.rotation =
              motion() && part.motion === "pendulum"
                ? Math.sin(time * 2.5) * 0.055
                : 0;
            part.y = part.rest[1] + (motion() ? Math.sin(time * 2.2) * 2 : 0);
          }
      }
      this.alpha = down ? 0.27 : 1;
      this.tint = 0xffffff;
      this.angle = this.state === "damage" && motion() ? -4 : 0;
    }
  }
  function backgroundSprite(id) {
    let s = new P.Sprite(textures[id]);
    s.width = W + 40;
    s.height = H + 24;
    s.position.set(-20, -12);
    return s;
  }
  let painted, oldBackdrop, fore, shade;
  function makeScene() {
    backgrounds = new P.Container();
    actors = new P.Container();
    foregrounds = new P.Container();
    effects = new P.Container();
    selection = new P.Graphics();
    root.addChild(backgrounds, selection, actors, foregrounds, effects);
    actors.sortableChildren = true;
    painted = backgroundSprite("aqueduct");
    backgrounds.addChild(painted);
    oldBackdrop = new P.Sprite(P.Texture.from(LegacyScene.backdrop()));
    oldBackdrop.width = W;
    oldBackdrop.height = H;
    backgrounds.addChild(oldBackdrop);
    // Independent illustrated near plane. Its center is genuinely transparent.
    fore = backgroundSprite("foreground");
    fore.width = W + 300;
    foregrounds.addChild(fore);
    fore.alpha = 0.85;
    // A restrained UI vignette leaves the painted stage visible.
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    let grad = ctx.createLinearGradient(0, 0, 0, 900);
    grad.addColorStop(0, "#07121ad9");
    grad.addColorStop(0.25, "#07121a10");
    grad.addColorStop(0.58, "#07121a00");
    grad.addColorStop(1, "#07121aee");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 8, 900);
    shade = new P.Sprite(P.Texture.from(canvas));
    shade.width = W;
    shade.height = H;
    foregrounds.addChild(shade);
    ids.forEach((id, i) => {
      let hero = new CharacterView(id, i);
      heroes.push(hero);
      actors.addChild(hero);
    });
    paintPortraits();
  }
  function syncEnemies(b) {
    if (currentBattle === b) return;
    currentBattle = b;
    for (const view of enemyViews) {
      actors.removeChild(view);
      view.destroy();
    }
    enemyViews = [];
    if (!b) return;
    for (const [i, e] of b.enemies.entries()) {
      if (!enemyTextures.has(e.name))
        enemyTextures.set(
          e.name,
          P.Texture.from(LegacyScene.enemyTexture(e.name)),
        );
      let view = new P.Sprite(enemyTextures.get(e.name));
      view.anchor.set(120 / 260, 345 / 360);
      view.position.set(1020 + i * 155, 550 + i * 17);
      view.zIndex = view.y;
      actors.addChild(view);
      enemyViews.push(view);
    }
  }
  function spawn(x, y, index, kind) {
    if (!motion()) return;
    const palette = data.characters[ids[index]].palette;
    for (let i = 0; i < (kind === "ultimate" ? 70 : 38); i++) {
      const a = i * 2.39996,
        speed = 35 + (i % 9) * 22;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 30,
        age: 0,
        life: 0.35 + (i % 6) * 0.12,
        color: hex(palette[i % palette.length]),
        size: 1.5 + (i % 3),
      });
    }
    if (particles.length > 180) particles.splice(0, particles.length - 180);
  }
  function floatText(x, y, value, color = 0xf0d6a4) {
    feedback.push({ x, y, value, color, age: 0 });
  }
  const strokes = new P.Graphics();
  let texts = [];
  function drawEffects(dt) {
    strokes.clear();
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.age += dt;
      if (p.age > p.life) {
        particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 50 * dt;
      strokes
        .beginFill(p.color, 1 - p.age / p.life)
        .drawCircle(p.x, p.y, p.size)
        .endFill();
    }
    // Ambient fireflies and haze are independent of the painted layers.
    for (let i = 0; i < 26; i++) {
      let x = (i * 163.9 + time * 4) % W,
        y = 260 + ((i * 79) % 280) + Math.sin(time + i) * 8;
      strokes
        .beginFill(0xd7c08a, 0.25 + Math.sin(time * 2 + i) * 0.12)
        .drawCircle(x, y, 1 + (i % 2))
        .endFill();
    }
    if (activeAction && motion()) {
      let a = activeAction,
        progress = (performance.now() - a.start) / 850,
        col = hex(data.characters[ids[a.hero]].palette[0]);
      let x = 1020 + a.target * 155,
        y = 405;
      if (progress > 0.2 && progress < 0.85 && a.kind !== "defense") {
        if (a.hero === 0) {
          for (let k = 0; k < 4; k++) {
            strokes.lineStyle(2, hex(data.characters.tristan.palette[k]), 0.5);
            for (let j = 0; j < 25; j++) {
              let angle = j * 0.3 + time * 8 + k,
                r = 45 + k * 13 + Math.sin(j + k) * 7;
              let px = x + Math.cos(angle) * r,
                py = y + Math.sin(angle) * r * 0.7;
              j ? strokes.lineTo(px, py) : strokes.moveTo(px, py);
            }
          }
        }
        if (a.hero === 1) {
          strokes.lineStyle(2, col, 0.7);
          strokes.moveTo(heroes[1].x, 425);
          for (let j = 0; j < 12; j++)
            strokes.lineTo(
              heroes[1].x + ((x - heroes[1].x) * j) / 11,
              425 + Math.sin(j * 13 + time * 60) * 12,
            );
        }
        if (a.hero === 2) {
          for (let k = 0; k < 6; k++)
            strokes
              .lineStyle(1, 0xc6b292, 0.65)
              .moveTo(heroes[2].x + 25, 410 + k * 2)
              .lineTo(x + Math.cos(k) * 45, y + Math.sin(k) * 55);
        }
      }
    }
    for (let t of texts) t.destroy();
    texts = [];
    for (let i = feedback.length - 1; i >= 0; i--) {
      const f = feedback[i];
      f.age += dt;
      if (f.age > 1) {
        feedback.splice(i, 1);
        continue;
      }
      let label = new P.Text(f.value, {
        fontFamily: "Georgia",
        fontSize: 27,
        fill: f.color,
        stroke: 0x10202a,
        strokeThickness: 4,
      });
      label.anchor.set(0.5);
      label.position.set(f.x, f.y - f.age * 35);
      label.alpha = Math.min(1, (1 - f.age) * 3);
      effects.addChild(label);
      texts.push(label);
    }
    diagnostics.particles = particles.length;
  }
  function update() {
    const now = performance.now(),
      dt = Math.min(0.05, pixi.ticker.elapsedMS / 1000);
    time = motion() ? time + dt : 0;
    let b = window.currentBattle;
    syncEnemies(b);
    let illustrated = !b || b.mission === 0;
    painted.visible = illustrated;
    oldBackdrop.visible = !illustrated;
    fore.visible = illustrated;
    const scene = b ? "battle" : "menu";
    if (scene !== previousScene) {
      activeAction = null;
      previousScene = scene;
      heroes.forEach((h) => (h.transientUntil = 0));
    }
    livePointer.x += (pointer.x - livePointer.x) * 0.04;
    livePointer.y += (pointer.y - livePointer.y) * 0.04;
    painted.y = b ? -80 : -12;
    painted.x =
      -20 + (motion() ? Math.sin(time * 0.12) * 4 + livePointer.x * 3 : 0);
    fore.x =
      -150 + (motion() ? Math.sin(time * 0.12) * 9 + livePointer.x * 11 : 0);
    fore.y = (b ? -45 : -12) + (motion() ? livePointer.y * 4 : 0);
    const positions = b
      ? [
          [245, 550],
          [430, 555],
          [620, 550],
        ]
      : [
          [820, 700],
          [990, 717],
          [1155, 700],
        ];
    selection.clear();
    heroes.forEach((hero, i) => {
      let [x, y] = positions[i],
        down = b?.heroes[i].hp <= 0;
      hero.position.set(x, y + (motion() ? Math.sin(time * 1.8 + i) * 1.4 : 0));
      hero.scale.set(((b ? 1 : 1.18) * hero.config.height) / 650);
      hero.zIndex = y;
      const guard = b?.heroes[i].guard || false;
      hero.update(now, guard, down);
      if (activeAction?.hero === i) {
        const a = activeAction,
          age = (now - a.start) / 850;
        if (age >= 1) {
          activeAction = null;
          hero.transientUntil = 0;
        } else {
          let swing = Math.sin(Math.min(1, age) * Math.PI);
          if (motion() && !["defense", "heal", "teamguard"].includes(a.kind))
            hero.x +=
              swing *
              (i === 2 ? 20 : Math.min(500, 1020 + a.target * 155 - x - 120));
          if (!a.emitted && age > 0.3) {
            const supportive = ["defense", "heal", "teamguard"].includes(
              a.kind,
            );
            spawn(
              supportive ? hero.x : 1020 + a.target * 155,
              supportive ? hero.y - 130 : 405,
              i,
              a.kind,
            );
            a.emitted = true;
          }
        }
      }
      selection
        .beginFill(0x071019, 0.3)
        .drawEllipse(x, y + 3, 48, 9)
        .endFill();
      if (b?.active === i && !down) {
        selection
          .lineStyle(1.5, hex(hero.config.palette[0]), 0.9)
          .drawEllipse(x, y + 3, 52, 11);
        selection.lineStyle(0);
      }
    });
    enemyViews.forEach((view, i) => {
      view.alpha = b.enemies[i].hp > 0 ? 1 : 0.22;
      view.y = 550 + i * 17 + (motion() ? Math.sin(time * 2 + i) * 2 : 0);
    });
    drawEffects(dt);
  }
  function paintPortraits() {
    if (!images.tristan) return;
    document.querySelectorAll("canvas[data-portrait]").forEach((canvas) => {
      const id = ids[Number(canvas.dataset.portrait)],
        im = images[id],
        ctx = canvas.getContext("2d");
      let box = {
        tristan: [95, 5, 210, 230],
        roy: [90, 40, 210, 230],
        niek: [80, 5, 230, 250],
      }[id];
      ctx.fillStyle = "#23323a";
      ctx.fillRect(0, 0, 64, 64);
      ctx.drawImage(im, ...box, 0, 0, 64, 64);
    });
  }
  api.paintPortraits = paintPortraits;
  window.choreograph = (hero, target, kind) => {
    if (!diagnostics.ready) return;
    const state =
      kind === "defense"
        ? "defense"
        : ["basic", "burst"].includes(kind)
          ? "attack"
          : "special";
    heroes[hero].transient(state, 850);
    activeAction = {
      hero,
      target: Math.max(0, target),
      kind,
      start: performance.now(),
      emitted: false,
    };
  };
  api.reactToEnemy = (before, b) => {
    if (!diagnostics.ready) return;
    b.heroes.forEach((h, i) => {
      let damage = before[i] - h.hp;
      if (damage > 0) {
        heroes[i].transient("damage", 650);
        floatText(heroes[i].x, 340, "−" + damage, 0xe5a18b);
      }
    });
  };
  api.playState = (id, state) => {
    const h = heroes[ids.indexOf(id)];
    if (!h || !data.animations[state]) return false;
    h.transient(state, 1500);
    return true;
  };
  api.ready = (async () => {
    try {
      const forceCanvas =
        new URLSearchParams(location.search).get("renderer") === "canvas";
      pixi = new P.Application({
        view: document.querySelector("#world"),
        width: W,
        height: H,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(devicePixelRatio, 2),
        autoDensity: true,
        forceCanvas: forceCanvas || !P.utils.isWebGLSupported(),
      });
      diagnostics.backend =
        pixi.renderer.type === P.RENDERER_TYPE.WEBGL ? "WebGL" : "Canvas";
      pixi.ticker.maxFPS = 30;
      root = new P.Container();
      pixi.stage.addChild(root);
      function resize() {
        pixi.renderer.resize(innerWidth, innerHeight);
        root.scale.set(innerWidth / W, innerHeight / H);
      }
      resize();
      addEventListener("resize", resize);
      addEventListener("pointermove", (e) => {
        pointer.x = e.clientX / innerWidth - 0.5;
        pointer.y = e.clientY / innerHeight - 0.5;
      });
      await Promise.all(
        Object.entries(data.images).map(([id, src]) => loadImage(id, src)),
      );
      makeScene();
      effects.addChild(strokes);
      diagnostics.ready = true;
      status.hidden = true;
      pixi.ticker.add(update);
      paintPortraits();
      return diagnostics;
    } catch (e) {
      diagnostics.errors.push(e.message);
      status.textContent = "Illustrated artwork could not load. " + e.message;
      status.classList.add("failed");
      throw e;
    }
  })();
})();

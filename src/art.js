/* Offline procedural art: painted ruins, articulated silhouettes and particle choreography. */
(function () {
  const canvas = document.querySelector("#world"),
    c = canvas.getContext("2d");
  let W = 1440,
    H = 900,
    t = 0,
    fx = null;
  window.choreograph = (hero, target, kind) => {
    fx = { hero, target, kind, start: performance.now() };
  };
  const poly = (pts, fill, stroke) => {
    c.beginPath();
    pts.forEach((p, i) => (i ? c.lineTo(...p) : c.moveTo(...p)));
    c.closePath();
    c.fillStyle = fill;
    c.fill();
    if (stroke) {
      c.strokeStyle = stroke;
      c.stroke();
    }
  };
  function line(x, y, a, b, color, w = 1) {
    c.strokeStyle = color;
    c.lineWidth = w;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(a, b);
    c.stroke();
  }
  function oval(x, y, rx, ry, col) {
    c.fillStyle = col;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, 7);
    c.fill();
  }
  function person(x, y, id, scale = 1, active = false, dead = false) {
    c.save();
    c.translate(x, y + Math.sin(t * 1.8 + x) * 3);
    c.scale(scale, scale);
    if (dead) c.globalAlpha = 0.25;
    let attack =
      fx && ["tristan", "roy", "niek"][fx.hero] === id
        ? (performance.now() - fx.start) / 850
        : 2;
    let striking = attack < 1 && attack > 0.15;
    let tr = id === "tristan",
      roy = id === "roy",
      col = tr ? "#1d2528" : roy ? "#536879" : "#9d8865",
      skin = "#c3a080";
    oval(0, 3, 43, 9, "#060d12aa");
    if (active) {
      c.strokeStyle = tr ? "#a1a25d" : roy ? "#8ebdd6" : "#caa490";
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(0, 3, 46, 12, 0, 0, 7);
      c.stroke();
    }
    poly(
      [
        [-25, -73],
        [-6, -73],
        [-8, -6],
        [-27, -6],
      ],
      "#202c37",
    );
    poly(
      [
        [3, -73],
        [23, -73],
        [30, -8],
        [9, -8],
      ],
      "#17232e",
    );
    line(-27, -25, -8, -25, "#b1b1a0", 7);
    line(7, -28, 26, -28, "#b1b1a0", 7);
    poly(
      [
        [-29, -9],
        [-8, -9],
        [-5, 0],
        [-36, 0],
      ],
      "#111b23",
    );
    poly(
      [
        [9, -9],
        [30, -9],
        [42, 0],
        [7, 0],
      ],
      "#111b23",
    );
    poly(
      [
        [-23, -145],
        [20, -145],
        [30, -77],
        [-31, -77],
      ],
      col,
      "#17222a",
    );
    poly(
      [
        [-20, -142],
        [2, -129],
        [18, -145],
        [20, -117],
        [-21, -117],
      ],
      tr ? "#141d21" : "#34434c",
    );
    poly(
      [
        [-23, -143],
        [-12, -137],
        [-17, -86],
        [-30, -78],
      ],
      "#101b2444",
    );
    line(8, -113, 20, -113, "#c6c2a155", 1);
    line(9, -109, 20, -109, "#c6c2a144", 1);
    line(-4, -116, -4, -80, tr ? "#56615c" : "#c0ac88", 2);
    if (tr) {
      line(-22, -136, 18, -87, "#454c46", 7);
      for (let i = 0; i < 4; i++)
        line(-17 + i * 8, -86, -17 + i * 8, -77, "#727364", 4);
    }
    poly(
      [
        [-22, -138],
        [-33, -128],
        [-48, -87],
        [-37, -80],
        [-15, -117],
      ],
      col,
    );
    if (striking) {
      poly(
        [
          [19, -140],
          [37, -140],
          [88, -139],
          [89, -125],
          [38, -122],
          [18, -116],
        ],
        col,
      );
      oval(91, -131, 9, 8, skin);
      line(71, -137, 72, -125, "#b4b4a6", 8);
    } else
      poly(
        [
          [19, -140],
          [33, -129],
          [49, -105],
          [40, -97],
          [18, -116],
        ],
        col,
      );
    line(-45, -95, -41, -84, "#b4b4a6", 10);
    line(43, -106, 49, -98, "#b4b4a6", 9);
    oval(-43, -80, 7, 8, skin);
    oval(49, -96, 7, 7, skin);
    oval(0, -163, 21, 27, skin);
    if (tr) {
      poly(
        [
          [-25, -166],
          [-28, -184],
          [-15, -180],
          [-18, -196],
          [-5, -186],
          [5, -201],
          [11, -184],
          [27, -190],
          [22, -176],
          [32, -169],
          [17, -171],
          [9, -181],
          [-3, -173],
          [-16, -177],
        ],
        "#111b1d",
      );
      c.strokeStyle = "#11191b";
      c.lineWidth = 3;
      c.strokeRect(-19, -168, 16, 11);
      c.strokeRect(2, -168, 16, 11);
      line(-3, -164, 2, -164, "#11191b", 2);
      line(-13, -163, -9, -163, "#aca367", 2);
      line(7, -163, 11, -163, "#aca367", 2);
    } else if (roy) {
      poly(
        [
          [-22, -168],
          [-22, -184],
          [-14, -192],
          [7, -193],
          [22, -180],
          [21, -169],
          [12, -178],
          [-13, -178],
        ],
        "#b6a078",
      );
      line(-14, -164, -8, -164, "#85bedb", 3);
      line(6, -164, 12, -164, "#85bedb", 3);
    } else {
      poly(
        [
          [-25, -156],
          [-24, -181],
          [-9, -195],
          [8, -190],
          [22, -185],
          [27, -157],
          [18, -145],
          [13, -162],
          [5, -148],
          [-3, -164],
          [-12, -148],
          [-15, -163],
        ],
        "#b49b6b",
      );
      poly(
        [
          [-30, -88],
          [27, -88],
          [29, -72],
          [-31, -75],
        ],
        "#653c44",
      );
      for (let i = 0; i < 4; i++)
        line(48 + i * 2, -92, 62 + i * 5, -24, "#d7c7a277");
      oval(73, -25, 10, 12, "#746042");
      line(73, -14, 73, 13, "#816c4d", 8);
      line(73, 2, 57, 13, "#816c4d", 4);
      line(74, 2, 88, 11, "#816c4d", 4);
    }
    line(-6, -148, 6, -148, "#775c4d", 1);
    c.restore();
  }
  function enemy(x, y, i, b) {
    let e = b?.enemies[i],
      boss = e?.name === "Hollow Warden",
      archer = e?.name.includes("archer"),
      stalker = e?.name.includes("stalker"),
      acolyte = e?.name.includes("acolyte");
    c.save();
    c.translate(x, y + Math.sin(t * 2 + i) * 2);
    if (e?.hp <= 0) c.globalAlpha = 0.18;
    let s = boss ? 1.45 : 1;
    c.scale(s, s);
    oval(0, 0, 45, 10, "#060b12aa");
    poly(
      [
        [-24, -85],
        [-4, -85],
        [-14, 0],
        [-34, 0],
      ],
      "#252c32",
    );
    poly(
      [
        [0, -86],
        [24, -86],
        [35, 0],
        [14, 0],
      ],
      "#252c32",
    );
    poly(
      [
        [-30, -148],
        [26, -148],
        [38, -72],
        [-36, -72],
      ],
      boss ? "#434442" : "#3c3a42",
      "#737367",
    );
    poly(
      [
        [-35, -150],
        [-55, -138],
        [-41, -98],
        [-29, -103],
      ],
      "#555549",
    );
    poly(
      [
        [30, -150],
        [49, -135],
        [41, -90],
        [29, -100],
      ],
      "#555549",
    );
    oval(0, -169, 24, 27, "#2a2e32");
    poly(
      [
        [-25, -183],
        [0, -201],
        [25, -182],
        [18, -144],
        [0, -153],
        [-18, -144],
      ],
      "#727063",
    );
    line(-16, -173, -4, -169, "#ec9b73", 3);
    line(5, -169, 16, -173, "#ec9b73", 3);
    if (boss) {
      poly(
        [
          [-19, -191],
          [-41, -216],
          [-31, -178],
        ],
        "#777562",
      );
      poly(
        [
          [19, -191],
          [41, -216],
          [31, -178],
        ],
        "#777562",
      );
      oval(0, -118, 8 + Math.sin(t * 3) * 2, 12, "#d88760");
    }
    if (archer) {
      c.strokeStyle = "#b69d77";
      c.lineWidth = 4;
      c.beginPath();
      c.ellipse(57, -134, 27, 62, 0, -1.5, 1.5);
      c.stroke();
      line(58, -195, 58, -73, "#b6c2ad", 1);
      line(34, -130, 91, -130, "#b6c2ad", 2);
    } else if (stalker) {
      poly(
        [
          [38, -103],
          [57, -142],
          [53, -91],
        ],
        "#bbb9a0",
      );
      poly(
        [
          [-38, -100],
          [-57, -140],
          [-54, -87],
        ],
        "#bbb9a0",
      );
    } else {
      line(45, -110, 67, -203, "#858576", 5);
      if (acolyte) {
        oval(67, -210, 12, 17, "#d69f7a");
        oval(67, -210, 6, 9, "#ffdbc0");
      } else
        poly(
          [
            [67, -203],
            [79, -230],
            [82, -192],
          ],
          "#bbb99d",
        );
    }
    c.restore();
  }
  function draw() {
    if (
      canvas.width !== Math.round(innerWidth * devicePixelRatio) ||
      canvas.height !== Math.round(innerHeight * devicePixelRatio)
    ) {
      canvas.width = innerWidth * devicePixelRatio;
      canvas.height = innerHeight * devicePixelRatio;
    }
    c.setTransform(
      (devicePixelRatio * innerWidth) / W,
      0,
      0,
      (devicePixelRatio * innerHeight) / H,
      0,
      0,
    );
    t = window.reduceMotion ? 0 : performance.now() / 1000;
    let g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#101f2b");
    g.addColorStop(0.5, "#34434a");
    g.addColorStop(1, "#101d24");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    oval(925, 230, 110, 110, "#a0a89418");
    for (let k = 0; k < 3; k++) {
      let bottom = 470 + k * 55;
      for (let i = 0; i < 13; i++) {
        let x = i * 137 + (k % 2) * 51;
        poly(
          [
            [x, bottom],
            [x + 17, 240 + k * 55 + ((i * 37) % 90)],
            [x + 45, 210 + k * 64],
            [x + 72, 280 + k * 35],
            [x + 110, bottom],
          ],
          ["#263941", "#293b40", "#2c3d40"][k],
        );
      }
    }
    for (let side of [0, 1]) {
      c.save();
      c.translate(side ? W : 0, 0);
      c.scale(side ? -1 : 1, 1);
      poly(
        [
          [0, 0],
          [190, 0],
          [168, 100],
          [151, 102],
          [139, 520],
          [205, 565],
          [0, 610],
        ],
        "#14242b",
      );
      for (let i = 0; i < 7; i++)
        line(10, 130 + i * 58, 146, 132 + i * 58, "#40505655", 2);
      poly(
        [
          [160, 93],
          [510, 120],
          [505, 143],
          [176, 124],
        ],
        "#22343b",
      );
      poly(
        [
          [178, 131],
          [212, 134],
          [181, 242],
        ],
        "#23353c",
      );
      c.restore();
    }
    poly(
      [
        [0, 570],
        [500, 500],
        [990, 520],
        [1440, 570],
        [1440, 900],
        [0, 900],
      ],
      "#202d31",
    );
    for (let i = 0; i < 20; i++) {
      let y = 530 + i * i * 1.2;
      line(0, y, W, y + 10, "#64716b18");
    }
    for (let i = 0; i < 15; i++)
      line(i * 140 - 280, 900, 720 + (i - 7) * 30, 510, "#71807815");
    for (let i = 0; i < 45; i++) {
      let x = (i * 127.7 + t * (6 + (i % 3))) % W,
        y = 180 + ((i * 61) % 480) + Math.sin(t + i) * 15;
      oval(x, y, i % 3 ? 1 : 2, 1, "#d4b78055");
    }
    let b = window.currentBattle;
    let menu = !b;
    let positions = menu
      ? [
          [880, 675],
          [1060, 700],
          [1235, 680],
        ]
      : [
          [270, 583],
          [420, 615],
          [560, 595],
        ];
    positions.forEach((p, i) => {
      let off = 0;
      if (fx && fx.hero === i) {
        let age = (performance.now() - fx.start) / 850;
        if (age < 1 && !window.reduceMotion)
          off =
            fx.hero === 2
              ? Math.sin(age * Math.PI) * 15
              : Math.sin(age * Math.PI) * (fx.hero === 1 ? 530 : 380);
        else if (age >= 1) fx = null;
      }
      person(
        p[0] + off,
        p[1],
        ["tristan", "roy", "niek"][i],
        menu ? 1.35 : 1.05,
        b?.active === i && b?.phase === "player",
        b?.heroes[i].hp <= 0,
      );
    });
    if (b)
      b.enemies.forEach((e, i) => enemy(1000 + i * 155, 590 + i * 20, i, b));
    if (fx && !window.reduceMotion) {
      let age = (performance.now() - fx.start) / 850;
      if (age < 1) {
        let col = ["#a6a45f", "#9ecde7", "#ba9693"][fx.hero];
        let x = 1000 + fx.target * 155,
          y = 450;
        c.globalAlpha = Math.sin(age * Math.PI);
        if (fx.hero === 0) {
          for (let k = 0; k < 6; k++) {
            c.beginPath();
            c.strokeStyle = ["#7f8750", "#897342", "#d1bd79"][k % 3];
            c.lineWidth = 2 + (k % 2);
            for (let n = 0; n < 35; n++) {
              let a = n * 0.3 + age * 6 + k;
              let r = 50 + k * 12 + Math.sin(n * 2 + k) * 12;
              let px = x + Math.cos(a) * r,
                py = y + Math.sin(a) * r * 0.8;
              n ? c.lineTo(px, py) : c.moveTo(px, py);
            }
            c.stroke();
          }
        } else if (fx.hero === 1) {
          for (let k = 0; k < 5; k++)
            line(
              420 + age * 600 - k * 35,
              470 + k * 8,
              x,
              450 + k * 5,
              "#b0d9ea66",
              3,
            );
          if (fx.kind === "cat") {
            poly(
              [
                [x - 70, y + 40],
                [x - 45, y + 13],
                [x - 22, y + 26],
                [x + 15, y + 12],
                [x + 30, y - 10],
                [x + 38, y + 8],
                [x + 53, y - 8],
                [x + 55, y + 24],
                [x + 30, y + 44],
                [x + 10, y + 46],
                [x + 2, y + 66],
                [x - 8, y + 46],
                [x - 35, y + 44],
                [x - 47, y + 65],
                [x - 51, y + 40],
              ],
              "#a8d5e7",
            );
            line(x - 68, y + 39, x - 100, y + 12, "#a8d5e7", 5);
          }
        } else {
          for (let k = 0; k < 8; k++)
            line(
              610,
              500 + k * 3,
              x + Math.cos(k) * 70,
              y + Math.sin(k) * 60,
              "#c9b6a499",
              1,
            );
          if (fx.kind === "poison") {
            for (let k = 0; k < 15; k++)
              oval(
                x + Math.sin(k * 5) * 55,
                y + Math.cos(k * 3 + age * 3) * 65,
                10,
                12,
                "#9ca77955",
              );
          }
        }
        for (let j = 0; j < 18; j++) {
          let angle = j * 2.4;
          let r = age * 160;
          line(
            x + Math.cos(angle) * r * 0.3,
            y + Math.sin(angle) * r * 0.3,
            x + Math.cos(angle) * r,
            y + Math.sin(angle) * r,
            col,
            2 + (j % 3),
          );
        }
        c.globalAlpha = 1;
      }
    }
    let shade = c.createLinearGradient(0, 450, 0, 900);
    shade.addColorStop(0, "#07111800");
    shade.addColorStop(1, "#071118f5");
    c.fillStyle = shade;
    c.fillRect(0, 450, W, 450);
    requestAnimationFrame(draw);
  }
  draw();
})();

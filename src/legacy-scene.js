/* Existing enemies and later scenes retained; no protagonist geometry. */
window.LegacyScene = {
  enemyTexture(name) {
    const canvas = document.createElement("canvas");
    canvas.width = 260;
    canvas.height = 360;
    const c = canvas.getContext("2d"),
      t = 0,
      W = 1440,
      H = 900;
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
    enemy(120, 345, 0, { enemies: [{ name, hp: 1, maxhp: 1 }] });
    return canvas;
  },
  backdrop() {
    const canvas = document.createElement("canvas");
    canvas.width = 1440;
    canvas.height = 900;
    const c = canvas.getContext("2d"),
      t = 0,
      W = 1440,
      H = 900;
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
    return canvas;
  },
};

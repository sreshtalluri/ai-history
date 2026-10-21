import * as THREE from 'three';
import {
  ball,
  box,
  canvasTexture,
  clay,
  cone,
  cyl,
  easeInOut,
  glow,
  group,
  label,
  palette as P,
  ring,
  rod,
  screen,
  tube,
} from './kit';
import type { Builder, Built } from './objects';

/** 1843 · Babbage's Analytical Engine: columns of brass number wheels and a punched card. */
function analyticalEngine(): Built {
  const brass = '#d4a248';
  const columns: THREE.Group[] = [];
  const engine = group(
    box([2.6, 0.18, 1.1], P.brown, [0, -0.98, 0], undefined, 0.05),
    box([2.6, 0.14, 1.1], P.brown, [0, 0.98, 0], undefined, 0.05),
  );
  for (let c = 0; c < 4; c++) {
    const x = -0.95 + c * 0.63;
    const col = group(cyl(0.04, 0.04, 1.9, P.slate, [0, 0, 0]));
    for (let k = 0; k < 6; k++) {
      const wheel = group(
        cyl(0.24, 0.24, 0.1, brass, [0, 0, 0], undefined, 24),
        box([0.06, 0.11, 0.08], P.ink, [0, 0, 0.23], undefined, 0.01),
      );
      wheel.position.y = -0.75 + k * 0.3;
      col.add(wheel);
    }
    col.position.x = x;
    columns.push(col);
    engine.add(col);
  }
  const crank = group(rod([0, 0, 0], [0, 0, 0.5], 0.035, P.slate), rod([0, 0, 0.5], [0.3, 0, 0.5], 0.035, P.slate), ball(0.07, P.red, [0.3, 0, 0.5]));
  crank.position.set(1.35, 0.2, 0);
  crank.rotation.y = Math.PI / 2;
  engine.add(crank);

  const card = group(box([0.9, 0.04, 0.5], P.cream, [0, 0, 0], undefined, 0.02));
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 3; j++) {
      if ((i * 3 + j) % 3 !== 1) card.add(cyl(0.04, 0.04, 0.05, P.ink, [-0.32 + i * 0.16, 0, -0.14 + j * 0.14]));
    }
  }
  card.position.set(-0.6, -0.86, 0.85);
  card.rotation.set(0.15, 0.4, 0);

  return {
    group: group(engine, card),
    update: (t) => {
      columns.forEach((col, c) =>
        col.children.slice(1).forEach((w, k) => {
          w.rotation.y = Math.floor(t * 0.9 + c * 0.3 + k * 0.15) * (Math.PI / 5) * (k % 2 ? 1 : -1);
        }),
      );
      crank.rotation.z = t * 1.5;
    },
  };
}

function die(color: string): THREE.Group {
  const g = group(box([0.7, 0.7, 0.7], color, [0, 0, 0], undefined, 0.14));
  const pip = (x: number, y: number, z: number) => g.add(ball(0.07, P.ink, [x, y, z]));
  const o = 0.36;
  const d = 0.17;
  pip(0, 0, o); // 1
  pip(-d, -d, -o), pip(d, d, -o); // 2
  pip(o, -d, -d), pip(o, 0, 0), pip(o, d, d); // 3
  for (const [a, b] of [[-d, -d], [d, d], [-d, d], [d, -d]] as const) pip(-o, a, b); // 4
  for (const [a, b] of [[-d, -d], [d, d], [-d, d], [d, -d], [0, 0]] as const) pip(a, o, b); // 5
  for (const [a, b] of [[-d, -d], [-d, 0], [-d, d], [d, -d], [d, 0], [d, d]] as const) pip(a, -o, b); // 6
  return g;
}

/** 1948 · Shannon: language as weighted dice. */
function shannonDice(): Built {
  const d1 = die(P.paper);
  const d2 = die(P.purple);
  d1.position.set(-0.55, -0.55, 0.2);
  d2.position.set(0.5, -0.55, -0.1);
  const words = ['THE', 'HEAD', 'AND', 'IN', 'FRONTAL'].map((w, i) =>
    label(w, [0.62, 0.24], { pos: [-1.3 + i * 0.65, 0.75 - (i % 2) * 0.18, 0], bg: i === 4 ? P.yellow : P.paper, font: '700 34px "JetBrains Mono", monospace' }),
  );
  const g = group(d1, d2, ...words);
  return {
    group: g,
    update: (t) => {
      const p = (t % 2.6) / 2.6;
      const roll = p < 0.45 ? easeInOut(p / 0.45) : 1;
      const k = Math.floor(t / 2.6);
      d1.rotation.set((k + roll) * Math.PI * 0.5, (k + roll) * Math.PI, 0);
      d2.rotation.set(0, (k + roll) * Math.PI * 0.5, (k + roll) * Math.PI);
      const hop = p < 0.45 ? Math.sin((p / 0.45) * Math.PI) * 0.6 : 0;
      d1.position.y = -0.55 + hop;
      d2.position.y = -0.55 + hop * 0.8;
      words.forEach((w, i) => (w.visible = (t * 1.2) % 6 > i));
    },
  };
}

/** 1950 · The Imitation Game: a judge can't see who is human. */
function imitationGame(): Built {
  const skin = '#f2b48c';
  const human = group(
    ball(0.32, skin, [0, 0.35, 0]),
    box([0.34, 0.12, 0.3], P.brown, [0, 0.62, -0.02], undefined, 0.06),
    box([0.75, 0.7, 0.45], P.blue, [0, -0.35, 0], undefined, 0.2),
  );
  human.position.set(-1.05, -0.3, 0);
  const robot = group(
    box([0.58, 0.5, 0.5], P.slate, [0, 0.35, 0], undefined, 0.12),
    ball(0.07, glow(P.sky, 2), [-0.12, 0.4, 0.26]),
    ball(0.07, glow(P.sky, 2), [0.12, 0.4, 0.26]),
    cyl(0.02, 0.02, 0.2, P.ink, [0, 0.68, 0]),
    ball(0.05, glow(P.red, 1.5), [0, 0.8, 0]),
    box([0.75, 0.7, 0.45], P.green, [0, -0.35, 0], undefined, 0.2),
  );
  robot.position.set(1.05, -0.3, 0);
  const wall = box([0.18, 1.5, 1.2], P.cream, [0, -0.25, 0], undefined, 0.06);
  const q = group(
    box([0.75, 0.6, 0.25], P.paper, [0, 0, 0], undefined, 0.2),
    cone(0.1, 0.22, P.paper, [-0.18, -0.36, 0], [0, 0, 0.5]),
    label('?', [0.36, 0.36], { pos: [0, 0, 0.13], bg: P.paper, font: '800 200px Inter, sans-serif' }),
  );
  q.position.set(0, 1.0, 0.45);
  q.scale.setScalar(0.85);
  return {
    group: group(human, robot, wall, q),
    update: (t) => {
      q.position.y = 1.0 + Math.sin(t * 2) * 0.06;
      human.rotation.z = Math.sin(t * 1.3) * 0.06;
      robot.rotation.z = Math.sin(t * 1.3 + Math.PI) * 0.06;
    },
  };
}

/** 1956 · Dartmouth: the field gets its name on a blackboard. */
function dartmouth(): Built {
  const boardTex = canvasTexture(512, 300, (ctx, w, h) => {
    ctx.fillStyle = '#24493a';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = '700 46px "Inter Tight", Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ARTIFICIAL', w / 2, 112);
    ctx.fillText('INTELLIGENCE', w / 2, 168);
    ctx.font = '400 30px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('summer 1956', w / 2, 236);
  });
  const board = group(
    box([2.3, 1.42, 0.1], P.brown, [0, 0, -0.03], undefined, 0.04),
    screen(boardTex, [2.15, 1.27], [0, 0, 0.03]),
    box([2.0, 0.06, 0.16], P.brown, [0, -0.72, 0.08], undefined, 0.02),
    box([0.16, 0.05, 0.05], P.paper, [0.6, -0.68, 0.1], undefined, 0.02),
  );
  board.position.y = 0.25;
  board.rotation.x = -0.06;
  const legs = group(rod([-0.8, 1.0, -0.2], [-1.0, -1.0, 0.3], 0.04, P.brown), rod([0.8, 1.0, -0.2], [1.0, -1.0, 0.3], 0.04, P.brown), rod([0, 1.0, -0.25], [0, -1.0, -0.9], 0.04, P.brown));
  return { group: group(legs, board) };
}

/** 1958 · Mark I Perceptron: a grid of photocells learning to see a shape. */
function perceptron(): Built {
  const n = 8;
  const cells: THREE.Mesh[] = [];
  const panel = group(box([2.0, 2.0, 0.2], P.slate, [0, 0, -0.08], undefined, 0.1));
  // A letter "A"-ish target pattern the perceptron is learning.
  const shape = ['...##...', '..#..#..', '.#....#.', '.#....#.', '.######.', '.#....#.', '.#....#.', '........'];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const m = cyl(0.085, 0.085, 0.1, clay(P.ink, { emissive: P.yellow, emissiveIntensity: 0 }), [(j - 3.5) * 0.22, (3.5 - i) * 0.22, 0.05], [Math.PI / 2, 0, 0], 16);
      m.userData.on = shape[i]![j] === '#';
      cells.push(m);
      panel.add(m);
    }
  }
  panel.position.set(-0.4, 0.15, 0);
  panel.rotation.y = 0.25;
  const unit = group(
    box([0.8, 1.4, 0.7], P.navy, [0, -0.3, 0], undefined, 0.1),
    ...[0, 1, 2].map((k) => cyl(0.1, 0.1, 0.06, P.paper, [0, 0.1 - k * 0.35, 0.36], [Math.PI / 2, 0, 0])),
  );
  unit.position.set(1.2, 0, -0.3);
  const cable = tube([[-0.4, -0.9, 0], [0.3, -1.05, 0.2], [1.0, -0.8, 0.1]], 0.05, P.ink);
  return {
    group: group(panel, unit, cable),
    update: (t) => {
      const learned = (Math.sin(t * 0.8) + 1) / 2;
      cells.forEach((c, i) => {
        const target = c.userData.on ? 1 : 0;
        const noise = (Math.sin(i * 12.9898 + Math.floor(t * 3)) + 1) / 2;
        const v = target * learned + noise * (1 - learned) * 0.7;
        (c.material as THREE.MeshPhysicalMaterial).emissiveIntensity = v * 1.8;
      });
    },
  };
}

/** 1966 · ELIZA on a terminal. */
function elizaTerminal(): Built {
  let cursorOn = true;
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = '#071a0e';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#5dff9a';
    ctx.font = '600 26px "JetBrains Mono", monospace';
    const lines = ['> I FEEL SAD TODAY', 'WHY DO YOU FEEL', 'SAD TODAY?', `> ${cursorOn ? '█' : ''}`];
    lines.forEach((l, i) => ctx.fillText(l, 22, 48 + i * 40));
  };
  const tex = canvasTexture(320, 210, draw);
  const monitor = group(
    box([1.9, 1.45, 1.3], P.cream, [0, 0, -0.3], undefined, 0.22),
    box([1.55, 1.1, 0.1], P.ink, [0, 0.03, 0.36], undefined, 0.08),
    screen(tex, [1.4, 0.95], [0, 0.03, 0.42], undefined, 0.9),
  );
  monitor.position.y = 0.2;
  const keyboard = group(box([1.8, 0.14, 0.6], P.cream, [0, 0, 0], [0.12, 0, 0], 0.05));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) keyboard.add(box([0.14, 0.06, 0.12], P.slate, [-0.68 + c * 0.17, 0.08, -0.17 + r * 0.17], [0.12, 0, 0], 0.02));
  keyboard.position.set(0, -0.9, 0.85);
  let last = -1;
  return {
    group: group(monitor, keyboard),
    update: (t) => {
      const k = Math.floor(t * 2);
      if (k !== last) {
        last = k;
        cursorOn = k % 2 === 0;
        tex.redraw();
      }
    },
  };
}

/** 1973 · The first AI winter: a frozen mainframe. */
function aiWinter(): Built {
  const machine = group(
    box([1.5, 1.6, 0.8], P.slate, [0, -0.2, 0], undefined, 0.08),
    ...[0, 1].map((k) => cyl(0.26, 0.26, 0.06, P.ink, [-0.35 + k * 0.7, 0.2, 0.41], [Math.PI / 2, 0, 0])),
    ...[0, 1, 2, 3].map((k) => ball(0.05, glow(k === 0 ? P.red : '#444a5a', 1), [-0.45 + k * 0.3, -0.45, 0.42])),
  );
  const ice = box([1.75, 1.85, 1.05], clay('#bfe3ff', { transparent: true, opacity: 0.32 }), [0, -0.15, 0], undefined, 0.18);
  const snowcap = box([1.85, 0.22, 1.1], P.paper, [0, 0.78, 0], undefined, 0.11);
  const flakes = Array.from({ length: 18 }, (_, i) => {
    const f = ball(0.045, P.paper, [Math.sin(i * 7.1) * 1.7, 0, Math.cos(i * 3.3) * 0.9]);
    f.userData.speed = 0.35 + (i % 5) * 0.08;
    f.userData.offset = i * 0.37;
    return f;
  });
  const report = group(box([0.6, 0.06, 0.8], P.paper, [0, 0, 0], undefined, 0.02), box([0.6, 0.06, 0.8], P.cream, [0.04, 0.07, -0.02], [0, 0.1, 0], 0.02));
  report.position.set(-1.25, -0.95, 0.5);
  return {
    group: group(machine, ice, snowcap, report, ...flakes),
    update: (t) => {
      flakes.forEach((f) => {
        f.position.y = 1.4 - (((t * f.userData.speed + f.userData.offset) % 1) * 2.6);
      });
    },
  };
}

/** 1986 · Backpropagation: the error flows backwards through the layers. */
function backprop(): Built {
  const layers = [3, 4, 3];
  const nodes = layers.map((n, li) =>
    Array.from({ length: n }, (_, i) => ball(0.18, clay(P.blue, { emissive: P.sky, emissiveIntensity: 0 }), [(li - 1) * 1.15, (i - (n - 1) / 2) * 0.58, 0])),
  );
  const links: THREE.Mesh[] = [];
  for (let l = 0; l < 2; l++) for (const a of nodes[l]!) for (const b of nodes[l + 1]!) links.push(rod(a.position.toArray(), b.position.toArray(), 0.02, clay(P.slate, { emissive: P.red, emissiveIntensity: 0 })));
  const arrow = group(rod([1.1, 1.25, 0], [-0.9, 1.25, 0], 0.06, P.red), cone(0.15, 0.3, P.red, [-1.05, 1.25, 0], [0, 0, Math.PI / 2]));
  const err = label('error', [0.7, 0.24], { pos: [1.45, 1.25, 0], bg: P.red, fg: P.paper, font: '700 40px "JetBrains Mono", monospace' });
  return {
    group: group(...links, ...nodes.flat(), arrow, err),
    update: (t) => {
      const p = (t % 3) / 3;
      // forward pass (blue) for the first half, backward (red) for the second.
      nodes.forEach((layer, li) =>
        layer.forEach((n) => {
          const m = n.material as THREE.MeshPhysicalMaterial;
          if (p < 0.5) {
            m.emissive.set(P.sky);
            m.emissiveIntensity = Math.max(0, 1 - Math.abs(p * 2 * 2.5 - li) * 1.4) * 1.3;
          } else {
            m.emissive.set(P.red);
            m.emissiveIntensity = Math.max(0, 1 - Math.abs((p - 0.5) * 2 * 2.5 - (2 - li)) * 1.4) * 1.3;
          }
        }),
      );
      links.forEach((l) => ((l.material as THREE.MeshPhysicalMaterial).emissiveIntensity = p > 0.5 ? 0.5 : 0));
      arrow.visible = err.visible = p > 0.45;
    },
  };
}

/** 1995 · Support vector machine: the widest gap between two groups. */
function svm(): Built {
  const pts: THREE.Mesh[] = [];
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    pts.push(ball(0.13, P.blue, [-0.75 + Math.cos(a) * 0.45, 0.3 + Math.sin(a * 1.3) * 0.5, Math.sin(a) * 0.4]));
    pts.push(ball(0.13, P.orange, [0.75 + Math.cos(a + 1) * 0.45, -0.3 + Math.sin(a * 1.1) * 0.5, Math.cos(a) * 0.4]));
  }
  const plane = box([0.04, 2.0, 1.4], clay(P.paper, { transparent: true, opacity: 0.55 }), [0, 0, 0], [0, 0, 0.35], 0.02);
  const margins = [-0.32, 0.32].map((d) => box([0.02, 2.0, 1.4], clay(P.sky, { transparent: true, opacity: 0.18 }), [d * Math.cos(0.35), d * Math.sin(0.35), 0], [0, 0, 0.35], 0.01));
  const base = box([2.6, 0.08, 1.6], P.ink, [0, -1.05, 0], undefined, 0.04);
  return { group: group(base, plane, ...margins, ...pts), update: (t) => pts.forEach((p, i) => (p.position.y += Math.sin(t * 2 + i) * 0.0008)) };
}

/** 2009 · ImageNet: a wall of labelled photos and a magnifying glass. */
function imagenet(): Built {
  const colors = [P.blue, P.orange, P.green, P.pink, P.yellow, P.teal, P.purple, P.red];
  const tiles: THREE.Group[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      const col = colors[(r * 5 + c * 3) % colors.length]!;
      const t = group(
        box([0.36, 0.36, 0.05], P.paper, [0, 0, 0], undefined, 0.03),
        box([0.3, 0.22, 0.02], col, [0, 0.03, 0.03], undefined, 0.02),
        (r + c) % 3 === 0 ? ball(0.06, P.paper, [0.06, 0.06, 0.05]) : cone(0.08, 0.12, P.ink, [-0.03, -0.01, 0.05]),
      );
      t.position.set((c - 2.5) * 0.42, (1.5 - r) * 0.42 + 0.05, (c % 2) * 0.03);
      tiles.push(t);
    }
  }
  const wall = group(...tiles);
  wall.rotation.y = -0.2;
  const glass = group(
    ring(0.32, 0.06, P.ink),
    new THREE.Mesh(new THREE.CircleGeometry(0.3, 32), clay('#d8f0ff', { transparent: true, opacity: 0.3 })),
    rod([0.24, -0.24, 0], [0.62, -0.62, 0], 0.07, P.brown),
  );
  const tag = label('cat', [0.5, 0.2], { bg: P.yellow, font: '700 40px "JetBrains Mono", monospace' });
  return {
    group: group(wall, glass, tag),
    update: (t) => {
      const x = Math.sin(t * 0.7) * 0.8;
      const y = Math.cos(t * 0.9) * 0.35 + 0.1;
      glass.position.set(x, y, 0.55);
      tag.position.set(x + 0.15, y + 0.5, 0.6);
    },
  };
}

/** 2012 · AlexNet: trained on two gaming graphics cards. */
function alexnet(): Built {
  const fans: THREE.Group[] = [];
  const card = (z: number) => {
    const fan = group(cyl(0.34, 0.34, 0.04, P.ink, [0, 0, 0], [Math.PI / 2, 0, 0]));
    for (let k = 0; k < 7; k++) {
      const blade = box([0.08, 0.3, 0.02], P.slate, [0, 0, 0.03], [0, 0, (k / 7) * Math.PI * 2], 0.01);
      blade.geometry.translate(0, 0.15, 0);
      fan.add(blade);
    }
    fan.position.set(-0.45, 0, 0.1);
    fans.push(fan);
    return group(
      box([2.1, 0.75, 0.16], '#1d2026', [0, 0, 0], undefined, 0.05),
      box([1.95, 0.6, 0.04], '#30343d', [0, 0, 0.08], undefined, 0.03),
      fan,
      box([0.5, 0.06, 0.06], glow(P.green, 1.4), [0.6, 0.25, 0.1], undefined, 0.02),
      box([1.2, 0.12, 0.1], P.gold, [-0.1, -0.42, 0], undefined, 0.02),
      box([0.1, 0.8, 0.22], P.slate, [1.1, 0, 0], undefined, 0.02),
    ).translateZ(z);
  };
  const g = group(card(0.32), card(-0.32));
  g.children.forEach((c, i) => (c.position.y = i ? -0.35 : 0.35));
  const chip = label('GTX 580 ×2', [0.95, 0.22], { pos: [0.55, 0.85, 0.45], bg: P.green, fg: P.ink, font: '700 34px "JetBrains Mono", monospace' });
  g.add(chip);
  g.rotation.set(0.15, -0.35, 0);
  return { group: g, update: (t) => fans.forEach((f, i) => (f.rotation.z = t * (6 + i))) };
}

export const earlyHeroes: Record<string, Builder> = {
  'lovelace-note-g': analyticalEngine,
  'shannon-information': shannonDice,
  'turing-test': imitationGame,
  dartmouth,
  perceptron,
  eliza: elizaTerminal,
  lighthill: aiWinter,
  backprop,
  svm,
  imagenet,
  alexnet,
};

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

/** 2016 · AlphaGo: the board, and move 37 dropping into place. */
function alphago(): Built {
  const n = 9;
  const size = 2.2;
  const gridTex = canvasTexture(512, 512, (ctx, w) => {
    ctx.fillStyle = '#e2b56e';
    ctx.fillRect(0, 0, w, w);
    ctx.strokeStyle = '#4a3220';
    ctx.lineWidth = 4;
    const m = w / (n + 1);
    for (let i = 1; i <= n; i++) {
      ctx.beginPath();
      ctx.moveTo(m, i * m);
      ctx.lineTo(w - m, i * m);
      ctx.moveTo(i * m, m);
      ctx.lineTo(i * m, w - m);
      ctx.stroke();
    }
  });
  const top = screen(gridTex, [size, size], [0, -0.79, 0], [-Math.PI / 2, 0, 0]);
  const board = group(box([size + 0.06, 0.3, size + 0.06], '#c99654', [0, -0.95, 0], undefined, 0.06), top);
  const step = size / (n + 1);
  const at = (i: number, j: number) => [(i - (n - 1) / 2) * step, -0.74, (j - (n - 1) / 2) * step] as const;
  const stone = (color: string, i: number, j: number) => {
    const s = ball(0.1, color, at(i, j));
    s.scale.y = 0.45;
    return s;
  };
  const placed = [
    [2, 2, 1], [3, 3, 0], [6, 2, 1], [5, 6, 0], [2, 6, 1], [3, 5, 0], [6, 5, 1], [4, 4, 0], [4, 3, 1], [5, 3, 0], [2, 4, 1], [7, 4, 0],
  ].map(([i, j, b]) => stone(b ? P.ink : P.paper, i!, j!));
  const move37 = stone(P.ink, 6, 3);
  const halo = ring(0.16, 0.025, glow(P.teal, 2), [at(6, 3)[0], -0.76, at(6, 3)[2]], [Math.PI / 2, 0, 0]);
  const g = group(board, ...placed, move37, halo);
  g.rotation.x = 0.2;
  const label37 = label('move 37', [0.8, 0.24], { pos: [0.9, 0.05, 0.1], bg: P.teal, fg: P.ink, font: '700 38px "JetBrains Mono", monospace' });
  return {
    group: group(g, label37),
    update: (t) => {
      const p = (t % 3.2) / 3.2;
      const drop = p < 0.35 ? 1 - easeInOut(p / 0.35) : 0;
      move37.position.y = -0.74 + drop * 1.4;
      halo.scale.setScalar(p > 0.35 ? 1 + ((p - 0.35) / 0.65) * 1.5 : 0.001);
      (halo.material as THREE.MeshPhysicalMaterial).opacity = 1 - Math.max(0, (p - 0.35) / 0.65);
      (halo.material as THREE.MeshPhysicalMaterial).transparent = true;
      label37.visible = p > 0.35;
    },
  };
}

/** 2017 · The Transformer: every word attends to every other word. */
function transformer(): Built {
  const words = ['the', 'cat', 'sat', 'on', 'it'];
  const xs = words.map((_, i) => (i - 2) * 0.62);
  const tokens = words.map((w, i) =>
    group(box([0.5, 0.36, 0.36], P.paper, [0, 0, 0], undefined, 0.08), label(w, [0.4, 0.2], { pos: [0, 0, 0.185], font: '700 40px "JetBrains Mono", monospace' })).translateX(xs[i]!),
  );
  tokens.forEach((t) => (t.position.y = -0.85));
  const arcs: THREE.Mesh[] = [];
  for (let a = 0; a < words.length; a++) {
    for (let b = a + 1; b < words.length; b++) {
      const r = (xs[b]! - xs[a]!) / 2;
      const arc = ring(r, 0.025, clay(P.purple, { emissive: P.purple, emissiveIntensity: 0.6, transparent: true, opacity: 0.8 }), [(xs[a]! + xs[b]!) / 2, -0.65, 0], [0, 0, 0], Math.PI);
      arc.userData.pair = [a, b];
      arcs.push(arc);
    }
  }
  const layers = [0, 1, 2].map((k) =>
    box([3.2, 0.22, 0.9], clay(k % 2 ? P.sky : '#9fa4ff', { transparent: true, opacity: 0.85 }), [0, 0.75 + k * 0.32, -0.55], undefined, 0.1),
  );
  const nx = label('× N layers', [0.9, 0.22], { pos: [1.15, 1.45, -0.1], bg: P.ink, fg: P.paper, font: '600 34px "JetBrains Mono", monospace' });
  // Tokens, attention arcs and the layer stack together are taller than the
  // stage frame, so shrink and lower the whole model to keep the top in view.
  const model = group(...tokens, ...arcs, ...layers, nx);
  model.scale.setScalar(0.82);
  model.position.y = -0.15;
  return {
    group: group(model),
    update: (t) => {
      const focus = Math.floor(t / 1.4) % words.length;
      arcs.forEach((arc) => {
        const [a, b] = arc.userData.pair as [number, number];
        const on = a === focus || b === focus;
        const m = arc.material as THREE.MeshPhysicalMaterial;
        m.opacity += ((on ? 0.95 : 0.12) - m.opacity) * 0.15;
        m.emissiveIntensity = on ? 1.4 : 0.2;
      });
      tokens.forEach((tk, i) => (tk.position.y = -0.85 + (i === focus ? 0.08 : 0)));
      layers.forEach((l, k) => (l.position.y = 0.75 + k * 0.32 + Math.sin(t * 2 + k) * 0.02));
    },
  };
}

/** 2020 · Scaling laws: make it bigger and it gets predictably better. */
function scaling(): Built {
  const heights = [0.25, 0.42, 0.62, 0.88, 1.2, 1.62];
  const bars = heights.map((h, i) => {
    const b = box([0.34, 1, 0.34], i === heights.length - 1 ? P.blue : P.sky, [(i - 2.5) * 0.46, 0, 0], undefined, 0.06);
    b.userData.h = h * 1.25;
    return b;
  });
  const curve = tube(heights.map((h, i) => [(i - 2.5) * 0.46, -1 + h * 1.25 + 0.22, 0.2] as const), 0.035, glow(P.yellow, 1.2));
  const tag = label('175B', [0.6, 0.24], { pos: [1.15, 1.32, 0.2], bg: P.yellow, font: '800 44px "JetBrains Mono", monospace' });
  const base = box([3.0, 0.08, 0.8], P.ink, [0, -1.02, 0], undefined, 0.03);
  return {
    group: group(base, ...bars, curve, tag),
    update: (t) => {
      const p = Math.min(((t % 4) / 4) * 1.6, 1);
      bars.forEach((b, i) => {
        const k = easeInOut(Math.min(Math.max(p * heights.length - i, 0), 1));
        const h = Math.max(0.02, b.userData.h * k);
        b.scale.y = h;
        b.position.y = -1 + h / 2;
      });
      curve.visible = tag.visible = p >= 1;
    },
  };
}

/** 2020 · AlphaFold: a protein folding into its 3D shape. */
function alphafold(): Built {
  const pts: [number, number, number][] = [];
  // helix
  for (let i = 0; i <= 40; i++) {
    const a = i * 0.55;
    pts.push([-0.9 + Math.cos(a) * 0.32, -0.9 + i * 0.045, Math.sin(a) * 0.32]);
  }
  // loop over, then a second helix coming down
  pts.push([-0.4, 1.15, 0.3], [0.2, 1.05, 0.5]);
  for (let i = 0; i <= 36; i++) {
    const a = i * 0.55;
    pts.push([0.75 + Math.cos(a) * 0.3, 0.95 - i * 0.045, Math.sin(a) * 0.3]);
  }
  pts.push([0.4, -0.9, 0.6], [-0.2, -0.75, 0.75], [0.1, -0.2, 0.9]);
  const split = 43;
  const helixA = tube(pts.slice(0, split), 0.075, clay(P.teal, { emissive: P.teal, emissiveIntensity: 0.15 }));
  const helixB = tube(pts.slice(split - 1), 0.075, clay(P.pink, { emissive: P.pink, emissiveIntensity: 0.12 }));
  // β-sheets: flat arrows lying side by side, the other common protein shape.
  const sheet = (z: number) =>
    group(box([0.75, 0.05, 0.2], P.yellow, [0, 0, 0], undefined, 0.02), cone(0.17, 0.25, P.yellow, [0.48, 0, 0], [0, 0, -Math.PI / 2])).translateZ(z);
  const sheets = group(sheet(-0.28), sheet(0), sheet(0.28));
  sheets.children[1]!.rotation.y = Math.PI;
  sheets.position.set(0.05, -0.15, -0.45);
  sheets.rotation.z = 0.4;
  const g = group(helixA, helixB, sheets);
  return { group: g, update: (t) => (g.rotation.y = t * 0.3) };
}

/** 2022 · RLHF: people pick the better answer, and the model learns from it. */
function rlhf(): Built {
  const card = (x: number, good: boolean) => {
    const badge = group(
      cyl(0.24, 0.24, 0.1, good ? P.green : P.red, [0, 0, 0], [Math.PI / 2, 0, 0]),
      ...(good
        ? [box([0.06, 0.16, 0.06], P.paper, [-0.06, -0.02, 0.06], [0, 0, 0.75], 0.02), box([0.06, 0.28, 0.06], P.paper, [0.05, 0.03, 0.06], [0, 0, -0.6], 0.02)]
        : [box([0.06, 0.3, 0.06], P.paper, [0, 0, 0.06], [0, 0, 0.78], 0.02), box([0.06, 0.3, 0.06], P.paper, [0, 0, 0.06], [0, 0, -0.78], 0.02)]),
    );
    badge.position.set(0.5, 0.62, 0.15);
    const c = group(
      box([1.25, 1.5, 0.14], P.paper, [0, 0, 0], undefined, 0.1),
      label(good ? 'A' : 'B', [0.3, 0.3], { pos: [-0.4, 0.5, 0.075], bg: P.paper, font: '800 160px Inter, sans-serif' }),
      ...[0, 1, 2, 3].map((k) => box([0.9 - (k % 2) * 0.3, 0.07, 0.03], '#cfd3dc', [-0.05 - (k % 2) * 0.15, 0.1 - k * 0.2, 0.08], undefined, 0.03)),
      badge,
    );
    c.position.x = x;
    c.rotation.y = x > 0 ? -0.2 : 0.2;
    return { c, badge };
  };
  const a = card(-0.75, true);
  const b = card(0.75, false);
  return {
    group: group(a.c, b.c),
    update: (t) => {
      const p = (t % 2.5) / 2.5;
      a.badge.scale.setScalar(p < 0.2 ? easeInOut(p / 0.2) * 1.15 : 1);
      a.c.position.y = Math.sin(t * 2) * 0.05 + 0.05;
      b.c.position.y = -0.05;
    },
  };
}

/** 2022 · Image generators: a picture emerging from noise, step by step. */
function diffusionCanvas(): Built {
  const W = 96;
  const scene = (ctx: CanvasRenderingContext2D) => {
    const g = ctx.createLinearGradient(0, 0, 0, W);
    g.addColorStop(0, '#ffb36b');
    g.addColorStop(1, '#ff6fa8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, W);
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(64, 34, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5b3b8c';
    ctx.beginPath();
    ctx.moveTo(0, 80);
    ctx.lineTo(30, 46);
    ctx.lineTo(52, 70);
    ctx.lineTo(74, 50);
    ctx.lineTo(96, 76);
    ctx.lineTo(96, 96);
    ctx.lineTo(0, 96);
    ctx.fill();
    ctx.fillStyle = '#2d1f52';
    ctx.fillRect(0, 84, W, 12);
  };
  const clean = document.createElement('canvas');
  clean.width = clean.height = W;
  scene(clean.getContext('2d')!);
  const cleanData = clean.getContext('2d')!.getImageData(0, 0, W, W).data;
  let noiseLevel = 1;
  const tex = canvasTexture(W, W, (ctx) => {
    const img = ctx.createImageData(W, W);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = Math.random() * 255;
      for (let c = 0; c < 3; c++) img.data[i + c] = cleanData[i + c]! * (1 - noiseLevel) + n * noiseLevel;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  });
  tex.magFilter = THREE.NearestFilter;
  const frame = group(box([1.9, 1.9, 0.12], P.paper, [0, 0, 0], undefined, 0.05), screen(tex, [1.7, 1.7], [0, 0, 0.065]));
  frame.position.y = 0.3;
  frame.rotation.x = -0.08;
  const easel = group(rod([-0.7, 1.0, -0.1], [-0.95, -1.0, 0.3], 0.045, P.brown), rod([0.7, 1.0, -0.1], [0.95, -1.0, 0.3], 0.045, P.brown), rod([0, 1.0, -0.15], [0, -1.0, -0.8], 0.045, P.brown), box([1.6, 0.06, 0.2], P.brown, [0, -0.7, 0.12], undefined, 0.02));
  const brush = group(rod([0, 0, 0], [0, 0.8, 0], 0.035, P.brown), cone(0.07, 0.2, P.pink, [0, 0.9, 0]));
  brush.position.set(1.1, -0.6, 0.5);
  brush.rotation.z = 0.5;
  let last = -1;
  return {
    group: group(easel, frame, brush),
    update: (t) => {
      const p = (t % 5) / 5;
      const k = Math.floor(t * 12);
      if (k !== last) {
        last = k;
        noiseLevel = p < 0.75 ? 1 - easeInOut(p / 0.75) : 0;
        tex.redraw();
      }
    },
  };
}

/** 2023 · GPT-4, Claude and Gemini: three labs on the podium. */
function frontierRace(): Built {
  const steps = [
    { x: -0.85, h: 0.55, c: P.emerald },
    { x: 0, h: 0.85, c: '#d97757' },
    { x: 0.85, h: 0.4, c: P.blue },
  ];
  const orbs = steps.map((s) => ball(0.3, clay(s.c, { emissive: s.c, emissiveIntensity: 0.35 }), [s.x, -1 + s.h + 0.38, 0]));
  const podium = group(...steps.map((s) => box([0.8, s.h, 0.8], P.paper, [s.x, -1 + s.h / 2, 0], undefined, 0.06)));
  return {
    group: group(podium, ...orbs),
    update: (t) => {
      orbs.forEach((o, i) => {
        const s = steps[i]!;
        o.position.y = -1 + s.h + 0.4 + Math.abs(Math.sin(t * 1.8 + i * 1.3)) * 0.25;
      });
    },
  };
}

/** 2024 · Sora: a movie camera that films worlds that don't exist. */
function movieCamera(): Built {
  const reel = (x: number) => {
    const r = group(cyl(0.42, 0.42, 0.12, P.ink, [0, 0, 0], [0, 0, Math.PI / 2]));
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      r.add(cyl(0.08, 0.08, 0.14, P.slate, [0, Math.cos(a) * 0.22, Math.sin(a) * 0.22], [0, 0, Math.PI / 2]));
    }
    r.position.set(x, 0.75, 0);
    return r;
  };
  const r1 = reel(-0.05);
  const r2 = reel(-0.05);
  r1.position.z = -0.42;
  r2.position.z = 0.42;
  r1.rotation.y = r2.rotation.y = Math.PI / 2;
  const cam = group(
    box([1.6, 0.85, 0.75], P.pink, [0, 0, 0], undefined, 0.16),
    cyl(0.28, 0.36, 0.55, P.ink, [1.05, 0, 0], [0, 0, Math.PI / 2]),
    cyl(0.24, 0.24, 0.04, glow(P.sky, 0.8), [1.33, 0, 0], [0, 0, Math.PI / 2]),
    r1,
    r2,
    rod([-0.2, -0.43, 0], [-0.7, -1.05, 0.5], 0.04, P.ink),
    rod([-0.2, -0.43, 0], [-0.7, -1.05, -0.5], 0.04, P.ink),
    rod([-0.2, -0.43, 0], [0.4, -1.05, 0], 0.04, P.ink),
  );
  cam.rotation.y = -0.5;
  cam.position.y = 0.05;
  return {
    group: cam,
    update: (t) => {
      r1.rotation.x = r2.rotation.x = t * 2;
    },
  };
}

/** 2024 · o1: thinking step by step before answering. */
function thinking(): Built {
  const skin = '#cfd3ff';
  const head = group(
    ball(0.55, skin, [0, 0, 0]),
    box([0.3, 0.3, 0.3], skin, [0.15, -0.55, 0], undefined, 0.1),
    ball(0.07, P.ink, [0.2, 0.08, 0.48]),
    ball(0.07, P.ink, [0.45, 0.08, 0.28]),
    box([0.22, 0.05, 0.05], P.ink, [0.35, -0.18, 0.4], [0, 0.6, 0.15], 0.02),
  );
  head.rotation.y = 0.5;
  head.position.set(-0.9, -0.45, 0);
  const bubbles = [0.1, 0.15, 0.2, 0.26].map((r, i) => ball(r, clay(P.paper, { emissive: P.yellow, emissiveIntensity: 0 }), [-0.45 + i * 0.32, 0.15 + i * 0.28, 0]));
  const bulb = group(
    ball(0.38, clay('#fff6c9', { emissive: P.yellow, emissiveIntensity: 0, transparent: true, opacity: 0.95 }), [0, 0.12, 0]),
    cyl(0.17, 0.15, 0.3, P.slate, [0, -0.32, 0]),
    ...[0, 1, 2].map((k) => ring(0.16, 0.025, P.ink, [0, -0.25 - k * 0.08, 0], [Math.PI / 2, 0, 0])),
  );
  bulb.position.set(1.0, 1.0, 0);
  const bulbGlass = bulb.children[0] as THREE.Mesh;
  return {
    group: group(head, ...bubbles, bulb),
    update: (t) => {
      const p = (t % 3.5) / 3.5;
      bubbles.forEach((b, i) => {
        const on = p * 6 > i && p * 6 < i + 1.5;
        (b.material as THREE.MeshPhysicalMaterial).emissiveIntensity = on ? 0.6 : 0;
        b.scale.setScalar(on ? 1.15 : 1);
      });
      const lit = p > 0.7 ? Math.min((p - 0.7) / 0.1, 1) : 0;
      (bulbGlass.material as THREE.MeshPhysicalMaterial).emissiveIntensity = lit * 2.2;
      bulb.scale.setScalar(1 + lit * 0.08);
    },
  };
}

/** 2024 · Computer use + MCP: a model gets hands, and a standard plug. */
function computerUse(): Built {
  const scr = canvasTexture(320, 200, (ctx, w, h) => {
    ctx.fillStyle = '#f5f6fa';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2b2b38';
    ctx.fillRect(0, 0, w, 26);
    ['#ef5b4f', '#f6cd4b', '#3fbf7f'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(16 + i * 16, 13, 5, 0, 7);
      ctx.fill();
    });
    ctx.fillStyle = '#cfd3dc';
    for (let i = 0; i < 3; i++) ctx.fillRect(24, 50 + i * 28, 200 - i * 50, 12);
    ctx.fillStyle = '#10a37f';
    ctx.fillRect(180, 140, 110, 34);
  });
  const lid = group(box([2.0, 1.3, 0.08], P.slate, [0, 0.65, 0], undefined, 0.06), screen(scr, [1.84, 1.14], [0, 0.65, 0.045]));
  lid.rotation.x = -0.18;
  const laptop = group(box([2.0, 0.08, 1.3], P.slate, [0, 0, 0.65], undefined, 0.05), lid);
  laptop.position.set(-0.2, -0.85, -0.4);
  const cursorShape = new THREE.Shape();
  cursorShape.moveTo(0, 0);
  cursorShape.lineTo(0, -0.4);
  cursorShape.lineTo(0.11, -0.3);
  cursorShape.lineTo(0.18, -0.46);
  cursorShape.lineTo(0.25, -0.43);
  cursorShape.lineTo(0.17, -0.27);
  cursorShape.lineTo(0.3, -0.27);
  cursorShape.closePath();
  const cursor = new THREE.Mesh(new THREE.ExtrudeGeometry(cursorShape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 }), clay(P.ink));
  const plug = group(
    box([0.42, 0.22, 0.3], P.paper, [0, 0, 0], undefined, 0.08),
    box([0.2, 0.1, 0.16], P.slate, [-0.28, 0, 0], undefined, 0.04),
    tube([[0.2, 0, 0], [0.5, -0.05, 0], [0.7, -0.2, 0.1], [0.85, -0.3, 0.2]], 0.05, P.paper),
  );
  const tag = label('MCP', [0.5, 0.2], { bg: P.emerald, fg: P.paper, font: '800 46px "JetBrains Mono", monospace' });
  return {
    group: group(laptop, cursor, plug, tag),
    update: (t) => {
      const p = (t % 3) / 3;
      const k = easeInOut(Math.min(p * 1.8, 1));
      cursor.position.set(-0.9 + k * 1.15, 0.55 - k * 0.55, 0.0);
      cursor.scale.setScalar(p > 0.6 && p < 0.7 ? 0.85 : 1);
      const plugIn = easeInOut(Math.min(((t + 1) % 3) / 1.2, 1));
      plug.position.set(1.35 - plugIn * 0.3, -0.72, 0.25);
      tag.position.set(1.35 - plugIn * 0.3, -0.38, 0.25);
    },
  };
}

/** 2025 · DeepSeek-R1: an open model and a one-day market shock. */
function marketShock(): Built {
  const values = [1.5, 1.6, 1.55, 1.7, 1.65, 0.75];
  const bars = values.map((v, i) => box([0.3, v, 0.3], i === values.length - 1 ? P.red : P.green, [(i - 2.5) * 0.42, -1 + v / 2, 0], undefined, 0.05));
  const arrow = group(rod([0.55, 1.0, 0.3], [1.05, 0.0, 0.3], 0.06, P.red), cone(0.15, 0.3, P.red, [1.12, -0.12, 0.3], [0, 0, Math.PI * 0.85]));
  const tag = label('−$590B', [0.85, 0.26], { pos: [-0.75, 1.0, 0.3], bg: P.red, fg: P.paper, font: '800 46px "JetBrains Mono", monospace' });
  const lock = group(
    box([0.42, 0.34, 0.2], P.yellow, [0, 0, 0], undefined, 0.06),
    ring(0.13, 0.04, P.slate, [-0.12, 0.25, 0], [0, 0, 0], Math.PI),
  );
  lock.position.set(1.45, -0.75, 0.3);
  const base = box([3.0, 0.08, 0.7], P.ink, [0, -1.02, 0], undefined, 0.03);
  return {
    group: group(base, ...bars, arrow, tag, lock),
    update: (t) => {
      const p = (t % 3) / 3;
      const last = bars[bars.length - 1]!;
      const h = p < 0.3 ? 1.7 - easeInOut(p / 0.3) * 0.95 : 0.75;
      last.scale.y = h / 0.75;
      last.position.y = -1 + h / 2;
      arrow.visible = tag.visible = p > 0.3;
      lock.rotation.y = Math.sin(t) * 0.3;
    },
  };
}

/** 2025 · Claude Code: an agent working in a terminal. */
function terminalAgent(): Built {
  const lines = ['> fix the failing test', '  reading 12 files…', '  editing auth.ts', '  running tests…', '  ✓ 48 passed'];
  let shown = 0;
  const tex = canvasTexture(420, 280, (ctx, w, h) => {
    ctx.fillStyle = '#12131c';
    ctx.fillRect(0, 0, w, h);
    ctx.font = '600 24px "JetBrains Mono", monospace';
    lines.slice(0, shown).forEach((l, i) => {
      ctx.fillStyle = i === 0 ? '#f3e9d6' : l.includes('✓') ? '#5dff9a' : '#d9a0ff';
      ctx.fillText(l, 20, 46 + i * 44);
    });
  });
  const term = group(
    box([2.5, 1.75, 0.14], '#22232f', [0, 0, 0], undefined, 0.12),
    box([2.5, 0.22, 0.16], '#2f3040', [0, 0.77, 0.01], undefined, 0.08),
    ...['#ef5b4f', '#f6cd4b', '#3fbf7f'].map((c, i) => ball(0.04, c, [-1.08 + i * 0.13, 0.77, 0.1])),
    screen(tex, [2.3, 1.45], [0, -0.1, 0.075], undefined, 0.8),
  );
  term.position.y = 0.1;
  const spark = ball(0.12, glow('#d97757', 1.8), [1.25, 0.95, 0.2]);
  let last = -1;
  return {
    group: group(term, spark),
    update: (t) => {
      const k = Math.min(Math.floor((t % 6) / 0.8), lines.length);
      if (k !== last) {
        last = k;
        shown = k;
        tex.redraw();
      }
      spark.position.y = 0.95 + Math.sin(t * 3) * 0.08;
      spark.scale.setScalar(1 + Math.sin(t * 6) * 0.15);
    },
  };
}

/** 2026 · Agents for office work: a desk where the work gets done for you. */
function desk(): Built {
  const top = box([2.6, 0.12, 1.3], P.brown, [0, -0.35, 0], undefined, 0.04);
  const legs = [[-1.2, -0.55], [1.2, -0.55], [-1.2, 0.55], [1.2, 0.55]].map(([x, z]) => cyl(0.05, 0.05, 0.65, P.ink, [x!, -0.72, z!]));
  const lid = box([1.1, 0.72, 0.05], P.slate, [-0.35, 0.08, -0.35], [-0.2, 0, 0], 0.04);
  const glowScr = box([0.98, 0.6, 0.02], glow('#d97757', 0.5), [-0.35, 0.08, -0.32], [-0.2, 0, 0], 0.02);
  const laptopBase = box([1.1, 0.05, 0.7], P.slate, [-0.35, -0.27, 0.0], undefined, 0.03);
  const folders = [P.blue, P.yellow, P.green].map((c, i) => box([0.62, 0.06, 0.45], c, [0.75, -0.26 + i * 0.07, 0.15], [0, 0.1 * i, 0], 0.02));
  const mug = group(cyl(0.12, 0.11, 0.24, P.paper, [0, 0, 0]), ring(0.07, 0.025, P.paper, [0.13, 0, 0], [0, 0, 0]));
  mug.position.set(0.8, -0.17, -0.35);
  const check = group(
    cyl(0.2, 0.2, 0.06, P.green, [0, 0, 0], [Math.PI / 2, 0, 0]),
    box([0.05, 0.14, 0.05], P.paper, [-0.05, -0.02, 0.04], [0, 0, 0.75], 0.02),
    box([0.05, 0.24, 0.05], P.paper, [0.04, 0.03, 0.04], [0, 0, -0.6], 0.02),
  );
  return {
    group: group(top, ...legs, laptopBase, lid, glowScr, ...folders, mug, check),
    update: (t) => {
      const p = (t % 2.4) / 2.4;
      check.position.set(0.75, 0.05 + easeInOut(Math.min(p * 2, 1)) * 0.55, 0.15);
      check.scale.setScalar(p < 0.8 ? 1 : 1 - (p - 0.8) * 5);
    },
  };
}

/** 2026 · GPT-6 Astra: is this AGI? A benchmark gauge that won't settle. */
function agiQuestion(): Built {
  const q = group(
    ring(0.48, 0.13, glow(P.red, 0.5), [0, 0.65, 0], [0, 0, -Math.PI / 2.2], Math.PI * 1.35),
    rod([0.05, 0.2, 0], [0, -0.2, 0], 0.13, glow(P.red, 0.5)),
    ball(0.15, glow(P.red, 0.5), [0, -0.62, 0]),
  );
  q.position.set(-0.75, 0.2, 0);
  const needle = box([0.05, 0.62, 0.05], P.ink, [0, 0.31, 0], undefined, 0.02);
  const gauge = group(
    ring(0.7, 0.08, P.paper, [0, 0, 0], [0, 0, 0], Math.PI),
    ...[0, 1, 2, 3, 4].map((k) => box([0.04, 0.14, 0.04], P.slate, [Math.cos((k / 4) * Math.PI) * 0.56, Math.sin((k / 4) * Math.PI) * 0.56, 0.05], [0, 0, (k / 4) * Math.PI - Math.PI / 2], 0.01)),
    group(needle),
    ball(0.08, P.ink, [0, 0, 0.04]),
    label('AGI?', [0.6, 0.22], { pos: [0, -0.22, 0.05], bg: P.ink, fg: P.paper, font: '800 46px "JetBrains Mono", monospace' }),
  );
  gauge.position.set(0.8, -0.35, 0.1);
  const needlePivot = gauge.children[6] as THREE.Group;
  const ped = cyl(0.55, 0.65, 0.3, P.ink, [-0.75, -0.92, 0]);
  return {
    group: group(q, gauge, ped),
    update: (t) => {
      needlePivot.rotation.z = -0.4 + Math.sin(t * 1.3) * 0.75 + Math.sin(t * 3.1) * 0.1;
      q.rotation.y = Math.sin(t * 0.9) * 0.4;
    },
  };
}

/** 2025 · Veo 3 & Genie 3: a tiny generated world you can walk around. */
function tinyWorld(): Built {
  const island = group(
    cyl(1.25, 0.9, 0.5, P.brown, [0, -0.75, 0], undefined, 40),
    cyl(1.27, 1.27, 0.12, P.green, [0, -0.47, 0], undefined, 40),
  );
  const tree = (x: number, z: number, s: number) =>
    group(cyl(0.06, 0.08, 0.35, P.brown, [x, -0.25, z]), cone(0.28 * s, 0.6 * s, '#2f9e63', [x, 0.15 * s, z]), cone(0.22 * s, 0.45 * s, '#3fbf7f', [x, 0.42 * s, z]));
  const house = group(box([0.45, 0.38, 0.4], P.cream, [0, 0, 0], undefined, 0.04), cone(0.38, 0.32, P.red, [0, 0.35, 0], [0, Math.PI / 4, 0]));
  house.position.set(-0.45, -0.2, -0.35);
  const walker = group(cyl(0.08, 0.1, 0.24, P.pink, [0, 0, 0]), ball(0.08, '#f2b48c', [0, 0.19, 0]));
  const pond = cyl(0.3, 0.3, 0.02, glow(P.sky, 0.3), [0.5, -0.4, 0.45]);
  const cloud = group(ball(0.2, P.paper, [0, 0, 0]), ball(0.15, P.paper, [0.2, -0.03, 0]), ball(0.14, P.paper, [-0.18, -0.04, 0]));
  return {
    group: group(island, tree(0.6, -0.4, 1), tree(0.85, 0.15, 0.8), tree(-0.8, 0.35, 0.9), house, pond, walker, cloud),
    update: (t) => {
      const a = t * 0.6;
      walker.position.set(Math.cos(a) * 0.6, -0.3 + Math.abs(Math.sin(t * 6)) * 0.04, Math.sin(a) * 0.6);
      walker.rotation.y = -a;
      cloud.position.set(Math.sin(t * 0.3) * 0.8, 1.0, -0.3);
    },
  };
}

/** 2026 · Personal agents: always-on helpers orbiting your phone. */
function personalAgents(): Built {
  const scr = canvasTexture(180, 360, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1d2140');
    g.addColorStop(1, '#3a1f4d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    [0, 1, 2].forEach((i) => ctx.fillRect(22, 70 + i * 70, 136, 44));
  });
  const phone = group(box([0.95, 1.85, 0.12], P.ink, [0, 0, 0], undefined, 0.14), screen(scr, [0.83, 1.66], [0, 0, 0.065], undefined, 0.7));
  phone.rotation.set(-0.15, 0.25, 0);
  const dots = [P.emerald, P.orange, P.sky].map((c) => ball(0.17, glow(c, 0.8)));
  return {
    group: group(phone, ...dots),
    update: (t) => {
      dots.forEach((d, i) => {
        const a = t * 0.9 + (i / 3) * Math.PI * 2;
        d.position.set(Math.cos(a) * 1.25, Math.sin(a * 2) * 0.3 + (i - 1) * 0.35, Math.sin(a) * 0.7);
      });
    },
  };
}

/** 2026 · Project Glasswing: finding the bugs before attackers do. */
function bugHunt(): Built {
  const body = ball(0.42, P.ink, [0, 0, 0]);
  body.scale.set(1, 0.55, 1.35);
  const legs: THREE.Mesh[] = [];
  for (let s = -1; s <= 1; s += 2) for (let k = -1; k <= 1; k++) legs.push(rod([s * 0.3, -0.05, k * 0.3], [s * 0.65, -0.28, k * 0.45], 0.03, P.ink));
  const bug = group(
    body,
    ball(0.2, P.ink, [0, 0.02, 0.6]),
    ball(0.05, glow(P.red, 1.6), [-0.08, 0.1, 0.75]),
    ball(0.05, glow(P.red, 1.6), [0.08, 0.1, 0.75]),
    ...legs,
    rod([0.06, 0.12, 0.72], [0.25, 0.45, 1.0], 0.02, P.ink),
    rod([-0.06, 0.12, 0.72], [-0.25, 0.45, 1.0], 0.02, P.ink),
  );
  bug.scale.setScalar(0.85);
  const s = new THREE.Shape();
  s.moveTo(0, 0.7);
  s.bezierCurveTo(0.35, 0.6, 0.6, 0.6, 0.62, 0.55);
  s.bezierCurveTo(0.62, 0.05, 0.45, -0.4, 0, -0.7);
  s.bezierCurveTo(-0.45, -0.4, -0.62, 0.05, -0.62, 0.55);
  s.bezierCurveTo(-0.6, 0.6, -0.35, 0.6, 0, 0.7);
  const shieldGeo = new THREE.ExtrudeGeometry(s, { depth: 0.15, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, curveSegments: 24 });
  shieldGeo.center();
  const shield = new THREE.Mesh(shieldGeo, clay(P.rose));
  shield.position.set(1.1, 0.4, -0.2);
  const glass = group(ring(0.42, 0.06, P.paper), new THREE.Mesh(new THREE.CircleGeometry(0.4, 32), clay('#d8f0ff', { transparent: true, opacity: 0.25 })), rod([0.3, -0.3, 0], [0.7, -0.7, 0], 0.07, P.slate));
  const ground = box([2.8, 0.06, 1.8], '#1d2236', [0, -1.0, 0], undefined, 0.03);
  return {
    group: group(ground, bug, shield, glass),
    update: (t) => {
      const a = t * 0.7;
      bug.position.set(Math.sin(a) * 0.6 - 0.3, -0.72, Math.cos(a) * 0.3);
      bug.rotation.y = a + Math.PI / 2;
      legs.forEach((l, i) => (l.rotation.x = Math.sin(t * 12 + i) * 0.15));
      glass.position.set(bug.position.x + 0.1, 0.2, bug.position.z + 0.5);
      glass.rotation.x = -0.5;
    },
  };
}

/** 2025 · Robot foundation models: an arm that picks things up from instructions. */
function robotArm(): Built {
  const cubeMesh = box([0.3, 0.3, 0.3], P.orange, [0, 0, 0], undefined, 0.06);
  const fingerL = box([0.06, 0.26, 0.12], P.slate, [-0.12, -0.12, 0], undefined, 0.02);
  const fingerR = box([0.06, 0.26, 0.12], P.slate, [0.12, -0.12, 0], undefined, 0.02);
  const hand = group(box([0.34, 0.1, 0.18], P.ink, [0, 0, 0], undefined, 0.03), fingerL, fingerR, ball(0.05, glow(P.sky, 2), [0, 0.06, 0.1]));
  const forearm = group(box([0.16, 0.8, 0.16], P.yellow, [0, 0.4, 0], undefined, 0.06), ball(0.13, P.ink, [0, 0, 0]));
  hand.position.y = 0.88;
  forearm.add(hand);
  const upper = group(box([0.2, 0.95, 0.2], P.yellow, [0, 0.47, 0], undefined, 0.07), ball(0.16, P.ink, [0, 0, 0]));
  forearm.position.y = 0.95;
  upper.add(forearm);
  const base = group(cyl(0.45, 0.55, 0.22, P.ink, [0, -0.89, 0]), cyl(0.22, 0.26, 0.25, P.slate, [0, -0.66, 0]));
  upper.position.y = -0.5;
  const turret = group(upper);
  base.add(turret);
  const pad = box([0.5, 0.04, 0.5], P.paper, [0.9, -0.98, 0.3], undefined, 0.02);
  cubeMesh.position.set(-0.9, -0.83, 0.3);
  return {
    group: group(base, pad, cubeMesh),
    update: (t) => {
      const p = (t % 5) / 5;
      // reach to cube → grip → swing → release over pad → return
      const seg = (a: number, b: number) => easeInOut(Math.min(Math.max((p - a) / (b - a), 0), 1));
      const swing = seg(0.35, 0.65) - seg(0.85, 1);
      turret.rotation.y = Math.PI * 0.82 - swing * Math.PI * 0.64;
      const reach = seg(0.05, 0.25) - seg(0.28, 0.35) + seg(0.65, 0.72) - seg(0.75, 0.82);
      upper.rotation.z = 0.25 + reach * 0.55;
      forearm.rotation.z = 1.2 + reach * 0.75;
      hand.rotation.z = -(upper.rotation.z + forearm.rotation.z) + Math.PI;
      const grip = p > 0.25 && p < 0.72;
      fingerL.position.x = grip ? -0.17 : -0.12;
      fingerR.position.x = grip ? 0.17 : 0.12;
      if (grip && p > 0.28) {
        hand.updateWorldMatrix(true, false);
        const w = new THREE.Vector3(0, -0.2, 0).applyMatrix4(hand.matrixWorld);
        cubeMesh.parent?.worldToLocal(w);
        cubeMesh.position.copy(w);
      } else if (p >= 0.72) {
        cubeMesh.position.y += (-0.79 - cubeMesh.position.y) * 0.3;
      } else {
        cubeMesh.position.set(-0.9, -0.83, 0.3);
      }
    },
  };
}

export const modernHeroes: Record<string, Builder> = {
  alphago,
  transformer,
  'scaling-laws-gpt3': scaling,
  alphafold,
  'instructgpt-chinchilla': rlhf,
  'image-gen-boom': diffusionCanvas,
  'gpt4-claude': frontierRace,
  'sora-preview': movieCamera,
  'o1-reasoning': thinking,
  'computer-use-mcp': computerUse,
  'deepseek-r1': marketShock,
  'claude-code': terminalAgent,
  'claude-cowork-opus46': desk,
  'gpt6-astra': agiQuestion,
  'veo3-genie3': tinyWorld,
  'personal-agents': personalAgents,
  'glasswing-mythos': bugHunt,
  'robotics-vla': robotArm,
};

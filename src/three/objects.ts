import * as THREE from 'three';
import type { TrackId } from '../data/tracks';
import {
  ball,
  box,
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
  slab,
} from './kit';

/**
 * The object library. Each builder returns a group sized to sit within a
 * ~2.5-unit radius, resting on y ≈ -1, plus an optional idle animation.
 */
export interface Built {
  group: THREE.Group;
  update?: (time: number) => void;
}
export type Builder = () => Built;

// ───────────────────────── Hero objects (turning points) ─────────────────────────

/** 1936 · A head reading and writing symbols on an endless tape. */
function turingMachine(): Built {
  const cell = 0.46;
  const symbols = ['1', '0', '1', '1', '0', ' ', '1', '0', '1'];
  const tape = group(
    box([cell * symbols.length + 0.3, 0.12, 0.7], P.ink, [0, -0.95, 0], undefined, 0.05),
    ...symbols.map((s, i) => {
      const x = (i - (symbols.length - 1) / 2) * cell;
      return group(
        box([cell - 0.05, 0.36, 0.5], P.cream, [x, -0.7, 0], undefined, 0.07),
        label(s, [0.26, 0.26], { pos: [x, -0.7, 0.252], bg: P.cream }),
      );
    }),
  );

  const dialNeedle = box([0.04, 0.22, 0.04], P.ink, [0, 0.1, 0], undefined, 0.015);
  const dial = group(
    cyl(0.24, 0.24, 0.08, P.paper, [0, 0, 0], [Math.PI / 2, 0, 0]),
    group(dialNeedle),
  );
  dial.position.set(0, 0.55, 0.32);
  const needlePivot = dial.children[1] as THREE.Group;
  needlePivot.position.set(0, 0, 0.06);

  const head = group(
    box([0.9, 0.75, 0.64], P.red, [0, 0.45, 0], undefined, 0.16),
    box([0.5, 0.26, 0.5], P.red, [0, -0.02, 0], undefined, 0.08),
    cone(0.12, 0.22, P.ink, [0, -0.25, 0], [Math.PI, 0, 0]),
    ball(0.06, glow(P.yellow), [0.3, 0.68, 0.33]),
    dial,
  );
  head.position.y = -0.05;

  const g = group(tape, head);
  g.position.y = 0.1;
  return {
    group: g,
    update: (t) => {
      // Step the head along the tape, cell by cell, back and forth.
      const steps = 6;
      const period = 0.9;
      const k = Math.floor(t / period);
      const phase = easeInOut(Math.min(((t % period) / period) * 1.6, 1));
      const pos = (n: number) => {
        const m = ((n % (2 * steps)) + 2 * steps) % (2 * steps);
        return (m <= steps ? m : 2 * steps - m) - steps / 2;
      };
      head.position.x = (pos(k) + (pos(k + 1) - pos(k)) * phase) * cell;
      needlePivot.rotation.z = -(k + phase) * (Math.PI / 3);
    },
  };
}

/** 1997 · The supercomputer cabinet and the board where it beat Kasparov. */
function deepBlue(): Built {
  const tile = 0.2;
  const board = group(box([tile * 8 + 0.16, 0.12, tile * 8 + 0.16], P.brown, [0, -0.96, 0], undefined, 0.05));
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      board.add(
        box(
          [tile - 0.01, 0.04, tile - 0.01],
          (i + j) % 2 ? P.cream : '#6b4a33',
          [(i - 3.5) * tile, -0.88, (j - 3.5) * tile],
          undefined,
          0.01,
        ),
      );
    }
  }
  const king = (color: string, x: number, z: number) =>
    group(
      cyl(0.075, 0.09, 0.06, color, [x, -0.83, z]),
      cyl(0.045, 0.07, 0.28, color, [x, -0.66, z]),
      ball(0.07, color, [x, -0.48, z]),
      box([0.03, 0.12, 0.03], color, [x, -0.37, z], undefined, 0.01),
      box([0.09, 0.03, 0.03], color, [x, -0.37, z], undefined, 0.01),
    );
  const pawn = (color: string, x: number, z: number) =>
    group(cyl(0.06, 0.075, 0.05, color, [x, -0.84, z]), cone(0.055, 0.16, color, [x, -0.73, z]), ball(0.055, color, [x, -0.62, z]));
  const hopper = pawn(P.paper, 0.1, 0.3);
  board.add(king(P.paper, -0.3, 0.5), king(P.ink, 0.3, -0.5), hopper, pawn(P.ink, -0.1, -0.1), pawn(P.ink, 0.5, -0.3));
  board.position.set(-0.55, 0, 0.35);
  board.rotation.y = 0.35;

  const strips = (x: number, h: number) =>
    [0, 1, 2].map((k) => box([0.06, h, 0.02], glow(P.sky, 1.2), [x - 0.2 + k * 0.2, 0, 0.41], undefined, 0.02));
  const tower = (x: number, h: number) =>
    group(box([0.82, h, 0.8], P.navy, [x, -1 + h / 2, 0], undefined, 0.08), ...strips(x, h * 0.62).map((s) => {
      s.position.y = -1 + h / 2;
      return s;
    }));
  const cabinet = group(tower(0, 2.1), tower(0.9, 1.6));
  cabinet.position.set(0.85, 0, -0.75);
  cabinet.rotation.y = -0.25;

  return {
    group: group(board, cabinet),
    update: (t) => {
      hopper.position.y = Math.max(0, Math.sin(t * 2.2)) ** 2 * 0.18;
    },
  };
}

/** 2022 · A conversation, a typing indicator, and the Regenerate arrow. */
function chatGpt(): Built {
  const user = group(
    box([1.35, 0.55, 0.32], P.emerald, [0, 0, 0], undefined, 0.2),
    cone(0.12, 0.26, P.emerald, [0.5, -0.32, 0], [0, 0, -0.5]),
    ...[0, 1].map((i) => box([i ? 0.6 : 0.9, 0.06, 0.04], P.paper, [-0.05 - i * 0.15, 0.09 - i * 0.18, 0.17], undefined, 0.03)),
  );
  user.position.set(0.55, 0.85, -0.35);

  const dots = [0, 1, 2].map((i) => ball(0.12, P.ink, [-0.38 + i * 0.38, 0, 0.27]));
  const reply = group(
    box([2.1, 1.0, 0.45], P.paper, [0, 0, 0], undefined, 0.3),
    cone(0.16, 0.36, P.paper, [-0.78, -0.56, 0], [0, 0, 0.5]),
    ...dots,
  );
  reply.position.set(-0.35, -0.2, 0.15);

  const regen = group(
    ring(0.3, 0.07, P.emerald, [0, 0, 0], [0, 0, 0], Math.PI * 1.55),
    cone(0.13, 0.22, P.emerald, [0.3, -0.06, 0], [0, 0, Math.PI]),
  );
  regen.position.set(1.15, -0.55, 0.35);

  return {
    group: group(user, reply, regen),
    update: (t) => {
      dots.forEach((d, i) => {
        d.position.y = Math.max(0, Math.sin(t * 5 - i * 0.7)) * 0.16;
      });
      regen.rotation.z = -t * 1.4;
    },
  };
}

// ───────────────────────── Thread objects (every other moment) ─────────────────────────

function gear(): Built {
  const teeth = 12;
  const gearGroup = group(cyl(0.95, 0.95, 0.3, P.purple, [0, 0, 0], [Math.PI / 2, 0, 0], 48), cyl(0.3, 0.3, 0.34, P.ink, [0, 0, 0], [Math.PI / 2, 0, 0]));
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    gearGroup.add(box([0.26, 0.3, 0.28], P.purple, [Math.cos(a) * 1.02, Math.sin(a) * 1.02, 0], [0, 0, a], 0.05));
  }
  const small = gearGroup.clone();
  small.scale.setScalar(0.48);
  small.position.set(1.25, -0.7, -0.2);
  gearGroup.position.y = 0.15;
  return {
    group: group(gearGroup, small),
    update: (t) => {
      gearGroup.rotation.z = t * 0.4;
      small.rotation.z = -t * 0.4 * (1 / 0.48) + 0.13;
    },
  };
}

function flowchart(): Built {
  const amber = '#d99a3a';
  const diamond = box([0.75, 0.75, 0.3], amber, [0, 0.55, 0], [0, 0, Math.PI / 4], 0.08);
  const yes = box([0.95, 0.5, 0.3], P.cream, [-0.9, -0.6, 0], undefined, 0.1);
  const no = box([0.95, 0.5, 0.3], P.cream, [0.9, -0.6, 0], undefined, 0.1);
  const g = group(
    diamond,
    label('IF', [0.34, 0.2], { pos: [0, 0.55, 0.16], bg: amber, fg: P.paper }),
    yes,
    no,
    label('THEN', [0.62, 0.22], { pos: [-0.9, -0.6, 0.16], bg: P.cream }),
    label('ELSE', [0.62, 0.22], { pos: [0.9, -0.6, 0.16], bg: P.cream }),
    rod([-0.3, 0.3, 0], [-0.8, -0.32, 0], 0.04, P.ink),
    rod([0.3, 0.3, 0], [0.8, -0.32, 0], 0.04, P.ink),
  );
  return { group: g, update: (t) => (diamond.rotation.y = Math.sin(t) * 0.2) };
}

function neuralNet(): Built {
  const layers = [3, 4, 4, 2];
  const nodes: THREE.Mesh[][] = layers.map((n, li) =>
    Array.from({ length: n }, (_, i) =>
      ball(0.17, clay(P.blue, { emissive: P.sky, emissiveIntensity: 0 }), [(li - 1.5) * 0.95, (i - (n - 1) / 2) * 0.55, 0]),
    ),
  );
  const links: THREE.Mesh[] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    for (const a of nodes[l]!) {
      for (const b of nodes[l + 1]!) {
        links.push(rod(a.position.toArray(), b.position.toArray(), 0.018, clay(P.slate, { transparent: true, opacity: 0.6 })));
      }
    }
  }
  const g = group(...links, ...nodes.flat());
  return {
    group: g,
    update: (t) => {
      // A pulse sweeps left to right, like a forward pass.
      nodes.forEach((layer, li) =>
        layer.forEach((n) => {
          const pulse = Math.max(0, Math.cos((t * 1.6 - li * 0.7) % (Math.PI * 2)));
          (n.material as THREE.MeshPhysicalMaterial).emissiveIntensity = pulse ** 4 * 1.2;
        }),
      );
    },
  };
}

function speechBubble(): Built {
  const indigo = '#6467f2';
  const bubble = group(
    box([2.1, 1.25, 0.45], indigo, [0, 0, 0], undefined, 0.32),
    cone(0.17, 0.38, indigo, [-0.7, -0.7, 0], [0, 0, 0.45]),
    ...[1.4, 1.1, 0.7].map((w, i) => box([w, 0.1, 0.05], P.paper, [-0.65 + w / 2, 0.3 - i * 0.28, 0.24], undefined, 0.04)),
  );
  bubble.position.y = 0.2;
  return { group: bubble, update: (t) => (bubble.position.y = 0.2 + Math.sin(t * 1.5) * 0.06) };
}

function camera(): Built {
  const lens = group(
    cyl(0.45, 0.5, 0.45, P.ink, [0, 0, 0], [Math.PI / 2, 0, 0]),
    cyl(0.32, 0.32, 0.06, glow(P.teal, 0.8), [0, 0, 0.24], [Math.PI / 2, 0, 0]),
    ball(0.1, glow('#ffffff', 2), [0.1, 0.1, 0.28]),
  );
  lens.position.set(0, -0.15, 0.55);
  const g = group(
    box([1.9, 1.15, 0.8], P.teal, [0, -0.15, 0], undefined, 0.2),
    box([0.55, 0.25, 0.5], P.teal, [-0.5, 0.52, 0], undefined, 0.08),
    box([0.25, 0.14, 0.12], glow(P.yellow, 0.8), [0.6, 0.3, 0.42], undefined, 0.04),
    lens,
  );
  return { group: g, update: (t) => (lens.rotation.z = Math.sin(t) * 0.3) };
}

function clapper(): Built {
  const stripes = (y: number, z: number) =>
    [0, 1, 2, 3, 4].map((i) => box([0.22, 0.2, 0.05], i % 2 ? P.paper : P.ink, [-0.68 + i * 0.34, y, z], [0, 0, 0.5], 0.02));
  const arm = group(box([1.9, 0.26, 0.2], P.ink, [0.95, 0, 0], undefined, 0.05), ...stripes(0, 0.11).map((s) => {
    s.position.x += 0.95;
    return s;
  }));
  arm.position.set(-0.95, 0.42, 0);
  const g = group(
    box([1.9, 1.3, 0.2], P.pink, [0, -0.4, 0], undefined, 0.08),
    box([1.9, 0.26, 0.2], P.ink, [0, 0.16, 0], undefined, 0.05),
    ...stripes(0.16, 0.11),
    ...[0, 1, 2].map((i) => box([1.4 - i * 0.3, 0.08, 0.04], P.paper, [-0.2 - i * 0.15, -0.25 - i * 0.25, 0.11], undefined, 0.03)),
    arm,
  );
  return {
    group: g,
    update: (t) => {
      const p = (t % 2.2) / 2.2;
      arm.rotation.z = p < 0.8 ? easeInOut(p / 0.8) * 0.45 : 0.45 * (1 - (p - 0.8) / 0.2) ** 3;
    },
  };
}

function microphone(): Built {
  const waves = [0, 1, 2].map((i) =>
    ring(0.7 + i * 0.32, 0.04, clay(P.orange, { transparent: true, opacity: 1 }), [0, 0.55, 0], [0, 0, -Math.PI / 4], Math.PI / 2),
  );
  const wavesR = waves.map((w) => {
    const m = w.clone();
    m.material = (w.material as THREE.Material).clone();
    m.rotation.z = (3 * Math.PI) / 4;
    return m;
  });
  const g = group(
    ball(0.46, P.orange, [0, 0.55, 0]),
    ring(0.47, 0.05, P.ink, [0, 0.5, 0], [Math.PI / 2, 0, 0]),
    cyl(0.17, 0.13, 0.9, P.ink, [0, -0.25, 0]),
    cyl(0.55, 0.6, 0.12, P.ink, [0, -0.95, 0]),
    ...waves,
    ...wavesR,
  );
  return {
    group: g,
    update: (t) => {
      [...waves, ...wavesR].forEach((w, i) => {
        const k = i % 3;
        (w.material as THREE.MeshPhysicalMaterial).opacity = 0.25 + 0.75 * Math.max(0, Math.sin(t * 3 - k * 0.8));
      });
    },
  };
}

function trophy(): Built {
  const cupShape = [
    [0.05, 0],
    [0.62, 0.05],
    [0.7, 0.4],
    [0.62, 0.8],
    [0.45, 1.0],
    [0.12, 1.08],
    [0.08, 1.12],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const cup = new THREE.Mesh(new THREE.LatheGeometry(cupShape, 48), clay(P.gold));
  cup.rotation.x = Math.PI;
  cup.position.y = 1.0;
  const g = group(
    cup,
    ring(0.28, 0.06, P.gold, [-0.68, 0.55, 0], [0, 0, Math.PI / 2]),
    ring(0.28, 0.06, P.gold, [0.68, 0.55, 0], [0, 0, Math.PI / 2]),
    cyl(0.09, 0.12, 0.45, P.gold, [0, -0.35, 0]),
    box([0.9, 0.35, 0.7], P.red, [0, -0.78, 0], undefined, 0.08),
    ball(0.14, glow(P.yellow, 1.2), [0, 1.22, 0]),
  );
  return { group: g };
}

function robot(): Built {
  const eyes = [-0.22, 0.22].map((x) => ball(0.1, glow(P.sky, 2), [x, 0.62, 0.36]));
  const arm = group(rod([0, 0, 0], [0.55, 0.35, 0], 0.09, P.green), ball(0.13, P.slate, [0.6, 0.38, 0]));
  arm.position.set(0.55, -0.05, 0);
  const g = group(
    box([1.0, 0.75, 0.7], P.green, [0, 0.6, 0], undefined, 0.2),
    ...eyes,
    cyl(0.03, 0.03, 0.3, P.ink, [0, 1.12, 0]),
    ball(0.08, glow(P.red, 1.5), [0, 1.3, 0]),
    box([0.85, 0.85, 0.6], P.cream, [0, -0.25, 0], undefined, 0.18),
    box([0.4, 0.22, 0.05], glow(P.teal, 0.6), [0, -0.15, 0.31], undefined, 0.05),
    rod([-0.45, 0.0, 0], [-0.7, -0.5, 0], 0.09, P.green),
    arm,
    box([0.25, 0.25, 0.3], P.slate, [-0.22, -0.85, 0], undefined, 0.06),
    box([0.25, 0.25, 0.3], P.slate, [0.22, -0.85, 0], undefined, 0.06),
  );
  return {
    group: g,
    update: (t) => {
      arm.rotation.z = Math.sin(t * 3) * 0.35;
      const blink = (t % 3.5) > 3.38 ? 0.15 : 1;
      eyes.forEach((e) => (e.scale.y = blink));
    },
  };
}

function browserAgent(): Built {
  const win = group(
    box([2.3, 1.55, 0.18], P.paper, [0, 0, 0], undefined, 0.12),
    box([2.3, 0.28, 0.2], P.ink, [0, 0.64, 0.01], undefined, 0.1),
    ...[P.red, P.yellow, P.green].map((c, i) => ball(0.05, c, [-0.95 + i * 0.16, 0.64, 0.12])),
    box([0.9, 0.32, 0.06], glow(P.emerald, 0.5), [0.45, -0.38, 0.1], undefined, 0.1),
    ...[0, 1].map((i) => box([1.5 - i * 0.5, 0.08, 0.04], '#cfd3dc', [-0.3 - i * 0.25, 0.28 - i * 0.22, 0.1], undefined, 0.03)),
  );
  win.position.y = 0.1;
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(0, -0.62);
  s.lineTo(0.16, -0.47);
  s.lineTo(0.28, -0.72);
  s.lineTo(0.38, -0.67);
  s.lineTo(0.26, -0.43);
  s.lineTo(0.46, -0.43);
  s.closePath();
  const cursor = slab(s, 0.06, P.ink);
  cursor.rotation.z = 0.15;
  const pointer = group(cursor);
  return {
    group: group(win, pointer),
    update: (t) => {
      const p = (t % 3) / 3;
      const k = easeInOut(Math.min(p * 1.6, 1));
      pointer.position.set(-0.7 + k * 1.3, 0.4 - k * 0.65, 0.4);
      const click = p > 0.66 && p < 0.76 ? 0.85 : 1;
      pointer.scale.setScalar(click);
    },
  };
}

function shield(): Built {
  const s = new THREE.Shape();
  s.moveTo(0, 0.95);
  s.bezierCurveTo(0.45, 0.8, 0.8, 0.82, 0.85, 0.75);
  s.bezierCurveTo(0.85, 0.1, 0.6, -0.55, 0, -0.95);
  s.bezierCurveTo(-0.6, -0.55, -0.85, 0.1, -0.85, 0.75);
  s.bezierCurveTo(-0.8, 0.82, -0.45, 0.8, 0, 0.95);
  const body = slab(s, 0.25, P.rose);
  const check = group(
    box([0.16, 0.5, 0.12], P.paper, [-0.2, -0.08, 0.22], [0, 0, 0.75], 0.05),
    box([0.16, 0.85, 0.12], P.paper, [0.16, 0.08, 0.22], [0, 0, -0.6], 0.05),
  );
  const g = group(body, check);
  g.position.y = 0.1;
  return { group: g, update: (t) => (g.rotation.y = Math.sin(t * 0.8) * 0.25) };
}

function gpuChip(): Built {
  const pins = group();
  for (let i = 0; i < 9; i++) {
    const o = (i - 4) * 0.22;
    pins.add(
      box([0.08, 0.04, 0.2], P.gold, [o, -0.62, 1.12], undefined, 0.015),
      box([0.08, 0.04, 0.2], P.gold, [o, -0.62, -1.12], undefined, 0.015),
      box([0.2, 0.04, 0.08], P.gold, [1.12, -0.62, o], undefined, 0.015),
      box([0.2, 0.04, 0.08], P.gold, [-1.12, -0.62, o], undefined, 0.015),
    );
  }
  const core = box([0.9, 0.14, 0.9], glow('#7bf0a6', 0.25), [0, -0.38, 0], undefined, 0.05);
  const g = group(
    box([2.1, 0.14, 2.1], '#1f6f4a', [0, -0.68, 0], undefined, 0.06),
    box([1.4, 0.18, 1.4], P.ink, [0, -0.52, 0], undefined, 0.06),
    core,
    pins,
  );
  g.rotation.x = 0.35;
  g.position.y = 0.2;
  return {
    group: g,
    update: (t) => {
      (core.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2.5));
    },
  };
}

// ───────────────────────── Registry ─────────────────────────

/** Unique objects for specific moments. Everything else falls back to its thread's object. */
export const heroObjects: Record<string, Builder> = {
  'turing-machine': turingMachine,
  'deep-blue': deepBlue,
  chatgpt: chatGpt,
};

export const trackObjects: Record<TrackId, Builder> = {
  foundations: gear,
  symbolic: flowchart,
  learning: neuralNet,
  language: speechBubble,
  vision: camera,
  video: clapper,
  audio: microphone,
  games: trophy,
  robotics: robot,
  agents: browserAgent,
  safety: shield,
  industry: gpuChip,
};

export function builderFor(eventId: string, track: TrackId): { key: string; build: Builder } {
  const hero = heroObjects[eventId];
  return hero ? { key: eventId, build: hero } : { key: `track:${track}`, build: trackObjects[track] };
}

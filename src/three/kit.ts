import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * A tiny modelling kit for chunky, clay-like toy objects. Everything is built
 * from rounded primitives so the whole collection shares one visual language.
 */

export const palette = {
  cream: '#f3e9d6',
  paper: '#fbf8f1',
  ink: '#2b2b38',
  slate: '#5b6475',
  navy: '#24346e',
  blue: '#4a78f5',
  sky: '#7fb2ff',
  red: '#ef5b4f',
  orange: '#f5a03b',
  yellow: '#f6cd4b',
  gold: '#e3b341',
  green: '#3fbf7f',
  emerald: '#10a37f',
  teal: '#2bb3c0',
  pink: '#ee6ca9',
  purple: '#8d6cf2',
  rose: '#e2476b',
  brown: '#9a6b47',
  screen: '#141724',
} as const;

export type Color = string;

export interface MatOptions {
  emissive?: Color;
  emissiveIntensity?: number;
  map?: THREE.Texture;
  transparent?: boolean;
  opacity?: number;
}

export function clay(color: Color, opts: MatOptions = {}): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.55,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.45,
    envMapIntensity: 0.55,
    emissive: opts.emissive ?? '#000000',
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    map: opts.map ?? null,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
  });
}

/** Glowing material for lights, screens and LEDs. */
export function glow(color: Color, intensity = 1.6): THREE.MeshPhysicalMaterial {
  return clay(color, { emissive: color, emissiveIntensity: intensity });
}

type Vec = readonly [number, number, number];

function place<T extends THREE.Object3D>(obj: T, pos: Vec = [0, 0, 0], rot: Vec = [0, 0, 0]): T {
  obj.position.set(...pos);
  obj.rotation.set(...rot);
  return obj;
}

export function box(
  size: Vec,
  material: THREE.Material | Color,
  pos?: Vec,
  rot?: Vec,
  radius = 0.06,
): THREE.Mesh {
  const r = Math.min(radius, Math.min(...size) / 2 - 0.001);
  const geo = new RoundedBoxGeometry(size[0], size[1], size[2], 4, Math.max(r, 0.001));
  return place(new THREE.Mesh(geo, toMat(material)), pos, rot);
}

export function cyl(
  rTop: number,
  rBottom: number,
  h: number,
  material: THREE.Material | Color,
  pos?: Vec,
  rot?: Vec,
  segments = 32,
): THREE.Mesh {
  return place(new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), toMat(material)), pos, rot);
}

export function ball(r: number, material: THREE.Material | Color, pos?: Vec): THREE.Mesh {
  return place(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), toMat(material)), pos);
}

export function cone(r: number, h: number, material: THREE.Material | Color, pos?: Vec, rot?: Vec): THREE.Mesh {
  return place(new THREE.Mesh(new THREE.ConeGeometry(r, h, 32), toMat(material)), pos, rot);
}

export function ring(
  R: number,
  r: number,
  material: THREE.Material | Color,
  pos?: Vec,
  rot?: Vec,
  arc = Math.PI * 2,
): THREE.Mesh {
  return place(new THREE.Mesh(new THREE.TorusGeometry(R, r, 16, 64, arc), toMat(material)), pos, rot);
}

/** A rounded rod between two points. */
export function rod(a: Vec, b: Vec, r: number, material: THREE.Material | Color): THREE.Mesh {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const len = va.distanceTo(vb);
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(len - 2 * r, 0.001), 6, 12), toMat(material));
  mesh.position.copy(va.clone().add(vb).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return mesh;
}

/** A thick, bevelled 2D shape: shields, arrows, cursors. */
export function slab(shape: THREE.Shape, depth: number, material: THREE.Material | Color, pos?: Vec, rot?: Vec) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 4,
    curveSegments: 24,
  });
  geo.center();
  return place(new THREE.Mesh(geo, toMat(material)), pos, rot);
}

/** A flat label: text drawn on a canvas, used as a decal on a thin plate. */
export function label(
  text: string,
  size: readonly [number, number],
  opts: { fg?: Color; bg?: Color; font?: string; pos?: Vec; rot?: Vec } = {},
): THREE.Mesh {
  const px = 256;
  const canvas = document.createElement('canvas');
  canvas.width = px;
  canvas.height = Math.round((px * size[1]) / size[0]);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = opts.bg ?? palette.paper;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = opts.fg ?? palette.ink;
  ctx.font = opts.font ?? `700 ${Math.round(canvas.height * 0.62)}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + canvas.height * 0.04);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
  return place(new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), mat), opts.pos, opts.rot);
}

export function group(...children: THREE.Object3D[]): THREE.Group {
  const g = new THREE.Group();
  for (const c of children) g.add(c);
  return g;
}

function toMat(m: THREE.Material | Color): THREE.Material {
  return typeof m === 'string' ? clay(m) : m;
}

export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
export const easeOutBack = (t: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

/** A canvas-backed texture. Call `redraw()` after drawing again to animate it. */
export function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture & { redraw: (fn?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) => void } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas) as THREE.CanvasTexture & {
    redraw: (fn?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) => void;
  };
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.redraw = (fn = draw) => {
    fn(ctx, w, h);
    tex.needsUpdate = true;
  };
  return tex;
}

/** A flat panel showing a canvas texture (screens, boards, pictures). */
export function screen(tex: THREE.Texture, size: readonly [number, number], pos?: Vec, rot?: Vec, emissive = 0): THREE.Mesh {
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.6,
    emissive: emissive ? '#ffffff' : '#000000',
    emissiveMap: emissive ? tex : null,
    emissiveIntensity: emissive,
  });
  return place(new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), mat), pos, rot);
}

/** A smooth tube along a list of points (ribbons, cables, curves). */
export function tube(points: readonly Vec[], r: number, material: THREE.Material | Color, closed = false): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), closed);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, points.length * 12, r, 12, closed), toMat(material));
}

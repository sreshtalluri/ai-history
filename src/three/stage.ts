import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { easeInOut, easeOutBack } from './kit';
import type { Builder } from './objects';

interface Item {
  key: string;
  root: THREE.Group;
  update: ((t: number) => void) | undefined;
  start: number;
  phase: 'in' | 'idle' | 'out';
  dir: number;
}

const IN_MS = 750;
const OUT_MS = 450;

/**
 * Renders one object at a time on a soft-lit stage, animating objects in and
 * out as the reader moves through history. Drag to rotate; it eases back to a
 * slow idle spin.
 */
export class Stage {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  private pivot = new THREE.Group();
  private rim: THREE.DirectionalLight;
  private items: Item[] = [];
  private clock = new THREE.Clock();
  private frame = 0;
  private visible = true;
  private resizeObserver: ResizeObserver;
  private intersection: IntersectionObserver;

  // Drag-to-rotate state.
  private dragging = false;
  private lastX = 0;
  private velocity = 0;
  private userYaw = 0;
  private idleSince = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private reducedMotion: boolean,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.scene.add(new THREE.HemisphereLight('#ffffff', '#1a1a2a', 0.9));
    const key = new THREE.DirectionalLight('#fff4e6', 2.2);
    key.position.set(3, 5, 4);
    this.scene.add(key);
    this.rim = new THREE.DirectionalLight('#8b8bf5', 2.4);
    this.rim.position.set(-4, 2.5, -4);
    this.scene.add(this.rim);

    this.scene.add(this.makeShadow());
    this.scene.add(this.pivot);

    this.camera.position.set(0, 0.8, 6);
    this.camera.lookAt(0, -0.05, 0);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement ?? canvas);
    this.intersection = new IntersectionObserver(([entry]) => {
      this.visible = entry?.isIntersecting ?? true;
    });
    this.intersection.observe(canvas);
    document.addEventListener('visibilitychange', this.onVisibility);

    canvas.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);

    this.resize();
    this.loop();
  }

  setAccent(color: string): void {
    this.rim.color.set(color);
  }

  /** Swap to a new object. dir = +1 when moving forward in time, -1 backward. */
  show(key: string, build: Builder, dir: number): void {
    if (this.items.some((i) => i.key === key && i.phase !== 'out')) return;
    const now = performance.now();
    for (const item of this.items) {
      if (item.phase !== 'out') Object.assign(item, { phase: 'out', start: now, dir });
    }
    const { group, update } = build();
    const root = new THREE.Group();
    root.add(group);
    this.pivot.add(root);
    this.items.push({ key, root, update, start: now, phase: this.reducedMotion ? 'idle' : 'in', dir });
    if (this.reducedMotion) {
      for (const item of this.items.filter((i) => i.phase === 'out')) this.remove(item);
    }
    this.userYaw = 0;
    this.velocity = 0;
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.intersection.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.canvas.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    for (const item of [...this.items]) this.remove(item);
    this.scene.environment?.dispose();
    this.renderer.dispose();
  }

  private loop = () => {
    this.frame = requestAnimationFrame(this.loop);
    if (!this.visible || document.hidden) return;
    const t = this.clock.getElapsedTime();
    const now = performance.now();

    for (const item of [...this.items]) {
      const elapsed = now - item.start;
      const r = item.root;
      if (item.phase === 'in') {
        const p = Math.min(elapsed / IN_MS, 1);
        const e = easeOutBack(p);
        r.position.x = (1 - easeInOut(p)) * item.dir * 3.2;
        r.rotation.y = (1 - p) * item.dir * -1.1;
        r.scale.setScalar(0.55 + 0.45 * e);
        if (p >= 1) item.phase = 'idle';
      } else if (item.phase === 'out') {
        const p = Math.min(elapsed / OUT_MS, 1);
        const e = easeInOut(p);
        r.position.x = -e * item.dir * 3.2;
        r.rotation.y = e * item.dir * 0.9;
        r.scale.setScalar(1 - 0.5 * e);
        if (p >= 1) this.remove(item);
      } else {
        r.position.x = 0;
        r.rotation.y = 0;
        r.scale.setScalar(1);
      }
      if (!this.reducedMotion) {
        item.update?.(t);
        r.position.y = Math.sin(t * 1.1) * 0.04;
      }
    }

    // Drag inertia, then drift back into a slow idle spin.
    if (!this.dragging) {
      this.userYaw += this.velocity;
      this.velocity *= 0.92;
      if (Math.abs(this.velocity) < 0.0005 && now - this.idleSince > 1500 && !this.reducedMotion) {
        this.userYaw += 0.0025;
      }
    }
    const base = this.reducedMotion ? 0 : Math.sin(t * 0.35) * 0.35;
    this.pivot.rotation.y = base + this.userYaw;

    this.renderer.render(this.scene, this.camera);
  };

  private remove(item: Item): void {
    this.pivot.remove(item.root);
    item.root.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
          (m as THREE.MeshStandardMaterial).map?.dispose();
          m.dispose();
        }
      }
    });
    this.items = this.items.filter((i) => i !== item);
  }

  private resize(): void {
    const parent = this.canvas.parentElement ?? this.canvas;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Pull back on narrow screens so wide objects still fit.
    const dist = 6 * Math.max(1, 1.3 / this.camera.aspect);
    this.camera.position.set(0, 0.8 * (dist / 6), dist);
    this.camera.lookAt(0, -0.05, 0);
    this.camera.updateProjectionMatrix();
  }

  private makeShadow(): THREE.Mesh {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,0.55)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 2.4),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -1.1;
    return mesh;
  }

  private onVisibility = () => this.clock.getDelta();

  private onDown = (e: PointerEvent) => {
    this.dragging = true;
    this.lastX = e.clientX;
    this.velocity = 0;
    this.canvas.setPointerCapture?.(e.pointerId);
  };

  private onMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    const dx = e.clientX - this.lastX;
    this.lastX = e.clientX;
    this.velocity = dx * 0.008;
    this.userYaw += this.velocity;
  };

  private onUp = () => {
    if (!this.dragging) return;
    this.dragging = false;
    this.idleSince = performance.now();
  };
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

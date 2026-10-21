import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { tracks } from '../data';
import type { TrackId } from '../types';
import type { Stage } from '../three/stage';

interface Props {
  eventId: string;
  track: TrackId;
  /** +1 moving forward in time, -1 backward. */
  direction: number;
  accent: string;
  label: string;
}

/**
 * Hosts the 3D stage. three.js is loaded lazily so the text of the page shows
 * immediately; without WebGL it falls back to a glowing placeholder.
 */
export function StageCanvas({ eventId, track, direction, accent, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const builderRef = useRef<typeof import('../three/objects') | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');

  useEffect(() => {
    let cancelled = false;
    let stage: Stage | null = null;
    (async () => {
      try {
        const [{ Stage: StageClass, webglAvailable }, objects] = await Promise.all([
          import('../three/stage'),
          import('../three/objects'),
        ]);
        if (cancelled || !canvasRef.current) return;
        if (!webglAvailable()) throw new Error('WebGL unavailable');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        stage = new StageClass(canvasRef.current, reduced);
        stageRef.current = stage;
        builderRef.current = objects;
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('fallback');
      }
    })();
    return () => {
      cancelled = true;
      stage?.dispose();
      stageRef.current = null;
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const objects = builderRef.current;
    if (status !== 'ready' || !stage || !objects) return;
    stage.setAccent(accent);
    stage.show(eventId, objects.builderFor(eventId, track).build, direction);
  }, [status, eventId, track, direction, accent]);

  return (
    <div className={`stage-canvas is-${status}`} style={{ '--accent': accent, '--track': tracks[track].color } as CSSProperties}>
      <canvas ref={canvasRef} role="img" aria-label={`Illustration: ${label}. Drag to rotate.`} />
      {status === 'fallback' && (
        <div className="stage-fallback" aria-hidden="true">
          <span>{tracks[track].label}</span>
        </div>
      )}
    </div>
  );
}

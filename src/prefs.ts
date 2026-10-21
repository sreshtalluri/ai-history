import { useEffect, useState } from 'react';

/** Per-browser convenience settings. Storage may be unavailable, so every access is guarded. */
function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the setting just won't persist.
  }
}

export function usePersistentState<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = read(key);
    return allowed.find((a) => a === stored) ?? fallback;
  });
  useEffect(() => write(key, value), [key, value]);
  return [value, setValue];
}

export type Lens = 'everyone' | 'engineer';
export const lenses = ['everyone', 'engineer'] as const satisfies readonly Lens[];

export type Theme = 'system' | 'light' | 'dark';
export const themes = ['system', 'light', 'dark'] as const satisfies readonly Theme[];

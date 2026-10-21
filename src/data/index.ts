import type { AIEvent } from '../types';
import { historyEvents } from './events-history';
import { modernEvents } from './events-modern';

export { eras, eraIds } from './eras';
export { people, personIds } from './people';
export { tracks, trackIds } from './tracks';
export { terms } from './terms';
export { labs, openProblems, FRONTIER_AS_OF } from './frontier';

/** Every event in chronological order (stable within a year). */
export const events: readonly AIEvent[] = [...historyEvents, ...modernEvents]
  .map((e, i) => ({ e, i }))
  .sort((a, b) => a.e.year - b.e.year || a.i - b.i)
  .map(({ e }) => e);

export const eventById = new Map(events.map((e) => [e.id, e]));

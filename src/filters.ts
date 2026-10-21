import type { AIEvent, TrackId } from './types';

export interface Filters {
  /** Empty means every track. */
  tracks: ReadonlySet<TrackId>;
  milestonesOnly: boolean;
}

export const noFilters: Filters = { tracks: new Set(), milestonesOnly: false };

export function matches(event: AIEvent, filters: Filters): boolean {
  if (filters.milestonesOnly && !event.milestone) return false;
  if (filters.tracks.size === 0) return true;
  return event.tracks.some((t) => filters.tracks.has(t));
}

export function isFiltered(filters: Filters): boolean {
  return filters.milestonesOnly || filters.tracks.size > 0;
}

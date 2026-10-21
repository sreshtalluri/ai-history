import { trackIds } from '../data';
import { isFiltered, noFilters, type Filters } from '../filters';
import type { TrackId } from '../types';
import { TrackChip } from './bits';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  count: number;
  total: number;
}

export function FilterBar({ filters, onChange, count, total }: Props) {
  const toggleTrack = (id: TrackId) => {
    const next = new Set(filters.tracks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ ...filters, tracks: next });
  };

  return (
    <div className="filterbar">
      <div className="filter-row">
        <label className="switch">
          <input
            type="checkbox"
            checked={filters.milestonesOnly}
            onChange={(e) => onChange({ ...filters, milestonesOnly: e.target.checked })}
          />
          <span className="switch-track" aria-hidden="true" />
          Turning points only
        </label>
        <span className="filter-count">
          {count} of {total} moments
        </span>
        {isFiltered(filters) && (
          <button type="button" className="link-button" onClick={() => onChange(noFilters)}>
            Clear filters
          </button>
        )}
      </div>
      <div className="chip-scroller" role="group" aria-label="Filter by type of AI">
        {trackIds.map((id) => (
          <TrackChip key={id} id={id} active={filters.tracks.has(id)} onClick={() => toggleTrack(id)} />
        ))}
      </div>
    </div>
  );
}

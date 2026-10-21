import type { CSSProperties } from 'react';
import { eras, eraIds, events, tracks } from '../data';
import { matches, type Filters } from '../filters';
import { href } from '../router';
import { NextStep } from './NextStep';
import { FilterBar } from './FilterBar';
import { Section, TrackChip } from './bits';

export function Timeline({ filters, onFiltersChange }: { filters: Filters; onFiltersChange: (f: Filters) => void }) {
  const visible = events.filter((e) => matches(e, filters));

  return (
    <Section title="The whole timeline" kicker="Overview">
      <FilterBar filters={filters} onChange={onFiltersChange} count={visible.length} total={events.length} />
      <div className="timeline">
        {eraIds.map((eraId) => {
          const inEra = visible.filter((e) => e.era === eraId);
          if (inEra.length === 0) return null;
          const era = eras[eraId];
          return (
            <section key={eraId} className={`tl-era mood-${era.mood}`}>
              <header className="tl-era-head">
                <span className="tl-era-years">
                  {era.span[0] === era.span[1] ? era.span[0] : `${era.span[0]}–${era.span[1]}`}
                </span>
                <h2>{era.title}</h2>
                <p>{era.tagline}</p>
              </header>
              <ol className="tl-list">
                {inEra.map((e) => (
                  <li key={e.id} className={e.milestone ? 'is-milestone' : undefined}>
                    <a
                      className="tl-item"
                      href={href({ page: 'journey', id: e.id })}
                      style={{ '--dot': tracks[e.tracks[0]].color } as CSSProperties}
                    >
                      <span className="tl-dot" aria-hidden="true" />
                      <span className="tl-year">
                        {e.year}
                        {e.date && <small>{e.date}</small>}
                      </span>
                      <span className="tl-text">
                        <strong>{e.title}</strong>
                        <span>{e.oneLiner}</span>
                        <span className="chips">
                          {e.tracks.map((t) => (
                            <TrackChip key={t} id={t} />
                          ))}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
        {visible.length === 0 && <p className="muted">Nothing matches these filters.</p>}
      </div>
      <NextStep to={{ page: 'journey' }} label="Walk the journey" hint="Step through these moments one at a time, with the full story for each." />
    </Section>
  );
}

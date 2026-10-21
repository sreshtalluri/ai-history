import { useEffect, useMemo, type CSSProperties } from 'react';
import { eras, eraIds, eventById, events, roleLabels, roleOrder, shifts, shiftsByEvent, tracks } from '../data';
import { matches, type Filters } from '../filters';
import type { Lens } from '../prefs';
import { href, navigate } from '../router';
import type { AIEvent } from '../types';
import { FilterBar } from './FilterBar';
import { CitationList } from './Citations';
import { PersonPill, SourceList, TrackChip, VerificationBadge } from './bits';

interface Props {
  id: string | undefined;
  lens: Lens;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const CURRENT_YEAR = 2026;

export function Journey({ id, lens, filters, onFiltersChange }: Props) {
  const visible = useMemo(() => events.filter((e) => matches(e, filters)), [filters]);
  const first = visible[0] ?? events[0]!;
  const current = (id && eventById.get(id)) || first;
  const index = events.indexOf(current);

  // Prev/next walk the full chronology but skip anything hidden by filters,
  // so the current card can be outside the filter without trapping the reader.
  const prev = events.slice(0, index).reverse().find((e) => matches(e, filters));
  const next = events.slice(index + 1).find((e) => matches(e, filters));
  const position = visible.indexOf(current);

  const era = eras[current.era];
  const prevAny = events[index - 1];
  const isEraStart = !prevAny || prevAny.era !== current.era;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight' && next) navigate({ page: 'journey', id: next.id });
      if (e.key === 'ArrowLeft' && prev) navigate({ page: 'journey', id: prev.id });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [current.id]);

  return (
    <div className="journey">
      <p className="kicker journey-kicker">
        Step 2 · The journey <span className="muted">· use ← → or the buttons below to move</span>
      </p>
      <EraRibbon visible={visible} current={current} />
      <FilterBar filters={filters} onChange={onFiltersChange} count={visible.length} total={events.length} />

      {isEraStart && (
        <aside className={`era-banner mood-${era.mood}`}>
          <p className="kicker">
            New chapter · {era.span[0] === era.span[1] ? era.span[0] : `${era.span[0]}–${era.span[1]}`}
          </p>
          <h2>{era.title}</h2>
          <p className="era-tagline">{era.tagline}</p>
          <p>{era.summary}</p>
        </aside>
      )}

      <EventCard event={current} lens={lens} />

      <nav className="stepper" aria-label="Step through the timeline">
        {prev ? (
          <a className="step-button" href={href({ page: 'journey', id: prev.id })}>
            <span className="step-dir">← {prev.year}</span>
            <span className="step-title">{prev.title}</span>
          </a>
        ) : (
          <span className="step-button is-disabled">Start of the story</span>
        )}
        <span className="step-count">
          {position >= 0 ? `${position + 1} / ${visible.length}` : 'Outside filter'}
          <small>use ← → keys</small>
        </span>
        {next ? (
          <a className="step-button step-next" href={href({ page: 'journey', id: next.id })}>
            <span className="step-dir">{next.year} →</span>
            <span className="step-title">{next.title}</span>
          </a>
        ) : (
          <a className="step-button step-next" href={href({ page: 'frontier' })}>
            <span className="step-dir">Step 3 →</span>
            <span className="step-title">See today’s frontier labs</span>
          </a>
        )}
      </nav>
    </div>
  );
}

function EraRibbon({ visible, current }: { visible: readonly AIEvent[]; current: AIEvent }) {
  const chapter = eraIds.indexOf(current.era) + 1;
  return (
    <>
    <p className="ribbon-current">
      Chapter {chapter} of {eraIds.length} · <strong>{eras[current.era].title}</strong>
    </p>
    <div className="ribbon" aria-label="Progress through the eras">
      {eraIds.map((eraId) => {
        const inEra = visible.filter((e) => e.era === eraId);
        if (inEra.length === 0) return null;
        const active = current.era === eraId;
        return (
          <div key={eraId} className={`ribbon-era${active ? ' is-active' : ''}`} style={{ flexGrow: inEra.length }}>
            <span className="ribbon-label">{eras[eraId].title}</span>
            <div className="ribbon-dots">
              {inEra.map((e) => (
                <a
                  key={e.id}
                  href={href({ page: 'journey', id: e.id })}
                  className={`ribbon-dot${e.id === current.id ? ' is-current' : ''}${e.milestone ? ' is-milestone' : ''}`}
                  style={{ '--dot': tracks[e.tracks[0]].color } as CSSProperties}
                  title={`${e.year} · ${e.title}`}
                  aria-label={`${e.year}: ${e.title}`}
                  aria-current={e.id === current.id ? 'step' : undefined}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}

export function EventCard({ event, lens }: { event: AIEvent; lens: Lens }) {
  const accent = tracks[event.tracks[0]].color;
  const ago = CURRENT_YEAR - event.year;

  return (
    <article className="event-card" style={{ '--accent': accent } as CSSProperties} key={event.id}>
      <header className="event-head">
        <div className="event-year">
          <span className="year">{event.year}</span>
          {event.date && <span className="date">{event.date}</span>}
          <span className="ago">{ago === 0 ? 'this year' : `${ago} year${ago === 1 ? '' : 's'} ago`}</span>
        </div>
        <div className="event-meta">
          <div className="chips">
            {event.tracks.map((t) => (
              <TrackChip key={t} id={t} />
            ))}
            {event.milestone && <span className="badge badge-milestone">★ Turning point</span>}
            {event.verification === 'reported' && <VerificationBadge level="reported" />}
          </div>
          <h1 className="event-title">{event.title}</h1>
          <p className="event-oneliner">{event.oneLiner}</p>
        </div>
      </header>

      {shiftsByEvent.get(event.id)?.map(({ shift, role, note }) => (
        <a key={shift.id} className={`shift-banner role-${role}`} href={href({ page: 'shifts', id: shift.id })}>
          <span className="shift-banner-kicker">
            Big shift {shifts.indexOf(shift) + 1} · {roleLabels[role].label}
          </span>
          <span className="shift-banner-title">
            {shift.from.label} <span aria-hidden="true">→</span> {shift.to.label}
          </span>
          <span className="shift-steps" aria-hidden="true">
            {roleOrder.map((r) => (
              <span key={r} className={`shift-step${r === role ? ' is-here' : ''}`}>
                {roleLabels[r].short}
              </span>
            ))}
          </span>
          <span className="shift-banner-note">{note}</span>
        </a>
      ))}

      <div className="event-body">
        <div className="event-main">
          <p className="event-summary">{event.summary}</p>

          <h2 className="mini-head">Key points</h2>
          <ol className="key-points">
            {event.keyPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ol>

          {event.engineer && (
            <details className="under-hood" open={lens === 'engineer'} key={`${event.id}-${lens}`}>
              <summary>
                <span className="mono">{'</>'}</span> Under the hood {lens === 'everyone' && <small>for engineers</small>}
              </summary>
              <p>{event.engineer}</p>
            </details>
          )}
        </div>

        <aside className="event-side">
          {event.stat && (
            <div className="stat">
              <span className="stat-value">{event.stat.value}</span>
              <span className="stat-label">{event.stat.label}</span>
            </div>
          )}

          <div className="why">
            <h2 className="mini-head">Why it matters</h2>
            <p>{event.whyItMatters}</p>
          </div>

          {event.coined && (
            <div className="coined">
              <h2 className="mini-head">Word coined</h2>
              <p>
                <strong>“{event.coined.term}”</strong>
                <br />
                <span>{event.coined.by}</span>
              </p>
            </div>
          )}

          {event.people && event.people.length > 0 && (
            <div>
              <h2 className="mini-head">Key people</h2>
              <div className="people-pills">
                {event.people.map((p) => (
                  <PersonPill key={p} id={p} />
                ))}
              </div>
            </div>
          )}

          {event.sources && event.sources.length > 0 && (
            <div>
              <h2 className="mini-head">{event.verification === 'reported' ? 'News coverage' : 'More to explore'}</h2>
              <SourceList sources={event.sources} />
            </div>
          )}
        </aside>
      </div>

      {event.cites && event.cites.length > 0 && (
        <details className="event-refs" open={lens === 'engineer'} key={`refs-${event.id}-${lens}`}>
          <summary>
            <span>📄 Read the original</span>
            <small>
              {event.cites.length} source{event.cites.length === 1 ? '' : 's'} · full citation, where to look, links
            </small>
          </summary>
          <CitationList ids={event.cites} />
        </details>
      )}
    </article>
  );
}

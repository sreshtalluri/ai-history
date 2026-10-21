import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { eras, eraIds, eventById, events, roleLabels, roleOrder, shifts, shiftsByEvent, tracks } from '../data';
import { isFiltered, matches, type Filters } from '../filters';
import type { Lens } from '../prefs';
import { href, navigate } from '../router';
import type { AIEvent } from '../types';
import { CitationList } from './Citations';
import { FilterBar } from './FilterBar';
import { StageCanvas } from './StageCanvas';
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
  // so the current moment can be outside the filter without trapping the reader.
  const prev = events.slice(0, index).reverse().find((e) => matches(e, filters));
  const next = events.slice(index + 1).find((e) => matches(e, filters));
  const position = visible.indexOf(current);

  const era = eras[current.era];
  const chapter = eraIds.indexOf(current.era) + 1;
  const prevAny = events[index - 1];
  const isEraStart = !prevAny || prevAny.era !== current.era;

  const lastIndex = useRef(index);
  const direction = index >= lastIndex.current ? 1 : -1;
  useEffect(() => {
    lastIndex.current = index;
  }, [index]);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight' && next) navigate({ page: 'journey', id: next.id });
      if (e.key === 'ArrowLeft' && prev) navigate({ page: 'journey', id: prev.id });
      if (e.key === 'Escape') setDetailsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  const shiftLinks = shiftsByEvent.get(current.id) ?? [];

  return (
    <div className="stage" style={{ '--accent': era.accent } as CSSProperties}>
      <div className="stage-glow" aria-hidden="true" />

      <header className="stage-top">
        <div className="stage-chapter">
          <span className="stage-chapter-num">
            Chapter {chapter} of {eraIds.length}
          </span>
          <span className="stage-chapter-title">{era.title}</span>
        </div>
        <div className="stage-tools">
          <button
            type="button"
            className={`pill-button${isFiltered(filters) ? ' is-on' : ''}`}
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
          >
            {isFiltered(filters) ? 'Filtered' : 'Filter'}
          </button>
          <span className="stage-count mono">
            {position >= 0 ? position + 1 : '–'} / {visible.length}
          </span>
        </div>
      </header>

      {filtersOpen && (
        <div className="stage-filters">
          <FilterBar filters={filters} onChange={onFiltersChange} count={visible.length} total={events.length} />
        </div>
      )}

      <div className="stage-main">
        <div className="stage-year" aria-hidden="true" key={current.year}>
          {current.year}
        </div>
        <StageCanvas
          eventId={current.id}
          track={current.tracks[0]}
          direction={direction}
          accent={era.accent}
          label={current.title}
        />
        {prev && (
          <a className="stage-arrow is-prev" href={href({ page: 'journey', id: prev.id })} aria-label={`Previous: ${prev.year}, ${prev.title}`}>
            <Chevron dir="left" />
            <span className="stage-arrow-peek">
              <span className="mono">{prev.year}</span> {prev.title}
            </span>
          </a>
        )}
        {next ? (
          <a className="stage-arrow is-next" href={href({ page: 'journey', id: next.id })} aria-label={`Next: ${next.year}, ${next.title}`}>
            <Chevron dir="right" />
            <span className="stage-arrow-peek">
              <span className="mono">{next.year}</span> {next.title}
            </span>
          </a>
        ) : (
          <a className="stage-arrow is-next" href={href({ page: 'frontier' })} aria-label="Next: the 2026 frontier">
            <Chevron dir="right" />
            <span className="stage-arrow-peek">Step 3 · The 2026 frontier</span>
          </a>
        )}
      </div>

      <section className="stage-caption" key={current.id} aria-live="polite">
        {isEraStart && <p className="stage-era-intro">{era.tagline}</p>}
        <p className="stage-meta">
          <span className="mono">
            {current.date ? `${current.date}, ` : ''}
            {current.year}
          </span>
          {current.tracks.map((t) => (
            <TrackChip key={t} id={t} />
          ))}
          {current.milestone && <span className="badge badge-milestone">★ Turning point</span>}
          {current.verification === 'reported' && <VerificationBadge level="reported" />}
        </p>
        <h1 className="stage-title">{current.title}</h1>
        <p className="stage-oneliner">{current.oneLiner}</p>
        <div className="stage-actions">
          <button type="button" className="button primary" onClick={() => setDetailsOpen(true)}>
            Learn more
          </button>
          {shiftLinks[0] && (
            <a className="shift-pill" href={href({ page: 'shifts', id: shiftLinks[0].shift.id })}>
              <span className="shift-pill-role">{roleLabels[shiftLinks[0].role].short}</span>
              {shiftLinks[0].shift.from.label} → {shiftLinks[0].shift.to.label}
            </a>
          )}
        </div>
      </section>

      <Scrubber visible={visible} current={current} />

      <Drawer open={detailsOpen} onClose={() => setDetailsOpen(false)} title={current.title}>
        <EventDetails event={current} lens={lens} showEraIntro={isEraStart} />
        <div className="drawer-nav">
          {prev && (
            <a className="button" href={href({ page: 'journey', id: prev.id })}>
              ← {prev.year}
            </a>
          )}
          {next && (
            <a className="button primary" href={href({ page: 'journey', id: next.id })}>
              Next: {next.title} →
            </a>
          )}
        </div>
      </Drawer>
    </div>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The year scrubber: chapters as segments, one tick per moment, draggable. */
function Scrubber({ visible, current }: { visible: readonly AIEvent[]; current: AIEvent }) {
  const position = Math.max(visible.indexOf(current), 0);
  return (
    <nav className="scrubber" aria-label="Timeline scrubber">
      <div className="scrubber-eras" aria-hidden="true">
        {eraIds.map((eraId) => {
          const count = visible.filter((e) => e.era === eraId).length;
          if (!count) return null;
          return (
            <span
              key={eraId}
              className={`scrubber-era${current.era === eraId ? ' is-active' : ''}`}
              style={{ flexGrow: count, '--era': eras[eraId].accent } as CSSProperties}
            >
              <span className="scrubber-era-label">{eras[eraId].title}</span>
              <span className="scrubber-ticks">
                {visible
                  .filter((e) => e.era === eraId)
                  .map((e) => (
                    <span
                      key={e.id}
                      className={`scrubber-tick${e.milestone ? ' is-milestone' : ''}${e.id === current.id ? ' is-current' : ''}`}
                    />
                  ))}
              </span>
            </span>
          );
        })}
      </div>
      <input
        className="scrubber-range"
        type="range"
        min={0}
        max={Math.max(visible.length - 1, 0)}
        value={position}
        aria-label="Move through the timeline"
        aria-valuetext={`${current.year}: ${current.title}`}
        onChange={(e) => {
          const target = visible[Number(e.target.value)];
          if (target) navigate({ page: 'journey', id: target.id });
        }}
      />
    </nav>
  );
}

function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [title]);
  // Portalled to <body> so it sits above the sticky site header.
  return createPortal(
    <div className={`drawer${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer-panel" role="dialog" aria-modal="true" aria-label={title} ref={panelRef}>
        <button ref={closeRef} type="button" className="drawer-close" onClick={onClose} aria-label="Close details" tabIndex={open ? 0 : -1}>
          ×
        </button>
        {open && children}
      </div>
    </div>,
    document.body,
  );
}

export function EventDetails({ event, lens, showEraIntro }: { event: AIEvent; lens: Lens; showEraIntro: boolean }) {
  const ago = CURRENT_YEAR - event.year;
  const era = eras[event.era];
  return (
    <article className="details" style={{ '--track': tracks[event.tracks[0]].color } as CSSProperties}>
      <header className="details-head">
        <p className="kicker">
          {event.date ? `${event.date}, ` : ''}
          {event.year} · {ago === 0 ? 'this year' : `${ago} year${ago === 1 ? '' : 's'} ago`}
        </p>
        <h2>{event.title}</h2>
        <p className="details-oneliner">{event.oneLiner}</p>
      </header>

      {showEraIntro && (
        <aside className="details-era">
          <p className="mini-head">
            New chapter · {era.title}
          </p>
          <p>{era.summary}</p>
        </aside>
      )}

      {event.stat && (
        <div className="stat">
          <span className="stat-value">{event.stat.value}</span>
          <span className="stat-label">{event.stat.label}</span>
        </div>
      )}

      <p className="details-summary">{event.summary}</p>

      <h3 className="mini-head">Key points</h3>
      <ol className="key-points">
        {event.keyPoints.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ol>

      <div className="why">
        <h3 className="mini-head">Why it matters</h3>
        <p>{event.whyItMatters}</p>
      </div>

      {shiftsByEvent.get(event.id)?.map(({ shift, role, note }) => (
        <a key={shift.id} className="shift-banner" href={href({ page: 'shifts', id: shift.id })}>
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

      {event.engineer && (
        <details className="under-hood" open={lens === 'engineer'} key={`${event.id}-${lens}`}>
          <summary>
            <span className="mono">{'</>'}</span> Under the hood {lens === 'everyone' && <small>for engineers</small>}
          </summary>
          <p>{event.engineer}</p>
        </details>
      )}

      {event.coined && (
        <div className="coined">
          <h3 className="mini-head">Word coined</h3>
          <p>
            <strong>“{event.coined.term}”</strong> · <span>{event.coined.by}</span>
          </p>
        </div>
      )}

      {event.people && event.people.length > 0 && (
        <div>
          <h3 className="mini-head">Key people</h3>
          <div className="people-pills">
            {event.people.map((p) => (
              <PersonPill key={p} id={p} />
            ))}
          </div>
        </div>
      )}

      {event.cites && event.cites.length > 0 && (
        <div className="details-refs">
          <h3 className="mini-head">Read the original</h3>
          <CitationList ids={event.cites} />
        </div>
      )}

      {event.sources && event.sources.length > 0 && (
        <div>
          <h3 className="mini-head">{event.verification === 'reported' ? 'News coverage' : 'More to explore'}</h3>
          <SourceList sources={event.sources} />
        </div>
      )}
    </article>
  );
}

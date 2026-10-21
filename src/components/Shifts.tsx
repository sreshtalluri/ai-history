import { useEffect, type CSSProperties } from 'react';
import { eventById, roleLabels, roleOrder, shifts, tracks } from '../data';
import type { Lens } from '../prefs';
import { href } from '../router';
import type { Shift } from '../types';
import { CitationList } from './Citations';
import { NextStep } from './NextStep';
import { ProbabilityDemo } from './ProbabilityDemo';
import { Section } from './bits';

const AXIS_START = 1840;
const AXIS_END = 2026;
const pct = (year: number) => ((year - AXIS_START) / (AXIS_END - AXIS_START)) * 100;

export function Shifts({ lens, focus }: { lens: Lens; focus: string | undefined }) {
  useEffect(() => {
    if (focus) document.getElementById(`shift-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focus]);

  return (
    <Section title="The big shifts" kicker="Step 1 · The big ideas">
      <p className="lede page-intro">
        AI’s history makes most sense as a few big changes in <em>how</em> machines work, rather than as a list of
        inventions. Here are seven. Each links to the moments on the timeline where the old way peaked, the new way
        appeared, and the switch happened.
      </p>

      <nav className="shift-toc" aria-label="Shifts on this page">
        {shifts.map((s, i) => (
          <a key={s.id} href={href({ page: 'shifts', id: s.id })} className={focus === s.id ? 'is-active' : undefined}>
            <span className="mono">{i + 1}</span>
            <span>
              {s.from.label} <span aria-hidden="true">→</span> {s.to.label}
            </span>
          </a>
        ))}
      </nav>

      <div className="shift-list">
        {shifts.map((s, i) => (
          <ShiftCard key={s.id} shift={s} index={i} lens={lens} />
        ))}
      </div>

      <NextStep
        to={{ page: 'journey' }}
        label="Step 2 · Walk the full timeline"
        hint="Now see these shifts happen, one moment at a time. Shift badges on each card show where you are."
      />
    </Section>
  );
}

function ShiftCard({ shift, index, lens }: { shift: Shift; index: number; lens: Lens }) {
  const moments = shift.moments.flatMap((m) => {
    const event = eventById.get(m.event);
    return event ? [{ ...m, event }] : [];
  });

  return (
    <article id={`shift-${shift.id}`} className="shift-card">
      <header className="shift-head">
        <span className="shift-num mono">Shift {index + 1}</span>
        <h2>{shift.title}</h2>
        <p className="shift-question">“{shift.question}”</p>
      </header>

      <div className="from-to" aria-label={`From ${shift.from.label} to ${shift.to.label}`}>
        <div className="ft-box ft-from">
          <span className="ft-tag">Before</span>
          <strong>{shift.from.label}</strong>
          <span className="ft-example mono">{shift.from.example}</span>
        </div>
        <div className="ft-arrow" aria-hidden="true">
          <span>{shift.span}</span>
          <svg viewBox="0 0 60 16" width="60" height="16">
            <path d="M0 8h52M46 2l8 6-8 6" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <div className="ft-box ft-to">
          <span className="ft-tag">After</span>
          <strong>{shift.to.label}</strong>
          <span className="ft-example mono">{shift.to.example}</span>
        </div>
      </div>

      <div className="shift-body">
        <div className="shift-text">
          <p>{lens === 'engineer' ? shift.engineer : shift.plain}</p>
          <p className="analogy">
            <strong>Think of it like this:</strong> {shift.analogy}
          </p>
          {lens === 'everyone' && (
            <details className="under-hood">
              <summary>
                <span className="mono">{'</>'}</span> The technical version
              </summary>
              <p>{shift.engineer}</p>
            </details>
          )}
        </div>

        {shift.id === 'certain-to-probable' && (
          <div className="shift-demo">
            <h3 className="mini-head">Try it yourself</h3>
            <ProbabilityDemo lens={lens} />
          </div>
        )}

        <div className="shift-axis" aria-hidden="true">
          <span className="axis-line" />
          {moments.map((m) => (
            <a
              key={m.event.id + m.role}
              className={`axis-dot role-${m.role}`}
              style={{ left: `${pct(m.event.year)}%`, '--dot': tracks[m.event.tracks[0]].color } as CSSProperties}
              href={href({ page: 'journey', id: m.event.id })}
              title={`${m.event.year} · ${m.event.title}`}
              tabIndex={-1}
            />
          ))}
          <span className="axis-label" style={{ left: 0 }}>
            {AXIS_START}
          </span>
          <span className="axis-label" style={{ right: 0 }}>
            {AXIS_END}
          </span>
        </div>

        <ol className="moment-path">
          {roleOrder.map((role) =>
            moments
              .filter((m) => m.role === role)
              .map((m) => (
                <li key={m.event.id + role} className={`moment role-${role}`}>
                  <a href={href({ page: 'journey', id: m.event.id })}>
                    <span className="moment-role">{roleLabels[role].short}</span>
                    <span className="moment-year mono">{m.event.year}</span>
                    <strong>{m.event.title}</strong>
                    <span className="muted">{m.note}</span>
                  </a>
                </li>
              )),
          )}
        </ol>

        {shift.cites && (
          <details className="shift-refs">
            <summary>Read more: {shift.cites.length} key sources</summary>
            <CitationList ids={shift.cites} />
          </details>
        )}
      </div>
    </article>
  );
}

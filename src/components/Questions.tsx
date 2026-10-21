import { eventById, openProblems } from '../data';
import type { Lens } from '../prefs';
import { href } from '../router';
import { NextStep } from './NextStep';
import { Section } from './bits';

export function Questions({ lens }: { lens: Lens }) {
  return (
    <Section title="What we’re still working out" kicker="Step 4 · Open questions">
      <p className="muted page-intro">
        The history isn’t finished. These are the problems researchers, labs and governments are working on now:
        how to make AI do what we intend, understand what’s happening inside it, and decide who gets to set the
        rules.
      </p>
      <ul className="problem-grid">
        {openProblems.map((p) => (
          <li key={p.id} className="problem-card">
            <h2>{p.title}</h2>
            <p>{lens === 'engineer' ? p.engineer : p.plain}</p>
            <h3 className="mini-head">Approaches</h3>
            <ul className="tag-list">
              {p.approaches.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <p className="status">
              <strong>Status:</strong> {p.status}
            </p>
            {p.events && (
              <p className="related">
                {p.events.map((id) => {
                  const e = eventById.get(id);
                  return e ? (
                    <a key={id} href={href({ page: 'journey', id })}>
                      {e.year} · {e.title}
                    </a>
                  ) : null;
                })}
              </p>
            )}
          </li>
        ))}
      </ul>
      <NextStep
        to={{ page: 'sources' }}
        label="Go deeper: read the original papers"
        hint="Every source on this site, with full citations and exactly where to look."
      />
    </Section>
  );
}

import type { CSSProperties } from 'react';
import { eras, eraIds, events, people, terms, tracks } from '../data';
import { href } from '../router';

export function Home({ onTurningPoints }: { onTurningPoints: () => void }) {
  const firstOfEra = (eraId: (typeof eraIds)[number]) => events.find((e) => e.era === eraId);
  const milestones = events.filter((e) => e.milestone);

  return (
    <div className="home">
      <section className="hero">
        <p className="kicker">An interactive history · 1843 → 2026</p>
        <h1>
          How machines learned to <span className="grad">think</span>, <span className="grad">see</span>,{' '}
          <span className="grad">speak</span> and <span className="grad">act</span>.
        </h1>
        <p className="lede">
          Step through {events.length} moments that made artificial intelligence, from Turing’s imaginary machine to
          today’s frontier models and personal agents. Each stop has a short summary, key points and why it matters.
          Switch to <strong>Engineer</strong> mode for the technical details and original papers.
        </p>
        <div className="hero-actions">
          <a className="button primary" href={href({ page: 'journey', id: events[0]!.id })}>
            Start the journey →
          </a>
          <button type="button" className="button" onClick={onTurningPoints}>
            Just the {milestones.length} turning points
          </button>
          <a className="button ghost" href={href({ page: 'frontier' })}>
            Skip to 2026
          </a>
        </div>
        <dl className="hero-stats">
          <div>
            <dt>Moments</dt>
            <dd>{events.length}</dd>
          </div>
          <div>
            <dt>Chapters</dt>
            <dd>{eraIds.length}</dd>
          </div>
          <div>
            <dt>People</dt>
            <dd>{Object.keys(people).length}</dd>
          </div>
          <div>
            <dt>Words coined</dt>
            <dd>{terms.length}</dd>
          </div>
        </dl>
      </section>

      <section className="chapters">
        <h2 className="section-title">The chapters</h2>
        <ol className="chapter-grid">
          {eraIds.map((eraId, i) => {
            const era = eras[eraId];
            const start = firstOfEra(eraId);
            const count = events.filter((e) => e.era === eraId).length;
            return (
              <li key={eraId}>
                <a className={`chapter-card mood-${era.mood}`} href={start ? href({ page: 'journey', id: start.id }) : '#/'}>
                  <span className="chapter-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="chapter-years">
                    {era.span[0] === era.span[1] ? era.span[0] : `${era.span[0]}–${era.span[1]}`}
                  </span>
                  <span className="chapter-title">{era.title}</span>
                  <span className="chapter-tagline">{era.tagline}</span>
                  <span className="chapter-count">{count} moments</span>
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="tracks-intro">
        <h2 className="section-title">Follow one thread</h2>
        <p className="muted">
          AI isn’t one story. Filter the journey to follow just the thread you care about.
        </p>
        <ul className="track-grid">
          {Object.entries(tracks).map(([id, t]) => (
            <li key={id} style={{ '--chip': t.color } as CSSProperties}>
              <strong>
                <span className="chip-dot" /> {t.label}
              </strong>
              <span>{t.description}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

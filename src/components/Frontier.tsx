import type { CSSProperties } from 'react';
import { events, FRONTIER_AS_OF, labs } from '../data';
import { href } from '../router';
import { NextStep } from './NextStep';
import { Section, SourceList } from './bits';

const asOf = new Date(`${FRONTIER_AS_OF}T12:00:00Z`).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function Frontier() {
  const latest = events.filter((e) => e.era === 'frontier').slice().reverse();

  return (
    <Section title="The frontier, right now" kicker={`Step 3 · Snapshot as of ${asOf}`}>
      <div className="notice">
        <strong>This page goes out of date quickly.</strong> New models come out every week, and much of 2026 is
        based on news reports that haven’t fully settled. Each card links its sources. Treat specific numbers as
        claims to check.
      </div>

      <h2 className="section-title">Who’s building it</h2>
      <ul className="lab-grid">
        {labs.map((lab) => (
          <li key={lab.id} className="lab-card" style={{ '--lab': lab.color } as CSSProperties}>
            <header>
              <h3>{lab.name}</h3>
              <p className="muted">{lab.founded}</p>
            </header>
            <p>{lab.oneLiner}</p>
            <h4 className="mini-head">Current lineup</h4>
            <ul className="model-list">
              {lab.models.map((m) => (
                <li key={m.name}>
                  <span className="model-name">{m.name}</span>
                  <span className="model-date mono">{m.date}</span>
                  <span className="model-note">{m.note}</span>
                </li>
              ))}
            </ul>
            <h4 className="mini-head">Focus</h4>
            <ul className="tag-list">
              {lab.focus.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <p className="watch">
              <strong>Watch:</strong> {lab.watch}
            </p>
            <SourceList sources={lab.sources} />
          </li>
        ))}
      </ul>

      <h2 className="section-title">What happened in 2026</h2>
      <ol className="latest-list">
        {latest.map((e) => (
          <li key={e.id}>
            <a href={href({ page: 'journey', id: e.id })}>
              <span className="mono">{e.date}</span>
              <strong>{e.title}</strong>
              <span className="muted">{e.oneLiner}</span>
            </a>
          </li>
        ))}
      </ol>

      <NextStep
        to={{ page: 'questions' }}
        label="Step 4 · What’s still unsolved"
        hint="Alignment, interpretability, agents, governance: the problems being worked on right now."
      />
    </Section>
  );
}

import type { CSSProperties } from 'react';
import { citationIds, eras, eraIds, events, people, shifts, tracks } from '../data';
import { href, type Route } from '../router';

const steps: { n: number; to: Route; title: string; time: string; body: string }[] = [
  {
    n: 1,
    to: { page: 'shifts' },
    title: 'The big shifts',
    time: '~10 min',
    body: 'The seven big ideas that changed, including why old AI always gave the same answer and today’s doesn’t. Includes a hands-on demo.',
  },
  {
    n: 2,
    to: { page: 'journey' },
    title: 'The journey',
    time: '~45 min, or dip in',
    body: 'Step through every key moment from 1843 to today. Each card has a summary, key points, why it matters and the original source.',
  },
  {
    n: 3,
    to: { page: 'frontier' },
    title: 'The 2026 frontier',
    time: '~5 min',
    body: 'Who is building what right now: Anthropic, OpenAI, Google DeepMind, xAI, Meta and the Chinese open-model labs.',
  },
  {
    n: 4,
    to: { page: 'questions' },
    title: 'Open questions',
    time: '~5 min',
    body: 'Alignment, interpretability, agents and governance: the problems nobody has solved yet.',
  },
];

export function Home({ onTurningPoints }: { onTurningPoints: () => void }) {
  const firstOfEra = (eraId: (typeof eraIds)[number]) => events.find((e) => e.era === eraId);
  const milestones = events.filter((e) => e.milestone);
  const probability = shifts.find((s) => s.id === 'certain-to-probable')!;

  return (
    <div className="home">
      <section className="hero">
        <p className="kicker">An interactive history · 1843 → 2026</p>
        <h1>
          How machines learned to <span className="grad">think</span>, <span className="grad">see</span>,{' '}
          <span className="grad">speak</span> and <span className="grad">act</span>.
        </h1>
        <p className="lede">
          A visual guide to {events.length} moments that made artificial intelligence, for complete beginners and
          for engineers. Use the <strong>Everyone / Engineer</strong> switch in the top bar to choose how much
          technical detail you see.
        </p>
        <div className="hero-actions">
          <a className="button primary" href={href({ page: 'shifts' })}>
            Start the tour →
          </a>
          <a className="button" href={href({ page: 'journey', id: events[0]!.id })}>
            Jump into the timeline
          </a>
          <button type="button" className="button ghost" onClick={onTurningPoints}>
            Just the {milestones.length} turning points
          </button>
        </div>
      </section>

      <a className="big-idea" href={href({ page: 'shifts', id: probability.id })}>
        <span className="kicker">The big idea in one picture</span>
        <span className="big-idea-row">
          <span className="ft-box ft-from">
            <span className="ft-tag">Old AI</span>
            <strong>{probability.from.label}</strong>
            <span className="ft-example mono">“I feel sad” → “Why do you feel sad?” (every time)</span>
          </span>
          <span className="ft-arrow" aria-hidden="true">
            <svg viewBox="0 0 60 16" width="60" height="16">
              <path d="M0 8h52M46 2l8 6-8 6" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <span className="ft-box ft-to">
            <span className="ft-tag">Today’s AI</span>
            <strong>{probability.to.label}</strong>
            <span className="ft-example mono">Same question → a different, plausible answer each time</span>
          </span>
        </span>
        <span className="big-idea-cta">{probability.question} Try the demo →</span>
      </a>

      <section>
        <h2 className="section-title">Your path through the site</h2>
        <ol className="path">
          {steps.map((s) => (
            <li key={s.n}>
              <a className="path-step" href={href(s.to)}>
                <span className="path-num">{s.n}</span>
                <span className="path-title">{s.title}</span>
                <span className="path-time mono">{s.time}</span>
                <span className="path-body">{s.body}</span>
              </a>
            </li>
          ))}
        </ol>
        <p className="path-ref muted">
          Reference anytime: <a href={href({ page: 'timeline' })}>Timeline overview</a> ·{' '}
          <a href={href({ page: 'people' })}>{Object.keys(people).length} people</a> ·{' '}
          <a href={href({ page: 'words' })}>Who coined what</a> ·{' '}
          <a href={href({ page: 'sources' })}>{citationIds.length} cited sources</a>
        </p>
      </section>

      <section className="chapters">
        <h2 className="section-title">Or jump to a chapter</h2>
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
        <h2 className="section-title">Or follow one thread</h2>
        <p className="muted">
          AI isn’t one story. In the journey, filter to just the thread you care about.
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

import { terms } from '../data';
import { href } from '../router';
import { Section } from './bits';

export function Words() {
  return (
    <Section title="Who coined what" kicker="The vocabulary of AI">
      <p className="muted page-intro">
        Many of the words we use for AI were invented by a specific person at a specific moment. This is where
        they came from.
      </p>
      <ol className="words">
        {terms.map((t) => (
          <li key={t.term} className="word">
            <span className="word-year mono">{t.year}</span>
            <div>
              <h2>{t.term}</h2>
              <p className="word-by">Coined by {t.coinedBy}</p>
              <p>{t.meaning}</p>
              {t.event && (
                <a className="small-link" href={href({ page: 'journey', id: t.event })}>
                  See the moment →
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

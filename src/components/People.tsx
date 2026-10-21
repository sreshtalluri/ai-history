import { useEffect } from 'react';
import { events, people, personIds } from '../data';
import { href } from '../router';
import { NextStep } from './NextStep';
import { Initials, Section } from './bits';

export function People({ focus }: { focus: string | undefined }) {
  useEffect(() => {
    if (!focus) return;
    document.getElementById(`person-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focus]);

  // Order people by the first moment they appear in, so the page reads chronologically.
  const firstAppearance = (id: string) => events.findIndex((e) => e.people?.some((p) => p === id));
  const ordered = [...personIds].sort((a, b) => firstAppearance(a) - firstAppearance(b));

  return (
    <Section title="The people" kicker="Who built this">
      <p className="muted page-intro">
        Ordered by when they enter the story. Select a moment to jump to it in the journey.
      </p>
      <ul className="people-grid">
        {ordered.map((id) => {
          const person = people[id];
          const appearsIn = events.filter((e) => e.people?.some((p) => p === id));
          return (
            <li key={id} id={`person-${id}`} className={`person-card${focus === id ? ' is-focus' : ''}`}>
              <div className="person-head">
                <Initials name={person.name} size={48} />
                <div>
                  <h2>{person.name}</h2>
                  <p className="muted">
                    {person.role}
                    {'lifespan' in person && ` · ${person.lifespan}`}
                  </p>
                </div>
              </div>
              <p>{person.knownFor}</p>
              {appearsIn.length > 0 && (
                <ul className="appears-in">
                  {appearsIn.map((e) => (
                    <li key={e.id}>
                      <a href={href({ page: 'journey', id: e.id })}>
                        <span className="mono">{e.year}</span> {e.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
      <NextStep to={{ page: 'journey' }} label="Walk the journey" hint="See these people’s work in context, one moment at a time." />
    </Section>
  );
}

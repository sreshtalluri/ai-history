import type { CSSProperties, ReactNode } from 'react';
import { people, tracks } from '../data';
import { href } from '../router';
import type { PersonId, Source, TrackId, Verification } from '../types';

export function TrackChip({ id, active, onClick }: { id: TrackId; active?: boolean; onClick?: () => void }) {
  const track = tracks[id];
  const style = { '--chip': track.color } as CSSProperties;
  if (onClick) {
    return (
      <button
        type="button"
        className={`chip chip-button${active ? ' is-active' : ''}`}
        style={style}
        onClick={onClick}
        aria-pressed={active}
        title={track.description}
      >
        <span className="chip-dot" />
        {track.label}
      </button>
    );
  }
  return (
    <span className="chip" style={style} title={track.description}>
      <span className="chip-dot" />
      {track.label}
    </span>
  );
}

export function Initials({ name, size = 40 }: { name: string; size?: number }) {
  const letters = name
    .replace(/\(.*?\)|et al\.|&.*$/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  // Stable hue per name so the same person always gets the same colour.
  const hue = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
  return (
    <span
      className="avatar"
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.38, '--hue': hue } as CSSProperties}
    >
      {letters}
    </span>
  );
}

export function PersonPill({ id }: { id: PersonId }) {
  const person = people[id];
  return (
    <a className="person-pill" href={href({ page: 'people', id })} title={person.knownFor}>
      <Initials name={person.name} size={26} />
      <span>{person.name}</span>
    </a>
  );
}

const verificationCopy: Record<Verification, { label: string; hint: string }> = {
  established: { label: 'Established history', hint: 'Well documented across many sources.' },
  primary: { label: 'Primary source', hint: 'Confirmed by the organisation involved.' },
  reported: {
    label: 'Recent: check sources',
    hint: 'Based on news reports from 2026 that may not have settled yet. Check the linked sources.',
  },
};

export function VerificationBadge({ level }: { level: Verification }) {
  const copy = verificationCopy[level];
  return (
    <span className={`badge badge-${level}`} title={copy.hint}>
      {copy.label}
    </span>
  );
}

export function SourceList({ sources }: { sources: readonly Source[] }) {
  return (
    <ul className="sources">
      {sources.map((s) => (
        <li key={s.url}>
          <a href={s.url} target="_blank" rel="noreferrer noopener">
            {s.label} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Section({ title, kicker, children }: { title: string; kicker?: string; children: ReactNode }) {
  return (
    <section className="page">
      <header className="page-head">
        {kicker && <p className="kicker">{kicker}</p>}
        <h1>{title}</h1>
      </header>
      {children}
    </section>
  );
}

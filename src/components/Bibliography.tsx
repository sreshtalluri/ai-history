import { useMemo, useState } from 'react';
import { citationIds, citations, events, shifts } from '../data';
import { href } from '../router';
import type { Citation, CitationId } from '../types';
import { Reference } from './Citations';
import { Section } from './bits';

const typeLabels: Record<Citation['type'], string> = {
  paper: 'Papers',
  book: 'Books',
  report: 'Reports',
  web: 'Articles & announcements',
  law: 'Laws & declarations',
};

export function Bibliography() {
  const [query, setQuery] = useState('');

  const citedBy = useMemo(() => {
    const map = new Map<CitationId, { label: string; to: string }[]>();
    const add = (id: CitationId, label: string, to: string) => map.set(id, [...(map.get(id) ?? []), { label, to }]);
    for (const e of events) for (const c of e.cites ?? []) add(c, `${e.year} · ${e.title}`, href({ page: 'journey', id: e.id }));
    for (const s of shifts) for (const c of s.cites ?? []) add(c, `Shift: ${s.title}`, href({ page: 'shifts', id: s.id }));
    return map;
  }, []);

  const q = query.trim().toLowerCase();
  const ids = [...citationIds]
    .sort((a, b) => citations[a].year - citations[b].year)
    .filter((id) => {
      if (!q) return true;
      const c: Citation = citations[id];
      return `${c.authors} ${c.title} ${c.year} ${c.venue ?? ''}`.toLowerCase().includes(q);
    });

  return (
    <Section title="Sources & further reading" kicker="Bibliography">
      <p className="muted page-intro">
        Every paper, book and announcement cited on this site, in chronological order, in APA style. “Where to
        look” points to the exact section, figure or equation. DOIs and arXiv IDs are checked automatically against
        Crossref and arXiv. News coverage of 2026 events is linked on each event’s card.
      </p>
      <input
        className="search"
        type="search"
        placeholder="Search authors, titles, years…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search sources"
      />
      <p className="filter-count">
        {ids.length} of {citationIds.length} sources
      </p>
      <ol className="biblio">
        {ids.map((id) => {
          const c: Citation = citations[id];
          return (
            <li key={id} className="biblio-item">
              <span className="biblio-year mono">{c.year}</span>
              <div>
                <span className="biblio-type">{typeLabels[c.type]}</span>
                <Reference c={c} id={id} />
                {citedBy.get(id) && (
                  <p className="cited-by">
                    Cited in:{' '}
                    {citedBy.get(id)!.map((x, i) => (
                      <span key={x.to}>
                        {i > 0 && ' · '}
                        <a href={x.to}>{x.label}</a>
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

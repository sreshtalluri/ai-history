import { describe, expect, it } from 'vitest';
import { parseHash, href } from '../router';
import { probabilities } from '../components/ProbabilityDemo';
import { citationIds, citations, eras, eraIds, eventById, events, labs, openProblems, people, personIds, shifts, terms } from './index';

describe('timeline data', () => {
  it('has unique, URL-safe event ids', () => {
    const ids = events.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('is in chronological order', () => {
    for (let i = 1; i < events.length; i++) {
      expect(events[i]!.year).toBeGreaterThanOrEqual(events[i - 1]!.year);
    }
  });

  it('places every event inside its era span', () => {
    for (const e of events) {
      const [start, end] = eras[e.era].span;
      expect(e.year, `${e.id} (${e.year}) outside ${e.era}`).toBeGreaterThanOrEqual(start);
      expect(e.year, `${e.id} (${e.year}) outside ${e.era}`).toBeLessThanOrEqual(end);
    }
  });

  it('gives every era at least one event, in era order', () => {
    const order = events.map((e) => eraIds.indexOf(e.era));
    for (const eraId of eraIds) expect(events.some((e) => e.era === eraId)).toBe(true);
    for (let i = 1; i < order.length; i++) expect(order[i]!).toBeGreaterThanOrEqual(order[i - 1]!);
  });

  it('has the content every card needs', () => {
    for (const e of events) {
      expect(e.title.length, e.id).toBeGreaterThan(0);
      expect(e.oneLiner.length, e.id).toBeGreaterThan(0);
      expect(e.keyPoints.length, e.id).toBeGreaterThanOrEqual(3);
      expect(e.whyItMatters.length, e.id).toBeGreaterThan(0);
    }
  });

  it('cites sources for every recent (2026) event', () => {
    for (const e of events.filter((e) => e.year >= 2026)) {
      expect(e.sources?.length ?? 0, e.id).toBeGreaterThan(0);
      expect(e.verification, e.id).toBeDefined();
    }
  });

  it('uses https links only', () => {
    const urls = [
      ...events.flatMap((e) => e.sources ?? []),
      ...labs.flatMap((l) => l.sources),
    ].map((s) => s.url);
    for (const url of urls) expect(url).toMatch(/^https:\/\//);
  });
});

describe('cross references', () => {
  it('links every term and open problem to a real event', () => {
    for (const t of terms) if (t.event) expect(eventById.has(t.event), t.term).toBe(true);
    for (const p of openProblems) for (const id of p.events ?? []) expect(eventById.has(id), id).toBe(true);
  });

  it('features every person in at least one event', () => {
    const featured = new Set(events.flatMap((e) => e.people ?? []));
    const missing = personIds.filter((id) => !featured.has(id));
    expect(missing, `people with no event: ${missing.join(', ')}`).toEqual([]);
    expect(Object.keys(people).length).toBe(personIds.length);
  });
});

describe('big shifts', () => {
  it('ties every shift to real events covering old way → tipping point → new normal', () => {
    for (const shift of shifts) {
      for (const m of shift.moments) expect(eventById.has(m.event), `${shift.id} → ${m.event}`).toBe(true);
      for (const role of ['old', 'seed', 'tip', 'norm'] as const) {
        expect(shift.moments.some((m) => m.role === role), `${shift.id} missing ${role}`).toBe(true);
      }
    }
  });

  it('has unique shift ids', () => {
    expect(new Set(shifts.map((s) => s.id)).size).toBe(shifts.length);
  });
});

describe('citations', () => {
  it('cites a primary source for every turning point', () => {
    for (const e of events.filter((e) => e.milestone && e.year < 2026)) {
      expect(e.cites?.length ?? 0, e.id).toBeGreaterThan(0);
    }
  });

  it('gives every citation a way to find it', () => {
    for (const id of citationIds) {
      const c = citations[id];
      const findable = 'doi' in c || 'arxiv' in c || 'url' in c || c.type === 'book';
      expect(findable, id).toBe(true);
    }
  });

  it('uses every citation somewhere on the site', () => {
    const used = new Set([...events.flatMap((e) => e.cites ?? []), ...shifts.flatMap((s) => s.cites ?? [])]);
    const orphans = citationIds.filter((id) => !used.has(id));
    expect(orphans).toEqual([]);
  });
});

describe('probability demo', () => {
  const choices = [
    { word: 'a', logit: 2 },
    { word: 'b', logit: 1 },
    { word: 'c', logit: 0 },
  ];

  it('is greedy (deterministic) at temperature 0', () => {
    expect(probabilities(choices, 0)).toEqual([1, 0, 0]);
  });

  it('forms a distribution that flattens as temperature rises', () => {
    const cool = probabilities(choices, 0.5);
    const hot = probabilities(choices, 2);
    for (const p of [cool, hot]) expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    expect(cool[0]!).toBeGreaterThan(hot[0]!);
  });
});

describe('router', () => {
  it('round-trips routes', () => {
    for (const route of [
      { page: 'home' },
      { page: 'journey', id: 'transformer' },
      { page: 'people', id: 'turing' },
      { page: 'frontier' },
      { page: 'shifts', id: 'certain-to-probable' },
      { page: 'sources' },
    ] as const) {
      expect(parseHash(href(route))).toEqual(route);
    }
  });

  it('falls back to home for unknown routes', () => {
    expect(parseHash('#/nope')).toEqual({ page: 'home' });
    expect(parseHash('')).toEqual({ page: 'home' });
  });
});

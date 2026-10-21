import { describe, expect, it } from 'vitest';
import { parseHash, href } from '../router';
import { eras, eraIds, eventById, events, labs, openProblems, people, personIds, terms } from './index';

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

describe('router', () => {
  it('round-trips routes', () => {
    for (const route of [
      { page: 'home' },
      { page: 'journey', id: 'transformer' },
      { page: 'people', id: 'turing' },
      { page: 'frontier' },
    ] as const) {
      expect(parseHash(href(route))).toEqual(route);
    }
  });

  it('falls back to home for unknown routes', () => {
    expect(parseHash('#/nope')).toEqual({ page: 'home' });
    expect(parseHash('')).toEqual({ page: 'home' });
  });
});

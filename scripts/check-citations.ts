/**
 * Verifies the bibliography against the real world:
 *  - every DOI resolves on Crossref and its title matches ours
 *  - every arXiv id resolves and its title matches ours
 *  - every other URL (citations, event sources, lab sources) responds
 * Run with: npm run check-citations   (needs network access)
 */
import { citations } from '../src/data/citations';
import { events, labs } from '../src/data';

const words = (s: string) =>
  new Set(s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 3));

function similar(a: string, b: string): boolean {
  const wa = words(a);
  const wb = words(b);
  // Compare against the shorter title so a missing subtitle on either side still matches.
  const [small, big] = wa.size <= wb.size ? [wa, wb] : [wb, wa];
  if (small.size === 0) return false;
  let hit = 0;
  for (const w of small) if (big.has(w)) hit++;
  return hit / small.size >= 0.6;
}

async function fetchText(url: string): Promise<{ ok: boolean; status: number; text: string }> {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'ai-history-citation-check/1.0 (mailto:noreply@example.com)' } });
    return { ok: res.ok, status: res.status, text: res.ok ? await res.text() : '' };
  } catch (e) {
    return { ok: false, status: 0, text: String(e) };
  }
}

const problems: string[] = [];
const report = (msg: string) => {
  problems.push(msg);
  console.log('✗', msg);
};

for (const [id, c] of Object.entries(citations) as [string, (typeof citations)[keyof typeof citations]][]) {
  if ('doi' in c && c.doi) {
    const r = await fetchText(`https://api.crossref.org/works/${encodeURIComponent(c.doi)}`);
    if (!r.ok) report(`${id}: DOI ${c.doi} not found on Crossref (${r.status})`);
    else {
      const found: string = JSON.parse(r.text).message?.title?.[0] ?? '';
      if (!similar(c.title, found)) report(`${id}: DOI title mismatch\n    ours:     ${c.title}\n    crossref: ${found}`);
      else console.log('✓', id, 'DOI');
    }
  }
  if ('arxiv' in c && c.arxiv) {
    const r = await fetchText(`https://export.arxiv.org/api/query?id_list=${c.arxiv}`);
    const found = r.text.match(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/\s+/g, ' ').trim() ?? '';
    if (!r.ok || !found) report(`${id}: arXiv ${c.arxiv} not found (${r.status})`);
    else if (!similar(c.title, found)) report(`${id}: arXiv title mismatch\n    ours:  ${c.title}\n    arxiv: ${found}`);
    else console.log('✓', id, 'arXiv');
  }
}

const urls = new Set<string>([
  ...Object.values(citations).flatMap((c) => ('url' in c && c.url ? [c.url] : [])),
  ...events.flatMap((e) => (e.sources ?? []).map((s) => s.url)),
  ...labs.flatMap((l) => l.sources.map((s) => s.url)),
]);
for (const url of urls) {
  const r = await fetchText(url);
  // Some news sites block bots (401/403/429); report those separately, not as broken.
  if (r.ok) console.log('✓', url);
  else if ([401, 403, 429].includes(r.status)) console.log('?', url, `(${r.status}, blocks automated checks; verify by hand)`);
  else report(`URL ${url} → ${r.status || r.text}`);
}

console.log(problems.length ? `\n${problems.length} problem(s)` : '\nAll citations verified.');
process.exit(problems.length ? 1 : 0);

# The Story of AI

An interactive, visual walkthrough of the history of artificial intelligence, from Ada Lovelace (1843) and Turing's universal machine (1936) to the frontier models, personal agents and safety questions of 2026.

It's written for two audiences at once:

- **Everyone** mode: a plain-language summary, key points and "why it matters" for each moment.
- **Engineer** mode: adds an "Under the hood" panel (architectures, equations, training details) and links to the original papers.

## What's inside

The site has a guided four-step path (numbered in the top nav), plus reference pages.

| Section | What it is |
| --- | --- |
| **1 · Big Shifts** | Seven big changes in *how* AI works: rules → learning, deterministic → probabilistic, hand-picked features → learned representations, narrow → general, cleverness → scale, recognise → generate, answer → act. Each links to the moments where the old way peaked, the first signs appeared, the tipping point hit and the new normal set in. Includes a hands-on demo comparing a 1966-style rule bot with a toy language model that has a temperature slider. |
| **2 · Journey** | A full-screen 3D stage: one animated clay-style object per moment (32 unique hero objects for the turning points and chapter openers, plus one per thread), the year in huge type behind it, and a chapter scrubber. Drag to rotate; ← → or swipe to move; "Learn more" opens the full details, shift links and citations. Filter by thread or show only turning points. |
| **3 · 2026 Frontier** / **4 · Open Questions** | See below. |
| **Timeline** | The whole history on one scrollable page, grouped into 10 chapters. |
| **People** | 45 key figures, each linked to the moments they shaped. |
| **Words** | Who coined what: "robot", "artificial intelligence", "machine learning", "Transformer", "vibe coding", and more. |
| **2026 Frontier** | A dated snapshot of Anthropic, OpenAI, Google DeepMind, xAI, Meta and the Chinese open-weight labs. |
| **Open Questions** | Alignment, interpretability, agents, dangerous capabilities, governance and societal impact. |
| **Sources** | A searchable bibliography of every cited paper, book, report and law in APA style, each with "where to look" (section / figure / equation) and DOI, arXiv and PDF links. |

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # data-integrity tests (ids, chronology, cross-references, sources)
npm run build      # type-check + production build into dist/
npm run check-citations  # network: verify every DOI/arXiv id against Crossref/arXiv titles, and every URL
```

Stack: Vite + React + TypeScript in strict mode, with three.js for the 3D stage. three.js (~130 kB gzipped) loads lazily, only when a 3D stage is on screen, and falls back to a static placeholder without WebGL or with reduced motion. All content is typed data in `src/data/`. Event → era, event → person and term → event references are checked by the compiler or by the tests, so a typo in an id fails the build.

## Editing content

- `src/data/events-history.ts`: prelude through 2021
- `src/data/events-modern.ts`: 2022 to now
- `src/data/frontier.ts`: lab snapshot (`FRONTIER_AS_OF`) and open problems
- `src/three/`: the 3D kit (`kit.ts`), stage engine (`stage.ts`) and object library (`objects.ts`, `heroes-early.ts`, `heroes-modern.ts`). Give a moment its own object by adding a builder keyed by its event id.
- `src/data/shifts.ts`: the big shifts and the moments that mark each one
- `src/data/citations.ts`: the bibliography (events and shifts cite it by typed id)
- `src/data/people.ts`, `terms.ts`, `eras.ts`, `tracks.ts`

Every 2026 event must have `sources` and a `verification` level (enforced by tests). Events marked `reported` show a "Recent: check sources" badge, because much 2026 coverage is still settling.

## Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`. To turn it on once: **Settings → Pages → Build and deployment → Source: GitHub Actions**. The site uses hash routing and a relative base path, so it works at any URL.

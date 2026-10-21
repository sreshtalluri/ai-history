# The Story of AI

An interactive, visual walkthrough of the history of artificial intelligence, from Ada Lovelace (1843) and Turing's universal machine (1936) to the frontier models, personal agents and safety questions of 2026.

It's written for two audiences at once:

- **Everyone** mode: a plain-language summary, key points and "why it matters" for each moment.
- **Engineer** mode: adds an "Under the hood" panel (architectures, equations, training details) and links to the original papers.

## What's inside

| Section | What it is |
| --- | --- |
| **Journey** | Step through 87 moments one card at a time (← → keys work). Filter by thread (LLMs, vision, video, speech, robotics, safety…) or show only turning points. |
| **Timeline** | The whole history on one scrollable page, grouped into 10 chapters. |
| **People** | 45 key figures, each linked to the moments they shaped. |
| **Words** | Who coined what: "robot", "artificial intelligence", "machine learning", "Transformer", "vibe coding", and more. |
| **2026 Frontier** | A dated snapshot of Anthropic, OpenAI, Google DeepMind, xAI, Meta and the Chinese open-weight labs. |
| **Open Questions** | Alignment, interpretability, agents, dangerous capabilities, governance and societal impact. |

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # data-integrity tests (ids, chronology, cross-references, sources)
npm run build      # type-check + production build into dist/
```

Stack: Vite + React + TypeScript in strict mode. All content is typed data in `src/data/`. Event → era, event → person and term → event references are checked by the compiler or by the tests, so a typo in an id fails the build.

## Editing content

- `src/data/events-history.ts`: prelude through 2021
- `src/data/events-modern.ts`: 2022 to now
- `src/data/frontier.ts`: lab snapshot (`FRONTIER_AS_OF`) and open problems
- `src/data/people.ts`, `terms.ts`, `eras.ts`, `tracks.ts`

Every 2026 event must have `sources` and a `verification` level (enforced by tests). Events marked `reported` show a "Recent: check sources" badge, because much 2026 coverage is still settling.

## Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`. To turn it on once: **Settings → Pages → Build and deployment → Source: GitHub Actions**. The site uses hash routing and a relative base path, so it works at any URL.

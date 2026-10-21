import { useEffect, useState } from 'react';
import { Bibliography } from './components/Bibliography';
import { Frontier } from './components/Frontier';
import { Home } from './components/Home';
import { Journey } from './components/Journey';
import { People } from './components/People';
import { Questions } from './components/Questions';
import { Shifts } from './components/Shifts';
import { Timeline } from './components/Timeline';
import { Words } from './components/Words';
import { noFilters, type Filters } from './filters';
import { lenses, themes, usePersistentState, type Theme } from './prefs';
import { events } from './data';
import { href, navigate, useRoute, type PageName } from './router';

/** The guided path, in reading order, then reference pages. */
const path: { page: PageName; label: string }[] = [
  { page: 'shifts', label: 'Big Shifts' },
  { page: 'journey', label: 'Journey' },
  { page: 'frontier', label: '2026 Frontier' },
  { page: 'questions', label: 'Open Questions' },
];
const reference: { page: PageName; label: string }[] = [
  { page: 'timeline', label: 'Timeline' },
  { page: 'people', label: 'People' },
  { page: 'words', label: 'Words' },
  { page: 'sources', label: 'Sources' },
];

const themeIcon: Record<Theme, string> = { system: '◐', light: '☀', dark: '☾' };

export function App() {
  const route = useRoute();
  const [lens, setLens] = usePersistentState('ai-history:lens', lenses, 'everyone');
  const [theme, setTheme] = usePersistentState('ai-history:theme', themes, 'dark');
  const [filters, setFilters] = useState<Filters>(noFilters);

  useEffect(() => {
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (route.page !== 'journey') window.scrollTo(0, 0);
  }, [route.page]);

  const cycleTheme = () => setTheme(themes[(themes.indexOf(theme) + 1) % themes.length]!);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href={href({ page: 'home' })}>
          <span className="brand-mark" aria-hidden="true" />
          The Story of AI
        </a>
        <nav className="site-nav" aria-label="Sections">
          {path.map((n, i) => (
            <a key={n.page} href={href({ page: n.page })} aria-current={route.page === n.page ? 'page' : undefined}>
              <span className="nav-step">{i + 1}</span>
              {n.label}
            </a>
          ))}
          <span className="nav-divider" aria-hidden="true" />
          {reference.map((n) => (
            <a
              key={n.page}
              className="nav-ref"
              href={href({ page: n.page })}
              aria-current={route.page === n.page ? 'page' : undefined}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="controls">
          <div className="segmented" role="group" aria-label="Reading level">
            {lenses.map((l) => (
              <button key={l} type="button" aria-pressed={lens === l} onClick={() => setLens(l)}>
                {l === 'everyone' ? 'Everyone' : 'Engineer'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={cycleTheme}
            aria-label={`Theme: ${theme}. Click to change.`}
            title={`Theme: ${theme}`}
          >
            {themeIcon[theme]}
          </button>
        </div>
      </header>

      <main id="main" className={route.page === 'journey' ? 'is-stage' : undefined}>
        {route.page === 'home' && (
          <Home
            onTurningPoints={() => {
              setFilters({ tracks: new Set(), milestonesOnly: true });
              const first = events.find((e) => e.milestone);
              if (first) navigate({ page: 'journey', id: first.id });
            }}
          />
        )}
        {route.page === 'journey' && (
          <Journey id={route.id} lens={lens} filters={filters} onFiltersChange={setFilters} />
        )}
        {route.page === 'timeline' && <Timeline filters={filters} onFiltersChange={setFilters} />}
        {route.page === 'people' && <People focus={route.id} />}
        {route.page === 'words' && <Words />}
        {route.page === 'frontier' && <Frontier />}
        {route.page === 'questions' && <Questions lens={lens} />}
        {route.page === 'shifts' && <Shifts lens={lens} focus={route.id} />}
        {route.page === 'sources' && <Bibliography />}
      </main>

      <footer className="site-footer" hidden={route.page === 'journey'}>
        <p>
          Built as an open learning resource. History before 2024 is well documented; 2025–26 entries cite news
          sources and may change.{' '}
          <a href="https://github.com/sreshtalluri/ai-history" target="_blank" rel="noreferrer noopener">
            Suggest a correction on GitHub ↗
          </a>
        </p>
      </footer>
    </>
  );
}

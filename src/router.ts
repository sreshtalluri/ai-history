import { useEffect, useState } from 'react';

export type Route =
  | { page: 'home' }
  | { page: 'journey'; id?: string }
  | { page: 'timeline' }
  | { page: 'people'; id?: string }
  | { page: 'words' }
  | { page: 'frontier' }
  | { page: 'questions' };

export type PageName = Route['page'];

const simplePages = ['timeline', 'words', 'frontier', 'questions'] as const;

export function parseHash(hash: string): Route {
  const [page, id] = hash.replace(/^#\/?/, '').split('/');
  if (page === 'journey' || page === 'people') return id ? { page, id: decodeURIComponent(id) } : { page };
  const simple = simplePages.find((p) => p === page);
  return simple ? { page: simple } : { page: 'home' };
}

export function href(route: Route): string {
  if (route.page === 'home') return '#/';
  if ((route.page === 'journey' || route.page === 'people') && route.id) {
    return `#/${route.page}/${encodeURIComponent(route.id)}`;
  }
  return `#/${route.page}`;
}

export function navigate(route: Route): void {
  window.location.hash = href(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

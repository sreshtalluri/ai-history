import { href, type Route } from '../router';

/** The "where to go next" prompt at the end of each page, so the site reads in order. */
export function NextStep({ to, label, hint }: { to: Route; label: string; hint: string }) {
  return (
    <a className="next-step" href={href(to)}>
      <span className="next-step-kicker">Next</span>
      <span className="next-step-label">{label} →</span>
      <span className="next-step-hint">{hint}</span>
    </a>
  );
}

import { useState } from 'react';
import { citationLinks, citations, formatCitation } from '../data/citations';
import type { Citation, CitationId } from '../types';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the reference text is visible to select by hand.
    }
  };
  return (
    <button type="button" className="link-button" onClick={copy}>
      {copied ? 'Copied ✓' : 'Copy citation'}
    </button>
  );
}

export function Reference({ c, id }: { c: Citation; id?: string }) {
  return (
    <div className="ref" id={id ? `ref-${id}` : undefined}>
      <p className="ref-text">
        {c.authors} ({c.year}). <cite>{c.title}</cite>.
        {c.venue && (
          <>
            {' '}
            <em>{c.venue}</em>
            {c.volume && `, ${c.volume}`}
            {c.issue && `(${c.issue})`}
            {c.pages && `, ${c.pages}`}.
          </>
        )}
      </p>
      {c.pinpoint && (
        <p className="ref-pinpoint">
          <span className="ref-pin" aria-hidden="true">
            ⌖
          </span>{' '}
          <strong>Where to look:</strong> {c.pinpoint}
        </p>
      )}
      <p className="ref-links">
        {citationLinks(c).map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noreferrer noopener">
            {l.label} ↗
          </a>
        ))}
        <CopyButton text={formatCitation(c)} />
      </p>
    </div>
  );
}

export function CitationList({ ids }: { ids: readonly CitationId[] }) {
  return (
    <ol className="ref-list">
      {ids.map((id) => (
        <li key={id}>
          <Reference c={citations[id]} />
        </li>
      ))}
    </ol>
  );
}

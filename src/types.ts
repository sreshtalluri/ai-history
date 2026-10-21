import type { EraId } from './data/eras';
import type { PersonId } from './data/people';
import type { TrackId } from './data/tracks';
import type { CitationId } from './data/citations';

export type { CitationId, EraId, PersonId, TrackId };

export interface Track {
  label: string;
  /** Hex colour used for badges, dots and accents. */
  color: string;
  description: string;
}

export interface Era {
  title: string;
  /** Inclusive start and end years. */
  span: readonly [number, number];
  tagline: string;
  summary: string;
  /** Booms and winters are shaded differently on the timeline. */
  mood: 'boom' | 'winter' | 'steady';
  /** Chapter accent colour: stage lighting and highlights. */
  accent: string;
}

export interface Person {
  name: string;
  lifespan?: string;
  role: string;
  knownFor: string;
}

export interface Source {
  label: string;
  url: string;
}

export interface Stat {
  value: string;
  label: string;
}

/**
 * How well a claim is backed. Pre-2026 history is well documented; many 2026
 * items come from news reports that haven't settled yet.
 */
export type Verification = 'established' | 'primary' | 'reported';

export interface AIEvent {
  /** Stable slug, used in URLs: #/journey/<id> */
  id: string;
  year: number;
  /** Optional finer date, e.g. "Nov 30" or "Summer". */
  date?: string;
  era: EraId;
  tracks: readonly [TrackId, ...TrackId[]];
  title: string;
  /** One sentence a newcomer can read in five seconds. */
  oneLiner: string;
  /** Two to four plain-language sentences. */
  summary: string;
  keyPoints: readonly string[];
  whyItMatters: string;
  /** Extra technical depth, shown in Engineer lens. */
  engineer?: string;
  people?: readonly PersonId[];
  coined?: { term: string; by: string };
  stat?: Stat;
  /** Turning points get a bigger dot and appear in "milestones only". */
  milestone?: boolean;
  verification?: Verification;
  /** Scholarly references (papers, books, reports) from the bibliography. */
  cites?: readonly CitationId[];
  /** Other links: news coverage, encyclopedia pages. */
  sources?: readonly Source[];
}

export interface Citation {
  type: 'paper' | 'book' | 'report' | 'web' | 'law';
  /** APA-style author list, e.g. "Vaswani, A., Shazeer, N., … & Polosukhin, I." */
  authors: string;
  year: number;
  title: string;
  /** Journal, proceedings, publisher or site. */
  venue?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  arxiv?: string;
  url?: string;
  /** Exactly where to look in the work: section, figure, equation. */
  pinpoint?: string;
}

/** Where an event sits within a big shift. */
export type ShiftRole = 'old' | 'seed' | 'tip' | 'norm';

export interface ShiftMoment {
  event: string;
  role: ShiftRole;
  note: string;
}

export interface Shift {
  id: string;
  /** e.g. "From rules to learning" */
  title: string;
  from: { label: string; example: string };
  to: { label: string; example: string };
  span: string;
  /** The hook question a newcomer would ask. */
  question: string;
  plain: string;
  analogy: string;
  engineer: string;
  moments: readonly ShiftMoment[];
  cites?: readonly CitationId[];
}

export interface Term {
  term: string;
  year: number | string;
  coinedBy: string;
  meaning: string;
  /** Related event id. */
  event?: string;
}

export interface LabModel {
  name: string;
  date: string;
  note: string;
}

export interface Lab {
  id: string;
  name: string;
  color: string;
  founded: string;
  oneLiner: string;
  models: readonly LabModel[];
  focus: readonly string[];
  watch: string;
  sources: readonly Source[];
}

export interface OpenProblem {
  id: string;
  title: string;
  plain: string;
  engineer: string;
  approaches: readonly string[];
  status: string;
  /** Related event ids. */
  events?: readonly string[];
}

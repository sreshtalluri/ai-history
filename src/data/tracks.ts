import type { Track } from '../types';

export const tracks = {
  foundations: {
    label: 'Foundations',
    color: '#8b5cf6',
    description: 'The math, theory and hardware that everything else stands on.',
  },
  symbolic: {
    label: 'Symbolic AI',
    color: '#a16207',
    description: 'Hand-written rules and logic: the dominant idea from the 1950s to the 1980s.',
  },
  learning: {
    label: 'Machine Learning',
    color: '#2563eb',
    description: 'Systems that learn patterns from data instead of following hand-written rules.',
  },
  language: {
    label: 'Language & LLMs',
    color: '#5b5bd6',
    description: 'Chatbots, translation and large language models.',
  },
  vision: {
    label: 'Vision & Images',
    color: '#0891b2',
    description: 'Recognising what is in a picture, and later generating pictures.',
  },
  video: {
    label: 'Video & Worlds',
    color: '#db2777',
    description: 'Generated video and interactive simulated worlds.',
  },
  audio: {
    label: 'Speech & Audio',
    color: '#ea580c',
    description: 'Speech recognition, synthetic voices and music.',
  },
  games: {
    label: 'Human vs Machine',
    color: '#dc2626',
    description: 'Games and contests where AI was measured against human champions.',
  },
  robotics: {
    label: 'Robotics',
    color: '#65a30d',
    description: 'AI with a body: factory arms, self-driving cars, humanoids.',
  },
  agents: {
    label: 'Agents',
    color: '#059669',
    description: 'AI that takes actions on its own: using tools, computers and the web.',
  },
  safety: {
    label: 'Safety & Policy',
    color: '#be123c',
    description: 'Alignment research, safety testing, laws and the fight over how AI should be governed.',
  },
  industry: {
    label: 'Industry & Compute',
    color: '#475569',
    description: 'Companies, chips, money and the infrastructure race.',
  },
} as const satisfies Record<string, Track>;

export type TrackId = keyof typeof tracks;

export const trackIds = Object.keys(tracks) as TrackId[];

import type { Era } from '../types';

export const eras = {
  prelude: {
    title: 'Prelude',
    span: [1843, 1935],
    tagline: 'The idea before the machine',
    summary:
      'Long before computers existed, people imagined machines that could reason. A mathematician wrote the first program for a machine that was never finished, and a playwright invented the word "robot".',
    mood: 'steady',
  },
  foundations: {
    title: 'Foundations',
    span: [1936, 1955],
    tagline: '"Can machines think?"',
    summary:
      'Alan Turing defines what a computer is, before one exists. Researchers model the brain as an electrical circuit. By 1950 the question is out in the open: could a machine think?',
    mood: 'steady',
  },
  birth: {
    title: 'Birth & Golden Age',
    span: [1956, 1972],
    tagline: 'A field gets its name',
    summary:
      'A 1956 summer workshop at Dartmouth names the field "artificial intelligence". Early programs prove theorems, play checkers and chat. Researchers predict human-level AI within a generation.',
    mood: 'boom',
  },
  winters: {
    title: 'Winters & Expert Systems',
    span: [1973, 1992],
    tagline: 'Hype, crash, repeat',
    summary:
      'The promises are too big, so funding dries up. Rule-based "expert systems" bring a business boom in the 1980s and then a second crash. Quietly, the core ideas of neural networks are worked out in this period.',
    mood: 'winter',
  },
  ml: {
    title: 'Machine Learning Rises',
    span: [1993, 2011],
    tagline: 'Let the data decide',
    summary:
      'AI stops trying to write the rules by hand and starts learning them from data. A computer beats the world chess champion, robot cars cross a desert, and the internet supplies data at a scale no one had before.',
    mood: 'steady',
  },
  deep: {
    title: 'Deep Learning Revolution',
    span: [2012, 2016],
    tagline: 'GPUs + data + neural nets',
    summary:
      'In 2012 a neural network trained on gaming graphics cards wins an image-recognition contest by a huge margin. Within four years, deep learning leads in vision, speech and translation, and AlphaGo beats one of the best Go players in the world.',
    mood: 'boom',
  },
  transformers: {
    title: 'Transformers & Scale',
    span: [2017, 2021],
    tagline: 'Attention is all you need',
    summary:
      'Google researchers publish the Transformer architecture. Labs find that making models bigger and training them on more text reliably makes them better. GPT-3 shows that one model can do many tasks from a few examples, and AlphaFold largely solves protein structure prediction.',
    mood: 'boom',
  },
  generative: {
    title: 'Generative AI Goes Mainstream',
    span: [2022, 2023],
    tagline: 'Everyone meets AI',
    summary:
      'Image generators go viral, and ChatGPT becomes one of the fastest-growing consumer apps ever. GPT-4, Claude and Gemini start a race between frontier labs. Governments begin to respond.',
    mood: 'boom',
  },
  reasoning: {
    title: 'Reasoning & Agents',
    span: [2024, 2025],
    tagline: 'From chatting to doing',
    summary:
      'Models learn to "think" before they answer, use computers, and write and run code for hours. Video gets sound, image editing gets close to photographic, and an open model from China briefly knocks hundreds of billions off Nvidia\'s value.',
    mood: 'boom',
  },
  frontier: {
    title: 'The Frontier Now',
    span: [2026, 2026],
    tagline: 'Power, restraint and the "AGI" question',
    summary:
      'The most capable models are now strong enough at hacking that labs hold some back, and governments step in directly. Always-on personal agents launch, and labs publicly argue over whether "AGI" has arrived. Coverage of this year is still settling, so check the sources.',
    mood: 'boom',
  },
} as const satisfies Record<string, Era>;

export type EraId = keyof typeof eras;

export const eraIds = Object.keys(eras) as EraId[];

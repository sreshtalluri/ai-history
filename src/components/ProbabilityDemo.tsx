import { useMemo, useState } from 'react';
import type { Lens } from '../prefs';

/**
 * A toy, side-by-side demo: a 1966-style rule bot (deterministic) next to a
 * tiny "language model" that samples from made-up word probabilities.
 */

interface Choice {
  word: string;
  logit: number;
  next?: readonly Choice[];
}

const PROMPT = 'The robot opened the door and';

const TREE: readonly Choice[] = [
  {
    word: 'saw',
    logit: 2.0,
    next: [
      { word: 'a garden.', logit: 1.8 },
      { word: 'its own reflection.', logit: 1.5 },
      { word: 'nothing at all.', logit: 1.0 },
      { word: 'the future.', logit: 0.4 },
    ],
  },
  {
    word: 'smiled',
    logit: 1.6,
    next: [
      { word: 'at the sun.', logit: 1.7 },
      { word: 'for the first time.', logit: 1.6 },
      { word: 'politely.', logit: 0.9 },
    ],
  },
  {
    word: 'stepped',
    logit: 1.5,
    next: [
      { word: 'outside.', logit: 2.0 },
      { word: 'into the rain.', logit: 1.6 },
      { word: 'into history.', logit: 0.5 },
    ],
  },
  {
    word: 'froze',
    logit: 1.1,
    next: [
      { word: 'in surprise.', logit: 1.5 },
      { word: 'completely.', logit: 1.2 },
      { word: 'like a statue.', logit: 1.0 },
    ],
  },
  {
    word: 'sang',
    logit: 0.2,
    next: [
      { word: 'a lullaby.', logit: 1.2 },
      { word: 'off-key.', logit: 1.0 },
    ],
  },
];

/** softmax(logits / T). T = 0 means greedy: all probability on the top choice. */
export function probabilities(choices: readonly Choice[], temperature: number): number[] {
  if (temperature <= 0) {
    const max = Math.max(...choices.map((c) => c.logit));
    const top = choices.findIndex((c) => c.logit === max);
    return choices.map((_, i) => (i === top ? 1 : 0));
  }
  const scaled = choices.map((c) => Math.exp(c.logit / temperature));
  const sum = scaled.reduce((a, b) => a + b, 0);
  return scaled.map((v) => v / sum);
}

function sample(probs: readonly number[]): number {
  let r = Math.random();
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i]!;
    if (r <= 0) return i;
  }
  return probs.length - 1;
}

function ruleBot(input: string): { reply: string; rule: string } {
  const feel = input.match(/\bi feel (.+?)[.!?]*$/i);
  if (feel) return { reply: `Why do you feel ${feel[1]}?`, rule: 'IF "I feel X" → "Why do you feel X?"' };
  const am = input.match(/\bi am (.+?)[.!?]*$/i);
  if (am) return { reply: `How long have you been ${am[1]}?`, rule: 'IF "I am X" → "How long have you been X?"' };
  if (/\b(mother|father|family)\b/i.test(input)) {
    return { reply: 'Tell me more about your family.', rule: 'IF mentions family → "Tell me more about your family."' };
  }
  return { reply: 'Please go on.', rule: 'OTHERWISE → "Please go on."' };
}

interface Generation {
  first: number;
  second: number;
}

export function ProbabilityDemo({ lens }: { lens: Lens }) {
  // Rule side
  const [input, setInput] = useState('I feel sad today');
  const [ruleAsks, setRuleAsks] = useState<string[]>([]);
  const rule = ruleBot(input);
  const askRule = () => setRuleAsks((r) => [rule.reply, ...r].slice(0, 6));

  // Model side
  const [temperature, setTemperature] = useState(1);
  const [gens, setGens] = useState<Generation[]>([]);
  const firstProbs = useMemo(() => probabilities(TREE, temperature), [temperature]);
  const latest = gens[0];
  const secondChoices = TREE[latest?.first ?? 0]!.next!;
  const secondProbs = useMemo(() => probabilities(secondChoices, temperature), [secondChoices, temperature]);

  const generate = () => {
    const first = sample(firstProbs);
    const second = sample(probabilities(TREE[first]!.next!, temperature));
    setGens((g) => [{ first, second }, ...g].slice(0, 6));
  };
  const text = (g: Generation) => `${TREE[g.first]!.word} ${TREE[g.first]!.next![g.second]!.word}`;
  const unique = new Set(gens.map(text)).size;

  return (
    <div className="demo">
      <section className="demo-side demo-rules">
        <header>
          <span className="demo-tag">1966 style</span>
          <h3>Rule-based bot</h3>
          <p className="muted">Deterministic: follows fixed rules written by a person.</p>
        </header>
        <label className="demo-label" htmlFor="rule-input">
          You say:
        </label>
        <input
          id="rule-input"
          className="demo-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setRuleAsks([]);
          }}
        />
        <p className="demo-rule mono">Rule used: {rule.rule}</p>
        <button type="button" className="button" onClick={askRule}>
          Ask again
        </button>
        <ol className="demo-outputs" aria-live="polite">
          {ruleAsks.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ol>
        {ruleAsks.length > 1 && (
          <p className="demo-verdict">
            Asked {ruleAsks.length} times → <strong>1</strong> unique answer. Always the same.
          </p>
        )}
      </section>

      <section className="demo-side demo-model">
        <header>
          <span className="demo-tag">2020s style</span>
          <h3>Language model (toy)</h3>
          <p className="muted">Probabilistic: picks each next word by weighted chance.</p>
        </header>
        <p className="demo-prompt">
          “{PROMPT} <span className="demo-blank">…</span>”
        </p>

        <div className="temp">
          <label htmlFor="temp">
            Randomness (temperature): <strong className="mono">{temperature.toFixed(1)}</strong>
          </label>
          <input
            id="temp"
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
          />
          <div className="temp-scale muted">
            <span>0 · always the top word</span>
            <span>2 · wild</span>
          </div>
        </div>

        <Bars
          title="Chances for the next word"
          labels={TREE.map((c) => c.word)}
          probs={firstProbs}
          logits={lens === 'engineer' ? TREE.map((c) => c.logit) : undefined}
          highlight={latest?.first}
        />
        {latest && (
          <Bars
            title={`…then, after “${TREE[latest.first]!.word}”`}
            labels={secondChoices.map((c) => c.word)}
            probs={secondProbs}
            logits={lens === 'engineer' ? secondChoices.map((c) => c.logit) : undefined}
            highlight={latest.second}
          />
        )}

        <button type="button" className="button primary" onClick={generate}>
          Generate
        </button>
        <ol className="demo-outputs" aria-live="polite">
          {gens.map((g, i) => (
            <li key={i}>
              {PROMPT} <strong>{text(g)}</strong>
            </li>
          ))}
        </ol>
        {gens.length > 1 && (
          <p className="demo-verdict">
            Generated {gens.length} times → <strong>{unique}</strong> unique answer{unique === 1 ? '' : 's'}.
            {temperature === 0 ? ' At temperature 0 it always picks the top word, so it acts deterministically.' : ''}
          </p>
        )}
      </section>

      <p className="demo-footnote muted">
        Toy example with made-up probabilities. A real model chooses from about 100,000 possible tokens at every
        step, using everything written so far.
        {lens === 'engineer' && ' Probabilities shown are softmax(logit / T); logits are in grey.'}
      </p>
    </div>
  );
}

function Bars({
  title,
  labels,
  probs,
  logits,
  highlight,
}: {
  title: string;
  labels: readonly string[];
  probs: readonly number[];
  logits?: readonly number[] | undefined;
  highlight?: number | undefined;
}) {
  return (
    <figure className="bars">
      <figcaption className="mini-head">{title}</figcaption>
      {labels.map((label, i) => {
        const p = probs[i] ?? 0;
        return (
          <div key={label} className={`bar-row${highlight === i ? ' is-picked' : ''}`}>
            <span className="bar-label">{label}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${Math.max(p * 100, 0.5)}%` }} />
            </span>
            <span className="bar-value mono">
              {Math.round(p * 100)}%{logits && <small> z={logits[i]?.toFixed(1)}</small>}
            </span>
          </div>
        );
      })}
    </figure>
  );
}

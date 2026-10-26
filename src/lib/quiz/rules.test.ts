import { describe, expect, it } from 'vitest';
import { evaluate, type Answers } from './rules';
import { questions } from './questions';

const strong: Answers = {
  amount: '350k-1m',
  purpose: 'equipment',
  industry: 'manufacturing',
  usBased: 'yes',
  forProfit: 'yes',
  owners: 'yes',
  years: 'over5',
  size: 'under100',
  credit: '720plus',
  federalDebt: 'no',
  bankruptcy: 'no',
  equity: 'yes',
};

describe('evaluate', () => {
  it('marks a strong applicant as eligible', () => {
    const r = evaluate(strong);
    expect(r.status).toBe('eligible');
    expect(r.blockers).toEqual([]);
  });

  it('rejects amounts over $5 million and suggests 504', () => {
    const r = evaluate({ ...strong, amount: 'over5m' });
    expect(r.status).toBe('ineligible');
    expect(r.alternatives.some((x) => x.name.includes('504'))).toBe(true);
  });

  it.each(['lending', 'passive_re', 'gambling', 'cannabis', 'adult', 'nonprofit'])(
    'rejects ineligible industry %s',
    (industry) => {
      expect(evaluate({ ...strong, industry }).status).toBe('ineligible');
    },
  );

  it.each([
    ['purpose', 'personal'],
    ['purpose', 'speculative'],
    ['usBased', 'no'],
    ['forProfit', 'no'],
    ['owners', 'no'],
    ['federalDebt', 'yes'],
  ])('rejects %s=%s', (key, value) => {
    expect(evaluate({ ...strong, [key]: value }).status).toBe('ineligible');
  });

  it('flags low credit for review and suggests a microloan', () => {
    const r = evaluate({ ...strong, credit: 'under640' });
    expect(r.status).toBe('review');
    expect(r.alternatives.some((x) => x.name.includes('Microloan'))).toBe(true);
  });

  it('flags a recent bankruptcy for review', () => {
    expect(evaluate({ ...strong, bankruptcy: 'recent' }).status).toBe('review');
  });

  it('flags unsure owner status for review', () => {
    expect(evaluate({ ...strong, owners: 'unsure' }).status).toBe('review');
  });

  it('flags a startup with no equity for review', () => {
    expect(evaluate({ ...strong, purpose: 'startup', years: 'planning', equity: 'no' }).status).toBe('review');
  });

  it('keeps a new business with equity as eligible with cautions', () => {
    const r = evaluate({ ...strong, years: 'under2' });
    expect(r.status).toBe('eligible');
    expect(r.cautions.length).toBeGreaterThan(0);
  });

  it('does not treat medium credit as a blocker', () => {
    expect(evaluate({ ...strong, credit: '640to679' }).status).toBe('eligible');
  });
});

describe('questions', () => {
  it('has unique ids and at least two options each', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of questions) expect(q.options.length).toBeGreaterThanOrEqual(2);
  });
});

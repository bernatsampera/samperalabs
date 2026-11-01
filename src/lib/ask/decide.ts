// Turns a visitor question into one outcome: shown, did-you-mean, blocked, or unavailable.
// NON-DETERMINISTIC: it calls Jev (see jev.ts). The rules below are plain code.
// Product decisions and the failure list: design-preview/home-experiences/product.md

import { DEFAULT_EXPERIENCE, EXPERIENCES, LANDING_QUESTIONS, getExperience } from './experiences';
import { askJev, JevError, type JevChoiceAnswer, type JevNoulAnswer, type JevQuestion } from './jev';

export const RULES = {
  scopeMin: 0.5, // below this, the question is not about Bernat
  showMin: 0.6, // the top experience needs at least this probability
  leadMin: 0.2, // and must lead the second by at least this much
  optionMin: 0.1, // "Did you mean" lists experiences above this
  maxOptions: 3,
  maxLength: 300,
};

export type Outcome = 'shown' | 'did-you-mean' | 'blocked' | 'unavailable';
export type Option = { id: string; title: string; ask: string; probability?: number };
export type Decision = {
  outcome: Outcome;
  experience?: Option;
  options?: Option[];
  followUps?: Option[];
  scope?: number;
  probabilities?: { id: string; probability: number }[];
  source: 'jev' | 'cache' | 'default' | 'fallback';
  reason?: string;
  ms: number;
};

const option = (id: string, probability?: number): Option => {
  const e = getExperience(id)!;
  return { id: e.id, title: e.title, ask: e.ask, ...(probability === undefined ? {} : { probability }) };
};
const followUpsOf = (id: string) => (getExperience(id)?.followUps ?? []).map((f) => option(f));

const CONTEXT = 'A visitor typed this message into the search box on the personal website of Bernat Sampera, an AI engineer.';
const QUESTIONS: Record<string, JevQuestion> = {
  scope: {
    type: 'noul',
    instructions: `${CONTEXT} Is the message about Bernat Sampera, his work, his projects, his writing, his ideas about AI, or this website? A message that speaks to the site as "you" is about Bernat.`,
  },
  experience: {
    type: 'choice',
    instructions: `${CONTEXT} Choose what the visitor most wants to see.`,
    criteria: Object.fromEntries(EXPERIENCES.map((e) => [e.id, e.describe])),
  },
};

/** Applies the rules to Jev's answers. Plain code, no model call. */
export function applyRules(scope: number, probabilities: Record<string, number>): Pick<Decision, 'outcome' | 'experience' | 'options' | 'followUps'> {
  const ranked = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);
  if (scope < RULES.scopeMin) return { outcome: 'blocked', options: LANDING_QUESTIONS.map((id) => option(id)) };
  const [[topId, top], [, second]] = ranked;
  if (top >= RULES.showMin && top - second >= RULES.leadMin) {
    return { outcome: 'shown', experience: option(topId, top), followUps: followUpsOf(topId) };
  }
  let picked = ranked.filter(([, p]) => p >= RULES.optionMin).slice(0, RULES.maxOptions);
  // Fewer than 2 clear candidates: nothing stands out, so offer the top 3.
  if (picked.length < 2) picked = ranked.slice(0, RULES.maxOptions);
  return { outcome: 'did-you-mean', options: picked.map(([id, p]) => option(id, p)) };
}

// Same question, same answer: a small in-memory cache saves Jev calls.
const CACHE_MAX = 500;
const CACHE_TTL = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; decision: Decision }>();
const normalize = (q: string) => q.toLowerCase().replace(/\s+/g, ' ').trim();

export async function decide(question: string): Promise<Decision> {
  const started = performance.now();
  const ms = () => Math.round(performance.now() - started);
  const q = question.trim();

  if (!q) {
    return { outcome: 'shown', experience: option(DEFAULT_EXPERIENCE), followUps: followUpsOf(DEFAULT_EXPERIENCE), source: 'default', ms: ms() };
  }

  const key = normalize(q);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL) return { ...hit.decision, source: 'cache', ms: ms() };

  try {
    const response = await askJev(q, QUESTIONS);
    const scope = (response.answers.scope as JevNoulAnswer).noul;
    const probabilities = (response.answers.experience as JevChoiceAnswer).probabilities;
    const decision: Decision = {
      ...applyRules(scope, probabilities),
      scope,
      probabilities: Object.entries(probabilities).sort((a, b) => b[1] - a[1]).map(([id, probability]) => ({ id, probability })),
      source: 'jev',
      ms: ms(),
    };
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!);
    cache.set(key, { at: Date.now(), decision });
    return decision;
  } catch (error) {
    const reason = error instanceof JevError ? error.reason : 'unknown';
    // Never log the question text.
    console.warn(`[ask] Jev unavailable: ${reason}. ${error instanceof Error ? error.message : ''}`);
    return { outcome: 'unavailable', options: LANDING_QUESTIONS.map((id) => option(id)), source: 'fallback', reason, ms: ms() };
  }
}

/** A click on a follow-up or a "Did you mean" option opens the experience directly, with no Jev call. */
export function open(id: string): Decision | null {
  if (!getExperience(id)) return null;
  return { outcome: 'shown', experience: option(id), followUps: followUpsOf(id), source: 'default', ms: 0 };
}

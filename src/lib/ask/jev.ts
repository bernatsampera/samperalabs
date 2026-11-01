// Jev client for the home page question box.
// NON-DETERMINISTIC: Jev is an AI model. Its answers are probabilities, and the same
// question can get different numbers. A decided value is a choice, not a fact.
// API contract: POST {JEV_BASE_URL}/v1/systemone, as used in property-tree-real-problem/lab/versions/06/lib/jev.node.ts.
// Settings: JEV_API_KEY (required), JEV_BASE_URL, JEV_MODEL, JEV_TIMEOUT_MS.
// A value in the process environment wins over .env, so tests can point Jev at a fake server.

import { z } from 'astro/zod';

export type JevChoiceQuestion = { type: 'choice'; instructions: string; criteria: Record<string, string> };
export type JevNoulQuestion = { type: 'noul'; instructions: string };
export type JevQuestion = JevChoiceQuestion | JevNoulQuestion;
export type JevChoiceAnswer = { type: 'choice'; choice: string; confidence: number; probabilities: Record<string, number> };
export type JevNoulAnswer = { type: 'noul'; noul: number };
export type JevAnswer = JevChoiceAnswer | JevNoulAnswer;
export type JevResponse = { model: string; answers: Record<string, JevAnswer> };

export class JevError extends Error {
  constructor(
    message: string,
    readonly reason: 'no-key' | 'timeout' | 'http' | 'network' | 'contract',
  ) {
    super(message);
  }
}

const answerSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('choice'),
    choice: z.string(),
    confidence: z.number().min(0).max(1),
    probabilities: z.record(z.string(), z.number().min(0).max(1)),
  }),
  z.object({ type: z.literal('noul'), noul: z.number().min(0).max(1) }),
]);
const responseSchema = z.object({
  model: z.string(),
  answers: z.record(z.string(), answerSchema),
});

export function jevSettings() {
  const env = import.meta.env;
  const key = (env.JEV_API_KEY ?? process.env.JEV_API_KEY ?? '').trim();
  const baseUrl = (env.JEV_BASE_URL ?? process.env.JEV_BASE_URL ?? 'https://api.typesafe.ai').replace(/\/$/, '');
  const model = env.JEV_MODEL ?? process.env.JEV_MODEL ?? 'jev-latest';
  const timeoutMs = Number(env.JEV_TIMEOUT_MS ?? process.env.JEV_TIMEOUT_MS ?? 5000);
  return { key, baseUrl, model, timeoutMs };
}

function checkContract(raw: unknown, questions: Record<string, JevQuestion>): JevResponse {
  const parsed = responseSchema.safeParse(raw);
  if (!parsed.success) throw new JevError('Jev response does not match the contract.', 'contract');
  const response = parsed.data as JevResponse;
  for (const [id, question] of Object.entries(questions)) {
    const answer = response.answers[id];
    if (!answer || answer.type !== question.type) throw new JevError(`Jev answer for "${id}" is missing or has the wrong type.`, 'contract');
    if (question.type === 'choice' && answer.type === 'choice') {
      const keys = Object.keys(question.criteria);
      const got = Object.keys(answer.probabilities);
      if (!keys.includes(answer.choice)) throw new JevError(`Jev choice for "${id}" is not an option.`, 'contract');
      if (got.length !== keys.length || keys.some((k) => !(k in answer.probabilities))) throw new JevError(`Jev options for "${id}" do not match.`, 'contract');
      const sum = Object.values(answer.probabilities).reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1) > 0.01) throw new JevError(`Jev probabilities for "${id}" do not add up to 1.`, 'contract');
    }
  }
  return response;
}

/** One Jev request. At most one retry, and only for errors where a retry can help. */
export async function askJev(state: string, questions: Record<string, JevQuestion>): Promise<JevResponse> {
  const { key, baseUrl, model, timeoutMs } = jevSettings();
  if (!key) throw new JevError('JEV_API_KEY is not set.', 'no-key');

  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Response;
    try {
      response = await fetch(`${baseUrl}/v1/systemone`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, state, questions }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      // The visitor is waiting, so a timeout gets no retry.
      if (error instanceof Error && error.name === 'TimeoutError') throw new JevError(`Jev did not answer in ${timeoutMs} ms.`, 'timeout');
      if (attempt === 0) continue;
      throw new JevError('Jev could not be reached.', 'network');
    }
    if ((response.status === 429 || response.status >= 500) && attempt === 0) {
      await new Promise((done) => setTimeout(done, 400));
      continue;
    }
    if (!response.ok) throw new JevError(`Jev HTTP status ${response.status}.`, 'http');
    let raw: unknown;
    try {
      raw = await response.json();
    } catch {
      throw new JevError('Jev response is not JSON.', 'contract');
    }
    return checkContract(raw, questions);
  }
  throw new JevError('Jev request failed.', 'network');
}

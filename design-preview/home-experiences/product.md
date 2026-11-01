# Home page: ask, then enter an experience

Product decisions for the new samperalabs.com home page.
Visual design is decided in a separate conversation. This file is about the product only.
Status: decided on 2026-11-01 unless a section says "Proposal".

## The idea

The home page is an experience, not a portfolio.
The first screen is an artistic landscape with very little text and one input in the center.
The visitor asks a question. Jev matches the intent of the question to one prepared experience.
The site shows that experience. It is not a chat: one question, one prepared answer.
From some answers, the visitor goes deeper, for example into the MAAT story view.

## The flow

1. Landing: the landscape, the input in the center, and 3 sample questions under it.
2. Ask: the input moves to the top. The answer fills the screen under it.
3. Next: every answer ends with 2 or 3 follow-up questions. A click on one does the same as typing it.
4. A new question replaces the answer. The screen keeps no history. The browser Back button returns to the previous answer.
5. Each answer has its own URL (for example `?q=projects`). A shared link opens that answer directly.

## How the matching decides

Jev answers two questions for each message, as in the MAAT Admin Agent:

- Scope: is the message about Bernat, his work, or his ideas?
- Experience: which experience fits best? Jev returns a probability for each experience.

Rules:

- Scope is no: show the Blocked answer.
- One experience is clearly the best: show it.
- Two or three experiences are close: show "Did you mean" with those options.
- The input is empty: show "Who is Bernat".

Jev cannot be called from the site yet. Until it can, a stand-in matcher uses the same contract:

```
input:  the question text
output: { scope: yes | no, experiences: [{ id, probability }] }
```

When Jev is ready, it replaces the stand-in. The front end does not change.

Proposal, thresholds: show the top experience when its probability is 0.6 or more and it leads the second by 0.2 or more. Otherwise show "Did you mean" with the experiences above 0.2 (at most 3).

## Answer types

Every experience uses one of five types.

| Type | What it is |
|---|---|
| Statement | Fixed text that appears. It is the same each time. |
| Choices | A short intro, then options to click. |
| Journey | Mission, short summary, newest chapter, and a door into the story view. |
| List | Dated articles with links. |
| Blocked | "Ask a question about me or my experience", then the sample questions. |

## Experiences, first iteration (11 plus Blocked)

| id | Experience | People might type | What we show (type) |
|---|---|---|---|
| who | Who is Bernat (default) | who is Bernat, who are you | Role, "not a classic developer", the motto (Statement) |
| now | What I work on now | what are you doing now | MAAT as main work, AI has no memory as research (Choices) |
| projects | Projects | show me your projects | MAAT, AI has no memory, BJJGym, IndoEuroMap. MAAT is the largest. (Choices) |
| maat | MAAT | AI at your company, AI native | Mission, 3 seasons, newest chapter, door to the MAAT story view (Journey) |
| memory | AI has no memory | AI memory, context, gcontext | Mission, chapters, "story coming soon" (Journey) |
| agents | AI agents | how do you build agents | Articles about agents (List) |
| principles | How I think about AI | your view on AI | The 5 principles, one after another (Statement) |
| articles | Articles | what have you written | Published articles, newest first (List) |
| bjjgym | BJJGym | jiu-jitsu gyms | Problem, solution, external link (Statement) |
| indoeuromap | IndoEuroMap | city map | Short text, external link (Statement) |
| site | How this site works | what is Jev, is this AI | Jev matched your question, and how (Statement) |
| blocked | Blocked | anything not about Bernat | The fixed message and the sample questions (Blocked) |

Questions about gcontext go to `memory`. gcontext is one part of that journey, not an experience.

Later iterations: `career` (work history) and `contact` (how to reach Bernat). Bernat writes that content first.

To explore: a small line at the top of each answer that names what Jev understood, for example "You asked about: Projects".

## Saving the questions (Umami)

The site already loads Umami in production only (`src/components/common/Analytics.astro`). Today it tracks page views and no custom events.

Decided 2026-11-01: the server sends the question events to Umami (`src/lib/ask/track.ts`), because the API knows the real decision and ad blockers cannot drop them. The browser sends only `enter`, through Umami data attributes on the link.

| Event | Sent by | When | Data |
|---|---|---|---|
| `ask` | server | The visitor sends a question | `q` (cut to 200 characters), `experience` (empty unless shown), `probability` (top), `outcome` (shown, did-you-mean, blocked, unavailable), `source` (jev, cache, default, fallback), `options` (did-you-mean only) |
| `follow-up` | server | The visitor clicks a follow-up question | `from`, `to` |
| `did-you-mean` | server | The visitor picks a "Did you mean" option | `q` (cut to 200 characters), `to`. This labels unclear questions, so it is the best data to tune the descriptions. |
| `sample` | server | The visitor clicks a sample question | `to` |
| `menu` | server | The visitor picks a topic from the browse list (the quiet list icon in the field) | `to` |
| `enter` | browser | The visitor opens a deeper experience | `from`, `to`, as `data-umami-event="enter" data-umami-event-from="maat" data-umami-event-to="story"` on the link |

To open an experience by click, the browser sends `{ open, via, from, q }` to `/api/ask`. `via` is `follow-up`, `did-you-mean`, `sample`, or `menu`.

Events go out only in production. Local development sends nothing, unless `ASK_TRACK=on` (the E2E test uses this with a fake Umami server). `ASK_TRACK=off` stops them in production.

No other personal data. Visitors can still type personal data into a question, so the question text is cut short. The server forwards the visitor's IP address and browser name to Umami only so that Umami can count visitors, as its own script does.

## Proposal: landing sample questions

1. Who is Bernat Sampera?
2. What are you working on now?
3. Show me your projects.

## Proposal: follow-up questions

| After | Follow-ups |
|---|---|
| who | now, principles, projects |
| now | maat, memory, projects |
| projects | maat, agents, who |
| maat | agents, memory, projects |
| memory | principles, articles, maat |
| agents | maat, articles, site |
| principles | memory, articles, who |
| articles | agents, principles, projects |
| bjjgym | projects, who |
| indoeuromap | projects, who |
| site | agents, maat, who |
| blocked | the 3 landing sample questions |

## Ask endpoint: how it can fail

Written before the code. Each item names the expected behaviour. Real Jev calls in tests need Bernat's approval; the E2E test uses a fake Jev server.

Input
1. Empty or blank question: show `who`. No Jev call.
2. Question longer than 300 characters: HTTP 400. No Jev call.
3. Body is not JSON, or `q` is not a string: HTTP 400. No Jev call.
4. The same question again: answer from the cache. No new Jev call.
5. One visitor sends too many questions: HTTP 429. No Jev call.
6. A click on a follow-up or a "Did you mean" option: open that experience directly. No Jev call.

Configuration
7. `JEV_API_KEY` missing: no call. Outcome `unavailable`, with the landing sample questions.
8. Wrong address or network error: one retry, then `unavailable`.

Jev response
9. Jev is slow: stop waiting after the timeout. Outcome `unavailable`. No retry, because the visitor is waiting.
10. HTTP 429 or 5xx: one retry, then `unavailable`.
11. HTTP 401 or 403 (bad key): no retry. Outcome `unavailable`.
12. Body is not valid JSON, or does not match the contract (missing answer, wrong type, a choice that is not an experience, probabilities that do not add up to 1): `unavailable`.

Decision
13. Scope is no (below 0.5): `blocked`, even when one experience has a high probability.
14. One clear winner: `shown`.
15. Two or three close experiences: `did-you-mean` with 2 or 3 options, never 1.
16. All probabilities low: `did-you-mean` with the top 3.

Safety
17. Prompt injection in the question: Jev only returns probabilities for fixed ids, and nothing is generated. The worst case is a wrong experience.
18. The key never reaches the browser. The local status check shows only "key set: yes or no".
19. The local test page does not exist in production (HTTP 404).
20. Server logs never contain the question text.

Umami events
21. Umami is slow or down: the answer does not wait. The event is lost, and the log gets a warning without the question text.
22. Local development: no events, unless `ASK_TRACK=on`.
23. A long question: the event holds only the first 200 characters.
24. A click with an unknown `via`: the experience opens, and no event is sent.
25. A cached answer and a fallback answer still send `ask`, with their `source`.
26. Clicks are not rate limited. Each click sends at most one small event.

## Open decisions

1. The exact content of each experience (text, options, articles).
2. The stand-in matcher until Jev can be called.
3. The thresholds and the Umami events above (proposals).
4. The "You asked about" line (to explore).

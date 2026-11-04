# Review notes: MAAT Admin Agent article

Mode: draft from evidence. Status: local draft. Nothing is submitted, published, committed, or deployed.

## Evidence

Source: `/Users/bsampera/Documents/maat/workspace-app/docs/admin-agent/` and `/Users/bsampera/Documents/maat/maat-admin-agent` (commit `cb387c4`, 16 Oct 2026). Read only.

| Article claim | Source | Limit |
| --- | --- | --- |
| Scope score 0.21 to 0.93, chart values | journal `2026-10-13-AA45-scope-first-message.md` | One run per variant, empty history. |
| Action registry, three router tools, gym slug, token, error list | blueprint §3, journal `2026-09-23-AA7-registry-members.md`, agent `AGENTS.md` | Code and tests. No production accuracy claim. |
| Read-only test with `members.setCashMembership` | journal AA7 | Test evidence only. |
| Router pattern from an MCP proof of concept, no MCP server today | blueprint §1, §10, D7 | "MCP-style" is our wording. |
| Decision and Generation names, `GenerationPlan` | journal AA44, AA47 row, agent `AGENTS.md` | |
| Thresholds: scope 0.5, effort 0.5, language 0.7, widget 0.5 and 0.6 | AA45, AA36, AA43 journals, D42 | |
| Jev probe 0.22 s typical, 0.27 s p90 | journal AA44 | Two days of probes, "a hint, not a ruling". |
| Domain choice: yes/no failed, choice 5 of 5; bench table | journal `2026-10-15-AA46-domain-decision.md` | One bench run; switch off by default. |
| Widget types | STATUS rows AA20.1, AA20.2 | Built on fixtures. |
| Widget path, `{ shown, widget, values }`, P5 exception, hide after failure, 210 to 310 ms | D42, journals AA19.1, AA19.2 | Local measurements. |
| Ten questions, seven refusal cases, four routes | journal `2026-09-18-AA27-ten-questions.md` | |
| 66 cases, core 10, full | journal `2026-10-16-AA3.2-bench-tiers.md`, `bench/README.md` | AA46 reports 70 turns (multi-turn cases). |
| Model screening table, Solar outage, GLM 18 of 23, $0.0009 per turn | journals AA30, AA30.2 | One run each; costs exclude the judge. |
| Judge errors (C11, C02, C12), invoice substitute, 11 of 12 | journals AA30, AA15 | |
| Intent pipeline, 134 intents in 15 domains, thresholds 0.8 and 0.2, Intent Explorer, queue | `bench/intent/readme.md`, `technical.md`, `config.json`, `domains/catalog.md` | Map entries are not verified support. |

Excluded: customer gym slugs, PostHog project and dashboard IDs, session IDs, deployment names, keys.

## Author decisions, 16 Oct 2026

- Purpose: show what was built (portfolio) and help builders of similar agents. The "knowledge" thesis is direction only and does not appear in the article. Closing comic 07 removed.
- Name MAAT, not "the dashboard team". Stefano is not named.
- Do not mention Solar Pro 4. Removed from text and from chart 05 (4 of 20 screened models shown).
- Intent analysis may say "real conversations that the agent has". No gym is named.
- "MCP-style" wording accepted.
- Author role from blueprint v1.8: Bernat drives the project and owns AI infrastructure and backend.

## Remaining review issues

- Image scope: one image for each H2 section plus a cover (7 in the article). Confirm, or name H3 sections that need an image.
- The follow-up example "and last month?" is illustrative of the preparation step.

## Checks

- Browser review: not run (not authorized).
- No en or em dashes in article and metadata.

## Update to current agent code, 16 Oct 2026

Source: `maat-admin-agent` `origin/master` at `1f80c6f` (AA19.5). The local checkout was behind.

- Widgets: no Decision scoring since AA19.5. GLM picks from a one-line catalog built from the dashboard definitions (`useWhen`, `needsData`, `params`, `optionalParams`, `rows`), calls `show_widget` first, no-data guard, lost-call recovery step. Files: `src/core/widgets/prompt.ts`, `types.ts`, `src/core/agent/router/show-widget.ts`, `src/core/generation/widget-loss.ts`, commit message of `1f80c6f`. 16 widgets and 42 widget bench cases from `bench/widgets/`.
- Decision call: one request with scope, effort, 9 language questions (exactly one at 0.7 or more) and one domain choice question. Domain choice has no switch on master. Fallbacks from `src/core/decision/plan.ts` and `scope.ts`: answer, low effort, no language, no domain. Timeout 2 s (`request.ts`).
- Registry: 2 member actions, 15 attendance actions; error codes from `src/core/agent/errors.ts`.
- Widget mockup 04 redrawn: data call first, MembersTable columns from the real definition, one sentence after. Comic 03 clipboard: "Widget: table" replaced with "Language: English".

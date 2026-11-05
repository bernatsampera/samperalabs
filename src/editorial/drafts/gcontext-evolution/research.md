# Research for the gcontext evolution

Prepared on 5 November 2026. Research window: 1 March through 4 November 2026.

## Proposed account

The work began with a practical problem: an agent needed access to information and services across projects. A personal agent repository and Bleak supplied the first working forms. The context module platform then made information selectable for a task.

The next problem was reuse. Integration instructions, temporary tasks, and recurring workflows needed different structures. The work also tested ways to expose context through existing AI clients. In July, Bernat explicitly separated gcontext's saved state from the agent runtime.

Repeated use made writing harder than reading. New information could create small, repeated notes or enter the wrong place. Folder rules, classification methods, file-based apps, and conversation replays explored parts of that problem. Several approaches were replaced or kept as side experiments.

The later work tested how to update a handbook without losing useful information or damaging its text. It then put capture, rules, proposals, and approval into a local flow. A separate reading trial tested whether the saved knowledge helped an agent answer questions.

This is an editorial interpretation of the evidence. It is not a claim that every repository was one planned product version. The continuing theme is control over the information an agent can read, retain, and change.

## What was reviewed

| Source | Coverage | Use and limit |
| --- | --- | --- |
| Claude Code prompt history | 22,492 entries in the date window, after excluding projects under `~/Documents/maat/` | Broad index of typed requests. A relevant project and keyword filter selected 16,720 entries. Turning points received close reading. Pasted blocks can be placeholders. Replies and execution results are absent. |
| Claude Code transcript files | 416 retained top-level files, with 3,274 extracted user messages | Searchable supporting evidence. These include continuations and test sessions. They are not 416 distinct human conversations. Full retained records reach August, with most relevant material much later. |
| Codex session metadata | 1,682 local files inspected for working directory | 822 belonged to the excluded directory. Metadata identified 512 files in relevant project paths. No excluded transcript bodies were used. |
| Codex transcript files | 429 files in the narrowed set, September through November | 3,358 user-role records extracted for search. These include imported history, task notices, and delegated instructions. They are not a count of author messages. The 83 cloud context files in the relevant metadata set were left out of this pass. |
| Git history | Core repositories, related prototypes, and selected project test sources | Reachable commits across refs in the date window. Counts include merges and branch history. They do not measure effort, release count, or product adoption. |
| Project documents and code | Current files and selected historical revisions | Used to check what was built, which plans stayed open, and what existing tests recorded. No project application or source-project test suite was run. |

The earliest indexed Claude prompt is 1 March 2026. The latest is 4 November 2026. The older prompt history is useful, but it is not a complete transcript archive. This review cannot reconstruct every conversation or recover omitted attachments.

The transcript pass did not recursively read all Claude subagent files. It did not inspect every Cursor or other agent store. Searches and selected close reads support the proposed stories. This is not a line-by-line review of every historical record.

## Exclusion and handling

The source scan excluded projects inside `/Users/bsampera/Documents/maat/`. Directory metadata was sufficient to reject those session files. That content does not support these stories.

Other paths under `bleak-dev` can contain the word MAAT. They are outside the requested exclusion, but the public narrative does not use private customer data or support procedures. The Codex content pass also omitted the cloud context records described above.

Raw session extracts remain in `/tmp/gcontext-evolution-review/`. They are not in the review page or the site repository. The review files contain selected references and editorial text only. No credentials, raw transcript dumps, customer records, or service responses are embedded in the HTML.

No repository was changed outside SamperaLabs. No content was published. No commit or push was made. No browser check was run.

## Repository priorities

| Repository | Commits in window | Role in this account |
| --- | ---: | --- |
| `bleak-dev/gcontext-cloud` | 719 | Context modules, tasks, workflows, CLI, core package, and client connections. |
| `bleak-dev/gcontext-framework` | 583 | Saved state, reusable workflows, folder rules, classification, handbook updates, capture, and reading trials. |
| `bleak-dev/bleak` | 207 | Agent workspace, knowledge navigation, context selection, and separate instances. |
| `tools/bernatagent` | 32 | The early March goal and personal agent structure. |
| `gcontext-projects/test` | 31 | Context structure experiments and repeated additions. |
| `Documents/bernat-agent` | 26 | Later personal agent use and reusable procedures. |
| `projects/property-tree` | 14 | Semantic properties and code-based tree ordering. |
| `bleak-dev/everythingiscontext` | 3 | Public explanations and a draft capture/review design. |
| `bleak-dev/workflows` | 2 | Workflow packaging experiment. |
| `bleak-dev/gcontext-mcp` | 2 | A small client connection experiment. |
| `bleak-dev/context-problem` | 1 | Important May account of how different modules should change after use. |
| `bleak-dev/gcontext-apps` | 1 | File-based app prototype. |

The three main repositories received priority because they combine substantial history with direct relevance. Small repositories still hold important changes in direction.

Other repositories have more commits: `codigosafiliados` has 4,102, `diversity-map` has 640, and `bjjgym` has 561 in the inventory. They matter here where they supplied workflows, replay cases, or evaluations. Their whole product histories do not belong in the gcontext story.

The older `bleak-dev/samperalabs` checkout has 141 commits with shared Bleak ancestry. Related landing sites also share history. Worktree and clone counts were not added together. No combined commit total is used.

## Changes from the current site account

- Start with the March agent workspace and service access. The work did not start with the final handbook design.
- Explain modules through the implemented selection and loading behavior.
- Include tasks and workflows as an early attempt to manage changing knowledge.
- Give the July state/runtime decision its own story.
- Include the file-based app branch without presenting it as a main product release.
- Use the failed structure experiments and recorded test problems as article material.
- Treat 31 October as a milestone for the reviewed handbook flow. Git records earlier storage work on 17 October.
- Separate the goal of better agent performance from the limited results of the November trial.
- Replace broad labels such as "The goal" and "Not alone" with titles that name the work.

The new story candidates do not reuse the current page's seven-chapter structure. They are a replacement proposal. The public data in `src/lib/stories/gcontext.ts` remains unchanged during this review.

## Strong sources and their limits

The source catalog links 74 selected references. Prompt entries record Bernat's goals and reasons. Git revisions establish implementation milestones. Documents establish design intent or recorded observations, depending on their status.

Three author prompts are especially useful for the overall account:

- History line 4830, 1 March: project knowledge, APIs, scripts, and adding new information.
- History line 15293, 5 May: human-readable files, loadable modules, and less noise in task context.
- History line 20952, 22 July: gcontext as the saved state, separate from the runtime.

Later prompts make the unresolved problems concrete:

- History line 34660, 14 October: small artificial examples did not expose all problems in real use.
- History line 36596, 23 October: memory needs rules that reflect its purpose.
- History line 37611, 31 October: the reviewed flow worked, but configuration and responsibilities remained hard to understand.

The October method comparison is an AI-written evaluation of saved test artifacts. It reports useful findings, including damaged table text that passed checks. This review read that evaluation. It did not independently rerun all cases or certify every figure.

The November reading trial used one run for each question and mode. Its answer key and grading came from the model. Some runs accessed live systems beyond the isolated checkout. The saved report records a stale fact and a corrected answer key. Those limits are part of the article, not a footnote to a general performance claim.

Current documentation can disagree across revisions. For example, `docs/limits.md` describes older session and retry limits, while `docs/how-it-works.md` describes later conversation handling. The proposed copy avoids treating every old fault as current behavior.

## Items for Bernat to confirm

1. Which cloud and MCP versions reached other users? The code records implementation, but it does not establish launch dates or the extent of use.
2. Should the reusable workflow and file-app experiments be full articles or shorter branches in the main journey?

These questions do not block the review. The proposed text uses bounded claims until those details are confirmed.

## Suggested first articles

Start with the context module story, the handbook update comparison, and the reviewed capture flow. Together they show the original implementation, a difficult engineering problem, and the current result.

The reading trial can follow as a separate article. Its value is the honest account of what the test did and did not establish.

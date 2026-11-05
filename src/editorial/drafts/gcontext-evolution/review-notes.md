# Journey and article review

The author approved a connected narrative about carrying useful knowledge from one AI task into the next. This pass replaces the twelve-stop development list with six main steps.

## Review links

- [Journey](http://127.0.0.1:50533/design-preview/gcontext-journey): Six connected steps in the shared MAAT layout.
- [Research review](http://127.0.0.1:50532/): The original source review, retained as supporting research.
- [First article](http://127.0.0.1:50533/design-preview/gcontext-article?story=project-knowledge): Start the main article sequence in the site's reading layout.

## Main sequence

1. Give the agent a place to look: the initial workspace makes project knowledge accessible.
2. Load the relevant instructions: modules select context, but cannot by themselves preserve a correction found during work.
3. Keep the useful correction: task records and rules explore what to retain without creating conflicting notes.
4. Update the existing guide: retrieval and editing methods address affected passages, while recorded tests expose document damage.
5. Review before saving: rules and proposals let a person inspect changes before they reach the handbook.
6. Check the next task: the reading trial evaluates usefulness and exposes stale information and test limits.

Three timeline lanes group the work into finding, updating, and using knowledge. The date ranges describe the work covered by the story. They do not claim that each problem was solved before the next began.

## Continuous example

The export-guide example continues through the drawings and articles. The author requested removal of its explanatory paragraph from the journey introduction. The articles and accessible diagram descriptions still identify it as an illustration.

Six visuals follow the same guide through access, selection, conflicting notes, a proposed replacement, review, and later use. These are conceptual states, not product screenshots or a recorded incident. The later-use drawing asks whether the change helps. It does not claim a successful measured outcome.

The main articles use the same example. They identify the recorded table-edit failure and BJJGym reading trial as separate evidence. No metric or incident is invented for the illustrative export task.

## Optional experiments

- Apps and agents sharing files: attached to the first step.
- Connections to other AI clients and saved state outside the runtime: attached to context selection.
- Reusable procedures and folder rules: attached to retaining useful corrections.
- Real conversation replays and structure experiments: attached to updating existing knowledge.

The shared card component reveals these links under Related experiments. The branches start collapsed and add no progress nodes. Their articles return to the parent step. Main article links continue through only the six main steps.

## Voice and evidence

The card copy and all twelve article drafts use a professional, impersonal voice. Technical names remain inside the articles where they explain implementation. The main path uses language a reader can follow without prior knowledge of gcontext.

The matching IDs in stories.json retain the original sources. metadata.json adds branch sources to the relevant main story when the text combines several experiments.

The update-method article attributes its findings to the saved evaluation. The reading-trial article preserves the stale fact, model grading, single runs, and access to live systems. No general performance improvement is claimed.

## Scope

The journey still uses StoryLayout.astro, StoryVisual.astro, the shared CSS, and the shared path script. The optional example and branch fields have no content for MAAT. StoryExample.astro draws the six example states.

The articles use BlogLayout.astro. Both preview routes return 404 in production. The public gcontext data remains unchanged. No remote article writes, publication, commit, or push are part of this change.

This pass prepares the narrative and article content. Videos remain the next content format after review of the story.

## Remaining facts

The evidence does not establish which cloud and MCP versions reached external users. The optional articles describe implementation without claiming a launch, a public marketplace, or proven autonomous learning.

## Verification

[journey-verification.json](../../../../design-preview/gcontext-evolution/journey-verification.json) records focused TypeScript, content, route, and rendered HTML checks. It covers six main cards, six branches, article continuation, correct return links, and the example sequence. Browser checks were not run because the author did not authorize them.

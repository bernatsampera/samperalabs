# Project story brief

Use this request inside any project when you want to explore an article. Give the AI a feature, pull request, demo, or set of files to inspect. Bring the completed brief to SamperaLabs with the supporting material.

## Request to use in a project

Prepare a story brief for a SamperaLabs article about [feature or problem]. Read the project instructions first. Inspect only the relevant material. Do not change the project or publish anything.

Find a lesson that helps [reader]. Separate facts visible in the code from behavior demonstrated in a run. Do not infer my reasons for a decision from a code diff. Ask me when the reasons matter.

Return the fields below. Keep the brief short enough to review in one sitting. Include only material suitable for a public article. Replace private identifiers in examples. List missing evidence without inventing it.

## Brief fields

- Project: what it does, who uses it, and its public URL if available.
- Feature: what changed and its current state, such as prototype, tested, or released.
- Reader problem: what was difficult before this work.
- Proposed lesson: what another builder can use from this experience.
- Before and after: the same task under each approach, with a concrete input and output.
- Key choice: the decision that made the difference, plus an alternative and its cost.
- My contribution: what I did and which judgments need my confirmation.
- Evidence: file paths, commit or PR reference, demo steps, screenshots, and measured results if available.
- Limits: known failures, untested conditions, and claims the evidence does not support.
- Public material: what can appear in the article and what must remain private.
- Open questions: only the missing facts that affect the story.

For each important claim, record the source and what it proves. A file can show an implementation. A recorded run can show one outcome. A claim about reliability needs repeated observations under stated conditions.

## Suggest a story

Propose up to three useful angles. Explain the reader benefit and evidence gap for each. Recommend one. If none has enough substance, explain what material would make a useful article.

For the recommended angle, supply a section outline and image plan. Stop before writing the full article unless I requested a draft too.

## Example using BJJGym

This is a proposed article direction based on the approved project description. It is not a verified feature report.

The project helps travellers find BJJ gyms. Its description says AI extracts useful labels from reviews. Labels include no-gi and good teacher. This provides a possible story about turning unstructured text into details a traveller can inspect.

Proposed title: "What a gym review can tell a travelling grappler."

Proposed reader benefit: understand how to turn review text into useful product details while keeping the limits of that text clear.

Before drafting, obtain one real input and output from the feature. Confirm the extraction method, how missing details are handled, and the author's main lesson. Do not claim better accuracy, faster decisions, or user growth without evidence.

Possible images:

1. A cropped product screenshot showing where the labels appear.
2. An annotated review beside its actual extracted labels.
3. A small flow diagram showing the verified extraction steps.

Use a clearly marked synthetic review if a real review cannot be reused. Do not present its labels as measured model output. If the evidence exposes a useful failure, make that part of the lesson.

## Bring the material to SamperaLabs

Copy the brief and approved assets into the SamperaLabs writing session. Include short source excerpts when the other repository is unavailable. Repository paths alone are not enough for an AI that cannot access them.

Use this request: "Use this project brief to propose a SamperaLabs article. Follow the article prompt. Show me the main claim, outline, and image plan first."

- [new-essay-prompt.md](new-essay-prompt.md): Develop the selected story into a draft for review.
- [editorial-guide.md](editorial-guide.md): Apply the reader and quality criteria.
- [../../design-preview/decisions.md](../../design-preview/decisions.md): Source for the approved BJJGym project description.

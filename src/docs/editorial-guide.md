# SamperaLabs editorial guide

Use this guide to turn your writing or project work into an article. You own the idea, opinions, and final text. AI helps with structure, clear language, evidence, and images. Start each article by request. Publication requires your instruction.

The suggested reader is a person who builds AI products. Explain system terms before you use them. Change this audience when a brief names another reader.

## Start with one reader benefit

Complete this sentence: "After reading this, the reader can ___ because they understand ___."

A feature is a source of material. It becomes an article when it teaches a useful lesson. A release list alone is usually not enough. Look for a difficult choice, a failed approach, a useful method, or a result that changes how someone works.

Before drafting, record:

- The reader and their problem.
- The main claim in one sentence.
- One concrete example that supports it.
- The evidence available and the facts still missing.
- The action or decision the reader can take away.

If the evidence is too thin, collect more material or keep a short note. Do not expand it to meet a word count.

## Learn from the reference

[High Agency](https://www.highagency.com/) introduces its idea through a question, a meme, and concrete examples before it develops a larger explanation. It also uses diagrams and recurring visual ideas. This is an observation about that page, reviewed on 3 October 2026.

For SamperaLabs, use that approach to make technical ideas easier to understand. Keep your own language and experience. Make original examples and images. Do not copy the reference text or image set.

A useful sequence is: a concrete problem, your claim, an example, the mechanism, a limitation, and a practical next step. Adapt it to the subject. Do not force every article into the same structure.

## Choose how much help you want

| Mode | Your part | AI part |
| --- | --- | --- |
| Presentation only | Supply the finished text. | Flag unclear parts and propose images. Preserve the wording. |
| Edit with me | Supply a draft and your point of view. | Suggest cuts, order changes, and sentence edits. Explain changes to meaning. |
| Draft from evidence | Supply project material and your judgment. | Find a useful story and prepare a draft from supported facts. |

Use presentation only for an existing draft unless you request more editing. AI must not invent your memories, feelings, motives, or quotes. Ask you for those details when they matter.

## Work through three review points

1. Review the main claim, section outline, and image plan together. Select what to develop.
2. Review the complete draft with its images, captions, sources, and open questions. Revise until it is ready.
3. Review the rendered article on a phone and desktop. Give a separate instruction to publish.

An approval already given for a specific step remains valid. Do not ask for it again. A later change to a claim or image requires review of that change.

For a small edit, combine the first two points. Keep the final publication decision separate. These are editorial decisions, not an automatic sequence of jobs.

## Write with a clear point of view

Use the project-local [ASD-STE100 skill](../../.agents/skills/asd-ste100/SKILL.md) for clear technical explanations. Use its STE-flavored mode for article prose. Preserve the author's decisions, facts, conditions, headings, and code examples. Make small edits to unclear sentences. Do not add personal reactions or rewrite clear text only to change its voice. This skill replaces Humanizer, which the author rejected. Apply project writing rules before conflicting skill advice.

Start with something the reader can picture. Put the problem before the implementation details. Use one main idea per section. Let headings explain the argument when read on their own.

Use first person for your verified actions and opinions. Keep your specific examples and natural humor. Use short, active sentences. Explain unfamiliar terms. Remove sales language, stock AI phrases, and repeated conclusions. Use plain hyphens instead of en or em dashes.

Show the smallest code example that explains the choice. Move long reference material out of the main explanation when it breaks the reading flow. End with something the reader can try or use to make a decision.

Keep necessary uncertainty. "This worked in this test" must not become "This always works." Distinguish code that exists, behavior observed in a run, and measured results.

## Decide whether the article is ready

### Structure project articles around the decisions

For articles about work we built, use these reader questions as the default sequence:

1. What problem did we have?
2. Which tools could help solve it?
3. How did we combine those tools into a solution?
4. What does the solution look like, and what does it let us do?

Use H2 headings for the main sections. Add H3 headings for real subtopics, such as a constraint, tool choice, implementation step, or capability. The table of contents must show this useful hierarchy. Do not add empty sections only to make the contents list longer.

Prefer short explanations supported by code samples, folder trees, and diagrams. Show the mechanism instead of repeating it in prose. Use readable labels and check each visual on a phone. Label fictional or simplified examples next to the example. Never present example code as the company's actual implementation. Do not invent tools we evaluated or reasons we rejected them.

Keep the current limits close to the relevant capability. Use collective language for team work. Adapt this structure when the author gives a different direction.

### Review checklist

Every item below must pass. There is no average score that can excuse a false claim.

- Value: a named reader learns one useful thing.
- Voice: the opinions and first-person statements are yours.
- Evidence: factual claims have sources or clear limits.
- Structure: each section advances the main idea.
- Images: each image explains, demonstrates, or makes a useful point memorable.
- Visual variety: composition and drawing style fit the subject and differ from recent posts. Color changes alone do not pass.
- Motion: each scene shows a meaningful change through its own movement and timing.
- Honesty: sample data and proposed behavior are clearly identified.
- Reading: labels, captions, code, and headings work on a phone.
- Finish: no placeholders, broken links, or unresolved factual questions remain.
- Approval: you have reviewed the final version.

An article can pass with no meme and no animation. Quality depends on what the reader understands.

## Use the workflow

- [new-essay-prompt.md](new-essay-prompt.md): Reusable request for editing your draft or developing an article.
- [project-story-brief.md](project-story-brief.md): Portable brief for collecting a story from any project.
- [post-image-workflow.md](post-image-workflow.md): Image selection rules, production briefs, and a worked example.
- [../editorial/revisions/index.md](../editorial/revisions/index.md): Rules for the two articles whose public text comes from source files.

Keep preparation local unless you request a remote draft. A new Markdown file in this folder does not create a site post. Most posts use the database. The two source revisions use a different editing path.

# Article image workflow

Plan images while you shape the article. Use each image to answer a reader's question. An image can explain a mechanism, show evidence, or make a useful point memorable.

Start with the fewest images that do those jobs. Do not insert an image every fixed number of paragraphs. Do not add a cover image only to fill space.

## Choose the right format

| Reader need | Useful format | Quality rule |
| --- | --- | --- |
| See what the product does | Cropped screenshot with a small annotation | Show real behavior. Remove private data before sharing. |
| Understand a mechanism | Diagram with a few labeled steps | Check every arrow and label against the source. |
| Compare two approaches | Matching before and after panels | Use the same task and state the conditions. |
| Judge a result | Chart, table, or recorded output | Use real data with units, source, and limits. |
| Remember a familiar frustration | Original comic or meme | Make one clear joke that serves the article. |
| Picture an abstract idea | Simple illustration | Keep it distinct from product evidence. |

Use deterministic tools for diagrams and charts. Use an image generation tool for illustrations and original comics. Capture the real application for screenshots. Never generate a screenshot or chart and present it as evidence.

A meme is optional. Reject it if it needs a long explanation, relies on an unrelated trend, or weakens the tone. Humor must not make a stronger claim than the article supports.

Make the meaning clear at first glance. Show the specific action or repeated problem. Avoid props that require the reader to guess what they mean. For a comic, make each speaker clear. Check whether the reader can understand the point without the caption. The caption can add context, but it must not rescue an unclear picture. This rule follows the user's feedback on the first context article comic.

## Give each article a distinct visual concept

Choose the composition and drawing style before production. A change of color does not create a distinct concept.

Propose two visual concepts for the article. Explain how each concept serves its main idea. Select the stronger concept within the existing review step.

Do not default to labeled rectangles connected by arrows. Use that structure when the connections are the main information. Consider an annotated document, cut-paper illustration, technical drawing, typographic composition, or comic scene. Choose the style for the subject, not for novelty alone.

Compare the proposed images with the previous three available posts. Check shapes, composition, drawing style, and repeated scenes. If those posts are unavailable, record that limit. Imagine each image without its labels. If the images look interchangeable, revise the composition.

Give each image a separate job. Do not repeat the same explanation through several diagrams. Keep labels, captions, contrast, and reading quality consistent across styles.

For comics, choose the setting, viewpoint, and panel count from the action and joke. Do not repeat a person beside a computer by default. Keep each speaker and action clear.

## Design homepage movement from the idea

Each homepage scene needs its own composition and motion plan. Show a meaningful change, such as correction, replacement, accumulation, separation, or reuse. Do not use successive box highlights as the default animation.

Describe what stays fixed, what changes, and why that change helps the reader. Give each scene its own timing. A shared scroll controller can supply progress without forcing the same sequence on every scene.

Examples:

- Translation feedback: correct large text, then show a separate glossary proposal.
- Support context: annotate an investigation document beside the relevant procedure.
- Persistent context: replace a session while its reference document stays in place.
- Shared knowledge: show several readers consulting one central handbook.

Keep section dimensions stable during scroll. Provide a complete static composition when reduced motion is active or JavaScript is unavailable. Keep the reading link visible.

## Prepare the image plan

For each candidate, write:

- Placement: the paragraph or heading beside it.
- Reader question: what the image should answer.
- Main message: one sentence.
- Format and content: what the reader will see.
- Visual concept: composition, drawing style, and the reason for this choice.
- Variety check: how it differs from recent posts.
- Motion, if useful: what stays fixed, what changes, and the static fallback.
- Source: the evidence or reference behind it.
- Caption: the specific point the image makes.
- Alt text: the useful information for someone who cannot see it.
- Production: screenshot, diagram, chart, illustration, or existing asset.
- Review issue: any missing fact, permission, or choice.

Show the plan with the article outline. Select the useful candidates before producing finished assets. Treat already approved image requests as authorization for that work.

## Example for the context repository article

These are proposed additions to [Your AI Agent Deserves Its Own Repo](../editorial/revisions/your-ai-agent-deserves-its-own-repo.md). The article text stays unchanged until an edit is requested.

| Placement | Image proposal | Reader benefit |
| --- | --- | --- |
| After the opening problem | Optional two-panel comic about explaining the same setup in a new session | Makes the repeated work easy to recognize. |
| After Start with a small index | Diagram from a membership question to an index, a procedure, and relevant service files | Explains how the agent finds a useful subset of knowledge. |
| After Knowledge and execution are different responsibilities | Optional diagram linking context, runtime, and tools | Explains the boundary. Use it only if it improves on the existing table. |

The second image is the strongest first candidate because it explains the mechanism. The comic adds tone. The third image may repeat the table and can be omitted.

Diagram brief:

- Main message: an index gives the agent a path to the files needed for a task.
- Content: membership question, context index, investigation procedure, billing file, database file.
- Relationships: the question leads to the index; the index points to the procedure; the procedure points to both service files.
- Caption: "The index points to a procedure. The procedure identifies the service knowledge needed for this task."
- Alt text: "A membership question follows an index to an investigation procedure, which links to billing and database files."
- Evidence: the article's index example and its explanation of task-specific loading.
- Limit: this is a concept diagram. It does not show measured reliability or automatic learning.

Optional original comic brief:

- Panel one: a person supplies a stack of notes labeled "Our setup."
- Panel two: a new session presents an empty desk while the person holds the same stack.
- Caption: "A fresh session can bring familiar homework."
- Mark it as an illustration. The article already explains that some systems retain memory.
- Avoid logos and copied meme artwork.

## Produce and inspect

Use a plain background, strong contrast, and a small number of labels. Follow the site's zinc palette and Poppins labels for diagrams. Preserve useful colors in real screenshots. Do not make unrelated illustrations look like product interfaces.

For an illustration prompt, specify the main message, composition, objects, tone, and exclusions. For the comic above, request two simple panels with the same person and stack of notes. Add exact labels with a layout tool if the generator cannot render them cleanly.

Keep an editable source for diagrams and charts. Keep the prompt and selected output for generated art. Record the source URL and reuse terms for an existing asset. A source link alone does not establish permission to reuse an image.

Check factual labels and visual implications. Reject a diagram that suggests a guarantee the text does not make. Simplify diagrams that need tiny labels.

## Place images in the article

For local review, keep asset files with the draft. When submission is requested, use the existing editor image upload. Use normal Markdown image syntax:

```markdown
![Describe the useful information in the image](image-url)

A short caption explains the point and identifies illustrative data.
```

Place the image next to the passage it helps explain. Keep the explanation understandable without the image. Use captions for meaning and source links. Use alt text for the visual information.

Review in the actual article layout on a phone and desktop. Check label size, contrast, image loading, page width, and reading order. Compress large exports without losing readable details. Use a static image unless motion teaches something that the static version cannot.

The final review contains the complete article with images in place. A folder of separate pictures does not show whether the article reads well.

- [editorial-guide.md](editorial-guide.md): Article quality and review rules.
- [../pages/admin/llms.txt](../pages/admin/llms.txt): Existing editor and image upload tools.

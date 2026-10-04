# Context article trial

This local trial adds an original comic after the opening paragraph and one diagram after the small index example. It keeps the article wording unchanged. It uses the current article layout styles. The trial does not write to the post store.

- [index.html](index.html): Full article preview with separate comic and diagram controls and a phone-width control.
- [session-context-comic-v2.png](session-context-comic-v2.png): Current comic with explicit billing dialogue and fewer visual details.
- [session-context-comic-v2-prompt.txt](session-context-comic-v2-prompt.txt): Exact revision prompt used with the built-in image generation tool.
- [comic-v2-desktop-review.jpg](comic-v2-desktop-review.jpg): Browser capture of the revised comic in the desktop layout.
- [comic-v2-phone-review.jpg](comic-v2-phone-review.jpg): Browser capture of the revised comic at a 375-pixel viewport.
- [session-context-comic.png](session-context-comic.png): First comic, kept for comparison after the user found its meaning unclear.
- [session-context-comic-prompt.txt](session-context-comic-prompt.txt): Exact prompt used with the built-in image generation tool.
- [comic-desktop-review.jpg](comic-desktop-review.jpg): Browser capture of the comic in the desktop article layout.
- [comic-phone-review.jpg](comic-phone-review.jpg): Browser capture of the comic at a 375-pixel viewport.
- [context-path.svg](context-path.svg): Editable diagram showing a question, index, procedure, and service files.
- [context-path-export.svg](context-path-export.svg): Standalone diagram with embedded Poppins fonts.
- [build.mjs](build.mjs): Rebuilds the preview from the current article and reading styles.
- [desktop-review.jpg](desktop-review.jpg): Browser capture of the diagram in the desktop reading layout.
- [phone-review.jpg](phone-review.jpg): Browser capture of the diagram at a 375-pixel viewport.
- [../../src/editorial/revisions/your-ai-agent-deserves-its-own-repo.md](../../src/editorial/revisions/your-ai-agent-deserves-its-own-repo.md): Unchanged source text used by the preview.

Run `node design-preview/article-trial/build.mjs` from the project root to rebuild. Open index.html in a browser. Use the separate comic and diagram controls to compare versions. Use the phone-width control to inspect the narrow layout.

Suggested alt text: A membership question follows an index to an investigation procedure, which links to billing and database knowledge.

Caption: Concept diagram. The index points to a procedure. The procedure identifies the service knowledge needed for this task.

The diagram explains navigation through knowledge. It does not claim that the agent completes the investigation or that the files guarantee a correct result.

Browser review on 3 October 2026: the diagram fits the desktop and phone layouts. The 375-pixel viewport has no horizontal page overflow. The image labels and caption remain readable. The diagram toggle and phone-width control work. This preview uses the reading styles but is not the production route. The source article and database remain unchanged.

The user approved the diagram direction, then requested the comic trial. The user found the first comic unclear. The revised comic removes the stack of notes. It shows a person explaining billing in the first chat. The AI asks about billing again in the new chat. Both versions were made with the built-in image generation tool. This is an illustration, not a product screenshot. The next article paragraph retains the qualification about chat history and automatic memory.

Comic review: the image and dialogue fit the desktop and 375-pixel phone layouts. The comic loads and the page has no horizontal overflow. The comic toggle works independently of the diagram. Both assets have descriptive accessible text and captions. A text comparison confirmed that the article wording remains unchanged.

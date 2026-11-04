# Review notes

## Source

- The ideas come from the author in the session of 16 October 2026: the parts (session, adapter, global context), the definition of the global context, the goal of a small and exact session context, and the rule "write the global context for how the AI loads it".
- Repository context: /Users/bsampera/Documents/bleak-dev/gcontext-framework (docs/progress/context/gcontext.md). The article does not describe the implementation.
- All examples (prices, team, tools, the Tuesday and Friday story, the 14 Oct 2026 decision date) are fictional. The article says so in the opening and in the captions.

## Decisions (author, 16 October 2026: "follow your recommendation in all cases")

1. Title: "Global context for AI agents: minimal to load, fast to find".
2. Visual concept A: a card catalog and a cut-paper comic style, with no robot. The AI is a gold speech-balloon character.
3. Hook: the fictional Tuesday and Friday renewal email story.
4. Project name: the article stays general.
5. The two rule examples are H3 sections: "Each domain must make sense alone" and "The names on the map must say what is inside".
6. Try it: five steps plus the tool-call count test. The test is a suggestion, not a measured result.
7. Limits: the author gave no limits, so the article has no limits section.
8. The repeated title "Loading and Offloading Information in AI Agents" is removed from the four diagrams.

## Images

- Existing approved diagrams: 01, 02, 03, 04. Only the top title line changed.
- New comics: 00, 05, 06, 07, 09. New diagram: 08. Prompts and SVG sources are next to each PNG.

## Open questions

1. Homepage: no recommendation was given. Choose a homepage scene (card catalog: a drawer opens, a card is corrected, and the drawer closes), a text preview, or no homepage entry.
2. The opening sentence "The model did not fail at reasoning" is an interpretation of the fictional story. Confirm it.
3. The sentence in "The adapter is the least important part" ("If the information is badly written, a better adapter does not fix it") extends your view. Confirm it.
4. The rewrite adds sentences that extend your view. Confirm them: "The two fixes depend on each other. The save step only helps if the next session can find what was saved. The map only helps if what it points to is current." (end of Failure two), and "You can change the adapter later, and the map and the domains stay the same." (adapter section).
5. The fictional map in the code block gives three rules (read the map first, load one domain at a time, save a change in the domain where it belongs). The third rule is a concrete form of "it saves what changed". Confirm the wording.
6. The "Try it" section adds a sixth suggestion: add the save rule, tell the agent one fictional change, and ask for it in a new session. Confirm it. It is a suggestion, not a measured result.
7. Browser review on phone and desktop was not run.

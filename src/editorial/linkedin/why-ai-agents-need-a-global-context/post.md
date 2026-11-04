---
slug: why-ai-agents-need-a-global-context
url: https://samperalabs.com/posts/why-ai-agents-need-a-global-context
media: carousel
media_files:
  - carousel.pdf
planned: 2026-10-20 09:00 Europe/Madrid
status: ready
---

## Post

The model knows the world, not your business.
And each session loses its decisions when it ends.

The global context is the layer for that gap: the information the model cannot know (prices, team, decisions), saved outside any session.

The pattern (numbers match the slides):
1. Split the information into domains: sales/, people/, product/.
2. Write a map: one line for each domain.
3. At session start, load only the map. Rule: read it before any tool call.
4. For each question, load one domain. Nothing else enters the session context.
5. Save each change where it belongs.

In the article's fictional example, a founder raises a price to $119 in one session. Without steps 2 and 5, the next session searches five tools and emails $99 from an old Slack message. With them, it loads sales/ and finds $119. Same model.

Where it breaks: the two halves depend on each other. The map only helps if what it points to is current, and a save only helps if the next session can find it. Each domain must also make sense alone. "Ask Sales" is useless to an agent.

Where does your agent save a decision when the session ends?

Full article in the first comment.

## First comment

Global context for AI agents: minimal to load, fast to find
https://samperalabs.com/posts/why-ai-agents-need-a-global-context

It adds why the adapter (MCP, files, or a database) matters least, how to write each domain so it makes sense alone, and a test you can run on your own agent.

## Faith

1. Faith: every AI agent needs a global context, and a better model does not replace it.
2. Claim (hook): "The model knows the world, not your business." (article heading, 46 characters).
3. Artifact: the fictional two-session trace ($99 without, $119 with), the folder tree, and the map file.
4. Mechanism: five steps (domains, map, load the map at start, load one domain, save each change).
5. Where it breaks: the map and the save step depend on each other; each domain must make sense alone.

## Media

Attach `carousel.pdf` as a LinkedIn document. Document title: "The model knows the world, not your business."

10 slides: the cover, the gap (two-session trace), steps 1 to 5 (one slide each, same numbers and words as the post), the result trace, where it breaks, and the end slide with the URL. Code slides for every trace and file, so the mechanism is exact and readable on a phone.

## Decisions

- Hook: "The model knows the world, not your business." It is closest to the faith and it is the article's own heading. Rejected candidates: "MCP is the least important part of your agent's context." (contrarian, but further from the faith), "Your agent forgets every decision when the session ends.", "An agent with five tools still emailed the old price." (fictional story hook), "A larger model would not have fixed this agent." (too dramatic).
- Template: claim, rehook, definition, numbered mechanism, evidence, where it breaks, one specific question, pointer. This is the structure of the best-performing technical posts in the research (see the guide sources).
- Voice: no first-person claims. Team voice is not needed for a general lesson.
- Tag: no MAAT tag. The article is a general lesson.
- Media: carousel (10 slides). The post has a five-step mechanism, and documents get the most reach on personal profiles in vendor data.
- Link: first comment and the end slide.
- Date: Tuesday 20 October 2026, 09:00 Europe/Madrid, the next free Tuesday.

## Facts

| Claim | Source |
| --- | --- |
| The Tuesday and Friday renewal email story, the five tools, the $99 Slack message from March | src/editorial/drafts/global-context/article.md |
| All examples are fictional | src/editorial/drafts/global-context/review-notes.md |
| "The model did not fail at reasoning", and the two failures | src/editorial/drafts/global-context/article.md |
| Definition of the global context, domains such as Sales, People, Product, one line for each domain | src/editorial/drafts/global-context/article.md |
| The three rules of the map | src/editorial/drafts/global-context/article.md |
| The article has a map, a save step, and a five-step test | src/editorial/drafts/global-context/article.md |
| The model cannot know the prices: not public, did not exist at training time (basis for "a larger model would not know the $119 either") | src/editorial/drafts/global-context/article.md |
| The decision stayed in a conversation that ended | src/editorial/drafts/global-context/article.md |
| The map (sales, people, product), its rules, sales/prices.md, and the save step in Sales | src/editorial/drafts/global-context/article.md |
| Session definition, sessions do not share memory, session context as small and exact as possible | src/editorial/drafts/global-context/article.md |
| The three parts (session, adapter, global context), the adapter matters least | src/editorial/drafts/global-context/article.md |
| Each domain must make sense alone, "Ask Sales for the new price" is worse | src/editorial/drafts/global-context/article.md |
| The two fixes depend on each other: the save step and the map | src/editorial/drafts/global-context/article.md |

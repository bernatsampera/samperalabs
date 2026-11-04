# LinkedIn guide for SamperaLabs

These are the default decisions for every LinkedIn post about a SamperaLabs article.
The agent applies them without questions. The author changes a default by editing this file.
The rules come from published data and from proven skills. The [Sources](#sources) section lists them. Where sources disagree, the rule says so.

## Reader

The reader is a technical builder: an AI engineer or a software engineer who ships agents and LLM features.
The reader knows what a model, a prompt, a context window, a tool call, and MCP are. Do not explain these terms.
Define the article's own terms (for example "global context", "domain", "Decision model") in one exact clause.

## Faith

Each post transmits one faith: the conviction that the reader holds after the post, for example "Every AI agent needs a global context, and a better model does not replace it."
The faith is deeper than the hook or the message. The hook gets attention. The message is what the post says. The faith is what the reader believes afterwards, and acts on.

- Choose the faith first. It is the central position of the article, not a detail.
- The hook and the carousel cover stand close to the faith: they state the specific claim that the faith rests on, preferably in the article's own words.
- Never write the general faith as a slogan or a closing moral ("Every agent needs X"). The body proves the specific case. The reader makes the generalization.
- Close the obvious alternative ("a better model fixes this", "this is a bug") with one fact from the article.

## Gate: do not draft without these five inputs

Extract them from the article and write them in the `Faith` section of `post.md` before the first draft. This gate is the main fix for sloppy posts.

1. **Faith**: one sentence.
2. **Claim**: the specific, counter-intuitive or measured statement the faith rests on. It becomes the hook.
3. **Artifact**: a real number, a measured result, a file tree, a trace, a config line, or a labeled fictional example from the article.
4. **Mechanism**: 3 to 7 numbered steps from the article, in system terms.
5. **Where it breaks**: a limit, a failure mode, a trade-off, or a dependency that the article states.

If the article has no measured number, use its most exact artifact and keep its label ("in the article's fictional example"). If it states no limit, use a dependency that it states. Never invent one.

## Post template

This is the structure of the best-performing technical posts (ByteByteGo, SwirlAI): one claim, a numbered mechanism that matches the visual, evidence, and the place where it breaks.

1. **Hook, line 1.** The claim, as one complete sentence. Target 80 characters or fewer, maximum 140 (the mobile "see more" fold). A statement, never a question. Story-moment and contrarian hooks perform best; question hooks perform worst.
2. **Rehook, line 2.** One shorter sentence with the stakes or the system. Line 1 and line 2 together stay within 140 characters where possible.
3. **Context.** One to two sentences: the system, the session, and what the model has and does not have.
4. **Mechanism.** "The pattern (numbers match the slides):" followed by 3 to 7 numbered steps. One line each. Use the article's system terms.
5. **Evidence.** The artifact from the gate, with its limit next to it.
6. **Where it breaks.** One to two sentences. This is the line that makes engineers trust the post.
7. **Close.** Either one specific question about the reader's own system ("Where does your agent save a decision when the session ends?"), or no question. Never "Thoughts?" or "Agree?". A closing question adds little reach; use it only when it is useful to answer.
8. **Pointer.** "Full article in the first comment."

Length: 900 to 1,500 characters (about 150 to 250 words). Long posts only help when people read them to the end, because LinkedIn ranks by predicted dwell time and reduces dwell bait.
Paragraphs: at most two visual lines on a phone, with one empty line between them.

## Language

- Serious and technical: an engineer who explains a design decision to other engineers.
- At each step, say where the information is: in the model weights, the session context, a tool, a file, or nowhere.
- Exact terms. "Session context", not "memory". "Tool call", not "looks around".
- ASD-STE100 style: short sentences, active voice. Vary sentence length naturally.
- No emoji, no hashtags, no Unicode bold. No en dashes or em dashes.
- Do not call stored information a "note" or a "piece".
- Banned AI and LinkedIn tells (the check enforces most of them through `blocked-phrases.json`):
  - reveal bridges: "The result?", "Here's what", "Here's how", "Here's why", "The kicker", "Why? Because";
  - false contrast: "It's not X, it's Y", "Stop X, start Y", "No X. No Y. Just Z.";
  - sincerity openers: "Let me be honest", "Real talk", "Unpopular opinion";
  - one-word or two-word paragraphs for effect (maximum one short fragment in a post);
  - AI vocabulary: crucial, robust, leverage, landscape, seamless, holistic, delve, unlock, game changer;
  - more than one triad (three parallel items) in the prose. Numbered steps do not count.
- Over-correction guard: after you remove the tells, read again. A rewrite that adds new drama, new fragments, or new opinions fails.

## Carousel

The default media for a post with a numbered mechanism. Documents get more reach than images on personal profiles in vendor data, and readers save them as a reference.

- 8 to 10 slides, 1080 x 1350 px, one idea for each slide.
- **Cover:** the hook claim, 8 words or fewer if possible, maximum 10. A short label above it with the article's subject. No image unless the image itself carries the claim. 99% of ad impressions stop at the first three cards, so the cover decides the post.
- **Body:** one slide for each numbered step, with the same number and the same words as the post. 15 to 30 words of prose, or a code block (trace, file tree, map, config) within 36 characters per line. Split a slide instead of cutting a fact.
- **Evidence slide** and **"Where it breaks" slide**, in that order.
- **End slide:** the article title phrase and the URL. No other call to action.
- One visual style for every post (the renderer provides it). Article images only when they are readable at feed size; comics only when they carry the step better than a trace.
- Render, then inspect every slide at full size and as a contact sheet at feed size. Fix cut text, small text, and repeated slides.

Video: only when the article has a homepage scene and the post is about one change from a before state to an after state.
Image: only for a single measured result shown by an article chart.

## Link

Put the article URL in the first comment, and on the end slide. Data conflicts on whether a link in the body reduces reach (Ordinal reports most of the penalty on company pages; AuthoredUp reports the lowest reach for one link). The first comment is the safer default for a personal profile.
The first comment: the article title, the URL, and one sentence about what the article adds beyond the post.

## After posting

Reply to comments in the first 60 to 90 minutes. Replies inside comment threads correlate with more reach in vendor data.

## Truth

- Use only claims that the article or its review notes support. Each claim gets a row in the `Facts` table of `post.md`, with its source path.
- Keep each limit next to its claim: "a fictional example", "in this test", "one bench run", "in our measurements".
- "I" only for the author's own opinions and actions as the article states them. "We" for team work.
- Mention the author's role only when the article states it, with the same words.
- Do not invent experiences, feelings, results, numbers, quotes, or reactions.
- Do not name a person who the article does not name.

## MAAT

- Name MAAT when the article does. Explain it once in a short clause when the reader needs it: "MAAT, where I work, makes software for combat sports gyms."
- Tag the MAAT company page once, at the first mention, when the article describes MAAT team work. `post.md` writes the plain name; the Decisions section tells the author to type `@MAAT` there and select the company page.
- Do not tag MAAT for general lesson articles, even when the example comes from MAAT.

## Calendar

- One post each week, on Tuesday at 09:00 Europe/Madrid. Reason: builders read LinkedIn on weekday mornings, and one week gives each post time to collect comments.
- The date is the next free Tuesday after the latest planned date in `src/editorial/linkedin/index.md`. With no planned posts, use the next Tuesday after today.
- Do not plan two posts with the same theme in consecutive weeks. Skip one week in that case, and report the free week so another article can fill it.

Themes:

| Theme | Articles |
| --- | --- |
| Agent context | why-ai-agents-need-a-global-context, building-an-ai-brain-at-maat, context-tree-agent-support-tasks, your-ai-agent-deserves-its-own-repo |
| Building agents | how-we-built-the-maat-admin-agent, lessons-learned-building-a-real-world-ai-agent-with-langgraph, analyzing-open-deep-research |
| AI tools for operations | gym-schedule-image-to-classes |
| Prompting | express-the-general |

Add each new article to one theme when its first post is planned.

## Backlog order

When the author asks which article is next, use this order. It starts with the newest work and alternates themes:

1. why-ai-agents-need-a-global-context
2. how-we-built-the-maat-admin-agent
3. gym-schedule-image-to-classes
4. express-the-general
5. building-an-ai-brain-at-maat

The context tree, own-repo, and LangGraph articles overlap with newer articles or are older. They get a post only on request.

## Sources

Researched on 17 October 2026. Vendor data has closed methods; treat numbers as direction, not law.

- LinkedIn Engineering, long-dwell ranking (2024): https://www.linkedin.com/blog/engineering/feed/leveraging-dwell-time-to-improve-member-experiences-on-the-linkedin-feed
- LinkedIn Pressroom, feed update against engagement bait (2026): https://news.linkedin.com/2026/ImprovingTheFeed
- AuthoredUp hook study, 309,614 posts (story hooks highest, question hooks lowest, short hooks highest): https://authoredup.com/blog/linkedin-hook-examples
- AuthoredUp format and length data: https://authoredup.com/blog/linkedin-algorithm
- Ordinal link penalty study: https://www.tryordinal.com/blog/linkedin-link-penalty-study
- Socialinsider carousel data (documents vs images, 9-12 slides): https://www.socialinsider.io/blog/linkedin-carousel/
- ByteByteGo post with numbered diagram: https://www.linkedin.com/posts/alexxubyte_systemdesign-coding-interviewtips-activity-7112099871880294402-FNdc
- Aurimas Griciunas (SwirlAI) RAG post with 9 numbered steps: https://www.linkedin.com/posts/aurimas-griciunas_what-are-%F0%9D%97%A5%F0%9D%97%B2%F0%9D%98%81%F0%9D%97%BF%F0%9D%97%B6%F0%9D%97%B2%F0%9D%98%83%F0%9D%97%AE%F0%9D%97%B9-%F0%9D%97%94%F0%9D%98%82%F0%9D%97%B4%F0%9D%97%BA%F0%9D%97%B2%F0%9D%97%BB%F0%9D%98%81%F0%9D%97%B2%F0%9D%97%B1-activity-7162757919552200704-jNqF
- Skill with the tell list and over-correction guard: https://github.com/sergebulaev/linkedin-skills
- Skill with the "no draft without metric, insight, mechanism" gate: https://github.com/samber/cc-skills/tree/main/skills/linkedin-ghostwriting
- Skill with carousel rules and render-and-inspect: https://github.com/charlie947/social-media-skills

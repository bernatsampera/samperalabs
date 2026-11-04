# Home page experiences: content draft

Draft of 2026-11-01 for Bernat to edit. Every fact comes from a source in the repo or a published article. Each experience lists its sources. "To check" marks facts that may be mock data or that need Bernat's decision.
Product rules: product.md. Experience ids and follow-ups: src/lib/ask/experiences.ts.

## Shared texts

Input placeholder
> Ask me about my work

Blocked (the question is not about Bernat)
> I only answer questions about me and my work. Try one of these.

Did you mean (Jev is not sure)
> Which one do you mean?

Unavailable (Jev does not answer)
> I cannot read questions right now. Pick one of these.

Follow-up label
> You can also ask

To check: a short note near the input that questions are saved, for example "I save the questions people ask, without names." Umami receives the question text, so visitors should know.

## who: Who is Bernat (default)

Type: Statement

> I am Bernat Sampera, an AI engineer. I focus on context.
>
> I am not a classic software developer. Most of my work is the knowledge an AI needs before it can help.
>
> Everything is information. Working with AI is less about code and more about knowledge: what you know, and how you pass it on.
>
> At MAAT, I help a company learn to work with AI. In my own time, I research how AI should store and find information.

Sources: journey/data.js (person.about, person.mottoLong).
To check: a sentence about where you live or your background. The repo has none, and Career comes later.

## now: What I work on now

Type: Choices

> Right now I work on two things.

| Option | Line | Opens |
|---|---|---|
| MAAT | My main work. How does a company become AI native? | maat |
| AI has no memory | My research. How should AI store and find information? | memory |

Sources: journey/data.js (missions).

## projects: Projects

Type: Choices. MAAT is the largest option.

> These are the things I build. MAAT is my main work.

| Option | Line | Opens |
|---|---|---|
| MAAT | I help a software company for combat sports gyms work with AI, in the team and for the gym owners. | maat |
| AI has no memory | My research on how AI stores and finds information. gcontext is the tool I build to test it. | memory |
| BJJGym | Find a Brazilian jiu-jitsu gym wherever you travel. | bjjgym |
| IndoEuroMap | Explore a city and see its local patterns. | indoeuromap |

Sources: journey/data.js (MAAT context, chapter k-5), src/lib/projects.ts (purpose lines).

## maat: MAAT

Type: Journey

Mission
> How does a company become AI native?

Summary
> MAAT makes software for combat sports gyms. I help the team, and the gym owners, work with AI.

The journey has three parts.

| Part | Question | Dates |
|---|---|---|
| Internal AI tools | How can AI take slow, manual work off the team? | May to September 2026 |
| The company brain | Can one place answer any question about MAAT? | Since May 2026 |
| AI for our customers | How can gym owners use AI every day? | Since September 2026 |

Newest chapter, October 2026
> Gym owners can ask in plain words. A gym owner types "Who came to class yesterday?" The Admin Agent finds the answer and shows it as a table or a chart.

Door
> Enter the MAAT journey

Sources: world/journey/guided/data.js (seasons, chapter maat-5), the published Admin Agent article.
To check: guided/data.js says its dates and the "AI migrations" chapter are mock data. Confirm the part dates before launch.

## memory: AI has no memory

Type: Journey

Mission
> How should AI store and find information?

Summary
> This is my own research, and how I see AI. The hard part is not the model. It is the information we give it.

Chapters so far
1. A model knows the world, not your work.
2. Everything is information.
3. Knowledge needs a shape.
4. Load little, find fast.
5. Knowledge must outlive the session.
6. Next: What should AI forget?

Newest chapter
> Knowledge must outlive the session. Each AI session ends and forgets what it learned. I am testing a small tool, gcontext, that saves the useful parts for the next session.

Door
> The story of this journey is coming soon.

Proposal, related reading under the door: "Global context for AI agents: minimal to load, fast to find", "Context Architecture vs Agent Harnesses: Where Gcontext Fits", "Express the General".

Sources: world/journey/data.js (journey "knowledge"), published articles.
To check: journey/data.js says its chapter dates are mock data, so this draft shows no chapter dates.

## agents: AI agents

Type: List, newest first.

> I build agents that work with what a company knows. These articles show how.

| Date | Article |
|---|---|
| October 2026 | [How we built the MAAT Admin Agent for gym owners](https://samperalabs.com/posts/how-we-built-the-maat-admin-agent/) |
| June 2026 | [How we built a context tree for our agent to resolve support tasks](https://samperalabs.com/posts/context-tree-agent-support-tasks/) |
| May 2026 | [Context Architecture vs Agent Harnesses: Where Gcontext Fits](https://samperalabs.com/posts/context-architecture-vs-agent-harnesses/) |
| May 2026 | [Your AI Agent Deserves Its Own Repo](https://samperalabs.com/posts/your-ai-agent-deserves-its-own-repo/) |
| November 2025 | [How to handle Human in the loop with Langgraph and FastAPI](https://samperalabs.com/posts/how-to-handle-human-in-the-loop-with-langgraph-and-fastapi/) |
| September 2025 | [Lessons Learned Building a Real-World AI Agent with LangGraph](https://samperalabs.com/posts/lessons-learned-building-a-real-world-ai-agent-with-langgraph/) |
| July 2025 | [Advanced Langgraph: Deep dive into open deep research](https://samperalabs.com/posts/analyzing-open-deep-research/) |

Sources: samperalabs.com/rss.xml on 2026-11-01.
To check: 7 articles may be too many for one answer. Cut to the ones you want to show.

## principles: How I think about AI

Type: Statement. The principles appear one after another.

> Five ideas guide how I work with AI.

1. **Everything is information.** Code, a chat, a rule in someone's head: all of it is information. AI work starts there. *Example: before I build an agent, I list what it must know.*
2. **Knowledge beats code.** A strong model with the wrong knowledge gives wrong answers. Most of the work is the knowledge, not the code. *Example: the MAAT Brain is a set of folders and text, not a program.*
3. **Say the goal, not only the steps.** If you give a helper only the steps, it cannot find a better way. Tell it what you want. *Example: "Make this easy to read" beats "add a comment to every line".*
4. **Give a map, not a pile.** Nobody reads a pile. A map shows where to look, so the AI reads only what the question needs. *Example: an agent reads one index first, then opens only the files it needs.*
5. **Write for people and AI at the same time.** If a new colleague and an AI can both follow it, it is clear enough. *Example: plain files, short sentences, folders with clear names.*

Sources: journey/data.js (principles).

## articles: Articles

Type: List, newest first.

> Everything I have published, newest first.

| Date | Article |
|---|---|
| October 2026 | How we built the MAAT Admin Agent for gym owners |
| October 2026 | Global context for AI agents: minimal to load, fast to find |
| October 2026 | Building an AI Brain at MAAT |
| October 2026 | From a gym schedule picture to classes in MAAT |
| June 2026 | How we built a context tree for our agent to resolve support tasks |
| June 2026 | Express the General |
| May 2026 | Context Architecture vs Agent Harnesses: Where Gcontext Fits |
| May 2026 | Your AI Agent Deserves Its Own Repo |
| May 2026 | Bet on Optionality |
| April 2026 | Using Ollama in a simple App with the MCP Protocol |
| January 2026 | Safely Running Ollama with CPU Temperature Checks in Python |
| November 2025 | How to handle Human in the loop with Langgraph and FastAPI |
| September 2025 | Lessons Learned Building a Real-World AI Agent with LangGraph |
| July 2025 | Advanced Langgraph: Deep dive into open deep research |

Sources: samperalabs.com/rss.xml on 2026-11-01. The live answer should read the published posts, so new articles appear without an edit.
To check: show all 14, or the newest 8 and a link to the full list.

## bjjgym: BJJGym

Type: Statement

> BJJGym helps you find a Brazilian jiu-jitsu gym wherever you travel.
>
> Gym listings often miss what matters for training. They rarely say how a gym trains, who teaches, what level it has, or how clean it is.
>
> BJJGym uses AI to read public reviews and pull out labels such as no-gi, clean, good teacher, and high level. Each gym shows its labels.

Link
> Visit bjjgym.com

Sources: src/lib/projects.ts, design-preview/decisions.md (BJJGym project text).

## indoeuromap: IndoEuroMap

Type: Statement

> IndoEuroMap shows the local patterns of a city on a map.
>
> Data about places and reviews is scattered, so a neighbourhood is hard to understand.
>
> IndoEuroMap combines public place and review data into area profiles and shows them on a map. A profile describes an area. It says nothing about the ethnicity or culture of a person.

Link
> Visit indoeuromap.com

Sources: src/lib/projects.ts.

## site: How this site works

Type: Statement

> This page has no chatbot. Every answer here is prepared.
>
> When you ask a question, a small model called Jev reads it. Jev does not write text. It gives a probability for each prepared answer, and plain code picks the one to show.
>
> If Jev is not sure, the page asks you which answer you mean. If the question is not about me or my work, the page does not answer it.
>
> I use the same idea at MAAT. In the Admin Agent, Jev decides how to handle each message before a larger AI model writes the answer.

Sources: src/lib/ask/decide.ts, the published Admin Agent article.
To check: add "I save the questions people ask, without names" here if you want the note from Shared texts.

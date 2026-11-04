# Evidence for the samperalabs content

Extracted on 2026-11-01 from Bernat's own messages to Claude Code (projects gcontext-framework, bernat-agent, samperalabs), the three repos (gcontext-cloud, gcontext-framework, bernat-agent), and the 14 published articles plus 4 old project posts on samperalabs.com.

Rules of this file:
- Quotes are verbatim, typos kept, with the date (UTC). They are evidence for the voice, not text for the site.
- Private matters (money, tax, equity, health, family, addresses, housing, crisis plans) are left out.
- "To check" marks a fact that Bernat must confirm before it goes on the site.
- Numbers reported by agents, not by Bernat, are not in this file unless an article publishes them.

The raw extracts (one per log part, with timestamps) are in the session scratchpad under `mine/extract-*.md`. Ask to copy them into the repo if you want them.

---

## 1. Who Bernat is, public facing

### How he positions himself
- 2026-10-31: "I want to position myself as someone that is not a software developer, more in the direction of AI Engineer with a lot of focus on context. one of my motos is that everything is information and knowledge, and that working with AI is less about code and more about knowledge and how information is transmitted."
- 2026-10-16: "My vision with AI is that "KNOWLEDGE IS ALL THAT MATTER"."
- 2026-11-01: "the AI part of it, as it's what I do."
- Motto wordings seen: "Everything is information." (2026-11-01), "everything is information and knowledge" (2026-10-31), "KNOWLEDGE IS ALL THAT MATTER" (2026-10-16). To check: pick one.

### Work
- MAAT: the company where he works. MAAT makes software for combat sports gyms (Admin Agent article). The context tree article (June 2026) says: "the startup MAAT where I work, a martial arts software for gyms, we handle the memberships of students".
- Admin Agent article (2026-10-16): "I drive the Admin Agent project at MAAT, and I own its AI infrastructure and backend work."
- 2026-11-01: "during the week I work more on maat brain than in this" (this = gcontext).
- 2026-10-21: "I joined pretty early the company". To check: year and role title, and what he wants public.
- Side work: gcontext ("in my personal side, where it's mostly research", 2026-10-31), bjjgym.com and indoeuromap.com ("more like products", 2026-10-31).
- Older public projects: PackdenSack (post of 2025-05-01, AI packing assistant), BJJGym (post of 2025-03-29), translateprompt.com (the LangGraph article of 2025-09-10), ContextAgora (post of 2026-04-29). He also names codefreund and diversity-map (2026-09-29) as projects where old gcontext versions were tried. To check: which of these should appear at all.

### Background, to check before publishing
- "I am from spain" (2026-10-01).
- Lived in Munich before; "i can speak german" (2026-10-25); "I am trying to learn estonian" (2026-10-13).
- Nomad in Europe: "I have this plan of being nomad for while" (2026-10-19). Tallinn in October 2026, Munich next.
- Trains BJJ: "i want to go to a bjj gym 3 times per week" (2026-10-05).
- Works from cafes and libraries, a MacBook Pro plus a home server he calls casaserver, over Tailscale.
- Spanish or Catalan speaker; dictates many messages by voice.
- The site must not say anything about employment structure, equity, taxes, or housing.

---

## 2. His opinions about AI, in his words

Grouped by theme. Each theme has the source where he earned it, so the site can attach the opinion to the work.

### Everything is information
- Articles "Context is Everything" (2026-05-21): "Context offloading is the practice of systematically writing down what you know in a structured way so it can be referenced later, by you, by your team, or by any AI tool you work with." and "AI is a tool. A good one, but still a tool. It executes intent, it doesn't generate it." and "The gap between what you want and what AI can do isn't intelligence, it's definition."
- 2026-10-24: "When we come into information, we come into things that can be very flexible. At the end is information, everything are words and things that are transmitted to one place from another."
- 2026-10-23: "it can be facts, decisions, summaries, whatever. It's simply inforamtion that is useful for an AI to do operations, it's the layer between an AI and the database."

### The model is not the problem
- Article "Global context" (2026-10-16): "The model did not fail at reasoning. Two other things failed: On Friday, nothing told the agent where the price was. On Tuesday, nobody saved the new price."
- "Context is Everything": "The fix isn't a better model. It's a practice."
- 2026-11-01 (hero idea): "the ai should be viewed as a human with the information that he carries on one day" and "what I want to represent is the capability OF LEARNING that an AI agent has, not an AI, but an AI agent, that we can define for it information and define for him how to access it."

### LLMs cannot organize context alone
- 2026-10-23 (vision session): "these models, LLMs, are good at predicting the next token or whatever they have been trained at. But what they cannot do is organise context properly. They can do it better if you ask a very large LLM how to organise this in a nice way and following some specific rules. This can be done, but it requires the human to specify these rules and to give the sense of the whole agent or purpose of the memory layer to the AI."
- 2026-10-23: "I don't want that the human does it, but this is exactly what I am having so many problems about."
- 2026-10-22: "I know that right now the idea in my head is better than what we are generating. [...] We don't have to make the same as mine. We have to make one that is better."

### Less is more. Noise is the enemy
- 2026-10-16: "NOISE IT THE BIGGEST ENEMY ... A LOST FACT IS NOT WORSE THAN EXTRA TEXT. EXTRA TEXT is HELL" [paste]
- 2026-11-01: "In the last month I've been hearing many developers say that dogs [docs] are not needed. Everything can be just with the same line of codes. Here we have done it differently in busy regime [bjjgym], and the purpose of handbook is precisely this." and "We are willing to sacrifice some things being lost than to have too much information."
- 2026-10-25: "It's a problem if this context files have too much info, because then AI wastes a lot of tokens each time needs to undeerstand somehting, so keeping it trim is a need"
- Global context article: "Loading all the information does not make the answer better. It makes the session larger." Main rule: "Write the global context for how the AI loads it. Minimal to load, fast to find."

### A map, not a pile. Load one domain
- Global context article: "Access is not the same as knowing where to look." and "Without a map, the AI searches everywhere. With a map, it reads one line and goes to one place."
- 2026-10-16: "the RELEVANT context for the sesssion is loaded, this is the prize this is for what we are doing everything"
- Brain article (2026-10-04): "An AI with access to Stripe can retrieve payment information. That access does not explain how our team should handle a request."

### Knowledge must outlive the session. The save step
- Global context article: "A session does not only read information. It also creates it. [...] If the agent does not save that change, the change is lost when the session ends."
- 2026-10-17: "even if it's just AI the agents does things and learns things for the future, this learned things is what we want to give the agnt a place to leave them and recover later."
- 2026-10-15: "old facts shoud be replaced, this is very important. all facts must be replaced actually, the information of gcontext must be always up to date."

### Information must be characterless and plain
- 2026-10-21: "the information should be characterless, just information." and "you just type information, you are not doing json" and "we shouldn't put words that refer variables from the code."
- 2026-10-25: "it's a bit dumb to put a negation in a file, don't you think."
- 2026-10-24: "I want that the final thing is easy to understand for both the humans and also the AI."
- Brain article: "We chose a shared structure for our company context that both people and AI can follow."

### Files and folders, not graphs or vector stores
- 2026-10-24: "All of these systems like Memo and Graffiti [Mem0, Graphiti], they works with graph. [...] I don't want a system where everything works in graphs and the structure of the information it's based on graph. I don't want that."
- 2026-10-24: "right now LLMs are already very good at using gred [grep] to parse this information. I like how this goes that a coding agent uses GREP to parse this information."
- Article "Your AI Agent Deserves Its Own Repo" (2026-05-25): "Files make a small knowledge base easy to inspect. Markdown works across many tools. Git records what changed and lets you review those changes."
- Article "Context Architecture vs Agent Harnesses" (2026-05-26): "Agent intelligence becomes unreliable when context architecture is unmanaged." and "unmanaged context eventually becomes architectural debt."

### Do not copy what lives elsewhere
- 2026-10-24: "we don't want to add the information to G context if it already exists in some other place. [...] We want to be able to have the instructions to access this third party."
- Vision file: "Data that exists in another place, such as Notion, Stripe, or a database, is not copied. The handbook holds the instructions to access it."

### Say the goal, not the steps
- Article "Express the General" (2026-06-05): "I might know the result I need but have little knowledge of the best method. If I give the model that method as an instruction, I restrict its choices before it starts." and "writing a prompt starts with three questions: What result do I need? What facts and limits matter? Which instructions are only guesses?"
- 2026-10-16: "this is not a rule per se, this is a direction, this is very important when writing context as it's not the same one RULE as one, kindoff feeling, we want to explore in this direction."

### The process must produce the result, not a prompt trick
- 2026-10-22: "we shouldn't add this in the skill, this is playing tricks with the prompts. This has be done possible with the way domains are created"
- 2026-10-22: "A process that I design and it produces a non deterministic result very similar every time."
- 2026-10-16: "the method is a deterministic path where every single part of the process is non deterministic. There is no 1 right structure"
- 2026-10-27: "we don't hard code it for the first example that we build. We have to make something always general."

### Bet on optionality. One agent, many modules
- Article "Bet on Optionality" (2026-05-23): "N specialized agents give you N capabilities. N context modules give you the entire combinatorial space." and "The difference between "that would require a whole new system" and "that's just a prompt" is the entire gap between building for today and building for optionality."
- Article "Context Architecture vs Agent Harnesses": "Gcontext asks: How should knowledge and context be structured? OpenClaw / Hermes ask: How should autonomous agents run?" and "They're complementary, not competing."

### Agents: decide first, then write. Test with questions. Observe everything
- Admin Agent article (2026-10-16), his four lessons: "Write the questions before the prompts. This is test-driven development for agents." "Observability is your best friend, and it needs real focus." "Separate the Decision model from the Generation model." "Treat non-deterministic code as non-deterministic."
- 2026-10-17: "I need observability to be able to make gcontext work." and "EVERY time that a triger is done to SAVE information, EVERYTHING MUST BE LOGGED"
- Schedule article (2026-10-04): "find the point where a person can inspect and correct the result."
- 2025-09 LangGraph article: "The Bitter Insight: Removing nodes from an Agent for a Better User Experience" (he cut agent steps for speed).

### Working with AI as a person
- 2026-10-23: "I have the idea very very clear in my head, I know exactly what it has to do, but when it comes to the implementation lots of stuff has to be done at the same moment and I loose the overall vision"
- 2026-10-17: "can you pls understand HOW DIFFICULT IS TO TRY TO STORE the context and treat the challenge with respect"
- 2026-10-27: "we are in the AI era, if I want that people use my product, i have to also provide an easy way for them to connect to it."
- 2026-10-27: "with AI, me knows much better how to connect AI agents than them. So I want to guide them in some way to be able to make the their agents connect to our tool."
- 2026-10-31: "to achieve this I've worked in a very chaotic way, now I know that that conversation can do the things, and the knowledge is there, but the structure of the repository is a mess"

---

## 3. The gcontext story, in phases

This is the material for the second story. He said on 2026-10-31: "the goal is more to explain what is my vision of AI. Maybe the whole thing won't be ever called gcontext, I think gcontext should just be a small part in the story, and the goal should be the main part."

### Phase 0, 2025: agents with LangGraph, and a translator that learns
- Articles: "Advanced Langgraph: Deep dive into open deep research" (2025-07-15), "Lessons Learned Building a Real-World AI Agent with LangGraph" (2025-09-10, about translateprompt.com, a translator that remembers corrections), "How to handle Human in the loop with Langgraph and FastAPI" (2025-11-05), Ollama posts (2026-01, 2026-04).
- The translateprompt article already shows the seed: a stateless tool repeats the same mistake every day; one that saves the correction does not.

### Phase 1, April to July 2026: gcontext Cloud (Context Loader, ContextAgora, EIC, then gcontext)
- Repo gcontext-cloud: first commit 2026-04-02 ("build first poc", package context-loader-poc), last 2026-07-24, 697 commits. 292 commits in April alone. Python FastAPI plus React, Docker, secrets through Infisical and Varlock.
- Names, from git: Context Loader (04-02), ContextAgora (04-11), EIC and "everythingiscontext" (05-20 to 05-30, EIC = everything is context), gcontext from 05-30. gcontext.ai enters the code on 05-30. To check: what the "g" stands for. No file says it. Likely "global context".
- What it was: a self-hosted web app where you pick which "context modules" (integrations, workflows, tasks, each a folder of markdown with a module.yaml in your own git repo) the agent loads. A chat runs the claude CLI with those modules. The agent reads a module, writes a Python script, runs it with secrets injected by name. "READ, GENERATE, EXECUTE".
- His brainstorm note of 2026-05-15 (core_idea.md): "The AI can do everything, but it needs the right information. The whole game is making all your company's info available, then letting the AI pull the right slice per task with the least noise possible." and "Only a human can draw the outline. The agent can write what goes in the rooms once the rooms are drawn." and "Earlier version: a static tree representing the whole knowledge of a company. That worked for integrations [...] It broke for everything else: couldn't scale; couldn't represent disposable, per-task work".
- The EIC landing (05-24): "No MCP. No RAG. No vector DB. One folder of plain files; the agent walks llms.txt and reads only what each task needs."
- Post "ContextAgora.com" (2026-04-29): "Role: Founder & lead developer". It lists MAAT as live: "90% faster support resolution", and Soundmurai. The July landing says MAAT "64% faster support tasks" and Soundmurai "79% faster insight generation". To check: these numbers and whether to name clients at all.
- June: gcontext-ai on PyPI, a desktop support app, a hosted MCP connector (app.gcontext.ai, Free and Pro at 12 dollars a month, Stripe billing). July: self-hosting, docs site, position.md ("gcontext vs alternatives"), then the last commit on 07-24: "redesign landing around 'the framework for building stateful agents'". The hosted connector's fate is not recorded. To check.
- Articles of this phase: Context is Everything (05-21), Bet on Optionality (05-23), Your AI Agent Deserves Its Own Repo (05-25), Context Architecture vs Agent Harnesses (05-26), Express the General (06-05), the context tree at MAAT (06-14).
- Why it ended, from the framework's first decision log (2026-07-20): "The previous gcontext module system with three kinds (integration, task, workflow), module.yaml manifests, and typed folders. This was powerful but too complex for other people to understand and use. The classification system created decision paralysis ('is this a task or a workflow?')". To check: his own one-line reason.

### Phase 2, July to September 2026: "your agent is a folder", a release train, then the turn inward
- Repo gcontext-framework: first commit 2026-07-21. "A directory of folders becomes an agent. Every folder is context." One local server, gcontext up, serves the folder over MCP; Claude Code, Codex or Cursor attach. "gcontext is not a runtime. It has no chat loop, no LLM client." Decision of 2026-07-24: "The product is statefulness, not integrations" and "In AI, information is the currency."
- August: 176 commits, PyPI 0.4.4 to 0.15.0 in four weeks, 15 landing tags, a workflow marketplace (archived 08-09), an agent registry bleak-ai/agents (browser-cookbook, create-post, release-ops), landing headline "The Agent State Manager" (08-12). Iterations 0 to 7 as frozen folders; flows "never met a real use case" (dropped 08-01).
- 2026-08-12: the split into gcontext-agent (the project's own memory) and bernat-agent (his personal agent). The gcontext-agent captured his sessions on a schedule, three times a day, through October.
- Late August to September: the "folder standard" (v5 to v9): "gcontext is a folder standard. It gives an AI agent a memory of your project." A context/ folder, a save every five turns, a check of the structure. Then the "rethink" (09-21): a trigger that accepts text, a puller that finds context for a task, Jev scores where a fact goes, a replay harness over his recorded sessions. 09-30: "stale facts across files lead" as the main failure.
- No conversation logs exist before 2026-09-29. To check: August in his words, and whether the public site mentions this phase at all.

### Phase 3, 2026-09-29 to 2026-10-16: doubt, restart from zero, the first pipeline
- 2026-09-29: "Our solution atttempts to fix the same right? Are we doomed to failure?"
- 2026-10-06: "We start the project from zero." A pipeline in one day: extract units, summarize, questions, domains, tree.
- 2026-10-12: "The goal of this is that I, and other people can use it for their agents, mcp, brains... Basically I want that this is very easily pluggable"
- 2026-10-14: "I've been struggling with this for a whole week and made 0 progress" and the five breaks on real data: too many notes, notes too small, no restructure, no merge, no multi-note files.
- 2026-10-16: the four parts (AI, session context, adapter, global context) and the diagram title "Loading and Offloading Information in AI Agents". The two articles of 2026-10-16 come out of this week.

### Phase 4, 2026-10-17 to 2026-10-22: the second iteration
- 2026-10-17: a Claude Code stop hook held his window five minutes; he stopped it: "I think that we are trying to be too ambitious too soon". Pivot: an SEO agent for bjjgym.com as a controlled test bed. "the seo agent is the excuse. What we are doing is testing gcontext in this."
- 2026-10-17: he names the parts: adapter, extraction, placement. Observability becomes the center: the trace viewer.
- 2026-10-18: the names crisis: "I am at my literal limit". A legend and a full rename the same evening. Purpose per instance: "WE have to give a purpose to gcontext, what should gcontext save from the conversation".
- 2026-10-19 to 20: the MAAT brain becomes the first real use case. "A conversation is an adapter, an adapter doesn't have to be a conversation". Colleagues agreed to be recorded.
- 2026-10-21 to 22: rules for a stored piece (characterless, no code names, no dates or hashes), domains from the process, not from a prompt trick. He runs his own theory as an experiment, it fails, he accepts the data.

### Phase 5, 2026-10-23 to 24: stuck, then the vision from scratch
- 2026-10-22: "Honestly I worked a lot in this process and I am a bit stuck."
- 2026-10-23: "you say I need this from you, BUT WHY??" and "maybe we should do a grill me session and we setup a very detailed new "vision""
- 2026-10-23 to 24: the vision session. The words: handbook, gateway, agent, session, contribution, template, purpose. Success: "faster, more accurate and cheaper way than before."
- 2026-10-24: "I want to approach the whole solution for this again from 0, taking into consideration what we've done but just as an extra possibility, not as the base."

### Phase 6, 2026-10-24 to 27: the third iteration, addition tests
- A test place: same input (a contribution and a handbook), free method, measured on speed and accuracy. Methods: simple, folder-index, fact ledger, embeddings, fact-embeddings. The winner: code finds and writes, the model only decides.
- Test cases from his own work: "I had actually this example with a stripe function called dot get that before it was dot get and then they change so to something else, and I had this problem for a long time while I was using this stripe connection until I updated the context."
- 2026-10-25: "really what I am interested is "which context was missing that now has been found""
- An overnight loop of 8 iterations. 2026-10-26: "I want to stop here."

### Phase 7, 2026-10-28 to 2026-11-01: the gateway, the first real capture, public v1
- 2026-10-28: "I have been building gcontext for some time and the part of the adapter / gateway it's a bit challenging". Session package idea. "once a session has been rejected, this is rejected forever".
- 2026-10-30: his 12 step flow (conversation, capture, see what is kept, tweak, rerun, accept, record).
- 2026-10-31: first end to end capture on bjjgym. "the product works and we proved in this end to end run that I can start working actively with gcontext and storing context already, this is exactly what was my goal. So good, milestone acheived." Then the public-v1 cleanup. "My goal is to have from this an public repository that everyone can use and setup in 10 min."
- README today: "gcontext gives a coding agent a handbook: a folder of Markdown files with what the agent needs to know about a project."
- 2026-11-01: load through a skill he switches on, not an always-on import. Two live trials: bjjgym switches from docs to the handbook; the Maat brain at "just 5 minutes each day". "The goal is that everone can use gcontext".

---

## 4. MAAT facts, for the MAAT story

All from the published articles unless marked.

### Support tasks, from manual to a context tree (article 2026-06-14)
- "First we were doing most things manually, updating the DB by hand, same with Stripe. Tedious work."
- "After that we thought that with Claude Code we could use a claude.md to show the agent how our product was built" and "we did not trust the AI to do real changes in PROD."
- "we decided to find a way to keep the investigations we did in every conversation" with a "tree of llms.txt": stripe, firestore, support with runbooks and daily logs.
- To check: when this started (the article is June 2026, the ContextAgora post of April 2026 already names MAAT as live).

### The Brain (article 2026-10-04)
- "At MAAT, we build an AI Brain that the team can use for questions, support, and migrations."
- "We designed the hierarchy by hand" and "Growing the knowledge is still hard. [...] Knowledge growth is not automatic."
- Logs: the Brain is an MCP server the team uses from claude.ai and Claude Code; a "report" tool records intent, summary, and status per session (2026-10-20). To check: when the Brain started.

### Schedule photos (article 2026-10-04)
- "A schedule that took seconds to understand could take about 30 minutes to enter." "Our product team built an import tool that reduced this task to about five minutes." Docling on Modal, then Gemini 2.5 Flash-Lite. "find the point where a person can inspect and correct the result."
- To check: the month it shipped.

### The Admin Agent (article 2026-10-16)
- "Since September 2026 we build the MAAT Admin Agent: a chat inside the MAAT Admin Dashboard where a gym owner asks questions about the gym in plain language."
- Jev as the Decision model: scope, effort, language, domain. "The agent is read only. Today we test it on a seeded gym and with internal users. A closed beta with customer gyms comes next."
- Numbers in the article: model steps 213 to 121, cost down 39 percent on a 70 turn bench; 134 owner goals in 15 domains; 72 of 134 change data. These are published and can be used.

### AI migrations
- 2026-10-31 he named the first part "Making Internal AI tools to enable the team (gym scheduler, ai migrations to maat". The brief says the migrations chapter in the draft is not real. To check: did AI migrations happen, when, and what is public.

### The three parts he named (2026-10-31)
- "1 = Making Internal AI tools to enable the team (gym scheduler, ai migrations to maat" "2 = Making the Comapany brain, an internal tool that is able to answer questions about everything regarding maat" "3 = making AI features for our customers, admin aI agent" and "more of those things can be in parallel".

---

## 5. How he works with AI, for a "how I work" answer

- Claude Code as the main seat, several sessions in parallel on one repo. 2026-10-17: "this project that I am actively developing in multiple windows".
- Subagents by role. Fable for plans, options, and adversarial reviews. Opus for builds in worktrees. 2026-10-21: "let's make a plan for it with a fable 5.1 subagent in high effort and then trigger a opus 5.5 to implement it". Codex was a coworker until its quota ran out; from 2026-10-31 he asks for Opus only in gcontext.
- The main chat as orchestrator: 2026-10-27: "I want that you act as a sparring partner, brief and quick responses, not someone that thinks, if you have to think I will isntruct you to spawn a subagent".
- Handoff prompts between conversations, written by the AI, pasted by him. 2026-10-28: "put all the reasoning behind with details so you can explain it to me again when I forget".
- Options rated 1 to 10 before a decision. 2026-10-13: "show me different ideas and rate them from 1-10 and pros and cons".
- Design by choosing: static HTML mocks, two or three options, one remark, lock it. 2026-10-21: "what I like about claude.ai/design is that I can choose in which direction someothing goes and then provide small remarks to improve it in one direction or another".
- Plain explanations, always: "explain it to me in ASD-STE100 Simplified Technical English (STE)" appears almost daily.
- Talk before build. 2026-10-25: "But let's talk. Don't do it yet." 2026-11-01: "don't do nothing I am the driver and u help me".
- He runs the tests and judges in the UI himself. No unit tests, end to end runs with an artifact. 2026-10-17: "u created lots of dummy tests, u can remove them".
- Cost discipline: subscription only, one call per idea. 2026-10-22: "no stable repetitions, just one, then let me see it."
- Decisions written with his words and the date. Vision file: "Only Bernat changes this file. Each change has a date."
- A personal agent (bernat-agent) with modules per topic: his machines, trips, cafes, remote agents. 2026-10-10: "The purpose of the module is to save all the information of herdr and how to connect to casaserver in one place so we can recover it".
- Remote agents: one command moves a live coding session from the Mac to his home server and the phone continues it. 2026-10-16: "It has to be automatic, I dn't want to have to worry about it".
- Voice dictation for long thoughts.
- What he hates in an assistant: invented labels, verbosity, tests too big, agents fanning out without a strategy, asking without saying why, accepting everything without pushback.

---

## 6. Voice

Patterns in his writing: short imperatives; "u", "w", "pls", "tbf", "rn", "bro", "man"; caps for stress; double question marks; numbered answers; scores out of 10; "chill" and "let's talk" before a change of course; "I trust u" when he hands over; honest about being lost: "I am a bit lost right now."

For the site he wants the opposite of jargon: colloquial, simple, STE sentences, standard developer words, no invented labels, no clickbait, headings that name the technique, first person only for his real opinions. 2026-09-29: "I hate the language that you use and how u express things. Be much more coloquial, simple." 2026-10-26: "understandble by the default tech bro".

Lines that could carry into public text, after his edit:
- "Everything is information."
- "the model is not the hard part, the information we give it is"
- "A lost fact is not worse than extra text."
- "Access is not the same as knowing where to look."
- "Minimal to load, fast to find."
- "Say the goal, not the steps."
- "Write the questions before the prompts."
- "Decide first, then write."
- "A conversation is one input. An agent is not a conversation."
- "I would rather lose a fact than keep the noise."

---

## 7. The answer set, with the evidence behind each

| Intent | Evidence available | Gap |
|---|---|---|
| Who are you | positioning quotes, articles byline | background line, motto wording |
| What now | MAAT (brain, admin agent), gcontext trials | one line each in his words |
| Projects | bjjgym, indoeuromap, gcontext, MAAT; old: packdensack, translateprompt | which old ones to show |
| AI in a company (MAAT) | 5 articles, three parts named | dates, migrations |
| Agents | Admin Agent lessons, LangGraph 2025, HITL | his current one-paragraph view |
| Context and memory | global context article, vision, less is more | the chapter list |
| gcontext, the tool | README, vision words, phases | his two-sentence definition and what it is not |
| Models and tools | Jev, Claude Code, Ollama, Docling, Gemini named in articles and logs | what he names publicly |
| How you work with AI | section 5 | what stays private |
| Contact and hiring | nothing | everything |
| Side projects | project lines, old posts with numbers | numbers still true |
| This site | existing answer | none |

---

## 8. Facts to check

- Motto wording (three variants).
- Public background line: Spain, Munich, nomad, Tallinn, BJJ.
- MAAT: join date, title, what to say about the role, team language ("we").
- MAAT dates: support tree start, Brain start, schedule tool month, migrations real or not.
- ContextAgora post: "90% faster support resolution" and the Soundmurai client.
- Why gcontext Cloud (v1) ended, in one sentence.
- What happened in August 2026 (no logs).
- gcontext.ai landing: still his words, or stale.
- BJJGym post of 2025: "2,000+ verified gyms", "150+ countries". PackdenSack: "50,000 packing lists". Still true, and wanted.
- Which models and vendors can be named: Jev yes, GLM no (2026-10-16). Ollama, Gemini, Docling, Claude Code, Codex?
- Admin Agent status today: still internal, or in beta.

---

## 9. Interview questions

Posted in the chat on 2026-11-01. Answers go here when they come, verbatim, then the drafts follow.

### Answers, 2026-11-01, dictated (verbatim, glosses in square brackets)

1. "Maybe put that I live most of my professional career in Munich. Now I'm not in Europe [read as: now I'm a nomad in Europe, to check]. Don't put Tallinn, put that I visited Tallinn so far. I train BGJ [BJJ], Don put how many times a week. Say also that I've been working as a front end and full stack developer for three four years until I decided to do a switch to AI in the beginnings of twenty thousand and twenty-five. And then I made some time where I studied AI. I did some land graph [LangGraph], I did one course at the Turing College on AI engineering, I also created this GitHub repo with more than 250 stars, https://github.com/bernatsampera/event-deep-research using langgraph, This was the first serious thing I did with AI. Then I went to work with Matt [MAAT] at the end of 2025, and there I've been trying to enable the company to use AI and take the maximum advantage of AI in every place possible. And then maybe here let's put a link to the mad [MAAT] story when we are explaining this. I'll so put some link in the GitHub thing."

2. "On MUD [MAAT], I am an AI engineer. I already said when I joined what MAAT does is Helping the Zim [gym] owners run an Academy, mainly in martial arts like Brazilian Jiu Jitsu or MMA or kick boxing."

3. "Regarding the working mat [work at MAAT], I did in February of 2026 the schedule that was able to generate things from a simple image, and then to insert this into our backend. Then we also move the migration process from other providers to mat with the AI migration. I did this and this helped us a lot on to doing this process. I also took that process onto my own. I assumed all responsibility with my AI workflow. Then We did the Madbrain [Maat brain]. We started official [unofficial] version that was already being used by the team. That it's very similar to the thing I did with Context Zagora [ContextAgora]. It's mainly the same UI. And this already enabled all the team to have all the knowledge about MAD, and also enable non technical people to do questions to the AI regarding Stripe, the database, and other important data that before they had to record [resort] to a technical person to be able to do. This also helped the support team to start solving the support task on their own. Then on August, we made instead of the unofficial MadDrain, we made the official one, and this is a more polished version, which works with MCPs. In the old version, it was just a cloud [Claude] instance running on the virtual machine. This one has a better authentication. It works with MCP, it also has the concept of the playbooks, which is quite interesting, so that the team can execute pre-approved playbooks onto the backend, and in this case it's the AI that knows for each problem that the Zim owner does which playbook has to be executed, and because the playbooks are static, just some parameter change, we can do them deterministic, which solves a bit the problem of having rogue AI by people that are non-technical."

4. "GContext is a tool that attempts to solve the memory problem when working with AI agents that have a limited context during a session. Basically, it attempts to structure the information in the best way possible so that the agent is able to retrieve it and find it when it can [needs it]. Here it started in March on the attempt to make support that mat easier, of all the things that I needed to do to be able to support the tickets and Other questions that I had. But when you explain this, both math and G context are something different. Here I am explaining to you, but just this should be a bit separated as is my own project that I did for maat but outside maat, I am the owner. It shouldn't look as I'm trying to steal things of maat, so better to not mention that the origin was that. And then I mean to be honest, this is a bit the same direction that many other companies went during that time. And then I moved on to trying to build a UI for it. But I never released the product because I didn't want to do deal with the secret problems. If this ever became a SAS. Though I still use the UI for myself currently. And then I moved on to solve the problem of how can context be stored in an efficient way without much human intervention. To try to find what's the minimal human intervention required to keep a efficient context that is updated with everything that happens in a project, in a company, and kinda to build the tools to allow anyone to do that. It's similar to other solutions like mem0 , or the memory from claude, or graphify, This is more of a personal project because I know that it's a problem that it hasn't been solved still and it's a problem that I have and because there is no solution it's where I am spending my my time on."

5. "In the AI has no memory, maybe this is not relevant because I already explained all of the gcontext things."

6. "Yeah, these opinions are kind of good. Most of them derive from the context. Now I would like maybe them a bit more ordenated. I think that there are a lot of opinions and they look a bit crazy. So it would be good if they would appear a bit more structured."

7. "Yes, I work with cloud code [Claude Code]. Sometimes I use codex as the submission [subagent]. I have different techniques regarding the other things. I mean the thing about Jeff [Jev] is that it's not a model. I mean it's a model, but it's another concept, right? So yeah, we can name it and also yeah, those are good. Maybe Docklink [Docling] is not really necessary. Gemini also not. put langgraph instead, and creation of mcp"

8. "I mean the thing about agents, this is a bit particular, so I'm not sure how to put it in a professional way. But the thing is that I don't really see Asians [agents] as machines. I see them more equivalent as humans with a very focused memory and super capabilities that they have to be properly coordinated so that they can do things. This mostly when it comes to coding agents. But I'm not sure what to put in an opinion. It's more of a feeling that I have with working with the things."

9. "It should be actually pretty cool to have a contact that people can send me something directly from the site and then I with email service I would send the email and I would be able to respond to them. This would be actually cool. I think I have in busy gym [bjjgym] a recent [Resend] account. We could reuse that for this one."

10. "Regarding the side projects. You can just take a look at them, but there are mainly that BG regime [bjjgym]. It's a place to find GGs [BJJ gyms] across the world when traveling. And there over AI I have done a lot to extract the information. We also use GF [to check: what is GF] to find gyms. And in the Auromap [IndoEuroMap], it's still in the initial phase, but basically attempts to provide some information on what's the level of multiculture of a place."

Open from these answers: the motto wording (not picked, default "Everything is information."); "not in Europe" or "nomad in Europe"; the month of the AI migrations and of the first (unofficial) Brain; the contact email and the Resend account; what "GF" is; whether ContextAgora may be named on the site at all (he says the UI of the first Brain was the same as ContextAgora, and gcontext must stay apart from MAAT).

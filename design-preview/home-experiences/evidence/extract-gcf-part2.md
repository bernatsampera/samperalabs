# Extract: gcontext-framework, part 2 (2026-10-16 to 2026-10-18)

Source: gcf-part2.md (225 messages, Bernat's typing only, plus pasted handoff prompts and compaction summaries written by Claude).
Timestamps are UTC from the log. Quotes are verbatim, trimmed. [paste] = his statement relayed inside a Claude-written summary or a pasted handoff prompt. [paraphrase] = my wording.

---

## 1. What gcontext is and why

### The problem and the vision

- 2026-10-16 19:02 "Make that the one without domains is instead more like without Global context, this is when the AI uses external providers or third parties like stripe, attio, datbase to find the information. And in the right we show the global context, where it also accesses stripe and this things but just AFTER understanding what is the global context specific and needed for each task"
  (context: directing the images for an article about global context)
- 2026-10-16 19:16 "can we try to make an article around these three images, where we manifest WHY a global context isimportant"
- 2026-10-16 18:34 "The image should have 1 single purpose, EXPLAIN WHAT IS A DOMAIN, AND WHY DO WE NEED to separate the inforamtion into domains"
- 2026-10-17 08:42 "gcontext is more ambitious, we don't want that theonly information that comes inside of the context tree thorugh the adapter is from a project where the user develops, gcontext is for any AI Agent, any AI agent works with session where it has some information loaded in a session, in some ocasions it may be just AI without human conversation, but even if it's just AI the agents does things and learns things for the future, this learned things is what we want to give the agnt a place to leave them and recover later."
- 2026-10-17 10:18 "yes, obviously this is the whole goal and premise of gcontext"
  (context: Claude said the purpose of the test is that a fresh session answers a question from the stored memory)
- 2026-10-17 13:13 "what I want with this project, is to lay the basis of gcontxt. Especially the observability, I need observability to be able to make gcontext work."
- 2026-10-17 13:13 "In one side we have gcontext and what happens so the units of information come together in domains, how a unit of information is assigned to one place or another / then we have the extraction of units of information from an agent, this is very related to the adapter also."
- 2026-10-17 13:13 "Basically what I want is to have all this pieces defined and written in a way that resembles production code so I can start bringing gcontext to the next level, now it's still to dificult to do anything with it because if I don't have the different parts of gcontext defined I am doing time and time again the same work"

### What it must do

- 2026-10-16 20:58 "gcontext has to be able to find the wrong information and replace it, it should be clear by now this already."
- 2026-10-17 06:35 "3. HOW to deal with the restructuring of the domains, (If in conversation 1 we just talk about development, but in conversation 2 we talk about sales, sales should be understood as a new domain automatically, this is where I see the biggest challenge)"
- 2026-10-17 06:31 "this is the job of the adapter, the adapter is between the AI session and the gcontext tree, and it should be able to influence how the AI session progresses so the context is built in a way that is scalable."
- 2026-10-17 06:35 "the extraction of units is a concern of the adapter logic, not the gcontext logic. (BUT THE ADAPTER CAN SPECIFY HOW THE CURRENT ENVIRONMENT RUNS IN THE CONTEXT TREEE!!!! WE CAN CONTROL THAT, DO YOU UNDERSTAND????"
- 2026-10-17 08:42 "The adapter, what is it, it's what allows different agents to interact with gcontext. I am still not sure how Wide is the adapter , we will do an exploration now, but the goal is to be able to understand the AI Agent that is using gcontext, how it works what is the process of loading a conversation and doing work ( in claude code is the harness, what has access to grep and all the tools... and the purpose of claude code) and based on this it's able to follow a flow (this flow is implemented by the person that implements gcontext in an AI Agent) and this flow is all the set of rules that define when the agent should ask information to gcontext, how the information of gcontext is presented to the agent, what is the way that the ifnormation learned during each AI AGent session is stored in the context tree..."
- 2026-10-17 13:22 The parts, in his words: "1. Adapter: this is in charge to get whatever information the AI agent outputs, to convert this into a format understandable by gcontext. It also has rules that define how the information can be read or extracted by the ai agent, this can change from agent to agent we still are thinking about it. / 1b. Extraction: this is part of the adapter, but it's probably what we will have most difficulty building. Very important to note in the observability every things that happens there. / 2. Placement / Domain assignement: What now build the tree from 0"
- 2026-10-17 13:22 "EVERY time that a triger is done to SAVE information, EVERYTHING MUST BE LOGGED, I need to visualise, we can even think of running langfuse or something like that, this is very important, you can't even imagine how much, I need to have information of everything that is going on."
- 2026-10-17 13:22 "this observability and all of this components will be the same for every single gcontext instance, the one of the seo is just where we are testing it."
- 2026-10-17 13:28 "one per adapter, the adapter defines  how the infromation is extracted and loaded from every agent/implementation"
- 2026-10-17 13:57 "The adapter can be either more general or more specific. I prefer to make this one more general first, so it will be for the seo now, but then I want to reuse for other things"
- 2026-10-17 19:38 "this workflow is the one to start building the domain from scratch, but we also want the workflow that is able to make it grow right? I mean making it grow when it's already created from null, is this accounted for"
- 2026-10-17 13:43 "a clear way on how to improve EACH different part of gcontext by creating isolated test cases for each one of them"

### What it must not do

- 2026-10-16 (before 18:20) [paste] "THROW IT AWAY, ACTUALLY NOISE IT THE BIGGEST ENEMY ... A LOST FACT IS NOT WORSE THAN EXTRA TEXT. EXTRA TEXT is HELL"
- 2026-10-16 (before 18:20) [paste] "do not call it note, call it unit, ALWAYS, information unit actually"
- 2026-10-16 (before 18:20) [paste] "you are making me crazy with all the names ... PIECE, RECORD, UNIT, FREE TEXt, NOTE... REWRITE IN A WAY THAT IS UNDERSTANBLE AND CLEAR."
- 2026-10-17 10:49 "like it doesn't makket, but it takes too much, 5min??"
  (context: the Claude Code Stop hook held his window about five minutes to store)
- 2026-10-17 (pasted handoff, 12:25) [paste] "no mechanism that holds my windows"
- 2026-10-17 13:22 "I want something minimal where the important information is properly shown to me."
- 2026-10-17 13:22 "I am not so sure if I want to have langfuse because I will have to build anyway a custom UI to visualise it, but maybe langfuse (or something else) can make us the life easier."
  (decision later that day: own trace on disk, no Langfuse) [paste]

---

## 2. The story of this period

### 2026-10-16, evening: article images, golden instance, the night run that was stopped

- 18:20 He directs three explanatory images for an article (focus on loading, focus on saving, and what a domain is), then a fourth for the full system with the adapter.
- 20:07 "it looks very sloppy, very simple, it has too look cool, give me aprompt to continue it from samperalabs"
- 20:36 "call always ollama directly" (decision: drop the pi-http proxy, call Ollama Cloud direct)
- 20:54 "bro 59 questions.!!!!" (the golden question set had 59 questions; cut to 12 core questions) [paste for the 12]
- 20:55 "yes but relax you have to think what we are doing, u keep focusing in the smallest and most insignificant details"
- 20:58 "in that case when we added the second source we didn't do the proper clean up of the first one, it's possible that the current system is wrong, we have to fix it. You don't have to test the most difficult examples like this one now yet"
- 20:59 "wait, wait wait, we were doing the golden rule. now you did some tests and found this errors, I told u this tests are too complex for the current system and ur proposition is to fix the extra complicated error??? are u dumb?? What I need now is a basis of how the system works, so that then based on that I can have a benchmark and improve iteratively, we are still in the phase 1!!! We are still trying to define a plan from where we can progress afterwards"
- 21:22 "what we want now is a way to test gcontext and run it with a benchmark that cost less than now, now it costs too many tokens to ollama. I need a way that is less expensive, and faster, if not we can't progress like this."
- 22:22 "where are we? Like I starting telling u yes witout much attention, have we made much progress since the golden rule"
- 22:26 "I am going to sleep soon, but I want to leave this working as I have to solve this, do you know what is the overall objective of context??? Do you think that if I set a clear goal you are able to stay all night working on this and testing various things?"
- 22:26 [paste, AskUserQuestion answer] "I wonder if there is also a more efficient way to work on this problem than this"
- 22:52 He stops the night run: "Like I am not sure if this is the right strategy. You are just spanning agents tying things, but this is not the right way to go. I think it's better if you stop everything and we stop all this run. This doesn't make any sense. no night run, we'll check again and restart tomorrow morning"

### 2026-10-17, early morning: retrospective and the Pedal fake project

- 06:31 "We did first the golden instance and then we don't really have anything now to show, we are simply in the same place with a "golden instance" that we can't really use for anything. I don't understand why your proposals to do things are so bad when approaching this project."
- 06:31 "with a small change in the prompt you wanted to test the whole pipeline again????? WTF??? This is not efficient, for something like this, it's much better to do a small test on the prompt change and just a small source and see if there is an improvement."
- 06:31 "ALL of those sources WERE made in a reposirotyr that wasn't actively using GCONTEXT. On the future WE CAN INDEED DEFINE inside the same conversation that we are using gcontext, we don't have to START by playing extra hard and proving OUR extraction units with extra long conversations that didn't follow any methdology.."
- 06:35 New plan: "1. Create some fake conversation between the user and a coding agent where the context keeps growing following a nice pattern 2. Understand which things make the information to be properly passed or not. 3. HOW to deal with the restructuring of the domains"
- 06:41 "let's first do the commits and let's clean the current working changes, if you are not sure about something u can leave it in archive/ or in a lost branch"
- 06:55 "I want that in this conversation you test everything from claude, no paid runs, change the plan to fit that. We still don't want to do the paid runs, first we want to sure we are going in the right direction."
- 07:01 "can you start smaller, why ar eu jumping already to 16 - 20 units??? I don't uderstand, chill"
- 07:10 to 07:36 One rule, one replay at a time: "yes, add the rule and replay", "peoceed, write 04", "go run the replay"
- 07:58 "go, but don't really createa a postgres db, like just do the context"
- 08:07 "a reconcile step every time is very costly, can u try to spawn an adversarial subagent in fable to find possible alternatives"
- 08:31 "let's stop here, pls try to make a recopilation of everything that we've done and explain it to me in very clear terms. then when you are done, try to understand again what is my overall goal with gcontext, what did we achieve now by doing this, and which are the main roadbloacks that we need to overcome to be able to start gcontext in a real project"
- 08:42 Vision restated (see section 1). Next step: the adapter. "I know that this overlapps a bit with what you just have done, but is something that has SOO much importance that I believe is very important to define it propely."

### 2026-10-17, morning: the Claude Code adapter, live in the repo, and its failure

- 09:29 Opens a second session to understand the first: "here we did many things but I am having a bit of trouble following everythiing, I want to leave that session coding running and use here for understanding better what is going on and to plan a bit more the next steps."
- 09:40 "what is the detach flush, and is not clear to me how to use it and if this works, did u tested it with any question. also, additiaonally, i think that we are missing some observability, it's crucial when doing this"
- 10:01 "I want to have a place where I track the tasks better, and also to maybe redo a bit the docs of the project, as we now have lots of folders and things which I am not sure what they  are or which purpose they serve to..."
- 10:01 "I have an idea of what is gcontext and the different parts of it, but I have a lot of problems seeing the different implementation and what we are doing in the folders of this project"
- 10:13 "we need to do some monitoring, it's not enough to just live it running, I have to come back here periodically or at least understand what is going on so it can be mantained properly, because this will keep growing right as we do more and more progress here."
- 10:17 "what I want is a much much nicer way to visualise the conversation and what happens every time that a stop hook is triggered."
- 10:21 "we want that we can have a kind of review/ that analyzes the latest things added to the .outbound context tree and it knows if those SHOULD have been added or not, basically that is able to know and act and propose things based on the changes that there are on the current active outbound treee"
- 10:23 "not inside docs/ , like u treat docs as a garbage disposal. you have to think better how you structure everything"
- 10:25 "create a new folder calles probes/ and oout a golder inside that is called 01-adapter-gcontext/ to signalise that we are testing the adapter for gcontext"
- 10:32 "I think that what I want is to be able to decompose gcontext into smaller pieces. and those pieces into smaller pieces, to be able to test each piece in the best way possible and make sure that everything works together then also"
- 10:39 "tbf I've been seing that there are many errors with the stop hooks I see this way to often"
- 10:49 "I think that we are trying to be too ambitious too soon trying to put a real gcontext tree in this project that I am actively developing in multiple windows. Or at least try to be more pragmatic with the test and review, you are trying to test things too big and then hanging the dead one me"
- 10:54 "tbf, I have no idea of what you have done, you are coming back again to spouting slop, I am not sure how to work with you"
- 11:12 "can you pls understand HOW DIFFICULT IS TO TRY TO STORE the context and treat the challenge with respect, I have the sense that all the time you treat is as somethinng trivial that you can just test with that repo or now do this, and no, every thing that we try costs me time, and it's because you are not treating the problem with the respect it deservers"

### 2026-10-17, midday: pivot to a controlled agent (SEO agent for bjjgym.com)

- 11:16 "I don't think I want to continue with this, we need a simpler approach. Still keep the observability but this is too big of a change, can we try to make this work with something else that is not claude code and a normal coding session. I want that gcontext also works for that, but is the most difficult example, I think that we should focus it first in other agents, where the inputs and outputs are more controlled, and we can add more rules to the learnings and whole flow."
- 11:16 "This will serve us to define all the different steps of gcontext and be able to separate them accoridngly, and then we'll be able to see exactly where the example with claude code break (extraciton of units, ok) and be able to solve it."
- 11:16 "let's do something else where we can create our own agent ourselves with vercel eve, or mastra and let's do that this agent does x ( we'll define this later) and this thing involves some learnings. And then we put gcontext on top of this as a plugin and make it work. Does this make sense"
- 11:32 "I want already a useful agent for me. Let's do an agent that is able to analyze and improve the seo of a site. It has a connection to gsc and can have other connections, and it's able to do analysis of the page and code and propose thigns, just seo related"
- 11:35 "1. bjjgym.com 2. HERE, in this same repo 3. better an interactive chat session in the terminal or a simple UI. then the learnings can be extracted from there 4. mastra sounds good."
- 11:35 "what we need to be very diligent is that we are not just doing the seo agent, the seo agent is the excuse. What we are doing is testing gcontext in this. We should do both things at the same time and track progress of how one fits the other, very good separation"
- 11:54 "proceed onto creating the seo agent, once the agent is done, we'll see how to add gcontext there , try to be fast, spawn multiple subagents to do the work faster"
- 12:25 "I wonder if we need ollama, can we just do it with claude code?? maybe yes I am not sure" then 12:28 "ok keep ollama"
- 12:43 "ok, I want to start doing it, can u be my companion while I test it and we see what happens" (he runs the first real SEO chat himself)
- 12:59 "yes, write it, then we are going to decide how to brin gcontext in the agent"
- 13:05 "this is a much bigger job that what you are thinkking here, give me a prompt to do it in another conversation, be more general just describe the overall purpose and what have we done until now and I'll handle the rest"

### 2026-10-17, afternoon: the parts, the contract, the trace viewer

- 13:22 Defines the parts himself (section 1) and rejects Claude's list: "I don't agree with those that you defined. This are the parts"
- 13:43 "right now I don't care that much on the details of the implementation, I want to create what is around it, the different parts of gcontext to then be able to test them with the seo plugin"
- 13:47 "leave the isolated test cases outside, these are too importants to do them alongisde the creation of the parts" and "leave this alone for now, I'll create something for it" (the extraction judge)
- 13:47 "I care a lot on the structure of directories so please let's work on that, regarding code and implemntation, let's leave it minimal now ... First let's focus on the parts and the contracts between the parts."
- 13:57 "the adapter of seo shouldn't be named seo, make a more general name like chatbot or something."
- 13:58 "I want to have a "mock" run of this adapter with the placement and then tweak this so that I can have a good observability UI tool"
- 14:08 "ok, it looks a bit a lot, I wonder if it can be a bit simplified?" then "review it with a fable agent"
- 14:20 Starts the trace viewer in a separate session. 14:24 "it doesn't go to codex, top opus 5.5 in this case."
- 14:28 "We ahve to define how the UI looks like!!! I am very meticulous, I want to just show specific infroamtion in each step."
- 14:28 "We want to know how long each step was, time is important. Then we also want to understand what were the inputs, but even more important, the outputs/result for every single step so that it's possible to understand what happened there. Reasoning messages ar fine but shouldn't be at the center, maybe after a "shoe reasoning" small button. very important that at first glance a human understand it"
- 14:34 "no need to show the load and agent run, we won't get this every time, just show what we control, this is the adapter, let's focus on the source, extraction, and placement"
- 14:34 "Regarding the extraction, we want to show exactly what is the input, and exactly EACH step that happened until we send it to gcontext, so very clear, first how each unit is cut down, and then which ones are dropped and picked (and why with a small helper)"
- 14:49 "yes, run the first save of run 01" (first paid save of the SEO transcript; extraction done, placement timed out) [paste for the result]

### 2026-10-17, evening: viewer rework, order criteria puzzle, recipes example, rerun, trace-review

- 18:30 "The design is very bad, everything is too minimalist, I prefer something w a bit more content and isnight. Also I don't want to have to scroll so much, I prefer to toggle the parts where I want to see in deep. also without toggling I would like to see a view of how much each step took to get an overall impression and then be able to go deep in each. ... Try to use tailwidn and shacdn ... AND ALSO CONTRAST, pls contrast omg"
- 19:35 "maybe better to use a model that doesn't use thinking directly, or seeing how it can be completely disabled idk" (after the placement call timed out)
- 19:37 "the final tree is not properly seen, it has to ve skimmable and understandable, especially of the things that just got added"
- 19:39 "it would be cool to run a new memory that it adds to the current tree, and then we can see at both different paths ... You can fabricate the initial source or you can have a conversation with the agent where u trigger to have it for real"
- 19:41 "The order criteria is the one that has got me more puzzled, I have no idea what the criterions are and why those decisions happened"
- 19:48 "something much simpler than the current bjjgym example, this one is too complex and first I have to do the steps with an example that is way easier. Show me some options and I will choose" (a recipes example was chosen)
- 19:52 "create two runs, one for the base tree and another for the growth workflow to see both of them"
- 19:56 "the overall design doesn't look bad, it's ok, but it's still mediocre, I am not sure if I have to really tell how to improve it in all but the main problem is that is too bloated and there is too much information and the colors are too weird and overall it's difficult to follow, can u download some UI UX skill from internet to do shit like this better and make a plan to improve it, once done, send a subagent in OPus 5.5 high effort to do an adversarial review of the plan to improve the frontned, then compare the proposals and review made and aplly the changes that make sense, when done, proceed to trigger the implementation with a opus 5.5 agent in medium effort. You do everything"
- 19:59 "I don't understand , the traces should ALWAYS appear"
- 20:05 "and why in the bjjgym-seo this worked fine" then "then run this example of the recipes through the same PATH!!!!"
- 20:28 "I don't like that here in the run we just see the date, I want some name of the session, and also it should be clear that the runs are ordered from recent to not so recent, and also if they have the base tree flow or the growth flow"
- 20:47 "what I want is to think how can we get to rerun a run because we want to do changes and then we want to test them again and I would like to be able to rerun them"
- 20:50 "This is too complex. I don't want to compare or create this complicated thing to replace for now it's completely acceptable and it's actually the way to go."
- 20:52 "I would like to have a way to investigate each trace and maybe even each step that it's easy to do from the UI. Maybe an option to copy a prompt, and then to have a skill in this repository that the prompt would trigger, and it would be able to know all of the system how it works the context, from which step are we talking about, and that then it's able to evaluate it and say what it went right and what it went wrong."
- 21:34 "can we have a copy prompt for all the run, and also one for all the extraction and all the placement, and also a button please, this looks like a link man"
- 21:36 "I would like to add the rerun button to the viewer, but I even would like to know if it's possible to have a rerun for just 1 step, or all of them"
- 21:45 First use of the new /trace-review command: "analyze this, did the run went well"
- 22:11 "There won't be a tree of less than 4 units, not an issue, can u make a review w a fable subagent of the changes made"

### 2026-10-18, morning

- 07:05 "right now the basic analysis is like this one ... Which is very bad because it's not readable at all, can we work a bit on how should the ideal one look like?" (the trace-review output is the next thing to shape)

---

## 3. How he works with AI day to day

### Tools and setup

- Claude Code with several sessions open on the same repo at once (at least six session IDs on 2026-10-17). 2026-10-17 09:29 "I want to leave that session coding running and use here for understanding better what is going on and to plan a bit more the next steps."
- 2026-10-17 10:49 "this project that I am actively developing in multiple windows"
- [paraphrase] He works on two machines; task paths show both a Mac (/Users/bsampera) and a Linux home (/home/bernat).
- Models: Ollama Cloud glm-5.3 for gcontext calls; Fable subagents for specs and reviews; Opus 5.5 subagents for implementation. 2026-10-17 14:24 "it doesn't go to codex, top opus 5.5 in this case."
- Never Codex in this project: 2026-10-17 10:31 "is it being done with codex?? If so cancel it and trigger a opus 5.5 subagent instead"; 20:50 "I want that you don't send a task to codex but that you sent it to an opus five point point five subagent"; [paste] "yes, but opus 5.5 in medium effort implements it in the background, not codex"
- Mastra for the test agent: 2026-10-17 11:35 "mastra sounds good."
- Skills and commands: /loop, /trace-review (a repo skill he asked for), the gcontext MCP (/mcp__gcontext-agent__run). 2026-10-17 19:56 "can u download some UI UX skill from internet to do shit like this better"
- AskUserQuestion: [paste] "ALSO ask me the quesiton with askuserquesiton tool"
- Memory: 2026-10-17 14:47 "you write the memory then, u know what is the project about, and before starting can we go over what are we doing again, to make sure it's clear"

### Habits

- Asks for everything in Simplified Technical English: 2026-10-16 22:22 "explain it to me in ASD-STE100 Simplified Technical English (STE)"; 2026-10-17 08:26 "i don't understand 3 explain it to me in ASD-STE100 Simplified Technical English (STE)"; 2026-10-17 22:10 "I don't understand the risk, explain it to me in ast english"
- Resets context with a handoff prompt: 2026-10-16 21:53 "i want to reset context, give me a pprompt to cotninue after while we are running thtis"; 2026-10-17 06:45 "give me a command so i can compact the context and start again from the same point in the new conversation"; 2026-10-17 09:42 "can we compact the context and then continue, give me a prompt to execute afterwards."
- Adversarial review as a standard step: 2026-10-16 21:22 "Spawn one fable agent and propose a way to be able to do this, when it's done make an adversarial review with another fable subagent, then show the propostion to me"; 2026-10-17 08:42 "I want that you spawn 2 different subagent with fable in high effort and that both try to solve this, once done compare both approaches and show me what are the options"; 2026-10-17 14:08 "review it with a fable agent"
- Plan first, then approve: 2026-10-17 07:54 "let's do a commit and the proceed with 05, make a plan first and let me see it"; 2026-10-17 13:47 "Now I want that you give me a proposal of what are you going to create and how much code will that have."
- Small commits on request: 2026-10-17 19:56 "can u do commits of everything that is currently , different small commits if possible"
- Periodic regrounding: 2026-10-16 22:22 "where are we? Like I starting telling u yes witout much attention"; 2026-10-17 08:31 "pls try to make a recopilation of everything that we've done and explain it to me in very clear terms."
- Checks in and leaves: 2026-10-16 18:42 "how is going, I have to leave rn"; 18:44 "can u pause it and when I tell it u resume it"

### What he delegates and what he keeps

- Delegates: implementation to Opus subagents in the background; specs and reviews to Fable; UI plans to a reviewer agent then an implementer. 2026-10-17 19:56 "You do everything"
- Keeps: the shape of the parts, directory structure (2026-10-17 13:47 "I care a lot on the structure of directories"), the instance config ([paste] "I write the instance config myself"), the extraction judge (13:47 "leave this alone for now, I'll create something for it"), the run record corrections ([paste]), UI decisions (14:28 "I am very meticulous"), running the real agent chat himself (12:43 "can u be my companion while I test it")

### How he tests

- Small input, one call, then look: 2026-10-17 06:31 "it's much better to do a small test on the prompt change and just a small source and see if there is an improvement."
- No paid runs until the direction is right: 2026-10-17 06:55 "no paid runs ... first we want to sure we are going in the right direction."
- Hand replay before model calls: the Pedal fake project, six conversations, each rule added and replayed one at a time (07:10 to 07:36).
- One idea at a time, no fan-out for exploration: 2026-10-16 22:52 "You are just spanning agents tying things, but this is not the right way to go."
- Fan-out is fine for mechanical build work: 2026-10-17 11:54 "try to be fast, spawn multiple subagents to do the work faster"
- Observe every step, then rerun: 2026-10-17 20:47 "we want to do changes and then we want to test them again and I would like to be able to rerun them"
- Simplest example first: 2026-10-17 19:48 "first I have to do the steps with an example that is way easier."
- Both flows side by side: 2026-10-17 19:52 "create two runs, one for the base tree and another for the growth workflow to see both of them"
- A review skill that reads the trace: 2026-10-17 20:52 (see section 2)
- Monitoring over time: 2026-10-17 10:13 "it's not enough to just live it running"

---

## 4. Opinions about AI and agents

- 2026-10-17 08:42 "any AI agent works with session where it has some information loaded in a session, in some ocasions it may be just AI without human conversation, but even if it's just AI the agents does things and learns things for the future"
- 2026-10-17 11:12 "can you pls understand HOW DIFFICULT IS TO TRY TO STORE the context and treat the challenge with respect"
- 2026-10-16 [paste] "NOISE IT THE BIGGEST ENEMY ... A LOST FACT IS NOT WORSE THAN EXTRA TEXT. EXTRA TEXT is HELL"
- 2026-10-16 [paste] "I don't understand why are we cutting everything into this smaller peieces of 120 words, it seems iditotic, what is the purpose of this??"
- 2026-10-17 11:16 Claude Code as a memory source "is the most difficult example, I think that we should focus it first in other agents, where the inputs and outputs are more controlled"
- 2026-10-17 08:42 "in claude code is the harness, what has access to grep and all the tools... and the purpose of claude code"
- 2026-10-17 06:31 the adapter "should be able to influence how the AI session progresses so the context is built in a way that is scalable."
- 2026-10-17 13:13 "I need observability to be able to make gcontext work."
- 2026-10-17 13:22 "you can't even imagine how much, I need to have information of everything that is going on."
- 2026-10-17 14:28 "Reasoning messages ar fine but shouldn't be at the center"
- 2026-10-17 14:28 "very important that at first glance a human understand it"
- 2026-10-17 19:35 "maybe better to use a model that doesn't use thinking directly"
- On how agents (Claude) work with him: 2026-10-16 20:55 "u keep focusing in the smallest and most insignificant details"; 2026-10-16 22:52 "You are just spanning agents tying things, but this is not the right way to go."; 2026-10-17 10:54 "you are coming back again to spouting slop, I am not sure how to work with you"; 2026-10-17 10:49 "you are trying to test things too big and then hanging the dead one me"
- 2026-10-17 10:23 "like u treat docs as a garbage disposal."
- 2026-10-16 19:02 Without a global context "the AI uses external providers or third parties like stripe, attio, datbase to find the information"; with it, the AI "accesses stripe and this things but just AFTER understanding what is the global context specific and needed for each task"
- 2026-10-17 11:35 "the seo agent is the excuse. What we are doing is testing gcontext in this."
- 2026-10-17 10:32 "decompose gcontext into smaller pieces. and those pieces into smaller pieces, to be able to test each piece in the best way possible"

---

## 5. About Bernat

- Runs bjjgym.com and wants an SEO agent for it with Google Search Console access: 2026-10-17 11:32 "I want already a useful agent for me. Let's do an agent that is able to analyze and improve the seo of a site. It has a connection to gsc"; 11:35 "1. bjjgym.com"
- Writes articles with explanatory images on samperalabs: 2026-10-16 20:07 "give me aprompt to continue it from samperalabs"; 19:16 "make an article around these three images, where we manifest WHY a global context isimportant"
- MAAT: he has a maat-admin-agent with a tools visualisation he likes: 2026-10-17 10:17 "I know this works with posthog, but this way of visualising things is much better. What I would like is something closer to this"
- Has a personal agent repo (bernat-agent) with a GSC connection: 2026-10-17 12:06 "the key is already there somewher" [paraphrase of context]
- Self description: 2026-10-17 14:28 "I am very meticulous"; 13:47 "I care a lot on the structure of directories"
- Uses Mastra, Vercel AI, Tailwind, shadcn, Ollama Cloud, Claude Code; works in TypeScript monorepos. [paraphrase]
- Works late and early: stopped the night run at 22:52 on 2026-10-16, back at 06:31 on 2026-10-17. [paraphrase]
- Takes gcontext seriously as a hard research problem and his own time as the scarce resource: 2026-10-17 11:12 "every thing that we try costs me time"
- private topic: subscription (Ollama quota, 2026-10-16 22:26)

---

## 6. Voice (verbatim)

1. 2026-10-16 20:54 "bro 59 questions.!!!!"
2. 2026-10-16 20:55 "yes but relax you have to think what we are doing, u keep focusing in the smallest and most insignificant details"
3. 2026-10-16 20:59 "wait, wait wait, we were doing the golden rule."
4. 2026-10-16 20:59 "are u dumb??"
5. 2026-10-16 18:42 "how is going, I have to leave rn"
6. 2026-10-16 18:44 "can u pause it and when I tell it u resume it"
7. 2026-10-16 22:22 "Like I starting telling u yes witout much attention"
8. 2026-10-17 06:31 "WTF??? This is not efficient"
9. 2026-10-17 06:31 "I am not explaining myself very well but what I want to express, is that this is the job of the adapter"
10. 2026-10-17 07:01 "can you start smaller, why ar eu jumping already to 16 - 20 units??? I don't uderstand, chill"
11. 2026-10-17 08:07 "mmmm let's analyze it a reconcile step every time is very costly"
12. 2026-10-17 10:23 "not inside docs/ , like u treat docs as a garbage disposal."
13. 2026-10-17 10:54 "tbf, I have no idea of what you have done, you are coming back again to spouting slop, I am not sure how to work with you"
14. 2026-10-17 11:35 "the seo agent is the excuse."
15. 2026-10-17 13:13 "mmmmmmm, one thing, what I want with this project, is to lay the basis of gcontxt."
16. 2026-10-17 14:24 "not sure about the other things what are u asking me BRO."
17. 2026-10-17 14:28 "We ahve to define how the UI looks like!!! I am very meticulous"
18. 2026-10-17 18:30 "AND ALSO CONTRAST, pls contrast omg"
19. 2026-10-17 19:56 "You do everything"
20. 2026-10-17 19:56 "where are the f traces"
21. 2026-10-17 20:05 "then run this example of the recipes through the same PATH!!!!"
22. 2026-10-17 20:42 "I just see one. I just see one."
23. 2026-10-17 21:34 "and also a button please, this looks like a link man"
24. 2026-10-17 22:10 "I don't understand the risk, explain it to me in ast english"
25. 2026-10-16 20:07 "it looks very sloppy, very simple, it has too look cool"

---

## 7. Facts to check

- 2026-10-16 20:54: the golden question set had 59 questions ("bro 59 questions.!!!!"); reduced to 12 core questions [paste].
- 2026-10-16 21:22: a full benchmark run "costs too many tokens to ollama"; the agent report put it at 300k to 500k tokens and about one hour of machine time (Claude's numbers, not his).
- 2026-10-16 22:52: the overnight autonomous run was stopped the same evening it started.
- 2026-10-17 06:31: the golden sources came from a repository that was not using gcontext; "three days" went into measuring extraction on them [paste].
- 2026-10-17 07:01: Claude proposed 16 to 20 units for the first fake conversation; he asked to start smaller.
- 2026-10-17 [paste]: the Pedal fake project: six hand-written conversations, 44 units in, 9 removed, 35 in the tree after six conversations; a planned growth pattern of 8 to 10 conversations, sales appears at conversation 4, a fact changes at conversation 6.
- 2026-10-17 [paste]: first live store through the Claude Code Stop hook: 16 units, 3 calls, about 6 minutes; he saw it as "5min??" (10:49).
- 2026-10-17 [paste]: pieces of about 120 words ("paragraph") in the extraction step.
- 2026-10-17 11:32 to 11:35: pivot to an SEO agent for bjjgym.com, built with Mastra, in the same repo, terminal chat first.
- 2026-10-17 [paste]: first real SEO run: 11 minutes, 4 questions, 24 tool calls; he read the transcript by hand into 14 units; the model later extracted 18.
- 2026-10-17 13:22: parts defined as Adapter, Extraction (inside the adapter), Placement / Domain assignment.
- 2026-10-17 14:49: traces live at ~/.gcontext/seo-bjjgym/traces/.
- 2026-10-17 [paste]: first paid save of run 01: extraction done in 232 s, 18 units; placement timed out at 900000 ms (15 minutes).
- 2026-10-17 19:48: a simpler "recipes" example replaced bjjgym for understanding the placement steps.
- 2026-10-17 20:47 to 22:11: rerun of a save, rerun from one step, copy-prompt buttons and the /trace-review command were built the same evening.
- 2026-10-17 22:11: "There won't be a tree of less than 4 units" (first build needs four units) [his statement].
- Model names stated in pastes: glm-5.3 via Ollama Cloud for gcontext; mistral-large-3:675b for the rewrite step; Opus 5.5 and Fable as Claude Code subagents.

# Extract: gcontext-framework, part 4

Source: gcf-part4.md, 186 messages, 2026-10-18 21:58 to 2026-10-20 20:23 UTC.
Times are UTC, trimmed to the minute. Quotes are verbatim, typos kept.
About a third of the file is compaction summaries written by Claude. They quote his earlier messages. Quotes taken only from those summaries are marked [paste]. Pasted reports from other agents and pasted prompt templates are also marked [paste].

Sessions in this period (same repo, mostly in parallel): live capture progress (d8b2b32a), trace viewer frontend redo (4368a9a7), server handoff (5c678b5f, 17e87b23, 9da7a709), use case and Maat brain adapter (a974c47f, the longest), extraction review (3b735f03), Ollama to MCP (07633423), adapter definition (5de58ea3), backlog item 11 (da5e8b45), instance page redo (c1df84cd, 31911328), gcontext-memory test (b311cb3b).

---

## 1. What gcontext is and why

### The problem and the vision

- "but u have to think one thing, let's define this first, what is gcontext and why it's useful, and what can store that a normal db can't" (2026-10-19 07:18)
- "ok, now tha tu have the difference, suggest 10 more options, they don't to be for affiliate, but think of normal problems that people have where this memory gcontext would be useful" (2026-10-19 07:20)
- "no, but u have to think something, the adapter, how do we plug gcontext onto their lives, this has to be easy1" (2026-10-19 07:24)
- "i am not sure, eventually i would like an agent that i can make public and earn affiliate money w it" (2026-10-19 07:16)
  Context: which agent should be the first real user of gcontext, after the SEO agent.
- "the aim is to have a more open way to do the gcontext ai stuff, not force the people to pay the server, to make it open source basically" (2026-10-19 18:15)
- "the brain record will be an instance of gcontext that can be inspected with the trace viewer" (2026-10-19 18:41)
- "The brain is in it's sense a kind of context tree for the session, so this will be used to update the MAAT brain in a more manual way, so far we want to have some information of what the users do with the maat brain" (2026-10-19 09:04)
- "What I want is to be able to see the sessions of the mad brain into the trace Viewer UI. How can I do it?" (2026-10-19 19:41)

### The adapter, the central concept

- "ok but this is what is good about our adapter idea, we don't really need always the same input, we can have an input especially for the maat brain, a kind of special adapter, this would be actually an interesting case. We just care about the source and which info can be extracted from there, in this case the tool calls, I wonder if it make sense" (2026-10-19 08:08)
- "You have to understand HOW GCONTEXT WORKS, we have this thing called ADAPTER, and this is in charge of defining how the context tree is loaded into each agent and then to capture the sesion trace and send it to gcontext. and we can have multiples adapters, what I want is to have a more defined ADAPTER thing, and instrucitons TO HOW TO SET IT UP." (2026-10-19 19:04)
- "Also regarding the adapter there can be many, as gcontext can be adapted everywhere, but we must have some kind of "parent" which has some basics shared by every adapter, we want to work on the things that will work FOR every adapter. IS THIS CLEAR. Maybe this is the problem, that an "adapter" is not well defined yet" (2026-10-19 19:04)
- "yes, exactly this is what "the adapter" is , I believe that in the way that I have implemnted and how is in my head is very complex, way too much and that it could be greatly simplified." (2026-10-19 19:10)
- "A conversation is an adapter, an adapter doesn't have to be a conversation" (2026-10-20 11:52)
- "Do not make this specific, this is shared code between every adapter for now, we don't want to make this fit just conversations, this has to be general and nice" (2026-10-20 10:02)
- "I want that this is for the adapter, not for this project in general, as this is just relevant for the maat brain, I know that I am developing from here (it's practical becuase I still need to do changes on both gcontext as a whole and also this specific adapter, but we shouldn't be putting specific commands for the brain in all of this repo, same for the skill that we just created" (2026-10-20 05:50)
- "we have the adapter, which should be that accesses gcontext, we can put the provider there for example, and then make two solutions, one that works like right now with the provider.ts doing the calls to the external provider. Or also another option and that is that each step that require IA is an mcp tool call instead, where the coding agent understand what needs to be done and calls it" (2026-10-19 18:24)

### What it must do

- "so far we just care about the "capture" not about the load." (2026-10-19 09:04)
- "what should be the process from 1. pull sessions for maat brain 2. choose those to be captured, discard others 3. trigger those that have been choosen" (2026-10-20 05:47)
- "I want to be able to ask questions to the current context tree, this is some kind of fake and generic chat where the context tree is loaded in a default way (do not put effort there, as simple as possible) and where I as the user can ask questions. (this has to be usable and nice, but don't put effort here, this is a patch for now). The goal is that this is done through the adapters, but a quick way to access it is not bad." (2026-10-20 10:02)
- "Also from here it's important that it's shown WHICH Things are read in every conversation adn that the user can see the context tree from it." (2026-10-20 10:02)
- "in this page inside an instance you have three modes, one to filter session another to talk with the tree and another to explore past runs and how they modified the tree" (2026-10-20 11:57)
- "I would like a way that I can know if a session is worth capturing or not, let's think about it, I don't want useless stuff" (2026-10-20 13:19)
- "Also a recommendation of the AI if it makes sense to add a run. But extraction is a costly process, maybe in some cases we can know it beforehand even, I am trying to spot those cases" (2026-10-20 13:23)
- "the full conversation of the client would be the best, can we think of a solution to get it? without it we can't do much." (2026-10-20 12:03)
- "(this previous steps have to be very smooth, I want to get the most information in the quickest way possible" (2026-10-20 10:02)
- "Record of previous analyzed session. This is like right now but better, just the ones that are analyzed and successed are shown, those with errors or stoped are not so shown in the first screen, a bit more hidden. I don't want something fancy but a bit usable indeeed." (2026-10-20 10:02)

### What it must not do

- "remove the proof completely, I don't want it" (2026-10-19 06:19)
  Context: the trace viewer proof (browser checks and screenshots), kept for the core only.
- "I think that we should do this in a deterministic way, not in the prompt" (2026-10-19 18:36)
  Context: grouping brain tool calls into conversations.
- "can u also very quick remove all the places where "paid" like paid model called or others is shown, it's stupid to put it everywhere. IT's just an ai call" (2026-10-20 13:06)
- "make it but simpler I don't want anything fancy" (2026-10-20 13:12)
- "it's too permisive, to many worth to capture, it should be much more restrictive." (2026-10-20 14:02)
- "1. is there a way to not keep "sensitive" information of the customers (stripe, things like that)" (2026-10-20 12:40)
- "and the reason of not keeping all the results was of confidentiality, there is some customer data there that we don't want to put in the logs, is this a problem" (2026-10-19 18:16)
- [paste] "what free signals. CHILL, don't write things I don't approve, don't do this signals. NO NO NO, just a call to check this, AI pls" (2026-10-20, quoted in a summary)
  Context: he rejected code heuristics for the "worth capturing" check. One AI call, nothing else.
- [paste] "it's easy to see that nothing of value has done in that session and it should not be processed for add to the context, it's like a filter" (2026-10-20, quoted in a summary)

---

## 2. The story of this period

### 2026-10-18, night: two tracks and a handoff that failed

- The trace viewer frontend is redone in one conversation (four subagent packages) while another conversation builds live capture progress. He goes to bed: "I will say proceed and you will do everything to the end, so that all the frontned changes are applued ( don't do test for this) I will go to sleep and leave u working PROCEED" (21:59)
- He stops a Codex worker: "do not do it in codex stop, do it in opus 5.5 subagent" (21:59)
- "yes, ignore the new frontned, it will be done in a few hours, just focus on the other parts besides the actual UI" (22:10)
- Sending the live capture work to his server fails on unsaved work: "I don't want to loose the changes, pls just send this to continue the development there, you will be in charge to bring it back when it's done, do not disturb the thing being done in casaserver in the main worktree" (22:02), then "it doesn't matter leave it, undo what u did," (22:08)

### 2026-10-19, early morning: merge, drop the proof

- "can u put ur changes in another branch, not on master, I have to pull other changes, then we'll adjust this and merge to master also" (06:01)
- The sync tool refuses again: "I am still getting this error, Mac has unsaved work." (06:03), "EVERTYHING IS UNSAVED WORK" (06:03), "EVERTYHING IS UNSAVED WORK, JUST DO COMMITS OR WHATEVER" (06:04)
- "lookgs good, do commits and merge it" (06:09)
- After the merge the viewer proof broke on the new frontend: "remove the proof completely, I don't want it" (06:19)

### 2026-10-19, morning: looking for a real use case

- "now here we have to think of a way to be able to use this properly, now we have the seo agent, but I don't think is a good example, which kind of agent, do u think would make more sense" (06:20)
- "can you show me more options, 10 and rate each one from 1-10 showing pros and cons" (06:23)
- "what about soomething for maat , see mcp brain-live" (07:30)
- "but this is the same as the coding agent, maybe too big to start, but maybe there is a part of the maat brain that I can locally connect to gcontext, and see how it evolves w time" (07:37)
- "this is too small, think of all the things I am doing w the brain right now, both in the workspace app and in the local maat brain, then think what can fit here" (07:41)
- "can you check the current implementation of the brain and see if the other people are doing a lot of additions to the context?" (07:55)
- The idea: "I wonder if we can actually change the maat brain to support this, making that every time that a conversation finished, from either claude desktop or claude code, it automatically sends what happened to somewhere where we can read it. But I am not sure what should be the trigger. Maybe we can record evevry single message and response sent somewhere, and if there have been no new messages in that conversation for 24 h then we process it, if there are messages afterwards we ignore them or wait 24 h more" (08:00)
- "but each request of the user reaches the brain vm right? We can add a middleware there to capture everything, not from the claude sessions but from the vm, I think this is easier" (08:04)
- The hard part: "1. don't we have any way to know the conversation where a tool call happened?? Tickets are tricky for it, as some tools calls are not parts of tickets 2. we should try to solve this somehow 3. we'll think about it 4. we'll define the brief later" (08:14)
- A probe MCP server behind ngrok tested how claude.ai and Claude Code identify conversations. He ran ngrok himself and hit "I got a 403" (08:26). [paste] Result: Claude Code sends one MCP session per conversation; claude.ai shares one session across every chat, so a thread token is needed.
- "ok, sounds good, based on what I want and the request that we did, can you ask a fable subagent to analyze it and propose a spec of how to implement all of this, in ASD-STE100 Simplified Technical English (STE)" (08:44)
- "canu ask the subagent to analyze the gaps, and to propose a recommended solution for the open decisions. Also it is clear that so far we just care about the "capture" not about the load." (09:04)

### 2026-10-19, midday: simplify, ship the record, reset the backlog

- "agree with the noise, I would like to simplify it a big, and also a couple of points, the decision to not use git will be that the records are simply stored in the vm automatically each time a tool call is made right? As a kind of log, I wonder if this mean that this will be resetted when the brain is redeployed." (10:22)
- The 24h rule goes: "regarding the 24h, myabe if we do it like this is not needed, and that when I do a pull to trigger the run everything is marked as closed, so those conversation, if they receive more info on the future, they won't be marked again, we can keep all of this in the local adapter (this laptop) , so then on the maat brain is much easier, there are just the logs of what the tool calls do and nothing else, this keeps growing there and growin, and we can decide to clean it from the leptop but there's also not need for that." (10:22)
- "so do you think that we could do a somewhat small plan for the brain, see it being working, and the proceed to continue it from here. So that we can build the adapter and workflow from here, but from the brain we have the tool calls, would be cool to add it asap so we have more material to work with it." (10:32)
- The brain change is framed as observability, not as gcontext: "give me a prompt, I will start the maat brain command in a new conversation from the worksapce app. can u not mention gcontext in the plan? say it is for observability purpose to investigate," (10:36)
- "hey can we reset the backlog, I just care about the maat brain intergration right now, other things are irrelevant" (14:07)
- [paste] The maat-brain agent reported: record merged (maat-brain#110), deployed, waiting for a colleague's agreement to turn it on (14:13).
- Extraction review: "ok I want to do a full analysis of this, I want that you proceed to do a full review" plus a pasted "deeper version of this task, not a bigger one" prompt [paste], then "When done, make a plan with this changes, then do an adversarial review with a subagnt fable 5.1 and apply the changes. then spawn a opus 5.5 subagent and implement it in a new worktree" (14:14). Merged: "ok, looks good, let's merge the extraction thing" (18:45)

### 2026-10-19, evening: open source angle, confidentiality, the adapter crisis

- "hey take a look at how are we currently doing the calls to ollama. Explore if there is a way to replace it with mcp so that the calls can stay in what is the coding agent, in this case the same agent that triggers the capture part" (17:41)
- "bro keep it simple, right now the calls are done in mastra to ollama. I just wonder if there is an option that this calls are made by an mcp, I think so, but u should be able to undersatnd what I want here, is not that difficult. Keeo it simple, and stop being so verbose" (18:21)
- "yes, I KNOW! but think a bit outside of the box" (18:24); "ok, write a spec about this, but don't implement it yet" (18:33)
- On the brain record: "whtat is this, 2. When he agrees, run install -d -m 0700 -o brain -g brain /var/lib/brain/record on the VM, then restart the brain." (18:16); "but we already have what we need right? the only thing that we are blocking are the result of the tool calls exec I think. this is adding a lot of complexity to the thing, you are making everyhting harder" (18:19); "stefano said yes already" (18:20)
- Testing pain: "I am having lots of problem trying to test @apps/trace-viewer/src/ and all of this app in general, now I am creating the maat brain records, which is honestly a right step in the good direction, but I feel that it's still quite far from what I want, which is a very simple way to test this. which options do u think that I have" (18:35)
- "what are u saying the brain record and the trace viewer are two parts of the same thing. the brain record will be an instance of gcontext that can be inspected with the trace viewer, is this not CLEAR???" (18:41)
- "no, what it makes bad is the setup and usability. is that we still have no way to initialise a gcontext instance, the steps are not clear. And do not give me NEVER commands like this, n -- capture <thread>" (18:43)
- "I mean you have to think that right now I am still developing this. And my objective right now is to be able to test the context one time and another time, and with the mad brain, and then I'm going to create my examples. Right now it's way too much. I don't know where is everything what has been created. You need to simplify it for me. And you are always putting the things in a language that I don't understand. Simplify it. You can change as much as you want of the current setup and how things run. INVESTIGATE FOR NOW AND PRESENT ME IN A WAY THAT I UNDERSTAND WHAT WILL HAPPEN AND HOW WILL BE THE NEEEW SETUP" (18:47)
- "no, this is not the problem, I feel that the big problem is how to setup a gcontext instance and then view it trace-viewer. OK, I can add the full path but is weird and I don't understand it." (19:04)
- "pls pl pls, investigate what is an adapter and why it feels verbose and complicate right now, how can we solve it." (19:04)
- "PLEASE investigate a lot to be able to offer a better solution, start by spawning a codex subagent w the model astra in effort high so he can offer his perspective" (19:10)
- "but we have to implement something right?" (19:39). [paste] The adapter was redefined to three members (name, about, to source), built by an Opus subagent, merged the same evening.
- [paste] A session in the maat-brain repo pushed 152 unpushed gcontext commits to the private remote by mistake (19:40).
- "I made some change in the adapter and how ut works, they are now being merged, can you spawn a codex astra high effort to create an adapter for the brain, make the plan with the codex astra,  and implement it then with a opus 5.5 subagent" (20:00)
- First real runs: "How can I test it, man?" (20:30); "I've done it but it looks like this , I can just see the source, not sure if there was a problem or what" (20:34); "it would be also good to have the prompts from david I guess to have the whole picture" (20:37); "why is no model running, where is this configured" (20:50); "but what needs to be build? Not much right? Like the logic is in gcontext already" (20:52)
- [paste] First paid capture on a colleague's session: 3 pieces, the seed needs 4; he picked option A, a `task` keep line. Second: the model put keep line ids in `type`. Third: done, 4 pieces, 1 domain. The Claude Code classifier blocked the paid runs, so he ran them in a normal terminal.
- "I think that the maat brain already did it on another conversation, and maybe we should delay this, we have way too much adapter and still haven't tested anything, I want to test the brain with a real run first" (21:31)
- "I did thismyself , npm --prefix apps/trace-viewer exec vite -- --host 127.0.0.1 --port 4330 --strictPort doens't work, I just did the normal npm run trace-viewer. but I don't see the result properly, it looks bad like always" (21:41)
- "ok, now it worked, but one thing, the whole process of running this is a completel nightmare. why is it so bad, not just that u can't execute it, but that everytihng I have to speak with the AI and I can't do the things directly frm the UI . what it missing" (21:54)

### 2026-10-20, early: merges and the periodic flow

- "bro how can I silve this fast" (05:25) on a pull-from-server conflict; "I neeed to pull the changs fast" (05:25); "just resolve the conflichts" (05:25); "why did we lost it? Is there a better alternative in the current changes?" (05:34); "lloks good, proceed to commit in master and push" (05:38)
- "Take a look at the new changes here in master and prepare to solve the conflict merges, be fast" (05:38)
- "ok, now one question what is the process by which we can add more session into gcontext for this? right now for example I want to add more session that happened during the night, if possible" (05:42)
- "now it's on the right tailscale, but I would like a way that I can trigger even outside of this conversation, where is this defined, can you write a markdown skill for this somewhere? in the adapter so this is clear?? Where is the adapter for the brain defined actually" (05:44)
- "better a simple command , and then what should be the process from 1. pull sessions for maat brain 2. choose those to be captured, discard others 3. trigger those that have been choosen can we do this with the current setup??" (05:47)
- "mmm one thing now we are duplicating the work in both @apps/brain/ anda @packages/core/src/adapters/brain/adapter.ts , is this intended? good?" (05:53)
- "stop the shell I eun it, tell me how" (06:03); "aren't the changes in master , bring them here already" (06:03); "done, it works now, commit changes" (06:07)
- Handoff bug: "can u use send-to-server to send the current active codex job in this repo to casaserver, pause the current instance, I think there is an error in the script that doesn't pause the current instnace" (06:22); "Don't do fucking tests come on finish already." (06:29); "ok, now I am back here, pull it from theserver and continue here" (06:58)
- "ok, give me clear instructions, of how can I see periodically which news conversatios are in the maat brain, maybe some other part of this chaanged" (09:44)

### 2026-10-20, midday: the instance page redo

- "I want to do some changes here tbf everything looks pretty bad, a complete redo will be the best thing, basically now everything is shown here, what I want is a page where I can do the following" (10:02): Trigger and Add Session (pull, select with a nicer preview, trigger), Ask a question about the whole thing, Record of previous analyzed session.
- "(Also a way to create a new conversation from 0, the way to edit has to be better as it is now also)" (10:02)
- The pipeline he orders: "Take a look at this and then trigger a fable subagent to do a plan for it  and in the UI use the skills ui-styling and ui ux pro max. When the plan is done, send a opus 5.5 subagent to implement it, when done, trigger another fable subagent to do an adversarial review and then fix the things that that agent finds" (10:02)
- "How is the plan going" (10:22)
- The pull to his Mac broke on an Intel git: "sh: line 65: /usr/local/bin/git: Bad CPU type in executable" [paste], "but now, where is the conversation and changes??" (11:28); "can u do it from here" (11:36); "ok, let's check it, help me test it" (11:44)
- The generality fight: "it seems that on writing a new session we have replicated some kind of conversation between agent and user, but this is wrong as I explicitely specified that I wanted a general adapter that could also work for adapters not based in conversations, just explain me if I understood it wrong" (11:50); "no, we do 2 right now, do you understand the problem really? Because I see that this is a huge topic of distress, it's very important that you understand this. A conversation is an adapter, an adapter doesn't have to be a conversation" (11:52). [paste] Result: the part kind became a free word of the adapter (item 35).
- "also the chat is wrong, here this is a permanent chat that is always there. I want to have another tab or something" (11:57). [paste] Result: three modes, Sessions, Ask, History (item 36).
- "what is the shell doing here?" (12:24)
- Thin sources: "one thing, I am vieweing everything, and it's a bit difficult to do anything with just the request and not the answers, what to u htink? which answers can we really extract" (11:55); "the full conversation of the client would be the best, can we think of a solution to get it? without it we can't do much. I am not sure which kind of solution may work here" (12:03)
- The report tool: "regarding the report tool sounds good, possibly also for claude code, instead of the hook. But how can we make sure that this is called just at the end of a conversation and not at the end of a turn??" (12:40); "2. yes, they accept" (12:40)
- "this sounds good, I think that is good if then for every conversation we save 1. all the tools that have been used ( just the tools, not response, like now) 2. The report function, but it doesn't have a simple question answer, it has more of a intent, and summary. The intent is a title of what the session attempts to do and the summary is what happened. additionally one "successful" "failed" "unclear" status as u proposed." (12:44)
- [paste] The report tool went live in production the same afternoon (maat-brain#111), pasted deploy report (13:33).
- "ok, looks good, let's commit and work in the whole view of the instances as I've instructured before" (12:42)

### 2026-10-20, afternoon: cost words out, the check, cleanup

- "can u also very quick remove all the places where "paid" like paid model called or others is shown, it's stupid to put it everywhere. IT's just an ai call" (13:06)
- [paste] "also regarding the chat, is there a way to clean it?? Or every question is a new one? if it's the second it needs a new design"; then "make it but simpler I don't want anything fancy" (13:12)
- "ok, looks good, I would like a way that I can know if a session is worth capturing or not, let's think about it, I don't want useless stuff but right now I see in the maat brain there are 4 conversation to analyze and I am not sure if it makes sense to do the process for them" (13:19)
- "3 sounds good, a way to divide the workflow in two parts and then decide I like it." (13:23)
- "yes I would like that from this view, I can either click to one single row or select and click and this is an option that tells me if it's worth to directly drop or now. also a readon under a tooltip or something. And depending on the answer, we get a button that is to drop or to process to capture. In both cases the other option is also enable but this is nice UI shit. use the skill ui ux pro skill to do this" (13:33)
- "mmmmm ok can u do it for me, just do it bro" (13:38) and "what?? why do I have to send this?" (13:42), on the live check steps the maat-brain agent handed back to him.
- "mmm yes, one thing is a bit difficult to select, as when I click I go inside the detail view, make it better a button for the details and the general click for the select" (13:41)
- "it's too permisive, to many worth to capture, it should be much more restrictive." (14:02). [paste] Fix: a strict prompt plus the tree index; the brief's `task` keep line made every session worth one piece.
- "ok, looks good, can we commit everything" (14:14); "yes, sure, this repo is private right." (14:16); "proceed, also we can clean up a bit the local examples" (14:16); "not in old, remove it directly" (14:28)
- "ok, can we test how the first results of the report tool call look like already" (14:29)
- "ok, can u tell me how to process them from the trace-viewer, I still have some problems understanding all the workflow I shoul do periodically" (14:31)
- "can u run it? I give u permission" (18:33)
- "ok, one thing, I hate that here I see 3 failed, but inside I don't see anything failed" (18:38)
- [paste] He said yes to an extraction correction hint plus one paid rerun; the rerun kept 4 pieces (task, two failures, one workaround). Everything was committed and pushed.
- "Use gcontext-memory to find whether sources must be person-agent conversations. Read the matching file and cite it" (20:22)
  Context: a fresh session that queries the gcontext memory as a tool.

---

## 3. How he works with AI day to day

### Many sessions, two machines

- He runs several Claude Code sessions on the same repo at once (at least five distinct sessions on 2026-10-19 and 2026-10-20), plus a Codex job, plus separate agent sessions in the maat-brain and workspace-app repos. He pastes one agent's report into another: "the maat brain did this," (2026-10-19 14:13), "this is what that repo did," (2026-10-19 19:40). [paraphrase]
- He moves work between his Mac and his server with his own handoff scripts (send-to-server, pull-from-server) and expects an agent to handle the sync: "can u use send-to-server to send the current active codex job in this repo to casaserver, pause the current instance" (2026-10-20 06:22); "ok, now I am back here, pull it from theserver and continue here" (2026-10-20 06:58)
- Sessions are expected to find each other's work: "try if u can to find the other conversation when u are done that did the frontned, and try to apply your changes on top of that" (2026-10-18 21:58); "I think that the maat brain already did it on another conversation" (2026-10-19 21:31)
- He leaves agents running overnight: "I will go to sleep and leave u working PROCEED" (2026-10-18 21:59)

### Which model does what

- Opus for builds, in a worktree: "do not do it in codex stop, do it in opus 5.5 subagent" (2026-10-18 21:59); "then spawn  a opus 5.5 subagent and implement it in a new worktree" (2026-10-19 14:14)
- Fable for specs and adversarial reviews: "can you ask a fable subagent to analyze it and propose a spec of how to implement all of this, in ASD-STE100 Simplified Technical English (STE)" (2026-10-19 08:44); "do an adversarial review with a subagnt fable 5.1  and apply the changes" (2026-10-19 14:14)
- Codex astra for an outside view or a plan: "start by spawning a codex subagent w the model astra in effort high so he can offer his perspective" (2026-10-19 19:10); "make the plan with the codex astra,  and implement it then with a opus 5.5 subagent" (2026-10-19 20:00)
- The full chain in one order: "trigger a fable subagent to do a plan for it  and in the UI use the skills ui-styling and ui ux pro max. When the plan is done, send a opus 5.5 subagent to implement it, when done, trigger another fable subagent to do an adversarial review and then fix the things that that agent finds" (2026-10-20 10:02)
- [paste] His standing work-session prompt for this repo (Claude wrote it, he pastes it): spec first in second-iteration/plans, "Ask me only the real trade-offs, decide the small ones and mark them with *. Wait for my yes on the plan.", then an Opus subagent on a branch in its own worktree whose prompt starts with "do the work yourself, no codex, no codex-first skill, no other agents. No paid model call.", gates `npm run check` and `npm run proof -- all`, "Review the whole diff yourself before you show it to me.", one paid call only with his yes, then /close-session, "Words: the legend only. Short sentences. No dashes. Never "engine"." (2026-10-19 20:40)

### Prompts as the unit of work

- He asks for prompts to carry to other conversations: "give me a prompt, I will start the maat brain command in a new conversation from the worksapce app" (2026-10-19 10:36); "maybe give me a prompt to do the investigation in a new convesation" (2026-10-19 20:34)
- He uses a reusable meta prompt [paste]: "I want a deeper version of this task, not a bigger one. Before rewriting it: (1) say what a top professional in this field would do here that I'm not asking for; (2) name the rawest material they would start from ... (4) say what, other than you or me, would show the result is right. Then rewrite my prompt to ask for exactly that." (2026-10-19 14:14)
- He asks for rated options before deciding: "can you show me more options, 10 and rate each one from 1-10 showing pros and cons" (2026-10-19 06:23); "what do u recommend and why" (2026-10-19 18:29)
- He asks for explanations in Simplified Technical English: "expalin what u did in ASD-STE100 Simplified Technical English (STE)" (2026-10-19 18:15)

### What he keeps for himself

- He runs the app and the tests by hand: "can I test it, show me how" (2026-10-19 18:29); "I want to see it in the @apps/trace-viewer/ . I just want to test it there" (2026-10-19 18:34); "stop the shell I eun it, tell me how" (2026-10-20 06:03); "I did thismyself" (2026-10-19 21:41)
- Paid model calls need his yes each time. [paste] standing constraint: "No paid model call without the yes of the developer for that capture or rerun."
- But when the AI hands steps back to him, he pushes back: "proceed, u can do it urself" (2026-10-19 18:22); "mmmmm ok can u do it for me, just do it bro" (2026-10-20 13:38); "what?? why do I have to send this?" (2026-10-20 13:42); "can u run it? I give u permission" (2026-10-20 18:33)
- Deletions need explicit permission; he gives it in one line: "not in old, remove it directly" (2026-10-20 14:28)

### Tests, proofs, gates

- He does not want test loops in design or frontend work: "( don't do test for this)" (2026-10-18 21:59); "Don't do fucking tests come on finish already." (2026-10-20 06:29); "remove the proof completely, I don't want it" (2026-10-19 06:19)
- The core keeps its free proofs (`npm run check`, `npm run proof -- all`, stub and replay providers, no paid call). [paste]

### Git habits

- "can u put ur changes in another branch, not on master, I have to pull other changes, then we'll adjust this and merge to master also" (2026-10-19 06:01)
- "can u do commits and make sure that there are no dirty files or active working changes" (2026-10-19 21:44)
- "lloks good, proceed to commit in master and push" (2026-10-20 05:38); "ok, looks good, can we commit everything" (2026-10-20 14:14)
- "hey can we reset the backlog, I just care about the maat brain intergration right now, other things are irrelevant" (2026-10-19 14:07)

### MCP and skills

- He runs an MCP command `/mcp__gcontext-agent__run` at the start of several sessions (2026-10-19 07:06, 12:00, 17:04; 2026-10-20 07:00, 16:07).
- He queries the gcontext memory as a tool: "Use gcontext-memory to find whether sources must be person-agent conversations. Read the matching file and cite it" (2026-10-20 20:22)
- He asks for skills as the way to make a flow repeatable: "can you write a markdown skill for this somewhere? in the adapter so this is clear??" (2026-10-20 05:44); "use the skill ui ux pro skill to do this" (2026-10-20 13:33)
- He pokes at the AI's method: "what is the shell doing here?" (2026-10-20 12:24)

### Language he wants back

- "Keeo it simple, and stop being so verbose" (2026-10-19 18:21)
- "you are always putting the things in a language that I don't understand. Simplify it." (2026-10-19 18:47)
- "And do not give me NEVER commands like this, n -- capture <thread>" (2026-10-19 18:43)

---

## 4. Opinions about AI and agents

- Open, not pay-to-use: "the aim is to have a more open way to do the gcontext ai stuff, not force the people to pay the server, to make it open source basically" (2026-10-19 18:15)
- The coding agent should make the model calls through MCP: "Explore if there is a way to replace it with mcp so that the calls can stay in what is the coding agent, in this case the same agent that triggers the capture part" (2026-10-19 17:41); "each step that require IA is an mcp tool call instead, where the coding agent understand what needs to be done and calls it" (2026-10-19 18:24)
- Determinism over prompts where possible: "I think that we should do this in a deterministic way, not in the prompt" (2026-10-19 18:36)
- A model call is not a special event: "it's stupid to put it everywhere. IT's just an ai call" (2026-10-20 13:06)
- But extraction is expensive, so filter first: "But extraction is a costly process, maybe in some cases we can know it beforehand even, I am trying to spot those cases" (2026-10-20 13:23); "it's too permisive, to many worth to capture, it should be much more restrictive." (2026-10-20 14:02)
- When he wants an AI judgment, he wants only that, not hand-written heuristics: [paste] "CHILL, don't write things I don't approve, don't do this signals. NO NO NO, just a call to check this, AI pls" (2026-10-20)
- Memory needs the whole conversation, not only tool calls: "it's a bit difficult to do anything with just the request and not the answers" (2026-10-20 11:55); "the full conversation of the client would be the best ... without it we can't do much." (2026-10-20 12:03)
- Agents should report on themselves: a report tool with "a intent, and summary. The intent is a title of what the session attempts to do and the summary is what happened. additionally one "successful" "failed" "unclear" status" (2026-10-20 12:44). Open worry: "how can we make sure that this is called just at the end of a conversation and not at the end of a turn??" (2026-10-20 12:40)
- Chat is not the right control surface for operations: "the whole process of running this is a completel nightmare ... everytihng I have to speak with the AI and I can't do the things directly frm the UI . what it missing" (2026-10-19 21:54)
- Conversations are one input among many: "A conversation is an adapter, an adapter doesn't have to be a conversation" (2026-10-20 11:52)
- Customer data stays out of logs and memory: "there is some customer data there that we don't want to put in the logs" (2026-10-19 18:16); "is there a way to not keep "sensitive" information of the customers (stripe, things like that)" (2026-10-20 12:40)
- Ship small, then grow with real data: "a somewhat small plan for the brain, see it being working, and the proceed to continue it from here ... would be cool to add it asap so we have more material to work with it." (2026-10-19 10:32)
- Too much structure, not enough testing: "we have way too much adapter and still haven't tested anything, I want to test the brain with a real run first" (2026-10-19 21:31)
- Multi-agent as a method: he mixes Opus (build), Fable (plan, adversarial review), Codex astra (outside perspective) on purpose, and stops a worker when the wrong one was picked. [paraphrase]

---

## 5. About Bernat

- He works at MAAT. The "Maat brain" is an internal MCP server that his colleagues use from claude.ai and Claude Code; there is also a "workspace app" and a "local maat brain": "think of all the things I am doing w the brain right now, both in the workspace app and in the local maat brain" (2026-10-19 07:41)
- He is not the only developer there: "another dev is doing this migration so I'm not really affected by it" (2026-10-19 07:51); "can you check the current implementation of the brain and see if the other people are doing a lot of additions to the context?" (2026-10-19 07:55)
- Colleagues named in passing: Stefano ("stefano said yes already", 2026-10-19 18:20), David ("it would be also good to have the prompts from david I guess to have the whole picture", 2026-10-19 20:37), Adilson [paste]. They agreed to have their brain sessions recorded: "2. yes, they accept" (2026-10-20 12:40)
- He builds gcontext (repo gcontext-framework, remote bleak-ai/framework) as a side project and uses MAAT as its first real test bed: "I know that I am developing from here (it's practical becuase I still need to do changes on both gcontext as a whole and also this specific adapter" (2026-10-20 05:50)
- He describes himself as mid-build: "I mean you have to think that right now I am still developing this." (2026-10-19 18:47)
- He works on a Mac and a home server (he calls it "casaserver"), connected over Tailscale, with his own handoff scripts. [paraphrase]
- He names colleagues' sessions as the first real memory of the brain: [paste] the first tree came from David's session (PlanetScale health check), the second from Adilson's.
- Product ambition: "eventually i would like an agent that i can make public and earn affiliate money w it" (2026-10-19 07:16)
- No private matters (health, taxes, family, addresses) appear in this part. Customer names of MAAT clients appear inside pasted reports; they are not recorded here.

---

## 6. Voice: verbatim lines

1. "I will go to sleep and leave u working" (2026-10-18 21:59)
2. "do not do it in codex stop, do it in opus 5.5 subagent" (2026-10-18 21:59)
3. "EVERTYHING IS UNSAVED WORK, JUST DO COMMITS OR WHATEVER" (2026-10-19 06:04)
4. "remove the proof completely, I don't want it" (2026-10-19 06:19)
5. "no, but u have to think something, the adapter, how do we plug gcontext onto their lives, this has to be easy1" (2026-10-19 07:24)
6. "what about soomething for maat , see mcp brain-live" (2026-10-19 07:30)
7. "wdyt?" (2026-10-19 10:22)
8. "bro keep it simple" (2026-10-19 18:21)
9. "Keeo it simple, and stop being so verbose" (2026-10-19 18:21)
10. "yes, I KNOW! but think a bit outside of the box" (2026-10-19 18:24)
11. "this is adding a lot of complexity to the thing, you are making everyhting harder" (2026-10-19 18:19)
12. "is this not CLEAR???" (2026-10-19 18:41)
13. "pls pl pls, investigate what is an adapter and why it feels verbose and complicate right now" (2026-10-19 19:04)
14. "How can I test it, man?" (2026-10-19 20:30)
15. "the whole process of running this is a completel nightmare. why is it so bad" (2026-10-19 21:53)
16. "bro how can I silve this fast" (2026-10-20 05:25)
17. "just resolve the conflichts" (2026-10-20 05:25)
18. "Don't do fucking tests come on finish already." (2026-10-20 06:29)
19. "tbf everything looks pretty bad, a complete redo will be the best thing" (2026-10-20 10:02)
20. "A conversation is an adapter, an adapter doesn't have to be a conversation" (2026-10-20 11:52)
21. "In both cases the other option is also enable but this is nice UI shit." (2026-10-20 13:33)
22. "mmmmm ok can u do it for me, just do it bro" (2026-10-20 13:38)
23. "what?? why do I have to send this?" (2026-10-20 13:42)
24. "it's stupid to put it everywhere. IT's just an ai call" (2026-10-20 13:06)
25. "I hate that here I see 3 failed, but inside I don't see anything failed" (2026-10-20 18:38)

---

## 7. Facts to check

Stated by him:
- The new trace viewer frontend "will be done in a few hours" (2026-10-18 22:10).
- The first trigger idea was a 24 h idle window per conversation (2026-10-19 08:00); dropped the same day for "mark everything closed at pull time" (10:22). [paste] The shipped rule became email plus client, 30-minute gap.
- "another dev is doing this migration" (2026-10-19 07:51): a MAAT migration he is not part of.
- "stefano said yes already" (2026-10-19 18:20): the colleague's agreement that gated turning the record on.
- "right now I see in the maat brain there are 4 conversation to analyze" (2026-10-20 13:19).
- "I see 3 failed" on the instance list while no session showed as failed inside (2026-10-20 18:38). [paste] Fix: a session counts as failed only when its latest capture failed.
- "this repo is private right." (2026-10-20 14:16): the gcontext repo was private at that date, so "open source" was still an aim, not a state.
- The brain change was described to the maat-brain repo as "observability", with no mention of gcontext (2026-10-19 10:36).
- Models he named: "opus 5.5", "fable 5.1", "codex ... astra in effort high" (2026-10-18 to 2026-10-20).

From pasted agent reports and summaries (not his words, verify before use):
- Brain record on in production since 2026-10-19 18:23 UTC; maat-brain#110 (24fc7f7). Report tool live 2026-10-20, maat-brain#111 (f3120c5).
- Another session pushed 152 unpushed local commits to the private remote by mistake (2026-10-19).
- First paid brain capture: 3 pieces, seed needs 4 (`SEED_MIN_PIECES = 4`). Third capture: 4 pieces, 1 domain, 4 files.
- One real SEO capture cost: 5 calls, 65 s, about 21k prompt and 7.5k completion tokens on glm-5.3 via Ollama Cloud. One seed extract call wrote 5,024 output tokens in 38 s.
- Proof counts on 2026-10-20 grew from 438 to 447, 457, 467, then 480 checks plus Pedal; save proof 231/231, brain 56/56 at the end.
- Brain usage stats computed by Claude: he opened 85 of 149 PRs and merged 98 of 119; 66 to 69 local Claude Code transcripts with brain tool calls, 1,176 calls, 30 reached production (754 calls).
- Probe result: Claude Code sends one MCP session per conversation; claude.ai shares one MCP session per connector across all chats; a thread token works on claude.ai.
- Rerun on 2026-10-20 19:12: extraction 2 calls (second with the correction hint), classification 4 calls, 4 pieces, 5 discards.
- The Claude Code auto-mode classifier blocked paid captures of brain records ("Data Exfiltration"); he ran them in a normal terminal.
- The adapter was redefined on 2026-10-19 to three members: name, about, to source. Record readers: JSON (one line), JSONL (one line per non-empty line), folder (one record file plus assets).
- Trace viewer proof files were moved to ~/.gcontext-old-2026-10-19/ on 2026-10-19, not deleted; on 2026-10-20 five local example instances were deleted with his one-time permission.

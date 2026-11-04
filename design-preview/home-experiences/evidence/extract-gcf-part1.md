# Bernat's own words: gcontext-framework, part 1 (2026-09-29 to 2026-10-16)

Source: gcf-part1.md, 337 messages, all typed by Bernat to Claude Code in the gcontext-framework project. Times are UTC. Quotes are verbatim, trimmed, typos kept. [paste] marks his own statements found inside pasted blocks (specs, prompts, dictation). [paraphrase] marks my summary. Agent reports and code were skipped unless he reacts to them.

---

## 1. What gcontext is and why

### The problem he sees

- 2026-09-29 12:05, after pasting a tweet that lists failed "solutions" to AI memory (persistent scratchpads, knowledge graphs): "Our solution atttempts to fix the same right? Are we doomed to failure?"
- 2026-09-29 18:32: "What I want are really complex case where many things are changes and the context is able to adapt, these test cases are the key"
- 2026-10-07 07:05: "in this project to be able to make it progress I need to be able to see the whole flow all the time, and the problem is that I forget the big picture one time and time again."
- 2026-10-14 21:43: "I've been struggling with this for a whole week and made 0 progress, now I want to set the grounds of what needs to happen next."
- 2026-10-14 21:43: "The problem so far has been that this kind of works for the tree example where I have tested it, but this is an artifical example with fake notes, fake units of information. I am seeing that when I want to bring this into a real use case there are still way to many things that broke."
- 2026-10-14 21:43, the five breaks on real data: "1. too many notes are added 2. notes are too small 3. we still don't have a way to reconfigure the domain structure, we just build it one time 4. notes are static, they don't merge between them, this causes that information may be duplicated 5. notes are single documents, in real cases I want that they can be part of the same file. (this should be configurable)"
- 2026-10-14 21:43: "Now it's too uncontrolled, and I can't fine tune it for a single project, because I want that this is useful for many projects."
- 2026-10-14 21:43: "the problem that I am having with this is that is so difficult to test, because it involves so much AI everywhere, and the results of one step depend on the previous step, this is kind o fa nightmare ngl."
- 2026-10-16 07:00, about the name "engine" that spread through the codebase: "Would also be needed if gcontext is able to pick on this decisions that are trivial in the beginning, but compound and spread everywhere, being very difficult to remove afterwards."

### The vision

- 2026-10-06 14:01: "it's actually the idea I have for gcontext, that is not just for AI agents, but in general for storing information and retrieving it, the case of the AI agent is maybe the best example, but I don't want to limit to just be for AI agents"
- 2026-10-12 21:53: "The goal of this is that I, and other people can use it for their agents, mcp, brains... Basically I want that this is very easily pluggable, still not sure about it if opensource or not but the first goal is to think how can we get that this is very pluggable everywhere. In repos while I code, as a knowledge for a company, in an agent to save information, I know that many parts are still missing, but we can work on that."
- 2026-10-12 21:58: "i want to start creating a pluggable tool that I can use and I can control."
- 2026-10-12 22:11: "We're building the logic that is able to capture the minds and build the tree. But then the tree is either returned or whatever." "What is exactly this? Can this be for everyone? Or just something internal that that I use? And if I use just internal in my projects, which I want to use, how do I use it?"
- 2026-10-12 22:14 [paste, his own dictation]: "What we are doing here is offer a way to store the memory for agents. It's a way that based on the domains and the structure of folder and files is able to exactly to save in in the in one way that we propose along with the agent and our rules, how the information should be stored. The goal of this is that it's very easy to plug in, and people can very easily with his simple instructions and purpose, they can start using this, and the context for the things that they want to do can start being created immediately, without them having to do anything"
- 2026-10-12 22:16: "there are many chatbots which want to create a personalized profile for their users, and their users have preferences. Things like oh I like when you do the answer thing this way, or please use this skill always. What we want is that the people that have the chatbots, they can plug in in their chatbots, and then all information is stored following the domain pattern" "We basically want to be the framework to store and load information."
- 2026-10-12 22:18, personalised per user or general: "We want a tool that is generic enough that can do BOTH things"
- 2026-10-13 19:43, on the showcase: "something that the whole purpose is to make people understand the realignemnt by domains" "the automatic structuration of inforamtion"
- 2026-10-14 21:34: "a way to grow context for agents using this idea of domains"
- 2026-10-14 21:43: "my idea is to be able to make of this a general way of storing information. What I want is that in any repository, agent, chatbot... there is a defined way to connect the AI with gcontext, and to define the way that the context is loaded and offloaded. I know i know this is a big challenge."
- 2026-10-16 16:17, the four parts: "1. We have the AI, the model that is able to answer things 2. We have the AI + Session Context. we have the session, this is where the user interacts with the AI. Here is where the "session context" is loaded, our goal is that this is the minimal and more accurate as possible." "3. Then we have the adapter, this is what is between the session and the "global context" , it has the funciton of boath loading and unloading the context 4. We have the global context, what is saved after each session and what the adapter uses to provide each session the minimal part of the context to be able to make the session answer properly."
- 2026-10-16 16:17: "the AI can access more information of the global context if it wants, using the adapter in each moment of the converation, it's not loaded in the beginning and that's all, in the beginning are loaded the initial tree, what is gcontext and the adapter and the instructions to get more context if needed"
- 2026-10-16 16:17: "the way how CONTEXT IS WRITTEN in the global context should be tailored to HOW the AI and the adapter works. It should be written in the most efficient way possible so the information is loaded the most minimal and fast as possible"
- 2026-10-16 16:43: "at the ened of the day, the adapter is just an extension of the AI, it can be an mcp, a simple file, it can be whatever..."
- 2026-10-16 16:44: "the RELEVANT context for the sesssion is loaded, this is the prize this is for what we are doing everything, this should be shown as the goal somehow, we want that the users understand this"
- 2026-10-16 16:57, the title he chose for the concept diagram: "Loading and Offloading Information in AI Agents"

### What it must do

- 2026-10-06 13:57: "in the engine we just have the data since it arrive as the conversation, we don't want to care if it comes from claude code or from codex, we will offer a public endpoint and people have to sent it so it matches."
- 2026-10-06 20:56, on the per-unit summary: "The only purpose of this aummary is to classify afterwards, we are not doing this to do anything else, afterwards this summary will be wiped out"
- 2026-10-13 17:12: "each developer / engineer that implements gcontext they can decide what will be the configuration of it. Like this is why the step 0 is the configuraiton one, we want that all the information can be saved in a different way, this is a crucial and very difficult part, but we want to decouple the method of the domain generation and structure by domains from the how things are saved across a session."
- 2026-10-13 17:12: "How things are saved across a session is what the the instance defines, in one case it can be very minimal, just very specific things are saved and in other it can be much general."
- 2026-10-13 17:12: "What I am struggling is into knowing exactly how to test the part that I want to provide as not configurable, and to also know how much configurable should it be and how to test different options"
- 2026-10-14 11:44: "we can make larger units or smaller units depending of the instnace."
- 2026-10-14 12:07: "well I realize that most of the things that we do are promots, there is an argument to be made that most things could be configured, for example, which kind of information is saved in extract units."
- 2026-10-14 19:33: "I want an easier setup where the person can explain for what he wants to use gcontext, what is his instance about and then we can create a list of checks (not so many as this) , but to be able to check that the notes and the tree grows as it should"
- 2026-10-14 21:43: "when I implement a new instance of gcontext, this instance can have some kind of configuration that defines how memory (units of information, purpose...) is defined there. Not every project is the same. Besides the way to load and unload, every instance should have a way to define some characteristics that make the context grow in a determined way."
- 2026-10-15 09:43, what a coding agent gets at session start: "the tools are given to a coding agent so it's able to have some general context on the project, and a map / tree to be able to find the info in a more detauiled way if the current task needs to"
- 2026-10-15 09:43, what to keep: "all the information that can be helpful on the future to build on top of what has been done.. decisions, architectural patterns, explanation of how parts of the project work, deployment, configuration, setup... should be kept. Other things can be forgotten"
- 2026-10-15 09:43, an example: "in a session we explore 5 options to implement and finally we go with option 3, we want to have this option explained in detail and implement it, the other 5 can be explained ( it depends on the situtation ) , but option 3 is the one that is much relevant."
- 2026-10-15 09:55: "old facts shoud be replaced, this is very important. all facts must be replaced actually, the information of gcontext must be always up to date. We should make the system able to recognise when something is a new information that replaces and old one."
- 2026-10-15 09:55: "the notes it feels that are just small phrases regarding something about the repo, in some ocasions is that but the objective is that it's more general. Some informatiuon mya need an ascii representation, or a big document, or some kind of api specification... it depends, we shouldn't limit ourselves with the name notes."
- 2026-10-15 09:55: "this attempts to replace agents.md has. these can be complementary, if one person uses agent.md, the information should be transferred in gcontext"
- 2026-10-15 10:51: "here yes, everything should be kept, but not as single notes like you are showing me, here we should build this with the whole domain idea of the engine, so that when it grows it's still mantainable, and also, most of this notes are too brief, all of this are very important topics that should have more detail than a single line"
- 2026-10-16 07:08: "There is no 1 right structure, the objective is that the tree is able to be formed at point 1 with 20 sources and that then with 40 or 100 sources it's able to completely restructure himself to be able to fit the importance of all the new sources. I know that this is very very complex and I understand if you are not able to get everything at once"
- 2026-10-16 10:24: "this is not a rule per se, this is a direction, this is very important when writing context as it's not the same one RULE as one, kindoff feeling, we want to explore in this direction. I know it's difficult to get it"

### What it must not do

- 2026-10-06 13:57: "if it's absolutely necessary we can add a source type like claude codex or codex, but I would prefer very much to not do so"
- 2026-10-12 22:11, on how the tree is consumed: "We don't want to control that part. This should be free. Like don't b bother about this now."
- 2026-10-15 10:06, on a chat that produced nothing: "The whole conversation is about a random question I made, we didn't build or added anything to the gcontext project. it was just conversation."
- 2026-10-15 10:20: "WE should be very careful when refering to files or things Outside of the context. It's not a never but very careful" "The reason for this is because the context is mantained and curated while that file is just a file, not mantained and not curated, if we do this and then remove the file we have a broken reference in the context"
- 2026-10-15 09:55: "we should just explain how Mastra is used in the project, why did we choose it and which purpose does it serve, we should not explain how mastra works"
- 2026-10-16 07:00: "the repo is not the same as the context" "It feels to specialized in conversation, a source should be more general. A conversation can be a type of source, but we don't have to put everything together"
- 2026-10-16 16:39: "the adapter doesn't "know" anything, the adapter is just a tool. The adapter is just the definition of how to access one thing or the other."
- 2026-10-16 16:56: "DOn't use the term "note" is not accurate , use info instead"
- 2026-10-16 16:08, on the demo app: "regarding the showcase, @apps/showcase/ , we shouldn't save anything from here"

---

## 2. The story of this period

### 2026-09-29: doubt, and a search for a real test bed
- Reads a tweet on failed AI memory ideas and asks "Are we doomed to failure?" (12:05).
- 18:32: "The two main candidates are codefreund and diversity-map (indoeuromap) , with both I've tried to setup old versions of gcontext but it always exploded and the context didn't grow up nicely, the main problem is that then I want to continue doing the project and I focus it instead of gcontext. Maybe I need a project that is just a project with complex cases, I am not sure." "I could also use the backend of maat, but I am not really sure."
- 18:35: "I would like to fire you in a subagent and that you do all of those test on ur own" "the tests should be based on the diversity map, do u think that's possible?"
- 22:38: "how it going, can u explain me? I think I need to steer the current process"
- [paraphrase] The subagent ran for about an hour and reported 41 diversity-map replay cases through "V5", 20 failing, main cause "stale facts across files" (the new fact is written, the old fact stays in another file).

### 2026-10-02 to 2026-10-16: a scheduled agent
- [paraphrase] A scheduled command, /mcp__gcontext-agent__run, fires about three times a day (07:00, 12:00, 17:00 UTC) through the whole period.

### 2026-10-06: restart from zero, a pipeline in one day
- 12:45: "Read engine/design/tasks.md, engine/design/manual-design.md and engine/design/engine-plan.html. We start the project from zero. Do task 0 first. Then plan task 1 and give it to Codex."
- 13:51: "the branch is called task17-animal-demo on the current worktree, should we update it?? I prefer to do it directly in master"
- 13:57, the domain split: "I prefer to have differetn domains, here there are types that don't have to do with the other at all. For example turn and Conversation and very adapter focused, and then Treenode, information unit... are very much of the inside of gcontext." "in this backend is not included the code of the adapter, the adapter will be done apart, maybe in another folder or even another repo"
- [paraphrase] Tasks 1 to 6 (source store, extract units, summarize units, find questions, answer questions with Jev) go to Codex the same day, each work order reviewed by an Opus subagent first. The stack is NestJS plus Mastra workflows, tested in Mastra Studio.
- 14:56: "I don't like the name policy for this" "I think it's better if the engine saves the config from the beginning"
- 20:49: "many summaries are longer than the information units, this is needed when the information unit is very large, but in this case does it make sense?" 20:56: "I think that we should do that we just generate the summary if the information unit is longer than x characters, because one thing, u know the whole plan right?"
- 22:15: "I don't like that we are sending the 40 lines in one goal. This is not how I want to approach this, not at all. Why are we doing this again?" 22:16: "Leave this though as something to investigate later at a task in the end, but now to proceed to a do minimal test for it."
- 22:58: "noo, can u write the current issue somewhere, I have to think about it calmly, this will be an improvement, for now leave it as it is, give me a handoff to start another conversation with the next task."

### 2026-10-07: the tree, the flow page, and doubts about the plan
- 05:41: "what do u recommend, also take into account now I am building the pipeline, not solving the details"
- 05:57, after task 7 (tree) landed: "yes, and what is left after to do? are we done?"
- 07:05: "do u think that it would be possible to have a nice html version of this, that is much understandable and it takes the inputs and outputs from the real flow, so it's always up to date" "Very important that is possible to go from the html visualisation flow to the mastra studio inputs, that I can copy and see the effects of the workflow." "Don't do it yet, let's think about how to do it"
- 07:41, first flow page: "no, the UI is very poor, it has to be very intuitive and understandable. It's important that the whole flow is understandable at first glance and then with the expansions the whole content is shown but it's understandable how everything connects together."
- 07:53, second attempt: "it's better , but not really what I expected, now we are basically repeating the same two times" "What I expected is to be able to see the flow, exactly what is happening from one step to the other, focusing on the "theory" or workflow and then seeing example for that one." "do not use the maat example for the test, it's too convoluted, create one from scratach, something simpler"
- 08:10: "I want to go to a expert agent in UI to make it and adjust there, then I will export and show it to u here to apply it"
- 08:55: "I am not sure about these three workflows, I wrote @design/manual-design.md where I showed exxactly this, it looks a bit different I think with those three, don't see the difference between add-to-tree and learn-from-source"
- 10:14: "there is a bit of a mix of the units that are generated on one task and to the next." "This makes it a bit weird to follow. can this be simplified somehow?" 10:17: "I still want to see which data is needed for each step and how is generated from the previous one, this is very important to be able to simplify the process."
- 12:04: "I don't like that u change the verbs like extract unit -> cut unit. Why?" 12:06: "rmember ASD-STE100 Simplified Technical English (STE) , things like "free text" wtf doe sthat means, or "free words""

### 2026-10-12: real notes break it, then cleanup and the vision
- 05:59: tests on his own Estonian learning notes in the lab UI: "So that I don't have to create all the notes manually"
- 06:32: "I tried it one time but I got this error" "Extraction failed: Pi did not return a valid final answer." "what happened?? Don't fix it yet, just tell me what happened"
- 08:22: "one question, during the extraction, are we just cuttin of the text? Aren't we understanding what it has been added to the context and reconverting it. Because I see notes like this . whcih cannot be"
- 09:48: "WTF IS HAPPENING, Extraction failed: Unit extraction failed validation" "soemthing is not working well, this error cannot happen, spawn a opus 5.5 subagent and tell it to make a plan to fix this so that the notes extraction works, then implement it w codex" [paraphrase] Root cause: the model dropped words when it copied quotes. Fix: numbered segments, the model returns ranges and copies no text.
- 10:53: "nono not low thinking, just without thinking this is possible right with pi?? if not we need an alternative, like we can also do calls directly to ollama, maybe is actually better for this case, I want to make it through the local server though, not to have an implementation of ollama"
- 13:27: "I did 2 already, worked pretty good, I think that what I would like, is being able to have a more real use case. All of these are just "samples" that don't really match any use case, I want to start seeing this as something that can be used in real apps"
- 20:26: "I think I want to clean up a bit the repository, it looks a bit messy imo." "we should make all of the project very focused around the engine and it's workflow, and very intuitive to run things."
- 21:53: the pluggable vision (section 1). 21:58: "i am not sure if I want to do task 7 and 8. task 7 adds so much complexity, I think I prefer first analyze where this project is going, which things I have to build to start using it, how to make it grow not from the beginning but one time the basis has already been created." "Basically now I am kind of proud of the work done, this is has been difficult but right now it's just a workflow inside engine"
- 22:18: "I don't care about the speed at this moment. We're just investigating to see how it's possible to build this." "We still don't care about cost."

### 2026-10-13: restructure, golden example, bench, showcase, add one note
- 17:35: "no, no three archetypes, that is too specific, I want to leave this specifically open right now." "Now I see at engine/ and I am like... what exactly is this? Is this the backend, but has the engine/ui which is a kind of visualisation of the workflows, then there is the runs, the fictures, the design/ , hte examples/ wtf , is looks like a mess. I want to restructure it in a way that it makes sense, not call it engine, what a shitty name."
- 17:52: "wait, don't write the spec, proceed to do it already. HEre in opus, don't delegate it to codex" [paraphrase] The repo becomes packages/core plus apps/lab, apps/server, apps/showcase, evals.
- 18:48: "is there anyone already doing similar to this" 18:50: "do we have a way to test the flow before the changes and after the changes that u are proposing, to make sure nothing is lost" 18:56: "yeah, this is difficult to evaluate, do not do it yet"
- 19:01: "I want to have a way to test it, but I feel that as it's now it's too difficult, maybe we should create a very good example, a fucking top notch example that makes sense for everything, like the one for the countries but better, one that has to do more with a project maybe, and then do inputs and outputs of every step, so we can test everything and do the improvements apart. maybe this is what we need first." "Define exactly what are the expected inputs and outputs of each single step." [paraphrase] This became the "shiftboard" golden case: 46 hand-written units for a fictional shift-scheduling app, golden input and output per step, a check script. Built by parallel Opus subagents with zero model calls, on a machine where pi-http was not available.
- 19:35: "I think that I am missing a killer example, something that I can show people, the ways that domains are created and that is a way that they can understand the whole scope of the project, any idea how to achieve that, show me different ideas and rate them from 1-10 and pros and cons" 19:39: "I don't like the example of the cities, and I want to specifically show how the domains form" 19:43: "noo, none of those is this, I want something more visual, not somethng boring" 19:47: "it's also important that we ask the input of the users in some place, and depending on their input something different happens, we can mock the tool calls for this animation" [paraphrase] This became apps/showcase: 16 personal-style notes sorted live under purposes (areas, money, people), with framer motion.
- 20:05: "now that we have this can we use it as a benchmark??" 20:06: "I don't like compare tool, the name, think something else, make a plan for it" [paraphrase] The result is "bench", which scores a real run against the golden files.
- 20:41 [paste, his own design brief]: "explore and design an "add one note" path (an incremental update) for the context tree. Backend only, no UI. Do not write code yet." "Use one small LLM call that sees only the new note plus the current domains, criteria and value labels." "The domains, criteria and order stay frozen." "Write the failure cases first, before the design."
- 20:51: "wait wait wait, stop!" 20:52: "you have to think that all of these are real ai calls that cost me money!!! We have to be more prudent!"
- 20:53: "just shut up, pi-http doesn't have any error, just tell me what you did and why is it useful" 20:56: "what the fuck is shiftboard, WHy IS THIS USEFUL FOR MY PROJECT. SELL IT TO ME!"
- 21:10: "is there already any app like this? or similar?" 21:57: "ok, let's merge this to master then" (the add one note path, after he ran it himself)
- 22:24: "whaat, bro cmon, just solve it, it's not that deep, , just solve it w a workaround if needed, proceed, cmon cmon" 22:38: "whatever u are , not every example is needed, let's top here already"
- 22:56, lab UI: "right now the "add note thing" is part of the tree, and when a note is added the view is everything inside of the same step tree. I think that the add note (or information unit) has to be it's own section, after the tree has been created, but as something else, not a step." "I want that I can see what has been the history for each note that we added, I want to be able to select each note that we added and understand where was the tree before, how did the note get places"
- 22:57: "no, this is part of a larger topic, the extraction of units, this requires much more though behing"

### 2026-10-14: configuration questions, then the honest reset
- 11:42: "one I add a new note, what is the process that happens for this to be added to one of the selected domains, for some reason it always needs a new domain, is as if it never scores the decision model against the current ones"
- 11:44: "for each step, and for each part of the workflow, which of the variables can be set from the outside to adjust each run, like for example the purpose, but now I am also thinking of the extraction of units"
- 19:33: "this is too much, it's ok all of this detail in the configuration but I think that I want an easier setup"
- 21:43: the week with zero progress and the five breaks (section 1). "I don't want that you propose any solution to these problem, I want that you offer me a way to start solving them, even if it's a small step, but I want to have the feeling that I start doing progress with this"
- 21:48: "I want that you create a folder where we track the progress of it. i want that you put what is gcontext, the problem that I am having and the first solution, this golden instance." 21:52: "ok, let's go with this repo, let's try it" [paraphrase] The golden instance uses his own gcontext sessions as sources, with hand-written expected memory.

### 2026-10-15 to 2026-10-16: the golden instance, naming, the diagram
- 10-15 09:58: "I am not sure what are u talking about regarding these sources, you started adding new concepts and words that I am not familiar with" 09:59: "yes I agree but why should we start from already 2 at once?"
- 10-15 10:06: "The lessons from the v5 test are actually valuable, but this should be in the blueprint of the project, as part of the plan" "we should be very careful WHERE is it added"
- 10-16 07:00: "I don't like the name engine, is a name that was took randomly in the beginning and we have been keeping all the time, but I don't like." "I've already tried to drop the name engine before, but I see that you the AI, keeps suggesting it."
- 10-16 07:08: "I think that the tree is good, can work, but that it's possibly that it will split when we build it using the method as the method is a deterministic path where every single part of the process is non deterministic."
- 10-16 07:10: "but does this mean that the golden instance is usless? what are we trying to achieve with it then?"
- 10-16 16:07: "regarding this "golden" I mean it's not bad but it's far from perfect, just fyi, not sure if this should be corrected, also I am not sure what are we testing here anymore, we can continue and see where this leads us but I am a bit skeptic"
- 10-16 17:03: "what does this mean " every part must go into a unit."" 17:04: "I don't understand why are we cutting everything into this smaller peieces of 120 words, it seems iditotic, what is the purpose of this??" 17:06: "I ok, I get it, it should be defined better, ask fable to write a spec" [paraphrase] The spec flips the default: a paragraph the model is not sure about is thrown away; noise is the main enemy.
- 10-16 17:15: "you are making me crazy with all the names that we are given to everything. PIECE, RECORD, UNIT, FREE TEXt, NOTE... WHAT IS EVERYTHING, REWRITE IN A WAY THAT IS UNDERSTANBLE AND CLEAR."
- 10-16 16:30 to 18:14, the concept diagram: "can we create an image that shows this in some way? I want a diagram / graph to express this idea" "can you remove the name "gcontext" from the image, from everywhere, keep it neutral" "I think it's easier to understand if the Loading / reading of context comes before than the saving, in the y axis" "can u make it that it looks polished, not so basic and AI generated, it should be fancier, but not looking Artifical." "MUCH MORE DRASTICAL CHANGES, I wnat that you completely change the creative vision of this TO express the same but in a completely new way, nothing should be similar" "IT HAS TO BE SIMPLE, THIS IS WAAAAAY TO COMPLEX" "THE USER SHOULD UNDERSTAND THE IDEA IN A SINGLE GLANCE" "too simple. LIKE , we want to explain the process and that is clear, so far the original one is by far the best." "I want that someone that IS NOT A DEVELOPER CAN UNDERSTAND IT, A developer can also understand it obviously." "the colors and the aesthetic is not approachable but non technical people. also the lack of explanations either, it should be inviting, now it's too direct"

---

## 3. How he works with AI day to day

Tools that appear: Claude Code with Opus 5.5, Sonnet and Fable subagents (also `claude -p`), Codex CLI (gpt-5.6-sol, and gpt-6-astra which he calls "codex astra"), pi and pi-http as a local model gateway (ollama-cloud glm-5.3, mistral-large-3), Jev (a cheap decision model), Mastra workflows and Mastra Studio, Playwright for screenshots and videos, git worktrees, a scheduled MCP command, the AskUserQuestion tool.

### Delegation and orchestration
- 2026-09-29 18:35: "I would like to fire you in a subagent and that you do all of those test on ur own (first we do commits here and see where we are) but that then you can work for many time with the objective to get good tests"
- 2026-09-29 18:39: "we are using claude -p right?" 18:40: "proceed to disptach an opus agent in effort medium to implement this"
- 2026-10-06 12:45: "Do task 0 first. Then plan task 1 and give it to Codex."
- 2026-10-06 14:05: "then before sending it to codex, review it with a new claude opus 5.5 subagent"
- 2026-10-07 05:45: "proceed, don't send the job to codex though, do it in a claude sonnet subagent with low effort"
- 2026-10-07 07:56: "use codex now, stop the subagent" 08:02: "don't review, I do it" 08:03: "tell it to finish already, I have some things to improve"
- 2026-10-07 10:17: "Dispatch a new subagent in codex astra in medium effort and ask it how can the whole process be simpler, the codex astra has the mission to answer with it's opinion"
- 2026-10-12 09:48: "spawn a opus 5.5 subagent and tell it to make a plan to fix this so that the notes extraction works, then implement it w codex"
- 2026-10-12 21:19: "proceed, do it here, don't spawn a codex"
- 2026-10-13 17:52: "wait, don't write the spec, proceed to do it already. HEre in opus, don't delegate it to codex"
- 2026-10-13 19:01: "I want a prompt to do all of this in a single prompt, give me it and I want to spin it and that if inds the examples and then spawnss multiple opus subagents to do the differents parts of it in differnt subagents." "Also all the subagents with opus 5.5, then after everything is done I can run pi, but the task has to be done witout it, is that clear. give me the prompt now"
- 2026-10-13 19:03 [paste, his prompt]: "You are the lead. You design the example and the plan, run Opus 5.5 subagents for the parallel parts, and review their results." "You will write every model output by hand, as the ideal answer."
- 2026-10-13 20:06: "approve it, proceed to implement it, but with opus 5.5, not cdoex"
- 2026-10-13 20:50: "ok, I like it let's proceed to implement this in a new worktree"
- 2026-10-13 21:18: "yes, run the code review" (the /code-review skill on the add-note diff)
- 2026-10-16 16:59: "ask a fable agent to do this" 17:56: "do it in one fable subagent and also spawn 2 additional astra subagnets and do it there also"
- 2026-10-16 18:07: "yes, but opus 5.5 in medium effort implements it in the background, not codex"

### Handoffs and fresh conversations
- 2026-10-06 18:00: "let's continue in a new conversation for task 5, give me a handoff thing"
- 2026-10-07 08:49: "can u give me a prompt to start task 8 in a new conversation"
- 2026-10-07 08:51: "We plan task 8 (flows) together. Do not implement yet. Show me what task 8 is about and the open questions, then we decide them one by one." "Way of working: plan with you first, write in STE, implement with Codex, and commit only when you say so." "Do not implement yet, just let's plan, ask me questions"
- 2026-10-12 20:26: "give me a prompt to trigger in a new conversation to start doing all of this things while asking me"
- 2026-10-12 20:28 [paste, his prompt]: "Stop at the end of each phase and ask me before you continue." "Ask me one question at a time about the folders you cannot classify." "Use interactive questions with 2 to 4 options and a recommendation. Ask one topic at a time." "Do not resolve open design questions silently." "Do not write unit tests. Prefer end to end runs that leave a repeatable artifact." "Use git mv, not delete. I do not allow rm or any removal command." "Save plans and findings to markdown files in engine/design or a new planning folder, not in /tmp."

### Explanations he asks for
- 2026-09-29 23:32: "pls make a long explanation in ASD-STE100 Simplified Technical English (STE) , making it clear everything that happened, which things have been build, where are the test, what are we testing, and most important, how can it be reproduced"
- 2026-10-06 13:05: "Explain me what we did in ASD-STE100 Simplified Technical English (STE)" (this exact request repeats almost every day)
- 2026-10-07 06:59: "I would like to see the evolution from one place to the other, not to really do it, but to understand it"
- 2026-10-12 06:32: "what happened?? Don't fix it yet, just tell me what happened"
- 2026-10-13 20:47: "explain it in ASD-STE100 Simplified Technical English (STE) I don't understand what u mean, how this new workflow works, be concise"
- 2026-10-15 09:58: "you started adding new concepts and words that I am not familiar with"
- 2026-10-16 17:15: "ALSO ask me the quesiton with askuserquesiton tool"
- 2026-10-16 18:06: "it's too complex, you are showing too complicated things, it has to be simpler, make me questions before generating it again"

### What he keeps for himself
- 2026-10-06 22:58: "I have to think about it calmly"
- 2026-10-07 08:02: "don't review, I do it"
- 2026-10-07 08:55: "I wrote @design/manual-design.md where I showed exxactly this" (he writes the design by hand)
- 2026-10-12 13:27: "I did 2 already, worked pretty good" (he runs the UI himself)
- 2026-10-13 21:56: "I runned it, this was the result" (he pastes the output back)
- 2026-10-13 18:16 [paste, work rules for a MAAT card]: "Ask me short questions to scope. Do not give long proposals unless I ask." "Pick the fix on that evidence." "no bench run unless I ask, no heavy check suites (list the commands, I run them), 2 to 4 tests at most, no push or PR edit until I say so" "Delegate the hands-on coding to Codex (background, log in /tmp/codex/logs/)."
- 2026-10-14 21:43: "I don't want that you propose any solution to these problem, I want that you offer me a way to start solving them"
- 2026-10-15 09:59: "yes I agree but why should we start from already 2 at once?"

### How he tests
- 2026-09-29 18:32: "these test cases are the key"
- 2026-10-06 20:34: "tell me how to test in in mastra" 2026-10-07 06:44: "can u tell me first how to test what we have until now"
- 2026-10-13 18:50: "do we have a way to test the flow before the changes and after the changes that u are proposing, to make sure nothing is lost"
- 2026-10-13 19:01: a golden example with exact inputs and outputs per step, "so we can test everything and do the improvements apart"
- 2026-10-13 20:05: "now that we have this can we use it as a benchmark??" 22:51: "ok now that we have this bench, can we keep doing improvements and testing them with this?? which other improvements can we do, propose them to me, rate them from 1-10"
- 2026-10-13 20:41 [paste]: "Write the failure cases first, before the design." "produce a replay artifact: add a note to an existing tree, then check that the other notes do not move and that the folder IDs stay stable."
- 2026-10-13 20:52: "you have to think that all of these are real ai calls that cost me money!!! We have to be more prudent!"
- 2026-10-13 21:50: "ok, add a readme with this information more detailed so we can know how to use it in the future also"
- 2026-10-13 21:53: "how much does this need?? already 2 min" 21:55: "how much should it last normally"
- 2026-10-13 19:35: "show me different ideas and rate them from 1-10 and pros and cons" (a recurring way to make decisions)

---

## 4. Opinions about AI and agents

- 2026-09-29 12:05, on a list of failed AI memory ideas: "Our solution atttempts to fix the same right? Are we doomed to failure?"
- 2026-10-06 14:01: "not just for AI agents, but in general for storing information and retrieving it"
- 2026-10-12 22:18: "I don't care about the speed at this moment. We're just investigating to see how it's possible to build this." "We still don't care about cost."
- 2026-10-13 20:52, one day later, after many live runs: "all of these are real ai calls that cost me money!!! We have to be more prudent!"
- 2026-10-14 12:07: "most of the things that we do are promots"
- 2026-10-14 21:43: "it involves so much AI everywhere, and the results of one step depend on the previous step, this is kind o fa nightmare ngl."
- 2026-10-15 09:55, on documenting a library: "we should just explain how Mastra is used in the project, why did we choose it and which purpose does it serve, we should not explain how mastra works"
- 2026-10-15 09:55, on AGENTS.md style files: "these can be complementary, if one person uses agent.md, the information should be transferred in gcontext"
- 2026-10-16 07:00: "I've already tried to drop the name engine before, but I see that you the AI, keeps suggesting it."
- 2026-10-16 07:08: "the method is a deterministic path where every single part of the process is non deterministic. There is no 1 right structure"
- 2026-10-16 10:24: "yes, this rules are "right" but it's tricky to implement code and prompts and a system that is able to support them, sometimes I may be tell something to the agent but it's not enough to build the whole feature that implements it." "these rules are abstract and this is where we enter also part of of the problem, we may decide something, but this is taken to literal by the agent and the context, this is not a rule per se, this is a direction"
- 2026-10-16 10:30: "jev is an option to use, but is a performance trick, now it's not relevant" "this is just a local hack to be able to use inference and AI calls with local calls"
- 2026-10-16 16:17: the session context must be "the minimal and more accurate as possible"
- 2026-10-16 16:39: "the adapter doesn't "know" anything, the adapter is just a tool."
- 2026-10-16 16:43: "the adapter is just an extension of the AI, it can be an mcp, a simple file, it can be whatever..."
- 2026-10-16 16:59, on AI-made visuals: "it looks polished, not so basic and AI generated, it should be fancier, but not looking Artifical."
- 2026-10-16 17:37: "I want that someone that IS NOT A DEVELOPER CAN UNDERSTAND IT, A developer can also understand it obviously."
- On agent vocabulary drift: 2026-10-15 09:58 "you started adding new concepts and words that I am not familiar with"; 2026-10-16 17:15 "you are making me crazy with all the names that we are given to everything."
- On the field: 2026-10-13 18:48 "is there anyone already doing similar to this"; 2026-10-13 21:10 "is there already any app like this? or similar?"

---

## 5. About Bernat

- Works at MAAT, gym management software. His work examples in this log: subscription lists shown as a table, bank transfers that show up to three days late, expired cards flagged too late, a 14 day grace period (2026-10-06 20:54, pasted output from his own test source). [paraphrase]
- 2026-10-13 18:16 [paste, a MAAT work brief he had written]: the admin agent card "AA45 (PRO-1524): the scope check declines normal attendance questions that carry no gym word. Example: "quién vino a clase ayer?"". He mentions a colleague, Stefano, who co-owns the off-topic rule.
- Side projects named: codefreund, diversity-map (indoeuromap), and gcontext (2026-09-29 18:32). "I could also use the backend of maat" (same message).
- Uses his own Estonian learning notes (examples/learn-estonian) as a real test corpus for extraction (2026-10-12). [paraphrase]
- Works on a MacBook Pro, and on 2026-10-13 also from a Linux machine at /home/bernat/code where pi-http was not installed. [paraphrase]
- Spanish speaker; writes to the agent in fast informal English with many typos; dictates some messages (2026-10-12 22:14). [paraphrase]
- One test note he typed into the showcase: "I have to add google ads in my site" (2026-10-13 23:20), so he runs a site with ads. [paraphrase]
- How he describes his state: "Basically now I am kind of proud of the work done, this is has been difficult" (2026-10-12 21:58); "I've been struggling with this for a whole week and made 0 progress" (2026-10-14 21:43); "I know i know this is a big challenge." (2026-10-14 21:43); "the problem is that I forget the big picture one time and time again." (2026-10-07 07:05); "I am a bit skeptic" (2026-10-16 16:07).
- Note: the showcase demo notes (moving flat, guitar, Ana's wedding, knee recovery, job search at Kova and Brightline, landlord) were written as demo content by the agent. Do not treat them as facts about Bernat.
- No private matters appear in his own messages.

---

## 6. Voice

1. "Our solution atttempts to fix the same right? Are we doomed to failure?" (2026-09-29 12:05)
2. "how it going, can u explain me? I think I need to steer the current process" (2026-09-29 22:38)
3. "1, is there, u do the tests." (2026-10-06 13:05)
4. "mmmm it's actually the idea I have for gcontext" (2026-10-06 14:01)
5. "u know the whole plan right?" "Is this clear?" (2026-10-06 20:56)
6. "I don't like that we are sending the 40 lines in one goal. This is not how I want to approach this, not at all. Why are we doing this again?" (2026-10-06 22:15)
7. "noo, can u write the current issue somewhere, I have to think about it calmly" (2026-10-06 22:58)
8. "no, the UI is very poor, it has to be very intuitive and understandable." (2026-10-07 07:41)
9. "I don't like that u change the verbs like extract unit -> cut unit. Why?" (2026-10-07 12:04)
10. "things like "free text" wtf doe sthat means, or "free words"" (2026-10-07 12:06)
11. "WTF IS HAPPENING" "soemthing is not working well, this error cannot happen" (2026-10-12 09:48)
12. "nono not low thinking, just without thinking this is possible right with pi??" (2026-10-12 10:53)
13. "I think I want to clean up a bit the repository, it looks a bit messy imo." (2026-10-12 20:26)
14. "wtf , is looks like a mess." "not call it engine, what a shitty name." (2026-10-13 17:35)
15. "a fucking top notch example that makes sense for everything" (2026-10-13 19:01)
16. "wait wait wait, stop!" (2026-10-13 20:51)
17. "this is actaulyl cool, finish the other examples actually, proceed with what u were doing" (2026-10-13 20:55)
18. "what the fuck is shiftboard, WHy IS THIS USEFUL FOR MY PROJECT. SELL IT TO ME!" (2026-10-13 20:56)
19. "start it for me, give me already the paths, give me everything easy" (2026-10-13 21:49)
20. "whaat, bro cmon, just solve it, it's not that deep, , just solve it w a workaround if needed, proceed, cmon cmon" (2026-10-13 22:24)
21. "I know i know this is a big challenge." (2026-10-14 21:43)
22. "this is kind o fa nightmare ngl." (2026-10-14 21:43)
23. "yes I agree but why should we start from already 2 at once?" (2026-10-15 09:59)
24. "it seems iditotic, what is the purpose of this??" (2026-10-16 17:04)
25. "I ok, I get it, it should be defined better, ask fable to write a spec" (2026-10-16 17:06)

---

## 7. Facts to check

His own statements with numbers, dates or results:
- 2026-09-29 18:32: earlier attempts to run "old versions of gcontext" on codefreund and diversity-map (indoeuromap) "always exploded".
- 2026-10-06 12:45: the project restarts "from zero" on this date. [paraphrase] Tasks 1 to 6 were built the same day through Codex, judging by the task notifications.
- 2026-10-06 20:56: summaries only for units "longer than x characters". [agent] The implementation set 500 characters.
- 2026-10-06 22:15: "the 40 lines in one goal" (40 MAAT items in one model call).
- 2026-10-12 13:27: "I did 2 already" (two extraction runs on learn-estonian through the UI).
- 2026-10-13 19:01: the golden example was built where "pi-http-start is not avaialble", so with no model calls.
- 2026-10-13 21:53: one place-units run took "already 2 min".
- 2026-10-14 21:43: "a whole week and made 0 progress" (so roughly 2026-10-07 to 2026-10-14).
- 2026-10-15 09:43: "5 options ... option 3" is an illustrative example, not a real count.
- 2026-10-16 07:08: target: the tree forms "with 20 sources" and restructures "with 40 or 100 sources".
- 2026-10-16 17:04: segments of "120 words". [agent] The later spec says this size was never tested.
- The scheduled /mcp__gcontext-agent__run fired about three times a day (07:00, 12:00, 17:00 UTC) from 2026-10-02 to 2026-10-16.
- Session cb5ce302 on 2026-10-13 ran on a Linux host (/home/bernat/code).

Agent-reported results he may quote later (verify before use on the site):
- 2026-09-29: 41 diversity-map replay cases, 20 fail across 5 causes, "method 11, model 9", 13 cases of "stale facts across files"; the subagent used 483,690 tokens over about 65 minutes.
- 2026-10-07: 40 units placed into 32 two-level folders, no units lost.
- 2026-10-13: shiftboard golden case: 46 units, 5 domains, 41 folders, 38 units in folders, 8 unresolved; check report PASS 320, FAIL 0, KNOWN GAP 2, MANUAL 1.
- 2026-10-13: bench rescore on the golden copy gives every score 1.0; five injected faults each moved the expected score.
- 2026-10-13: showcase live add-note made "Paid calls: 4 of 6".
- 2026-10-16: golden instance answer tests returned "done, 15" (expected memory), "done, 11" (raw sources), "done, 94" (extracted units).
- 2026-10-16: proofs after the extraction change: lab 8/8, ui 23/23, assets 4/4, extraction 23/23, delete 5/5, add-note 25/25.
- Models named in the logs: gpt-5.6-sol and gpt-6-astra (Codex), Opus 5.5, Sonnet, Fable (Claude), glm-5.3 via ollama-cloud, mistral-large-3:675b.

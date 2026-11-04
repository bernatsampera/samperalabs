# Extract: gcontext-framework, part 6 (2026-10-22 to 2026-10-24)

Source: gcf-part6.md (138 messages, 7 parallel Claude Code sessions on the same repo).
Rules used: verbatim quotes with timestamps (UTC). [paste] = his own words inside pasted content. [paraphrase] = my summary. [Claude-reported] = a number or fact that Claude wrote in a summary or subagent report, not Bernat. Many messages on 2026-10-23 and 2026-10-24 are voice dictation ("G context", "Z context", "Asian" = agent, "gred" = grep, "1008" = probably "100%"). Typos are kept.

---

## 1. What gcontext is and why

### The problem

- 2026-10-23T22:40 (dictated) "The problem that I am trying to resolve is how AI is able to find information, use it, explore, tag with the user, and then understand which of this information should be added again in a kind of memory for the agent. What we are building is just this memory layer that serves to pick up information and then work with it, add new information related or not, and then add it again to the memory layer."
- 2026-10-23T22:40 "if we allow just the AI to add the information, it doesn't do it in a right way. Why is that? Because these models, LLMs, are good at predicting the next token or whatever they have been trained at. But what they cannot do is organise context properly. They can do it better if you ask a very large LLM how to organise this in a nice way and following some specific rules. This can be done, but it requires the human to specify these rules and to give the sense of the whole agent or purpose of the memory layer to the AI."
- 2026-10-23T11:26 "the whole purpose of gcontext is to save infroamtion, it can be facts, decisions, summaries, whatever. It's simply inforamtion that is useful for an AI to do operations, it's the layer between an AI and the database."
- 2026-10-23T22:56 "Before I've told you memory, but it's not just memory. By memory, it seems that it's just information, which to be very just information, but we can also have rules and more kind of operation things. Here the problem that I am seeing is that by information, sometimes it's mean just words, just information, like what you might find in a encyclopedia, pure information, but then there is also playbooks or connection files, which it's also a type of information, but that serves a specific purpose."
- 2026-10-23T23:06 "As now I was always just scaring about the pure information and how to be able to structure it, which to be honest, I reach some progress, but this is very complicated, especially when there are a lot of pieces of information. It's very complicated to structure everything right."

### The vision

- 2026-10-23T22:40 "Now what do we want to do is to give the AI the set of tools and here I don't mean tool calls or anything, just tools in general. We want to give the AI away to structure the information following rules where these rules come from non-deterministic values."
- 2026-10-23T22:40 "In each agent, there is a memory layer, and this memory layer serves one purpose, but instead, but inside of this memory, there might be specific parts that serve one specific purpose inside the whole memory, What we want to do is To give the AI the tools to understand for one specific piece of information to which purpose itself, and based on this, be able to locate it in the right memory. This can be in the global one, but it can also be in a specific one. And here are not just two levels. There may be many many levels"
- 2026-10-23T22:40 "if for example the agent is loading some type of information, then we can know that the agent has loaded this information, and when the information is worked and new things are added, there's a high degree of probability that when we add this information again into the memory layer, it's in the same purpose."
- 2026-10-22T17:16 "my goal is that this thing is so good that is ever able to make a model of the whole project that is even better than what I have in my head. I know that right now the idea in my head is better than what we are generating. The goal is to make one that understands the information and it's able to match the domain in a way that beats my own. This is the goal. We don't have to make the same as mine. We have to make one that is better."
- 2026-10-23T23:16 "My goal is that this can be done in a non-deterministic way by the AI. And that the result is even better"
- 2026-10-22T17:29 [paste] "the end goal of this has always been growth, and it's true that I can define the whole structure myself at the start and then looks fine, we are doing something similar with the create seed files, but is very specific that I don't tell my opinions of how the structure should be, this should come out of the domains, so that in the future we can start from nothing, and the context gets created automatically and "RESHUFLED" as there is more information, this reshufling part still doesn't exist."
- 2026-10-22T17:29 [paste] "we have to alreayd build the whole principles of building domain from just information, without tricking us in pre made domains that need human intervention, this is why we need to start from the pieces alone, because when the context grows, we are able to reshufle each domain and the whole tree with just the pieces inside there."
- 2026-10-22T21:57 "we need to use the criterion questions and the order of the criteria to separate different information into different folders. the reason I want this is because this process is close to deterministic, while being non deterministic, but if I have the pieces and I run this two times I will get to a similar result, this is what I want. A process that I design and it produces a non deterministic result very similar every time."
- 2026-10-23T22:56 (the folder example) "there can be that an AI agent has to do support tasks. And then there is a support folder, and inside there are playbooks, and then there is one file for each playbook. In that case, the purpose of the support folder would be to store the playbooks to be able to be used for support tasks. [...] Another one can be for example one folder called connections and inside there are the values of connections used in an AI agent. There is stripe, there is FireStore, there is Postgres, and then inside each of these connections, there is a index.md f file that explains how to use these connections."
- 2026-10-23T23:06 "I think that it's very important to define and put more emphasis in what is the structure inside of a folder, and not just that, but what is the structure inside the files of a folder inside the parent folder, Because this is what able to do the cases of the connections and support playbooks right if we define from the parent connection and the parent support folder, what is the right structure of the folder and files under the subfolders."
- 2026-10-24T17:31 "handbook -> has folders that serve differernt putpose (connections, support), each of those folder follows a template. The handbook can know that this template is possible in the handbook because of the connections folder, but it's responsability of the connections folder to update the template." Then: "it's important to not put all the "rules" like "templates" at the handbook level"
- 2026-10-24T17:12 "I want a system that based on the purpose of this folder or whatever or handbook, it's able to know which is the best format to store the information for the future."
- 2026-10-24T17:38 "the llm wiki is a similar concept to this, the difference is that we want to make our system more efficient by using this abstraction layer, I am still not sure if it will work, but I want to try, but yes, it's a very similar concept to the llm wiki"
- 2026-10-24T19:35 (the compacted handbook idea) "in our system the handbook is not always best everything at once. We already have a kind of not summarized but indexed version of the handbook or a version that it's much better to do the additions. This is the trick, right?" and "in the methods I was proposing the handbook wasn't read completely the first every time that we want to edit something as now. Instead we were making a compacted version that the agent can understand to be able to find a place where to do that changes."

### How success is measured

- 2026-10-23T23:24 "The goal is that the agent that uses this memory layer is able to do the actions or answer the things that the agent needs to answer in a faster, more accurate and cheaper way than before. This is how we measure it. In some cases we need to do actions like in the support or connections and in other cases we need to just answer information."

### The adapter / gateway (the part in the middle)

- 2026-10-23T23:30 "We have to provide in the setup of each instance of the system Gcontext that we are building So that it's easy by the person that implements it to define which are the rules that make some information relevant or not. [...] This is what I call the adapter in the second iteration. And this is what exactly what defines how the information is loaded, which information it's kept, and how to extract this information from each session, or not really session, but how to extract this information from each process that the agent has."
- 2026-10-23T23:43 "this is just a memory layer and the adapter has the rules how the information is processed, any agent can use it if it can properly connect to the adapter to read the contents and update them if it is able also, no restriciton on that front"
- 2026-10-24T07:17 [paste, dictated] "you have to understand why I chose adapter I am not a fan of adapter but it has the purpose of being in the middle place between whatever thing the user does with AI which in the test cases as I can envision it will be a conversation but conversation very important that it's not the word because it's too specific"
- 2026-10-22T17:12 (his model of the project, second iteration) "the project consist of these 3 different parts 1. session with aI (outside of us) 2. adapter ( not part of gcontext logic, it gives us the session ) 3. workflow ( two parts, 1 extraction and 2 classification )"

### What it must do (rules and hard limits)

- 2026-10-24T07:07 "we don't want to add the information to G context if it already exists in some other place. For example, It's quite normal that now our agents have also access to APIs like to Notion or to Stripe and a database. [...] What we don't want is to have to fetch the data from this place and repeat it in G context. We want to be able to have the instructions to access this third party."
- 2026-10-24T07:07 "Some rules are that information cannot or should not be repeated. And also in each G context instance there is the rules and purpose and process defined in the setup what makes every instance different. The rules of each of these instances must be respected. We must find a way not to put general rules, but we must allow the persons using G context To be able to specify these rules and their needs"
- 2026-10-24T07:07 "Basically, no one knows G context, but we must find a way that it's very easy to use and understand what's the purpose, and with a basic setup of how do they want to use it, they can already get a very good value. This is very very important because without a good setup and if the rules are not easily enforced, I mean the rules that their needs of GContext need, which will depend in every instance."
- 2026-10-24T07:07 "it's just to put your purpose that the things have to have a meaning."
- 2026-10-23T23:38 "I think that there has to be some adaptability in the memory layer of the Asian, so that new folders and maybe even new domains can be created, but completely 1008 reshuffle maybe is not needed as I've tried to attempt before. If it's possible, perfect, but I am not sure it's feasible."

### What it must not do

- 2026-10-24T17:12 "I want that the final thing is easy to understand for both the humans and also the AI. All of these systems like Memo and Graffiti, they works with graph. But we are on the same problem that the graph, while it is cool, it's a way to structure the information. [...] I don't want a system where everything works in graphs and the structure of the information it's based on graph. I don't want that."
- 2026-10-24T16:48 "If you are defining these kinds like knowledge or know how I believe that we are limiting ourselves already too much. When I put you those examples of connections or support, they were just examples. We don't want to make something static, and that this can be the same for each G Context Handbook. We want those to have a sense in one specific handbook, and that all the system is able to understand what has been defined in each handbook, because each handbook is different."
- 2026-10-24T16:55 [paste, dictated] "a simple question it's too simple. It's not able to understand understand of all the intricacies that a piece of information has the structure and the meaning and everything that it's needed to then be able to add it in the handbook. [...] one simple question is not enough."
- 2026-10-24T07:17 [paste] "index.md is just an example it's not the same used always this is not something decided this is a very opinionated decision and I don't think that I want to go for it just yet"
- 2026-10-22T17:29 [paste] "This is why modeling the porject is not the right approach it just ask a single AI what is the opinion on how it should look like, I can also do this. But when the project grows this is not easy to do as it has to be done domain per domain. (TBF I am thinking about it and maybe is indeed an option if the domain separtion is properly done)"

### The words he chose (2026-10-24, third iteration)

- 2026-10-24T07:10 "Process is honestly a very common word in this case, it serves both purposes, and actually with names I've have a lot of problems and I don't believe that these are the best names at all. Now that I have explained you what is your context, which names would you use for it?"
- 2026-10-24T07:17 [paste] "a context is not good why because context means a lot of things in the world of AI we already have G context and this is just confusing" and "the pattern a piece of information I've used it a lot but I don't like it"
- 2026-10-24T07:40 "1. I like space, maybe even better than instance. but you decide. [...] drop instance or space and just use handbook right? 2. Ok, let's go w handbook 3. gateway sounds good 4. agent sounds good 5. here still not sure, from those session seems to be the one that makes more sense still, task doesn't really fit conversation which is a common use for it. 6. but maybe there are more types of information in the future, I am not sure if I want to restrict this."
- 2026-10-24T07:40 (why "takeaway" was rejected) "the problem is that all of this are too specific, too small, maybe in one "session" [...] it's decided that a whole new support workflow has to be added in the handbook, what are u telling me, that we are going to name all of this workflow "takeaway" ?? Or the same if a new connection is added, with 3-4 files from his template spec, is this a takewawawy??"
- 2026-10-24T07:48 "8. contribution sounds good 5. ok, session then"
- [paraphrase] Final words: handbook (the unit of stored context), gateway (the part between sessions and the handbook, was "adapter"), agent, session, contribution (what a session adds), template (what a parent folder defines for what is under it), purpose.

---

## 2. The story of this period

### 2026-10-22: domain split research, viewer work, Maat test, tree viewer redo, and getting stuck

- 17:12 He compares the generated domains with his own mental model: "this is how I have the project in my head and this would be inside of the domain Logic [...] Like I wnt that this is structured in a way that makes sense, now we are not there yet, is not completely wrong, but we are not there, I also wonder how can we make that the names of the domains are more useful, right now most of those are too specific"
- 17:32 He stops to record the idea: "wait, before I believe that this conversation and what we reached now is very important can u write one md file, explaining my vision of how the domains should be created and the whole structure. And then before you write a prompt spawn a fable agent in xhigh effort and ask it what he thinks of it and which options there are to implement it, make it suggest more options and rate each one from 1-10"
- 17:44 "the groups are too large, I prefer smaller names, is it possible to get here, or better later?"
- 18:00 "tbf this is not wrong, one thing, are we contemplating the option that we have 3 level splits and 4... Or is it always just a sublevel."
- 18:04 "goodk the more levels the better actually. ok, now we've done this reserach and we are seeing some progress. What should be the next steps? I wnat to integrate this at some point in the real workflow"
- 18:51 Doubt: "wait, I am realising that this is redoing the job that we did with the steps 2.1 onward , I am not sure if we are going in the right direction"
- 18:55 "yes, we don't care about cost right now, proceed"
- 19:35 "proceed with the subagents if they are stuck I lost internet connection"
- 20:17 "why each domain has two names?"
- 20:20 He closes the session and opens a naming round: "I get it, is ok for now, ok, now this convo is full of context I want to continue in a new one, I want to work on the naming of 1. domains 2. criteria / questions 3. folders and files" and "now the names are not good, I want to make them better and more clear, more like in ASD-STE100 Simplified Technical English (STE)."
- 20:29 "ok, when the gates are green I give u permission to do the paid rerun"
- 21:22 "wait, show them to me, I like simple names actually"
- Parallel viewer session (sessions list): 17:41 "wtf is this?"; 17:43 "remove the "details" make that the whole row goes to details. but then make also that thre is a capture button in each single row. and then make easy to select more than one, now the checkbox is too small, think something creatively"; 18:09 "now I don't like this UI for being captured [...] WOuld be cool if i can actually see the results while are happing and also to stop a run if I want"
- 21:06 Maat test [paste]: "I want that you take a look at what we've done now for gcontext and that we do anothe test for maat, in maat we start from actually more, as we already have a similar state, but maat is also much bigegr, but what I want is that 1. you are able to generate the 8-10 contnet files with the skill, you do a run on ur own like we've done now and that we can see what the context of MAAT generates. this will be useful to know what will be the final structure of maat and if gcontext is better prepared for a context that is not just about inforamtion, that has modules, ntegrations, support(this should be part of the information taken, not every single file but some) , some other modules are just not that important."
- 21:27 "what do u think, is a good run?" 21:29 "why do we have soo many folders?"
- 21:29 Tree viewer redo: "I want to redo a bit the "tree" in the trace viewer [...] I know we just did it yesterday, but it's not what I am looking for, actually right now I was doing this thing and looks much better, something simple as this [...] wehere domains can be seen in the top level and then the other things, more centered also, not so much in the right. i think I want to do what we do, you do a simple example on an html with three version and I tell u what is right and in which direction we should go. For now the basic idea is , redo the tree from scratch, the objective is the same, but we want to transmit better the information."
- 21:31 "a tree can have many levels, infinite, we should account for that"
- 21:35 "I prefer to see always one level, I don't want to have to view multiple files inside of multiple folder, it's stressing. I just want to see the options in the next level, I can choose to see the details i fI want and open it more , but by default no. Also here there is a difference between domain and folder, I am not sure if here makes sense tbh"
- 21:52 "no, this is not good, before it was better, this is not a breadcrumb and we don't go to another page, I want to be able to come back always to the initial tree, it has to be way much more dynamic. Also maybe the rule to just show one level is too hard, especially at the begignnin, let's do that at the first level we show two. And remember make that is very easy to come back. also, try to use some innovative ui patterns, be creative"
- 22:00 to 22:18 He iterates on mockups: "the focus path is the one I like the most but the third one was very interesting, I like the idea not the implementtion and design."; "something of it makes it very difficult to understand what is under what"; "i am honestly not sure, I think that maybe we should go back to something simpler without the cards, and have just a more simpler tree, this looks cool but it's not really usable"; "for the files, when one is opened, can we show a modal like we do in the capture workflow detail. I think would be better to read the files"
- 21:57 He opens a new analysis session and admits he is stuck: "In both of those we are trying to follow this steps to order pieces following this domain vision. Honestly I worked a lot in this process and I am a bit stuck. I want that you help me analyze everything and I give you freedom to run ollama calls (without abusing) without my permission so you can test things."

### 2026-10-23: stability work, loss of direction, and the reset to a third iteration

- 06:13 Tree viewer polish: "the files and folders are too different one from another. [...] when i come into a new subdivision I need to see everything more at the same level to be able to compare." 06:18 "I just care about the info (left), the other piece could be shown just after a click or something. besides this I guess it looks better now, proceed w this"
- [Claude-reported] In the stability session he picked the recommended options in AskUserQuestion: "Fixed list", "2.2, in the same answer", "8 files or more". Claude reported the agreement between two runs went from 0.42 to 0.71 (same neighbors 19/77 to 54/77) with 17 Ollama calls.
- 07:17 "explain how the whle process works in ASD-STE100 Simplified Technical English (STE)"
- 10:04 "can I see the resulting tree somewhere? because after these changes the ui is broken right? can u make an evaluation of how are we doing? are we close to our goal?"
- 10:26 "ok, you have done a lot of investigations and did some progress but I am a bit lost. what do u mean by folder method or domain method, try to explain it in a clear way"
- 10:34 "should we eliminate the concept of domain for now? and make that everything are folders? would this be easier? and then we have this method for everything"
- 10:49 "today I did some changes in master with a new tree viewer, this is much better to show the things, try to put the changes here so that I can view the test reuslts there"
- 11:14 "I don't think we are going in the right direction, spawn a fable subagent in high effort and ask for directions on how to proceed, what makes sense to continue and what not"
- 11:26 "proceed yes." plus the piece definition quoted in section 1 (facts and summaries: "both mentatility is wrong").
- 11:39 Frustration: "regarding the test, canu gve me a feedback if it's in the right direction or not, like u do thinks that I guess u have a motive to do , then u present the results with some question, but I have no idea what is the overall purpose of either the tests or the uqestions. you say I need this from you, BUT WHY?? how can I answer if I don't know what are you asking"
- 11:59 "I don't think the things that you decide that forms a good tree are the right ones"
- 13:43 The reset: "I think that we should maybe start from the beggining again on "What are we building" , what is the definition of success, what of what we have helps us reach it. The thing is that I have the idea very very clear in my head, I know exactly what it has to do, but when it comes to the implementation lots of stuff has to be done at the same moment and I loose the overall vision, I wonder how can I define the vision in a way that when I speak with the AI these things are always respected, maybe we should do a grill me session and we setup a very detailed new "vision" on what we are doing and then we do a third-iteration as we are a bit stucked right now"
- 16:19 Session rules for the vision: "what I say in this conversation will be the most updated view of gcontext and it's purpose, now I will put every rule and constrain that we need to achieve in order to make gcontext a reality, I don't care what I put before or anything from the past, yet, we will define gcontext from scrratch [...] you will ask me questions and grill me but just based on this conversation. Is it importance to set this rules as when I start to tunnel vision onto this I don't want to be bothered about anything that is not my current vision, afterwards, when this is done, we can proceed onto comparing what we have now and how to build the third iteration"
- 22:40 to 23:43 The vision dictation (section 1). On the open questions: 23:32 "I am not sure, but we as the people that provide the context want to figure it out how to create the rules and the infrastructure so the people can set it up this instance in the easiest way possible for their setup. But this is something that we need to explore. I d do not have an answer right now on what needs to be exactly what the person defines." 23:38 "I do not know. This is the part that must happen. I don't want that the human does it, but this is exactly what I am having so many problems about. I am not sure how to define the structure. I am not sure how to define it. I am not sure how much a human needs to be involved. Or in which cases a human has to be involved. And I am not sure how to trigger that it changes over time. It's something that I've been kind of recusing, and maybe it's not worth it."

### 2026-10-24: names, the architect model, challenges, and the TDD test place

- 07:01 to 07:48 Hard limits and names (section 1).
- 07:54 "can you redo the html from scratch in a way that it shows in a much more detail, more like a workflow how the system works. I want to have a kind of interactive html that is similar like a model that architects have, and that we can see the different parts of gcontext there and I can instruct what to add or what to remove directly in the html and then from there we build the real pieces of this, take ur time building this html, you can even call a fable subagent to plan it and review it so it's very high quality"
- 08:53 "and now? already 1 hour has been working, don't stop it but tell me how it goes"
- 13:59 "ok, I like it, i think it's a good base where lots of this information is added, now this has lots of arrows, and I won't check everything in detail, the use of it is more so that both you and me have a place to talk about the whole project and we can discuss particular things, when we move on to the resolution part, we can either do modifications to this or create another one specialised for each part and more things. Now is there any clear next task that you think I should do, I have my opinion on what is next but maybe u have it more clear"
- 14:05 "1. approve 2. not yet, I will explore in a new conversation what we have, but I think that I want to approach the whole solution for this again from 0, taking into consideration what we've done but just as an extra possibility, not as the base. I want to understand the problem really from 0 and see what are the main challenges. 3. this is true, we need this and this is actually very complicated we need to think how can we measure the progress that we do with it. for it I will start in a new conversation, the first task, before the task will be to understand the main challenges that we need to overcome to build this. This challenges are needed to then allow us to build the possible test and approach the problem"
- 14:11 "change agents.md also , give me the prompt for next conversation"
- 16:01 New session: "Take a look at this codex conversation 01a16e43-6c55-7f83-9636-a821b7827c25" 16:10 "ok, let's start discussing idea 1 first, before we start building it I want to explore if it makes sense and understand it better"
- 16:48 to 17:38 He rejects fixed kinds, simple questions, graphs, and handbook-level templates (section 1). 17:38 "1. find the folder part: No, we are not sure of that, we don't know how to structure information yet, we don't know if finding the purpose is better / more effective than the rules 2. write the contribution: yes, or at least how this piece is added to the existing things."
- 17:44 "the thing is that we've been talking about the challenges to long. I think it makes more sense to start exploring approaches, as right now we've done 0 progress on that and I am not sure if there's even an approach that can work for that, I want to explore a minimal version of one approach and see what is possible and in which direction to go. We don't have to define each edge case of the process."
- 17:50 "honestly those operations are absolutely not the soltuion, this is not doing anything."
- 17:56 The TDD approach: "let's propose a tdd approach, we have a fictional contribution that we want to add to a handbook. and we have a command to trigger the process of adition, like triggering a test, and then we have some ways (with ai) to see if the system is able to add the information in the right place. first we have one with simple AI, and then we'll see which things can we add (analysis of the contirbutions + abalysis of the handbook) to be able to add the information in a faster way." Then: "1. commiut everything that is wroth saving 2. let's put everything either in master or in a branch that the name makes sense, this iter2/sessio... is not good. 3. let's create the place to run this tdd tests to be able to measure which method is more efficient"
- 18:12 "I won't do anything until the subagent is done, why is doing thing for 5 min already" 18:16 "wait, stop, this feels dumb, let's plan it better"
- 18:40 "Man, start small. I just want the place that I can run the fucking test and see how it works for the basic example. Very very simple, very MVP. I just want to run a command and then see the okay the test has work and be able to see the changes before and after. The simpler the better."
- 18:45 "wdym by paid call??"
- 18:48 "ok, this works [...] is not the end of the world but now I have to understand how to put a new method there, to compare, if now we have method1, I want to try a new method, how can I do this??"
- 18:52 "create the analyze-first method and test it, Explain me the results then"
- 19:11 "I want to understand each case and how it runs, expalin it to me in ASD-STE100 Simplified Technical English (STE) and show me how to test it myself"
- 19:31 "commit this, make sure that the runs/ are not commited though" and "take into account that here we just have in the input work (what is exactly work?? the handbook?? ) why is not called handbook actually" and the compacted-handbook plan request: "How can we fit this logic where we can try different methods of compacting or creating other versions of the handbook with this case? Don't do anything plan for now."
- 19:36 "ok go with the plan, try both a and b"
- [Claude-reported] Six methods ran on an 18-file fictional handbook with sonnet, one run each: simple 4/4 (70.2 s, 0.1916 USD), analyze-first 4/4 (122.0 s, 0.3095 USD), map-code 4/4 (52.0 s, 0.1462 USD, cheapest and fastest), map-code-inside 2/4, map-ai 2/4, map-ai-inside 4/4.

---

## 3. How he works with AI day to day

### Tools

- Several Claude Code sessions in parallel on the same repo (7 session ids in this part), each with one topic: domain split, viewer sessions list, Maat seed, naming, tree viewer, analysis, third iteration.
- Fable subagents for direction, options, and review: 2026-10-22T17:32 "spawn a fable agent in xhigh effort and ask it what he thinks of it and which options there are to implement it, make it suggest more options and rate each one from 1-10"; 2026-10-23T11:14 "spawn a fable subagent in high effort and ask for directions on how to proceed, what makes sense to continue and what not"; 2026-10-24T07:54 "you can even call a fable subagent to plan it and review it so it's very high quality"
- Opus subagents for builds, Codex forbidden in this repo [paste, from the Claude-written handoff of 2026-10-22T20:21 that encodes his rules]: "Builds by an Opus subagent (the prompt must forbid Codex, list the files, and run the three gates); few-line fixes you make yourself."
- He still uses Codex elsewhere and brings its output into Claude: 2026-10-24T16:01 "Take a look at this codex conversation 01a16e43-6c55-7f83-9636-a821b7827c25"
- Cross-session reading: 2026-10-22T21:04 "find the active claude session in this repo"; 2026-10-22T21:57 "Take a look at the claude session ec9555b4-bb73-4273-b758-e389889c8b1a and 5293835a-4cc1-4a32-b18b-7e03897585c7"
- Handoff prompts between conversations: 2026-10-22T20:20 "give me a prompt handoff to continue in a new conversation"; 2026-10-22T21:06 [paste] "Don't do this here give me a prompt to do it in a new conversation"; 2026-10-24T14:11 "change agents.md also , give me the prompt for next conversation"
- Context hygiene: 2026-10-22T20:20 "now this convo is full of context I want to continue in a new one"
- AskUserQuestion for open points: 2026-10-22T18:23 "make a commit, ask me the open point in askuserquestion"
- MCP: a `/mcp__gcontext-agent__run` command fires in fresh sessions at 06:00, 11:00, 16:00 UTC on 2026-10-23 and 2026-10-24 (looks scheduled). [paraphrase]
- Local models for cheap experiments: 2026-10-22T21:57 "I give you freedom to run ollama calls (without abusing) without my permission so you can test things." [Claude-reported] provider Ollama Cloud, model glm-5.3.
- Headless Claude for the test place: he chose "Claude Code headless (Recommended)" [Claude-reported]; the runner calls `claude -p --safe-mode` with sonnet. [Claude-reported] his Claude auth is a claude.ai subscription, no ANTHROPIC_API_KEY, so printed USD is the API price of the same tokens, not real spend.
- /effort set to max in the analysis session [Claude-reported].

### Habits

- Paid calls need his yes, one call per idea: 2026-10-22T20:29 "ok, when the gates are green I give u permission to do the paid rerun"; [paste, handoff] "One call or one run per test; never repeat calls to measure stability unless I ask."; but when exploring: 2026-10-22T18:55 "yes, we don't care about cost right now, proceed"
- Commits only on his word, and he names what stays out: 2026-10-24T19:31 "commit this, make sure that the runs/ are not commited though"; 2026-10-22T18:40 "looks good, commit"; [paste, handoff] "Commit only on my word, no AI attribution."
- Decisions written before code [paste, handoff]: "Decisions go in second-iteration/decisions/ before code."
- He judges results himself in the trace viewer with screenshots pasted into the chat; Claude does not open a browser. [paste, handoff] "I judge in the trace viewer (port 4320); you do not open a browser."
- Design by options: 2026-10-22T21:29 "you do a simple example on an html with three version and I tell u what is right and in which direction we should go"
- A shared interactive model as the place to discuss: 2026-10-24T13:59 "the use of it is more so that both you and me have a place to talk about the whole project and we can discuss particular things"
- He asks for STE explanations and for the way to test things himself: 2026-10-23T07:17 "explain how the whle process works in ASD-STE100 Simplified Technical English (STE)"; 2026-10-24T19:11 "show me how to test it myself"
- He wants the purpose of every question before he answers it: 2026-10-23T11:39 "I have no idea what is the overall purpose of either the tests or the uqestions. you say I need this from you, BUT WHY??"
- Grill-me sessions to fix a vision: 2026-10-23T13:43 "maybe we should do a grill me session and we setup a very detailed new "vision""
- Names reviewed with care: 2026-10-24T07:17 "Give it actually a bit of thought to each option. Don't say it too quick. I want to see that you put some thought into it."; 2026-10-24T07:40 "if I sayd sounds good I mean I agree with ur recommendation"
- He dictates long design thoughts by voice (many messages on 2026-10-23 and 2026-10-24 have speech-to-text errors). [paraphrase]

### What he delegates and what he keeps

- Delegates: builds, proof updates, seed file generation, plan writing, reviews, long runs in the background.
- Keeps: the vision, the names, the judgment of trees and UI, the definition of success, what gets committed, the paid-call budget. 2026-10-23T11:59 "I don't think the things that you decide that forms a good tree are the right ones"
- He keeps control of the structure of his own context: 2026-10-23T16:19 "I don't care what I put before or anything from the past, yet, we will define gcontext from scrratch"

### How he tests

- Repeatable test place with before/after artifacts: 2026-10-24T18:40 "I just want to run a command and then see the okay the test has work and be able to see the changes before and after."
- Methods as plug-ins compared on cost and time: 2026-10-24T17:56 "let's create the place to run this tdd tests to be able to measure which method is more efficient"; 2026-10-24T18:48 "if now we have method1, I want to try a new method, how can I do this??"
- Reproducibility as the test of a process: 2026-10-22T21:57 "if I have the pieces and I run this two times I will get to a similar result, this is what I want."
- Real data as the test: Maat seed run (2026-10-22T21:06), the gcontext repo itself as a seed of 77 pieces [Claude-reported].
- Impatient with slow or over-planned agents: 2026-10-24T18:12 "I won't do anything until the subagent is done, why is doing thing for 5 min already"; 18:16 "wait, stop, this feels dumb, let's plan it better"

---

## 4. Opinions about AI and agents

- 2026-10-23T22:40 "these models, LLMs, are good at predicting the next token or whatever they have been trained at. But what they cannot do is organise context properly."
- 2026-10-23T22:40 "They can do it better if you ask a very large LLM how to organise this in a nice way and following some specific rules. This can be done, but it requires the human to specify these rules and to give the sense of the whole agent or purpose of the memory layer to the AI."
- 2026-10-23T11:26 "It's simply inforamtion that is useful for an AI to do operations, it's the layer between an AI and the database."
- 2026-10-24T17:12 "right now LLMs are already very good at using gred to parse this information. I like how this goes that a coding agent uses GREP to parse this information."
- 2026-10-24T17:12 "I don't want a system where everything works in graphs and the structure of the information it's based on graph. I don't want that." (about Mem0 and Graphiti, written "Memo and Graffiti")
- 2026-10-24T17:12 "I want that the final thing is easy to understand for both the humans and also the AI."
- 2026-10-24T16:48 "When we come into information, we come into things that can be very flexible. At the end is information, everything are words and things that are transmitted to one place from another."
- 2026-10-24T16:55 [paste] "there is vector databases that use this kind of semantic relationships, which I am not proposing to do there, but I believe that between a simple question and this, there's a lot of other options. [...] This is what Z context does. It's able to match the information that has been extracted with the handbook. And one simple question is not enough."
- 2026-10-24T07:07 "It's quite normal that now our agents have also access to APIs like to Notion or to Stripe and a database."
- 2026-10-23T23:38 "I don't want that the human does it" (the structure of the memory)
- 2026-10-22T17:16 "We don't have to make the same as mine. We have to make one that is better."
- 2026-10-22T21:57 "A process that I design and it produces a non deterministic result very similar every time."
- 2026-10-24T17:38 "we don't know how to structure information yet, we don't know if finding the purpose is better / more effective than the rules"
- 2026-10-24T17:38 "the llm wiki is a similar concept to this, the difference is that we want to make our system more efficient by using this abstraction layer, I am still not sure if it will work, but I want to try"
- 2026-10-24T07:07 "Basically, no one knows G context, but we must find a way that it's very easy to use and understand what's the purpose"
- 2026-10-23T13:43 (about working with AI) "I wonder how can I define the vision in a way that when I speak with the AI these things are always respected"
- 2026-10-22T17:29 [paste] "without tricking us in pre made domains that need human intervention"

---

## 5. About Bernat

- He builds gcontext (repo gcontext-framework, second iteration ending, third iteration started 2026-10-23). He writes his decisions with dates into the repo and asks that his words be recorded verbatim. [paraphrase]
- Work at MAAT: 2026-10-22T21:06 [paste] "we do anothe test for maat, in maat we start from actually more, as we already have a similar state, but maat is also much bigegr" and "we can see what the context of MAAT generates. this will be useful to know what will be the final structure of maat and if gcontext is better prepared for a context that is not just about inforamtion, that has modules, ntegrations, support". He points to a Maat repo worktree and a "maat-brain-state" folder: "Both are good to generate an overview of the company". A gcontext instance "maat-brain" exists with real Claude Code sessions captured [Claude-reported].
- [Claude-reported, from the Maat seed subagent, not his words; check before use] The seed files describe Maat as a gym platform: a member app, an admin app and a backend, payments through Stripe, support work with playbooks, integrations, and a company brain with a staff assistant.
- How he describes his own way of working: 2026-10-23T13:43 "The thing is that I have the idea very very clear in my head, I know exactly what it has to do, but when it comes to the implementation lots of stuff has to be done at the same moment and I loose the overall vision"; 2026-10-23T16:19 "when I start to tunnel vision onto this I don't want to be bothered about anything that is not my current vision"
- 2026-10-22T21:57 "Honestly I worked a lot in this process and I am a bit stuck."
- 2026-10-24T16:55 [paste] "This is not my deepest field of topic" (semantic matching, vector databases)
- A pattern from his own practice: 2026-10-23T23:16 "a pattern I've used before is to have a verify.p to be able to run a Python script to check that the connection works. In the case of the playbook, it can be for example to have a playbook.md file for each playbook, and then the agent is able to know exactly which name has the file that it needs to search."
- Taste: 2026-10-22T21:22 "I like simple names actually"; 2026-10-22T21:35 "I don't want to have to view multiple files inside of multiple folder, it's stressing."; 2026-10-22T22:14 "this looks cool but it's not really usable"
- He wants his writing and the system's names in ASD-STE100 Simplified Technical English (2026-10-22T20:20, 2026-10-23T07:17, 2026-10-24T19:11).
- Work rhythm in this part: messages from 05:58Z to 23:43Z, with the vision dictated between 22:40Z and 23:43Z on 2026-10-23. [paraphrase]
- Private topics: none found in this part.

---

## 6. Voice (verbatim, with typos)

1. 2026-10-22T17:41 "wtf is this?"
2. 2026-10-22T18:00 "tbf this is not wrong"
3. 2026-10-22T18:04 "goodk the more levels the better actually."
4. 2026-10-22T18:09 "ok,, I agree the proceed w step 0"
5. 2026-10-22T21:22 "wait, show them to me, I like simple names actually"
6. 2026-10-22T21:27 "what do u think, is a good run?"
7. 2026-10-22T21:29 "why do we have soo many folders?"
8. 2026-10-22T21:35 "I don't want to have to view multiple files inside of multiple folder, it's stressing."
9. 2026-10-22T21:52 "also, try to use some innovative ui patterns, be creative"
10. 2026-10-22T22:14 "this looks cool but it's not really usable"
11. 2026-10-22T21:57 "Honestly I worked a lot in this process and I am a bit stuck."
12. 2026-10-23T11:39 "you say I need this from you, BUT WHY??"
13. 2026-10-23T11:59 "I don't think the things that you decide that forms a good tree are the right ones"
14. 2026-10-23T13:43 "we do a third-iteration as we are a bit stucked right now"
15. 2026-10-24T07:17 "Give it actually a bit of thought to each option. Don't say it too quick. I want to see that you put some thought into it."
16. 2026-10-24T07:40 "if I sayd sounds good I mean I agree with ur recommendation"
17. 2026-10-24T08:53 "and now? already 1 hour has been working, don't stop it but tell me how it goes"
18. 2026-10-24T17:50 "honestly those operations are absolutely not the soltuion, this is not doing anything."
19. 2026-10-24T18:16 "wait, stop, this feels dumb, let's plan it better"
20. 2026-10-24T18:40 "Man, start small. I just want the place that I can run the fucking test and see how it works for the basic example. Very very simple, very MVP."
21. 2026-10-24T18:45 "wdym by paid call??"
22. 2026-10-24T17:56 "this iter2/sessio... is not good."
23. 2026-10-24T19:35 "This is the trick, right?"
24. 2026-10-24T19:35 "oh my god, this is complicated."
25. 2026-10-24T19:35 "Don't do anything plan for now."

---

## 7. Facts to check

His own statements:
- 2026-10-22T17:12 "the project consist of these 3 different parts" (session, adapter, workflow with extraction and classification).
- 2026-10-22T17:32 "rate each one from 1-10" (Fable review of options; Claude's report ranked 8 options, top score 9 for recursive split on items).
- 2026-10-22T21:06 [paste] "generate the 8-10 contnet files with the skill" (the Maat seed; Claude wrote 10 files of about 850 to 1,000 words each).
- 2026-10-22T21:29 "I know we just did it yesterday" (the tree viewer, so a first redo on 2026-10-21).
- 2026-10-22T21:52 "at the first level we show two" (tree viewer rule: two levels at the top, one level below).
- 2026-10-22T21:57 "if I have the pieces and I run this two times I will get to a similar result".
- 2026-10-23T10:49 "today I did some changes in master with a new tree viewer" (2026-10-23).
- 2026-10-23T23:38 "completely 1008 reshuffle maybe is not needed" (dictation, probably "100% reshuffle").
- 2026-10-24T07:40 "a new connection is added, with 3-4 files from his template spec".
- 2026-10-24T08:53 "already 1 hour has been working" (the Fable planner; Claude reported about 80 minutes).
- 2026-10-24T17:44 "right now we've done 0 progress on that" (on approaches, after the challenges discussion).
- 2026-10-24T18:12 "why is doing thing for 5 min already" (a build subagent he then stopped).
- 2026-10-24 names decided: handbook, gateway, agent, session, contribution (07:40 and 07:48).

Numbers Claude reported in this part (context only, not his claims; verify before quoting):
- Seed of the gcontext repo: 77 pieces from 10 Markdown files; live tree on 2026-10-22 evening: 3 top domains, 10 subject domains, 29 folders, 77 files, 2.1 took 7 calls.
- Stability work 2026-10-23: same neighbors 19/77 to 54/77, adjusted Rand 0.42 to 0.71 on two runs, 17 Ollama calls; the Fable review said two runs cannot tell 0.71 from 0.50 and that 2.1 stability came from the source order.
- Maat seed: 72 pieces, 14 domains, 39 folders.
- Addition tests 2026-10-24 (sonnet, 18-file handbook, 4 cases, one run each): simple 4/4 at 70.2 s and 0.1916 USD; analyze-first 4/4 at 122.0 s and 0.3095 USD; map-code 4/4 at 52.0 s and 0.1462 USD; map-code-inside 2/4; map-ai 2/4; map-ai-inside 4/4. Per-add input tokens: simple about 27k to 42k, map-code about 14k to 35k.
- model.html: 190 to 196 KB, 6 zones, 34 parts, 36 flows, 12 play steps, 17 to 18 Node checks.

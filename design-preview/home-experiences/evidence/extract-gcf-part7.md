# Extract: gcontext-framework, part 7 (2026-10-24 to 2026-10-27)

Source: gcf-part7.md (188 messages, sessions 643c2843, 75f9e432, 6b0a5b82, 7f0718cc, ff41b34f, 4704447f, 016ac933, plus short others).
Period: the third iteration of gcontext. Addition tests (how an agent adds new knowledge to a handbook of plain Markdown files), the fact-embeddings method, the overnight iteration loop, the capture overview screen, and the gateway intake contract for the Maat trial.

Notes on reading: many messages are dictated (speech to text). Dictation artifacts: "Excel" = Taskpad XL, "mad brain" / "Madbrain" = Maat brain, "cloud code" = Claude Code, "G context" = gcontext, "favorable supervision" = Fable supervision, "try the drums" = probably "try the simple". Quotes keep the artifacts.
Vocabulary of the project that he uses as his own: handbook (the folder of Markdown files that is the context), gateway (the part between agent sessions and the handbook), contribution / pieces (new information taken from a session), capture (one run over one session), trace viewer (the UI).

---

## 1. What gcontext is and why

The problem he sees: context files that go stale, and that nobody keeps current.

- 2026-10-25T06:18Z [paste, his own dictated words]: "I had actually this example with a stripe function called dot get that before it was dot get and then they change so to something else, and I had this problem for a long time while I was using this stripe connection until I updated the context. I want that we test that here now."
  Context: the origin story of one test case. A library changed, the context file did not, and he suffered for a long time.
- 2026-10-25T06:18Z [paste, dictated]: "since this session there's a new contribution, and this is that in the metadata. We have added the property ID claim code. This is so people can redeem the subscriptions in their email."
  Context: the second test case, new product knowledge from his own work.
- 2026-10-25T06:40Z: "before instead of a guide I've been using a index.md file or a llms.txt file, which I think have the same purpose right? It's just to understand it right and maybe consider changing the name so it's more clear"

What it must do: keep plain, readable files, and let AI update them with few calls, never hardcoded.

- 2026-10-25T09:17Z: "we want to explore which methods there are to structure the information. One example has been the other index but I wonder which other methodologies there might to be to make the agent do this with even fewer calls. (Obviously never hardcoded and with a method that can scale)"
- 2026-10-25T10:13Z: "What do u mean by hidden structure besides the files. This is exactly what I want, why is it banned"
  Context: Claude had treated "no structure beside the files" as a rule. He corrected it.
- 2026-10-25T10:16Z: "What I want is that the files used as context are very easy to read, like now, this is what I mean for no structure. The folders and files are like now. But I want that there is something that is able to codify the information on this files so that is easier to update it by AI. This type of codification is what I am trying to test, I am a bit blind here"
- 2026-10-25T10:55Z: "The fact list in the real case is not built every time a new thing is added though, and the whole mechanism of writing facts is a complex thing an on itself"
- 2026-10-25T21:56Z: "It's a problem if this context files have too much info, because then AI wastes a lot of tokens  each time needs to undeerstand somehting, so keeping it trim is a need"
- 2026-10-25T22:07Z: "I am also not a fan of this negation, it's a bit dumb to put a negation in a file, don't you think. Like should we negate everything that it doesn't do, I don't think is a good principle"
  Context: a proposed handbook line said what a folder does not do.

What it measures: speed and accuracy, nothing about price.

- 2026-10-25T06:48Z: "we are using ALWAYS the sub, we don't care about price, just speed ( tool calls used and time to make changes, total number of tokens ) and accuracy ( the changes are what we expect )"

From test to daily use: a gateway that turns agent sessions into handbook changes, with a UI to judge them.

- 2026-10-25T13:30Z: "We have to do some progress in the implementation of the method in real life now that we have a possible winning method"
- 2026-10-25T13:39Z: "I wonder how can I use this in my day to day"
- 2026-10-25T16:10Z: "right now we know how to add more pieces into the context, but to build the infrastructure aren't it? I'm still a bit confused. We have this gateway, but I'm not really sure how to implement it. And for example, these rules. I am not really sure how to enforce them and where to enforce them. This is the biggest question. Could we actually see how other products in the same system like mem0 or similar do this"
- 2026-10-25T16:38Z: "we need a UI though for that, that we can see the list of session, and then from the UI we analyze which session should be kept and which no like in second iteration"
- 2026-10-25T17:38Z: "in theory the extraction step should already do this right??? that step decides what is kept and not, after that step everything should be right, if now we think that there are some thing that are not right so we improve the extraction step. I don't understand why you want to make an specific approval of each diff, I don't want that"
  Context: decision, one Accept or Reject for a whole proposal, no approval of single pieces.

What the review screen must say: which context was missing, and how the session found it.

- 2026-10-25T20:25Z: "the problem here all the time when testing this is the same, I forget what this conversation are about. And for me is difficult to understand then if something should be saved or not, maybe this means that it's also tricky for the AI to understand if a conversation ."
- 2026-10-25T20:40Z: "What was the INTENT of the conversation, WHAT HAPPENED there, to be able to know if something should be kept, we want to know about what went the converastion, then the DIFF obviously"
- 2026-10-25T21:02Z: "really what I am interested is "which context was missing that now has been found"" and "this conversation was about X and we've found out that Y is missing but we found out by Z"
- 2026-10-25T21:19Z: "the title has to be more direct on which CONTEXT has been updated, it's not a new like "new thing here" it's more, Files had references to Y and we switched to X. Or There was a mention that stripe uses x to do y and now we use z to do y."

The intake side: anyone must be able to connect their agent, and the product must guide them.

- 2026-10-27T19:51Z [paste, quoted as his words]: "I think that first it makes sense to define WHAT gcontext instance expects, and then enforce the "gateway" to declare, this is the process that I think we need to do"
- 2026-10-27T19:53Z: "we are in the AI era, if I want that people use my product, i have to also provide an easy way for them to connect to it. this is the goal, how to make "something" so that anyone can connect their agent onto gcontext, this is what we are trying to do I think. A kind of gateway that is able to absorb anything from "some" agent and funnel it into gcontext, the problem is that I don't know how to build this funnel, is where I am stuck, how much should I rely on AI, how much an UI makes sense,"
- 2026-10-27T19:55Z: "I still want to make it easier for the user, I don't believe that this is enough, it also depends on which product we are build tbf, maybe it makes more sense to start w something basic, and make it progressively more well put as we understand the needs"
- 2026-10-27T20:23Z: "it's very important that from the trace viewer I can understand what is the process. And something very important is that we don't hard code it for the first example that we build. We have to make something always general."
- 2026-10-27T20:23Z: "we will do something for a developer, and the UI has to be this. It has to be in the trace viewer in our UI. And we have to be able to understand what is the process, the new sessions appear there. I am not sure how to define it without making it specific though."
- 2026-10-27T20:31Z: "then we leave all the responsibility of connecting to the developer. And with AI, me knows much better how to connect AI agents than them. So I want to guide them in some way to be able to make the their agents connect to our tool. We want to make it easy for them. This is what we are doing. We can do a simple webhook for sure, but they don't know how to connect their agent to the webhook. We have to guide them on how to do so. This is the real challenge."
- 2026-10-27T20:31Z: "I don't want the full version already. I want the minimal version that even this being minimal in our G context, it's specified how their agent works, which type of agent there is, and how it's connected to G context. Some ideas that I've had are for example to have multiple types of gateways, and that in each gateway there is not each gateway, but that they can choose one on another gateway template, and for example, one is for cloud code sessions, another is for chat GPT sessions, another is for another kind of agent."
- 2026-10-27T20:34Z: "when I enter the adapter I just see the sessions, but for me it's not clear how new sessions enter and how to trigger from there the new sessions come. I am not sure if I should make this a more automatic process, put a button there, or how should that happen?"
- 2026-10-27T22:16Z: "when I press pull, where it's defined, what pull does. Now that does you mean me copy a bunch of things and create things from one place to another. Why was that needed? I would prefer if everything can be done from the UI. Like the problem is then now I see the UI, but there is still some magic behind that I don't understand."

What it must not do: hardcode for the first example, price talk, per-piece approvals, negations in files, repeat what is already built.

---

## 2. The story of this period

### 2026-10-24: compare addition methods, keep one accepted run per method

- 19:50Z (dictated): "Continue with the cases I want the you redo the methods of map AI and map code until you find one that it's better than the simple try the drums and if you don't get it come back to me."
- 19:54Z: "Wait before proceeding analyze the problem that we had until now with the fable submission in height effort and suggest that Fable does a plan to be able to improve the advanced mess methods where we compact the handbook."
- 20:22Z: "proceed, one thing when u mean 2usd, it's still everything under the subscription right? I am not really usng antrhopic api key right"
- 20:52Z: "can we remove the plans that have cleary not worked?"
- 20:54Z: "I want to be able to see in a clear manner what is the current value of every method, the one that got the lastest "accepted" method, so that we can iterate on that, this run, the accepted one, will be commited, not like the others, and will be manually accepted by me or AI, not automatic"
- 20:54Z: "let's have a overview.md inside addition-test  that explains what we are doing and the methods we've tried and didn't worked out and why"
- 20:55Z: "can u explain me what is the test that we are doing and what is the acceptance criteria of it, I want to understand it"
- 21:08Z (frustration): "what?? this is not good, on accepted I just wanted the single run that we accept as proof of the method, not the code and not whatever there is now"
- 21:11Z: "now can you explain me the test we are doing and the acceptance criteria?? How are we triggering everything and how can I change the test and try it again ??"

### 2026-10-25 morning: real test cases, a new harness, method exploration

- 06:18Z: replaced the invented Stripe test with two cases from his own work (claim code in metadata, stripe-python .get change). "Let's make a plan. And then I want that do we remove everything from the old test about these stripe seeds. I don't want to know anything about that. And everything are just these two checks."
- 06:48Z: "yes, can you stop talking about API price altogether, we are using ALWAYS the sub, we don't care about price [...] We won't ever use any paid api call of anthropic when testing this, I don't want to see any more time you mention USD cost in api price"
- 07:07Z: "make a conversation of what we've done to continue in a new one w fresh context"
- 07:15Z [paste, handoff written by Claude with his rules]: "There are two cases, both from my own Stripe work". Rules: "Start small. Build only what I ask." "Never delete: move files to ~/.Trash. Use uv for Python. No unit tests. Commit only when I ask." "In this repo, do small work directly. Do not use Codex." "Record each decision in third-iteration/ with its date and my words."
- 07:28Z: "I want an easier method to test it, that is closer to how I see the problem, now it's very difficult to get into the addition test and do changes, I like what it does but the way it's built is a bit too confusing for me."
- 07:28Z: "The goal is not to build something rigid that it's difficult to change, but that the methods have more freeedom to add more things and remove them"
- 07:28Z: "i want that the "input" and "output" of the tests is the same, the input and the handbool, but just this, then the method and everything that happens can be whatever we want, and pls make really nice code and a really nice structure that is easy to add more things and undestand what happens"
- 08:10Z: "ok, I like it better, let's commit and then give me the steps so I can follow it and understand it"
- 08:17Z: ran it himself. Pasted: "folder-index: 1 of 1 cases passed. 13.8 s, 4 tool calls, 27770 tokens" and "simple: 1 of 1 cases passed. 17.3 s, 10 tool calls, 49263 tokens". His comment: "seems like an improvement already"
- 09:11Z: "Ok let's get to it. What are the advantages of folder index method over the simpler one, why do u think it works better. In asd"
- 09:17Z (redirect): "You have the current plan wrong. Now we don't want to iterate on folder index to improve , we are not  building anything. Instead we want to explore which methods there are to structure the information. [...] I want that u propose me different methods to approach this and rate them from 1 to 10"
- 09:22Z: "Can u review this with a fable subagent, find possible improvements or things you missed"
- 09:42Z: "Ok, proceed to do step 1 2 and 3, all using the claude code subscription. Show me the results then of the different methods"
- 10:06Z: "What is full handbook exactly?? And the exact words ? Explain them in asd english"
- 10:10Z: "This are way too sinpler approaches, take a look at what I did in the second iteration, could that work here?"
- 10:13Z and 10:16Z: the "hidden structure" correction and the codification goal (see section 1).
- 10:32Z: "Ok ur recommendation sounda good, let's proceed with this test, use a subagent for it"
  Context: the fact ledger (one line per fact beside each file) became the main bet.
- 10:55Z: "i want that you retry just the fact ledger inproving based on what has failed and ignoring the fact building time, this should already be done"
- 11:02Z: "How do the facts look like related to the info, show me an example"
- 11:04Z: "I like this, can u try to make the example handbook a bit more coplicated so that the fact ledger can shine and see if scaling there can be indeed some improvement"
- 11:31Z (usage at 78 % of the week): "Yes, smaller, just to prove it makes sense the fact ledger"
- 11:43Z: "15 to 20 min is a lot, why so much time"
- 11:45Z: "Ok i dont see the thing working though, is it done"
- 11:54Z: "No, I WANT THat we save this results and that we now explore another method. I remember there was the embeding one and some other right"
- 12:14Z: "Interesting, i think that now that we have some results we can disptach a fable subagent will all this information, and ask it to evaluate it , understand the situation and plan next steps. Should we commit to one solution? To another? Is it worth a mix of some? Some new solutions? Inprove one or two and try again?? Dispatch it and let's see, use fable in high effort mode"
- 12:52Z: "Yes commit and make a full resume of all what you did, a handoff, i want to continue in a new concersation w fresh context. I want that after the compact we know where we are"
- Result of the morning [paste, Claude summary]: fact-embeddings (local embedding model picks the facts, one Claude call, code writes) passed 6 of 6 on Taskpad XL in 9.9 s with 37,700 tokens, against 11.5 s and 107,400 tokens for full-handbook.

### 2026-10-25 afternoon: from test to real use, and the first crash

- 13:22Z: "Whyvdo we need to wait for the reset"
- 13:30Z: "Yes dkl the fixes and no more tests, stop testing the same thing with different paramtwrws. We have to do some progress in the implementation of the method in real life now that we have a possible winning method, let's explorw this then, with my guidance, first the fixes"
- 13:47Z: "You can take a look at what was done in second iteration I believe that some parts can be recovered, there there was a trace-viewer that analyzed session and then proposed them for the capture, which would be the part that now we have with the method fact embeddings. Could it be adapted?"
- 13:53Z: "Not sure, dispatch a fable subagemt to analyse it and propose the best way to build this"
- 14:14Z: "I agree, proceed"
- 15:23Z: "i am not sure if I follow you on where are we"
- 16:10Z: the "biggest question" about the gateway and the rules, and mem0 (see section 1).
- 16:37Z: "WHAT do you build rn?? what are you talking about"
- 16:40Z: "Okay, but then exactly what you're going to build. I don't want that you repeat repeat many stuff, because almost everything is already built, right?"
- 16:50Z: "Just to be sure, this is the runs with the new fact embeddings, right? Because I still see the all the UI and I'm not sure which logic is being done."
- 16:51Z: "it failed. Invalid model result after one correction: Unknown domain candidate for task-identify-bulk-pause-playbook."
- 16:57Z: "Bro can you just fucking fix it and run it when it works? Try to run it and show me then the result. If you need it use a fucking browser automation, I don't care, just run it and show me the result."
- 17:23Z: "why did you choose one that is so big? Like let it run now, but why are u alwys choosing useless examples that take 20 min, can you be more mindful of my time when u do tests"
- 17:25Z: "and after this ends, what will we able to know?"
- 17:26Z: "but is this doing the fact embeddings approach?? like where are we, omg"
- 17:28Z: "should we completely redo the UI then?? like now we have many things, we have from iteration 2 the other methods, which are a bit different plus this new one, I wonder if the UI is prepared to support everyrihng and which changes should we make to adapt it and that we can have a nice flow,"
- 17:31Z: "actually ask a fable subagent that looks at the UI and tries to 1 adapt it 2. cut all the bullshit of second iteration"
- 17:38Z: decision, no per-diff approval (see section 1).
- 18:09Z: "ok give me a handoff for a new conversation and let's add a new handbook onto the viewer to test it, the one of the maat brain would be cool, to recover it but make a handbook now, but in a new conversation, give me the handoff"
- 19:03Z: "What do you mean by pay? Just use a subscription like always"

### 2026-10-25 evening: the Maat brain handbook fails, step back, redo the overview screen

- 20:10Z: "Okay, bro. We have to talk because this is not going well. Before we had the fact embeddings and work very good. We tried from that to do the example with the mad brain, and now we're seeing so many errors. Can we go back one step and try to put the fact embeddings test example into the whole thing, and then let's go forward from there. But let's talk. Don't do it yet. Understand what I'm saying, and let's do something that makes sense."
- 20:12Z [paste, dictated]: two options. "one option that is to recreate one instance with the taskpad Excel and then have possible fake contributions" and "the other option which is interesting, and this is to try to know why this case of the Madbrain failed. Because in the MadBrain we have a real session, and we then also have the real process and the output." He took both, in two conversations.
- 20:17Z (session e8ef88a2, Maat brain): "hey we did the deploy of this resume session last week, can u check if it's better now the results?"
  Context: a "report" tool in the Maat brain that records intent, summary, and status per session.
- 20:25Z: "I forget what this conversation are about [...] Now I have pulled more conversations from the maat brain from this week and this is how they look like, I think that with the intent and summary will be easier to understand for me."
- 20:33Z: "no, a conversation from me, bernat sampera"
- 20:34Z: "I can't work like this, let's do something, give me a prompt to redo the overview screen of the session in a new conversation."
- 20:36Z: "JUST INVESTIGATE AND UNDERSTATE, DO NOT BUILD NOTHING YET"
- 20:40Z: "ok, try to generate 3 differents version, the more different the better, and I'll guide you after that to which is better. Be very creative, not basic"
- 20:45Z: "bro, show them in an html following the same style of the page. Build the UI using mocks in a static html so I can switch between the options and choose the one I like"
- 21:02Z: "mmmmm not really, now the capture is most about "what were the conversation about, which tbf I instructed it that this was missing" but really what I am interested is "which context was missing that now has been found""
- 21:19Z: "The description is quite good" / "the reasons for the ban show be more clear that they are ban reasons, maybe some icon or something. The hour can be deleted from this overview ui, it's not relevant" / "can you do two versions more that following the side by side are quite different, they show the things in a idfferent manner, the more creative the better. I want to see if there is worth saving from them"
- 21:35Z: "Now I like it, I stick with option A btw"
- 21:56Z: the "too much info" remark (see section 1).

### 2026-10-25 night to 2026-10-26: the overnight loop, 8 iterations

- 22:12Z: "we are working on @third-iteration/ , we have made some good progress, and right now I will go to sleep, but I want to leave a job running until there is no more claude code usage, as it resets tomorrow (6am tallinn) . I wonder which is the best job that I could leave so that it investigates or plans something so that I can find it done and w hopefully some progress tomorrow, what do u think? show me different options and I will pick"
- 22:23Z: "would be cool if in general you try to improve the fact embeddings method and try to find some things that are better. Try to improve the times. Be mindful when you test. If you test always with the Excel, it doesn't make much sense. Maybe it's better to think of a case and to think what do you want to test with a small one? And maybe just at the end, test with the Excel."
- 22:23Z: "use this conversation as the orchestrator, and just dispatch other agents all the time to do the work. And in this one, you keep working and working until there is no more usage left. [...] even if you find the solution that is good, you analyze it what can be improved, you can dispatch a favorable supervision to propose a new plan, to analyze what went wrong, and then you keep always iterating until usage is completed"
- 22:25Z: "wait, before we start, let's do a commit now, then proceed already with the investigation. also another thing create a folder called overnight-task/ and add a iteration-1.md . There you will put everything that you do ## idea ## implementaion ## result ## next-proposal and so on for each one. PROCEEd"
- Night result [paste, Claude summary]: 8 iterations (grouped addition, refusal of empty operations, fallback, ledger update by diff, effort flag with no effect, a "covers" check, sentence verdicts reverted, facts derived by code). The loop stopped after iteration 8 and did not reach the usage limit. One open fault: in a large group the model drops the qualifier "old and new".
- 2026-10-26T08:50Z: "ok, can you make a resume in ASD-STE100 Simplified Technical English (STE) of the 8 iterations done, wht has been done? what have we achieved?"
- 08:53Z: "this is a bit difficult to understand, can you make an html where this is explained in a more visual way"
- 08:58Z: "it's still very dense, like I barely understand the fact embeddings process. Let's do this, can you explain me the different methods attempted, I think that there were the "simple", "full handbook", "facts-ids", embedinngs, fact embeddings (before overnight) , fact embeddings (after overnight). Is this so? Do a brief explanation first of them, very brief, then I will isntruct what to do"
- 09:02Z: "I would like to understand all of them better in a visual way in html, but it has to be properly explained, the current html of just the overnight work was very bad, very confusing"
- 09:10Z: "it's not bad but can you make it more oppinionated, and the design is bad, I want it more minimal, can u actually use the ui ux pro skill for this, the goal is to increase readability and undestand the concepts"
- 09:37Z: "now you are just explaining the fact-embeddings, is this the same for all, what I want to understand is the principples of way b, how did we get there, what is the critical change from way a to way b. not really an example of those"
  Context: way A, the model searches and edits with tools. Way B, code finds and writes, the model only decides.
- 11:39Z: "but how tdoes the model do the "search" , what is this "a model finds only the words that it thinks of" , explain it here, I don't get ti"
- 11:45Z: "one thing, it's incredible how badly explained it is, I don't even have words to communicate to you HOW bad the job done is, like this html it's completely useless, not because the information is bad, but because the way to explain it is completely unentilligible. pls, transform this so it looks like a piece of work understandble by the default tech bro. send it to a fable subagent so he can redo it"
- 19:47Z: "now we made overnight the 8 iterations, are the method developed from there already used in the trace-viewer? It's already the default method of doing the search?? Where do we have actually the code for the method in the repo?"
- 19:50Z: "can we  try to make the fix work fast, I like that we get the method to be much faster but I am not sure what is failing. Also I am not so sure what were the 8 iterations and what is failing"
- 20:37Z (decision to close): "I would prefer not to, I just want to pull whatever work we have done in the overnight task and leave it done. I want to close this as soon as possible and merge this with the rest. It's possible that in the future we improve this further. But for now, if it's possible, I want to stop here. If there is something small that can be done and can be solved now, let's do it. But if not not."
- 21:13Z: "let's reset this conversation on making the clear steps to move forward, give me a prompt to analyze where we are and how to continue with the third iteration, also, pls put the things of the overnigh task somewhere else, like this they are occupying mane space, same with all the files of the third iteration, I think this deserves some cleanup or something, do this before the prompt, I trust u"

### 2026-10-27: the intake contract for the Maat trial, plans A, E, and F

- 19:51Z: "I am trying to do this, before we start, let's approach which method should we approach to solve this, because I don't want to start building bullshit and then see that it wasn't needed, I want that you act as a sparring partner, brief and quick responses, not someone that thinks, if you have to think I will isntruct you to spawn a subagent and that the thinking happens there w the right context."
- 19:51Z [paste, handoff]: "The Maat trial is already in progress. Bernat uses gcontext and reports problems. This setup discussion came from his concern that session intake depends too much on fixed code." and "I built a basic screen too early."
- 19:53Z to 20:31Z: the "AI era" and "guide them" statements (see section 1).
- 20:32Z: "I think that you are going way too fast, man. First we need to think how do we do it for the mat trial. And then we see how we proceed from them. We don't start the templates, chill a bit"
- 20:39Z: "I don't think u are being serious, u are just accepting everywhere I tell u without giving it any though and doing pushback or trying to understand what is my overall vision and what I need. Can you try to make a resumre of my problem and what I've told u that I need and spawn a fable agent to ask for it. Fable should provide different options and rate them from 1-10, then I wille valuate which one fits what I have in mind. Feel free that the fable agents put constrains or tell me if I'm wrong somewhere"
- 20:49Z: "ok, sounds good, can you ask again the same fable agnet that it makes a plan for Both A and E, one after the other, then when the plan is detailed enough, trigger two opus 5.5 subagents, one after the other, to implement both A and E, afterwards show me how it works and how I can test it"
  Context: A = a gateway declaration file beside each session source, shown in the viewer. E = the developer's own coding agent as the setup guide (a /gcontext-setup command).
- 21:52Z: "of the tests, can u give me the exact commands, I created 1, but now at two I have to copy smething, give me the whole command always"
- 22:02Z: he ran "/gcontext-setup maat-brain-handbook. The agent is the Maat brain; its code is in uses/maat-brain and adapters/brain."
- 22:04Z: "Also, what I am testing here exactly, because I still don't see how I pull or what I am testing. I understood the UI, ok cool, but what else now??"
- 22:13Z: "I've done it and it has worked"
- 22:16Z: the "magic behind" complaint (see section 1). This led to plan F: what you read is what runs, the pull is a visible list of steps in the declaration.
- 22:24Z: "yes, tailnet happens outside, is a requirements that can be notted but not part of the pull, proceed with the plan with fable and implementation yes"

---

## 3. How he works with AI day to day

Tools and setup

- Claude Code on the subscription, never the API. 2026-10-24T20:22Z: "it's still everything under the subscription right? I am not really usng antrhopic api key right". 2026-10-25T19:03Z: "What do you mean by pay? Just use a subscription like always"
- Two machines: a Mac and a home server ("casaserver"). 2026-10-25T15:26Z: "can u pull the facts and other files from casaserver?"
- A browser automation connection he keeps in his own agent folder. 2026-10-25T17:06Z: "you can use /Users/bsampera/Documents/bernat-agent/connections/chrome-cdp"
- Claude Code slash commands of his own (/gcontext-setup). A command "/mcp__gcontext-agent__run" appears at about 07:00, 12:00, and 17:00 on 2026-10-25, 26, and 27 [paraphrase: looks like a scheduled gcontext job that runs three times a day].
- Codex is not used in this repo. 2026-10-25T07:15Z [paste, his rule]: "In this repo, do small work directly. Do not use Codex." Later [paste, 2026-10-26 summary]: "build with Opus subagents (the prompt must forbid Codex), not Codex."
- Skills: 2026-10-26T09:10Z: "can u actually use the ui ux pro skill for this"

Subagents, by role

- Fable at high effort for thinking, planning, review, and evaluation. 2026-10-25T07:28Z: "Spawn a fable agent in high efffort and let it think a bit to propose me a new setup to run this tests." 2026-10-25T09:22Z: "Can u review this with a fable subagent, find possible improvements or things you missed". 2026-10-25T12:14Z: "Dispatch it and let's see, use fable in high effort mode"
- Fable gives options with scores and pushback. 2026-10-27T20:39Z: "Fable should provide different options and rate them from 1-10 [...] Feel free that the fable agents put constrains or tell me if I'm wrong somewhere"
- Opus subagents build after the plan. 2026-10-27T20:49Z: "when the plan is detailed enough, trigger two opus 5.5 subagents, one after the other, to implement both A and E, afterwards show me how it works and how I can test it"
- The main conversation as orchestrator, not thinker. 2026-10-25T22:23Z: "use this conversation as the orchestrator, and just dispatch other agents all the time to do the work". 2026-10-27T19:51Z: "I want that you act as a sparring partner, brief and quick responses, not someone that thinks, if you have to think I will isntruct you to spawn a subagent and that the thinking happens there w the right context."
- An overnight loop: builder, then reviewer, then builder, until the usage runs out. 2026-10-25T22:23Z: "you keep working and working until there is no more usage left [...] you can dispatch a favorable supervision to propose a new plan, to analyze what went wrong, and then you keep always iterating until usage is completed"

Habits

- Handoffs between conversations, and a reset when context is full. 2026-10-25T07:07Z: "make a conversation of what we've done to continue in a new one w fresh context". 2026-10-25T12:52Z: "I want that after the compact we know where we are". 2026-10-26T21:13Z: "give me a prompt to analyze where we are and how to continue"
- Prompts for a new conversation, written by Claude, pasted by him. Many of his messages start with a pasted handoff, then a short order (2026-10-25T20:16Z, 20:36Z, 2026-10-27T19:51Z).
- Decisions are recorded with date and his words. 2026-10-25T07:15Z [paste, his rule]: "Record each decision in third-iteration/ with its date and my words. Say which vision line a plan or a test serves."
- One accepted run per method, chosen by hand, committed. 2026-10-24T20:54Z: "the accepted one, will be commited, not like the others, and will be manually accepted by me or AI, not automatic"
- Log each iteration with a fixed structure. 2026-10-25T22:25Z: "## idea ## implementaion ## result ## next-proposal and so on for each one."
- Commit before a risky run. 2026-10-25T22:25Z: "wait, before we start, let's do a commit now, then proceed already with the investigation."
- He wants to understand before he approves. 2026-10-24T21:11Z: "can you explain me the test we are doing and the acceptance criteria?? How are we triggering everything and how can I change the test and try it again ??" 2026-10-25T08:10Z: "give me the steps so I can follow it and understand it"
- Asks for explanations in Simplified Technical English. 2026-10-25T09:11Z: "In asd". 2026-10-25T10:06Z: "Explain them in asd english"
- Visual explanations as HTML, minimal, opinionated. 2026-10-26T09:10Z: "make it more oppinionated, and the design is bad, I want it more minimal"
- UI choices by static HTML mocks that he can switch between. 2026-10-25T20:45Z: "Build the UI using mocks in a static html so I can switch between the options and choose the one I like"
- Talk first, build later. 2026-10-25T20:10Z: "But let's talk. Don't do it yet." 2026-10-25T20:36Z: "JUST INVESTIGATE AND UNDERSTATE, DO NOT BUILD NOTHING YET"
- Wants the full command, every time. 2026-10-27T21:52Z: "give me the whole command always"
- Runs things himself and reports back. 2026-10-25T08:17Z: "I've just done a run with those results". 2026-10-25T15:29Z: "I've run npm run gateway -- accept third-iteration". 2026-10-27T22:13Z: "I've done it and it has worked"

What he delegates and what he keeps

- Delegates: plans, research, reviews, code, UI mocks, overnight iteration.
- Keeps: the test cases (from his own work), the acceptance of a run, the choice between options ("I stick with option A"), the direction of the product, the rules of the handbook, when to stop. 2026-10-26T20:37Z: "I want to stop here."

How he tests

- Measures: accuracy and speed only. 2026-10-25T06:48Z: "just speed ( tool calls used and time to make changes, total number of tokens ) and accuracy ( the changes are what we expect )"
- Same input and output for every method, the method is free. 2026-10-25T07:28Z: "the "input" and "output" of the tests is the same, the input and the handbool, but just this, then the method and everything that happens can be whatever we want"
- Small cases first, the big handbook at the end. 2026-10-25T22:23Z: "If you test always with the Excel, it doesn't make much sense. Maybe it's better to think of a case and to think what do you want to test with a small one? And maybe just at the end, test with the Excel."
- Respect his time. 2026-10-25T17:23Z: "why are u alwys choosing useless examples that take 20 min, can you be more mindful of my time when u do tests"
- No endless parameter sweeps. 2026-10-25T13:30Z: "stop testing the same thing with different paramtwrws"
- A known example through the whole flow to locate a fault. 2026-10-25T20:16Z [paste, his prompt]: "A wrong result then shows which part fails: the extraction (a wrong piece) or the viewer and gateway code (a right piece, but a wrong change)."
- Real sessions over fake ones when he can. 2026-10-25T20:12Z [paste, dictated]: "in the MadBrain we have a real session, and we then also have the real process and the output."

---

## 4. Opinions about AI and agents

- 2026-10-27T19:53Z: "we are in the AI era, if I want that people use my product, i have to also provide an easy way for them to connect to it."
- 2026-10-27T20:31Z: "with AI, me knows much better how to connect AI agents than them. So I want to guide them in some way to be able to make the their agents connect to our tool."
- 2026-10-27T20:31Z: "We can do a simple webhook for sure, but they don't know how to connect their agent to the webhook. We have to guide them on how to do so. This is the real challenge."
- 2026-10-25T21:56Z: "It's a problem if this context files have too much info, because then AI wastes a lot of tokens  each time needs to undeerstand somehting, so keeping it trim is a need"
- 2026-10-25T20:25Z: "for me is difficult to understand then if something should be saved or not, maybe this means that it's also tricky for the AI to understand"
- 2026-10-25T09:17Z: "(Obviously never hardcoded and with a method that can scale)"
- 2026-10-27T20:23Z: "we don't hard code it for the first example that we build. We have to make something always general."
- 2026-10-25T22:07Z: "it's a bit dumb to put a negation in a file, don't you think. Like should we negate everything that it doesn't do, I don't think is a good principle"
- 2026-10-25T17:38Z: "that step decides what is kept and not, after that step everything should be right, if now we think that there are some thing that are not right so we improve the extraction step."
  Context: fix the step that decides, do not add a human approval per piece.
- 2026-10-27T22:16Z: "I would prefer if everything can be done from the UI. Like the problem is then now I see the UI, but there is still some magic behind that I don't understand."
- 2026-10-27T19:51Z: "I don't want to start building bullshit and then see that it wasn't needed"
- 2026-10-27T20:39Z (what he rejects in an assistant): "u are just accepting everywhere I tell u without giving it any though and doing pushback or trying to understand what is my overall vision and what I need."
- 2026-10-25T16:40Z: "I don't want that you repeat repeat many stuff, because almost everything is already built, right?"
- 2026-10-25T13:30Z: "stop testing the same thing with different paramtwrws. We have to do some progress in the implementation of the method in real life"
- 2026-10-26T11:45Z (on an AI-written explainer): "it's completely useless, not because the information is bad, but because the way to explain it is completely unentilligible."
- 2026-10-25T07:28Z: "The goal is not to build something rigid that it's difficult to change"
- 2026-10-27T19:55Z: "maybe it makes more sense to start w something basic, and make it progressively more well put as we understand the needs"

---

## 5. About Bernat

- Name as he writes it: 2026-10-25T20:33Z: "no, a conversation from me, bernat sampera"
- Works at MAAT. He runs the "Maat brain" (an MCP server that staff agents call) and tests gcontext on it. 2026-10-25T20:25Z: "Now I have pulled more conversations from the maat brain from this week". 2026-10-27T20:32Z: "First we need to think how do we do it for the mat trial." 2026-10-25T20:17Z: "hey we did the deploy of this resume session last week, can u check if it's better now the results?" [paraphrase: a per-session report tool (intent, summary, status) shipped in the Maat brain the week before]
- 2026-10-27T19:51Z [paste]: "The Maat trial is already in progress. Bernat uses gcontext and reports problems."
- His own Stripe work gave the test cases. 2026-10-25T07:15Z [paste]: "There are two cases, both from my own Stripe work". The dictated story at 2026-10-25T06:18Z about the stripe-python .get change.
- He built a second iteration before this one, with a trace viewer that analysed sessions. 2026-10-25T10:10Z: "take a look at what I did in the second iteration". 2026-10-25T13:47Z: "there there was a trace-viewer that analyzed session and then proposed them for the capture"
- He used index.md and llms.txt files as agent guides before. 2026-10-25T06:40Z.
- Works on Tallinn time. 2026-10-25T22:12Z: "it resets tomorrow (6am tallinn)"
- Has a home server named casaserver and works from a Mac too. 2026-10-25T15:26Z, 2026-10-25T20:16Z [paste]: "Check casaserver (ssh bernat@casaserver, ...)"
- Writes and asks in ASD-STE100 Simplified Technical English; wants the product UI in plain words.
- Describes his audience for the explainer: 2026-10-26T11:45Z: "a piece of work understandble by the default tech bro"
- Private topics seen: none beyond work. (A personal email address appears inside a pasted tool instruction; not recorded.)

---

## 6. Voice

Verbatim, with his spelling.

1. 2026-10-24T20:22Z: "proceed, one thing when u mean 2usd, it's still everything under the subscription right? I am not really usng antrhopic api key right"
2. 2026-10-24T20:52Z: "can we remove the plans that have cleary not worked?"
3. 2026-10-24T21:08Z: "what?? this is not good, on accepted I just wanted the single run that we accept as proof of the method"
4. 2026-10-25T07:28Z: "pls make really nice code and a really nice structure that is easy to add more things and undestand what happens"
5. 2026-10-25T08:17Z: "seems like an improvement already"
6. 2026-10-25T09:11Z: "Ok let's get to it. What are the advantages of folder index method over the simpler one, why do u think it works better. In asd"
7. 2026-10-25T10:10Z: "This are way too sinpler approaches, take a look at what I did in the second iteration, could that work here?"
8. 2026-10-25T10:16Z: "This type of codification is what I am trying to test, I am a bit blind here"
9. 2026-10-25T11:43Z: "15 to 20 min is a lot, why so much time"
10. 2026-10-25T11:54Z: "No, I WANT THat we save this results and that we now explore another method."
11. 2026-10-25T13:30Z: "Yes dkl the fixes and no more tests, stop testing the same thing with different paramtwrws."
12. 2026-10-25T15:23Z: "i am not sure if I follow you on where are we"
13. 2026-10-25T16:37Z: "WHAT do you build rn?? what are you talking about"
14. 2026-10-25T16:57Z: "Bro can you just fucking fix it and run it when it works?"
15. 2026-10-25T17:26Z: "but is this doing the fact embeddings approach?? like where are we, omg"
16. 2026-10-25T17:31Z: "cut all the bullshit of second iteration"
17. 2026-10-25T20:10Z: "Okay, bro. We have to talk because this is not going well."
18. 2026-10-25T20:34Z: "I can't work like this, let's do something"
19. 2026-10-25T20:40Z: "Be very creative, not basic"
20. 2026-10-25T21:35Z: "Now I like it, I stick with option A btw"
21. 2026-10-25T22:25Z: "PROCEEd"
22. 2026-10-26T08:58Z: "it's still very dense, like I barely understand the fact embeddings process."
23. 2026-10-26T11:39Z: "explain it here, I don't get ti"
24. 2026-10-26T20:37Z: "If there is something small that can be done and can be solved now, let's do it. But if not not."
25. 2026-10-26T21:13Z: "I think this deserves some cleanup or something, do this before the prompt, I trust u"
26. 2026-10-27T20:32Z: "I think that you are going way too fast, man. [...] We don't start the templates, chill a bit"
27. 2026-10-27T22:04Z: "I understood the UI, ok cool, but what else now??"

Patterns: "u" for you, "w" for with, "pls", "tbf", "btw", "rn", "bro", "man", capitals for stress (INTENT, CONTEXT, WHAT), double question marks, dictation runs with no punctuation, swearing when a run fails, "let's talk" before a change of course, "I trust u" when he hands over cleanup.

---

## 7. Facts to check

- 2026-10-24T20:22Z: Claude mentioned "2usd" for a test run. He questioned it, and from 2026-10-25T06:48Z all price talk was banned.
- 2026-10-25T08:17Z (his paste of his own run): folder-index 13.8 s, 4 tool calls, 27,770 tokens; simple 17.3 s, 10 tool calls, 49,263 tokens. One run of one case.
- 2026-10-25T07:15Z [paste, handoff by Claude]: 3 runs each. simple 6 of 6, 40.6 s per run, 10.8 tool calls, 49,226 tokens; folder-index 6 of 6, 33.0 s, 6.3 tool calls, 39,574 tokens. "folder-index is 19% faster, with 42% fewer tool calls and 20% fewer tokens." Handbook Taskpad, 18 files.
- 2026-10-25T06:40Z [paste]: the .get error comes from stripe-python v15 (installed 15.3.1), StripeObject no longer inherits from dict.
- 2026-10-25T11:31Z [paste, Claude summary]: his weekly Claude usage was at 78 % when he asked for a smaller test.
- 2026-10-25T13:10Z [Claude summary, accepted by him]: fact-embeddings 6 of 6 on Taskpad XL (300 files) in 9.9 s with 37,700 tokens; full-handbook 11.5 s and 107,400 tokens. Taskpad L has 87 files.
- 2026-10-25T11:43Z: a ledger build was quoted at "15 to 20 min". 2026-10-25T17:23Z: a capture example "take 20 min".
- 2026-10-25T20:17Z: "we did the deploy of this resume session last week" (the Maat brain report tool; the paste says merged 2026-10-20).
- 2026-10-25T22:12Z: Claude Code usage "resets tomorrow (6am tallinn)".
- 2026-10-26T08:50Z: "the 8 iterations done" overnight. [paste]: the loop stopped after iteration 8 and did not reach the usage limit.
- 2026-10-26T08:58Z: his list of methods: "simple", "full handbook", "facts-ids", embeddings, fact embeddings (before overnight), fact embeddings (after overnight).
- 2026-10-26 [paste, Claude summary of the night]: 10 calls to 2 calls per session; ledger rebuild 271 s to 10 s; model time 33.5 s to 26.3 s on XL; each claude -p start about 1.8 s; model time about 6.5 ms per output token; no prompt cache reuse.
- 2026-10-27T20:49Z: "two opus 5.5 subagents" (model name as he wrote it).
- 2026-10-27T22:02Z: the /gcontext-setup command on the Maat brain handbook ran and "has worked" (22:13Z).

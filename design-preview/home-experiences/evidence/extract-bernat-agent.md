# Extract: Bernat's own words from the bernat-agent sessions

Source: scratchpad/mine/bernat-agent.md (314 messages, 2026-09-06 to 2026-10-29).
Quotes are verbatim and trimmed, typos kept. Timestamps are UTC.
[paste] = text he pasted or had Claude draft for him. [paraphrase] = my wording.
Private matters are not recorded. Where one appears, the line says "private topic: <word>".

Private topics met in this log (no content recorded): money (2026-10-06, 2026-10-19, 2026-10-25), tax (2026-10-15, 2026-10-20, 2026-10-21), equity and legal (2026-10-21), relocation and house search (2026-10-06, 2026-10-20, 2026-10-21, 2026-10-25, 2026-10-29), car and insurance (2026-10-19, 2026-10-25, 2026-10-29), crisis plans (2026-10-25), family (2026-10-19, 2026-10-25), expenses (2026-10-19), accommodation address (2026-10-01 to 2026-10-18).

## 1. About Bernat

Role and work
- "I am an employer of the spanish company of MAAT which is part of the UK company, also I have a estonian company" (2026-10-21 05:21Z). Note: he writes "employer"; the context shows he means employee. Rest of the message: private topic: tax.
- "For now I am at MAAT and want to stay working here" (2026-10-21 07:28Z). Rest of the message: private topic: relocation.
- "I joined pretty early the company" (2026-10-21 07:20Z). Context: MAAT. Rest: private topic: equity.
- "I worked for 5 months as a contractor" (2026-10-21 12:30Z). Context: before his MAAT employment started. Rest: private topic: equity.
- "using @connections/chrome-cdp/ for maat, can u do this" (2026-10-19 13:15Z). Context: he uses his agent's browser connection for MAAT admin tasks. The pasted text: private topic: expenses.

Background, languages, location
- "I am from spain and I am staying there for a month" (2026-10-01 08:37Z). Context: Tallinn, October 2026.
- "Ok, now next week I go to Estonia @modules/nomad-europe/26-10-tallin/ and I am preparing everything" (2026-10-01 08:37Z)
- "I have this plan of being nomad for while @modules/nomad-europe/" (2026-10-19 07:15Z)
- "I'm in Dot cafe, I want to go in another one i two hours" (2026-10-06 08:17Z)
- "I know that in munich for example I can go to 3-4 university libraries" (2026-10-05 19:50Z)
- "when I was in munich I had the option to go to tum library which is open from 06 to 12 everyday, including feiertage" (2026-10-09 16:40Z). Context: he lived in Munich before.
- "regarding @modules/nomad-europe/ I am thnking I would like to live for a bit in Munich, 2 months" (2026-10-20 08:38Z)
- "i can speak german" (2026-10-25 08:26Z)
- "hey, I am trying to learn estonian" (2026-10-13 22:24Z)
- "i want to go to a bjj gym 3 times per week though" (2026-10-05 09:49Z)
- "being 30 years old" [paste] (2026-10-25 07:14Z). Context: a dictated text about a new module. Rest of the paste: private topic: crisis.

Machines and projects he names
- "I have another computer casaserver, can I set it up there" (2026-10-07 21:20Z). casaserver is his home server (Ubuntu, reached over Tailscale).
- "give me some stats for my hetznet vps @connections/hetzner-vps/index.md" (2026-09-15 14:27Z)
- "hey my vps is at the limit of space I think." (2026-10-06 08:01Z). The pasted warning names the bjjgym VPS. [paste]
- "my mac is pretty strong" (2026-10-13 22:24Z)
- "/Users/bsampera/Documents/bleak-dev/gcontext-framework  my goal is to have this session 01a11d2b-cd68-77f2-bd26-be40aee9837e in there and continue it from there" (2026-10-10 06:42Z). gcontext-framework is the project he moves between the Mac and the server.
- "ok, then I want to test it in a neew project, /Users/bsampera/Documents/projects/diversity-map" (2026-10-10 20:56Z)
- A tool notification (not his words) shows a "website bjjgym" deployment queued through Coolify on 2026-09-06 21:14Z.
- Session titles in his pasted terminal output name "Gcontext plugin for SEO agent" and "Gcontext SEO agent test bed" [paste] (2026-10-18 11:57Z).
- "right now I am using orca, another ide" (2026-10-10 06:35Z); "from the mac here in orca (the ide I use)" (2026-10-18 11:57Z)

## 2. What he builds for himself: the personal agent

Shape of the agent [paraphrase]: a repo called bernat-agent with modules (mac-disk-space, nomad-europe with a Tallinn trip folder and a cafes folder, herdr-remote, later renamed remote-agents) and connections (hetzner-vps, casaserver, chrome-cdp). Modules hold the context so a later session can pick up where an older one stopped. Two further modules are private topic: tax and private topic: crisis.

The agent holds his context
- "I believe that my mac is pretty near to the limit of space on disk, can u check where can it be saved, we already did this in other ocacion, @modules/mac-disk-space/index.md" (2026-09-06 17:47Z)
- "ok, let's create a module inside bernat-agent that has all the information on my setup with herdr + mosh and knows all the necessary context to be able to deal with it, also add a hedrd-commands.md where you show different tables with beginner friendly commands like this." (2026-10-10 07:00Z)
- "The purpose of the module is to save all the information of herdr and how to connect to casaserver in one place so we can recover it" (2026-10-10 07:00Z)
- "ok, this works good, can you update now @modules/herdr-remote/ . Use another name, and make a very detailed guide of everthing we've done, REMOVE all the files that there are there and start from scratch, be concise!!" (2026-10-10 21:44Z)
- "ok, can we do an an update on @modules/remote-agents/README.md of the current state of this feature and then do a commit, update the context so it's up to date with what we have now, remove all the old things that you consider can be removed" (2026-10-25 06:21Z)
- "actually create a new folder inside the tallin trip folder that is about cafes, I will write there what I've though of each cafe" (2026-10-05 19:56Z)
- "can you maybe make some kind of map of the coffees available, so I can quickly ask you, ok I am here, where can I go then, also libraries and other places to work" (2026-10-05 20:23Z)
- "works, saved what we've done w proper organisation, now it looks messy inside cafes" (2026-10-05 20:38Z)
- "Take a look it @modules/ to understand my situation" (2026-10-25 06:59Z). Rest: private topic: car.
- "I want to create a new module, what is the goal of it?" (2026-10-25 07:14Z). The module itself: private topic: crisis.

The remote-agents tool: move a coding session between the Mac, the home server, and the phone
- "what is "herdr + moshi" in terms of AI development" (2026-10-06 19:46Z)
- "can we try to set it up from here also, I want to be able to access on the same session from both here and my phone, I want to log in there to codex from here" (2026-10-10 06:31Z)
- "I think it would be better if I start trying  one  project that I choose I use herdr , but always herdr, I don't use orca or the workspace in the laptop, this way my laptop and my phone see the same, and I don't have to think in which workspace I am working right now, does it make sense" (2026-10-10 06:38Z)
- "I would like to actually develop a whole flow, on my mac, so I can both push sessions on the hedrd server and then get them back, because for example now I want to do some change here and then when I go outside I want to be able to code with herdr u know" (2026-10-10 11:13Z)
- "I need a tool that is able to push a sesssion from 0 or update the current one, and same with pulling." (2026-10-10 11:13Z)
- "can we do this with a single command, this whole files w git, I like this more, but for me is very important to be able to do this in a single command. also would be better if it doesn't force me to commit, that I can just transfer" (2026-10-10 13:06Z)
- "I am working on mac and I want to move to work on the phone and close my mac" (2026-10-10 20:14Z)
- "I don't want to have to care about closing a chat, and one thing, now if I do changes with my phone how do I pull them back then from the mac, what is the flow" (2026-10-10 20:46Z)
- "I want that show just shows the ACTIVE session that have not BEEN pulled yet!!" (2026-10-10 22:09Z)
- "ok, good, now I want to start planning the option to make it work with claude code and pi also" (2026-10-12 13:28Z)
- "a lot of times the problem I have is that a task is already running and I have to do something else, now with the current solution I can stop it, push it to casaserver and then trigger the prompt in casaerver" (2026-10-16 21:33Z)
- "I want that is much faster that when I am working on a session I can simply say from another terminal (this is ok) , send-to-server , and instanlty (now I have to wait 20+ seconds ) appears the list of sessions , it shows those that are active and those that not, then I can select the one that I want like now, and if one is active in the current laptop it is able to stop on the laptop and continue automatically from the casaserver, this should also work if there are subagnets involved." (2026-10-16 21:33Z)
- "It has to be automatic, I dn't want to have to worry about it" (2026-10-16 21:33Z)
- "one thing, it would be cool if after sending the agent to the server a log is shown of how to connect directly from the mac to the server, so that I can either trigger a command or somethign" (2026-10-17 21:44Z)
- "I think that sometimes I may forget a run in the server, I wonder what is the best way to delete it, can I do it directly from the moble phone? Is it completely deleted then?" (2026-10-18 11:57Z)
- "I would like to have a command that would be for cleanup those things and would mark in red those runs that are more than 24 h ago" (2026-10-18 12:05Z)
- "this happened because this session created some branches and worktrees there I think, and then the pull-from-server didn't pull it, this is a problem, is there a solution for it" (2026-10-18 12:09Z)

Small personal tools
- "I want a simple place from the terminal that I can say "et hello, good morning" and et is the command that translates the phrase from english to estonia, then there is also tettranslate ) estonian, that translates from estonian to english." (2026-10-13 22:24Z)
- "I would like that this runs with ollama locally, my mac is pretty strong, I wonder if there is online any ollama model or open weight for translating from estonian to english" (2026-10-13 22:24Z)
- "remove also translategemma:12b and the local et and tet commands, remove it completely" (2026-10-23 14:11Z). Context: he dropped the tool ten days later.
- "prune, but also can we have a cron that prunes everything each day orr so, or just not keep old docker images" (2026-10-06 08:07Z). Context: Docker cache on the bjjgym VPS.
- "Is it running smoothly, make it look cool." (2026-09-15 14:27Z). Context: VPS stats page.

## 3. How he works with AI day to day

Tools named in his own words: Claude Code, Codex (in the Orca IDE), Pi coding agent, Opus subagents, Ollama local models (Qwen 27B, Gemma, translategemma), a chrome-cdp browser connection, Tailscale, tmux, Termius, Paseo, Herdr and Moshi (tried, then dropped), getbb (looked at), AeroSpace window manager, scrawl, Coolify on a Hetzner VPS, the home server casaserver. [paraphrase]

Delegation and who does what
- "(Don't send work to codex btw, stick it here into opus 5.5 subagents)" (2026-10-17 06:52Z)
- "create a prompt to do investigate and then do this in a new conversation, give me the prompt" (2026-10-12 13:29Z)
- "Delegate big coding to Codex through the codex-first skill. You design, review and test. Run workers yourself." [paste] (2026-10-12 13:36Z). Context: a work order Claude drafted at his request; the rules mirror his CLAUDE.md.
- "Never git add, commit or push in bernat-agent unless I ask." [paste] (2026-10-12 13:36Z)
- "If a gate fails after honest attempts, stop and report the exact error. Do not weaken a check." [paste] (2026-10-12 13:36Z)
- "Do not delete or change real chats, real projects, or real ~/.codex, ~/.claude, ~/.pi content. Tests use throwaway folders." [paste] (2026-10-12 13:36Z)
- "ask me before any global change that is not an install under the bernat user" [paste] (2026-10-12 13:36Z)
- "never print or copy secrets into chat or files" [paste] (2026-10-12 13:36Z)
- "check if the worker is done" (2026-10-10 11:37Z)
- "I've made a anew plan to improve the current setup, it's this, file:///Users/bsampera/Documents/bernat-agent/modules/herdr-remote/handoff-plan.packed.html , can u review it" (2026-10-10 13:02Z). Context: he writes plans as HTML pages and asks for review before build.
- "show me how to use this now, tell me what u have done first in ASD-STE100 Simplified Technical English (STE)" (2026-10-10 12:24Z)
- "i allow u to delete files" (2026-10-10 12:21Z)
- "leave it configured forever pls" (2026-10-10 09:40Z)
- "also another thing that doesn't work so good yet is the bypass  permissions, I have it turned on in my laptop but on casaserver it asks me for EVERY single thing, fix it" (2026-10-17 13:36Z)
- "do not put it in a plan, we are just talking. CHILLL" (2026-10-19 10:53Z)
- "ok, save the resaerch now" (2026-10-20 08:37Z). Context: he talks first, then asks to save.
- "can we do some commits of all the changes in bernat-agent" (2026-10-01 08:33Z); "ok, do commits now" (2026-10-25 06:56Z)

Testing habits
- "No unit tests: only end to end acceptance in acceptance.sh, with a report artifact." [paste] (2026-10-12 13:36Z)
- "I want to test it, can u help me do a test with it and check that it works fine" (2026-10-10 18:37Z); "make it w this project, /Users/bsampera/Documents/bleak-dev/gcontext-framework" (2026-10-10 18:41Z)
- "ok keep paseo, I am doing a real test and so far looks good, u created lots of dummy tests, u can remove them" (2026-10-17 13:23Z)
- "bro sjut up about acceptance suit, just remove it, I don't want for a project like this" (2026-10-17 21:48Z)
- "bros top with e2e," (2026-10-10 12:12Z). Context: he stopped a Codex worker that built a large E2E suite for a small sync script.

Choosing tools
- "from which terminal do u recommend me to run ssh -t bernat@100.81.74.79 herdr , like I've been using orca for this stuff right now but I am not sure it's the best one, which one people tend to use on mac to run herdr" (2026-10-10 06:47Z)
- "I saw one guy that typed this, ... is this a better solution that what we have done" (2026-10-10 12:28Z). Context: he brings in other people's setups (Termius plus tmux plus Claude Code per project) and asks for a comparison.
- "one thing I am using termius now, not moshi anymore, tell me the steps with that" (2026-10-10 20:15Z)
- "no, paseo is an option, but I want that you show me alternatives and that I can see a UI or example before installing it" (quoted in the 2026-10-17 19:19Z session summary; said between 09:42Z and 11:00Z)
- "kk let's try paseo" (2026-10-17 11:00Z)
- "I am thinking of also using paseo in my mac, can this make things easier" (2026-10-17 12:17Z)
- "I saw that in getbb there is this option, bb connect ... maybe is easier??" (2026-10-17 12:31Z)
- "the browsers from @chrome-cdp or whatever is used for browsing, are stealing all the time the focus of the screen, this is very anoying as I can't work if the focus of the main window is stolen, why does this happen, is there  a way to fix it forever" (2026-10-06 19:49Z)
- "in aerospace I have setup that when pressing alt + s I go to the s screen, can we disable it, it's very annoying as I need the s for something else, put slack somewhere else in, q for example" (2026-10-20 21:31Z)
- "the tool is scrawl, which is to make modification to UI, not sure if I am going to use it that much though, maybe from time to time" (2026-10-27 14:29Z)
- "it takes too much time, I need it faster, can we disable thinking if it's enabled" (2026-10-13 22:39Z). Context: local translation model.

Machine upkeep habits
- "the node_modules can u remove those from the projects outside maat that I haven't touched in the last 2 months?" (2026-09-06 18:12Z)
- "check the worktrees, if a change was done last week in either one of them then keep it. Besides diversity map, there kill everything" (2026-09-20 19:14Z)
- "remove gemma4 and can u move the the qwen 27 b model into casaserver? can u put it there somewhere?" (2026-09-29 22:56Z)
- "I think that with every deploy there is a problem that some cache from docker or so keeps growin, can u find out" (2026-10-06 08:01Z)
- "disk almost full again, do urgent safe cleanups" (2026-10-27 11:34Z)

Where he works
- "tbf I don't mind to take the tram and start exploring cafes and other places where I can work, this is a bit my idea . I don't want to be always in my studio, my idea is to be in cafes during the day, as long as they don't kick me out" (2026-10-05 19:55Z)
- "Bro if it the wifi stops I don't want to go there, put it in shitty cafes that are near to my home, but not recomended." (2026-10-05 20:00Z)
- "why are we not basing us on the reviews from https://laptopfriendly.co/tallinn , I think that there is a good source to find the cafes" (2026-10-06 20:52Z)
- "Coworing: finally I will work on cafes or in the house, no coworking." (2026-10-01 08:42Z)
- "compare it already with lift99, I don't like that they make me negotiate" (2026-10-09 13:17Z). Context: a coworking offer.

## 4. Opinions about AI and agents

Simplicity over machinery
- "wtf, we are not building the nasa here, just a simple thing." (2026-10-10 12:12Z)
- "I feel that this is duplicating everything and making all more complicated." (2026-10-10 06:38Z)
- "can u actually remove everything what we have done, this whole herdr-sync, it was a bad idea" (2026-10-10 12:35Z)
- "this is way too complex, I don't like it ... we have to make it simpler!" (2026-10-10 20:19Z)
- "Also one thing the select-session is too long of a command, make it shorter" / ""show" is better" (2026-10-10 21:34Z)
- "bro sjut up about acceptance suit, just remove it, I don't want for a project like this" (2026-10-17 21:48Z)

Agents must be fast and automatic
- "It's way way too annoying I have decided that I want it much faster..." (2026-10-16 21:33Z)
- "It has to be automatic, I dn't want to have to worry about it" (2026-10-16 21:33Z)
- "it's too slow , in everything, 1. showing the claude session and then allowing the user to pick the number 2. stopping claude!! It didn't stopped while it was already creating the new stuff in the new branch 3. Sending the files 4. actually opening the new things, everything is just way to painfully slow." (2026-10-17 06:52Z)
- "I don't like that I have to click there, I prefer if from the termius I can run a command like, select-session and then I can select a session in an easy way, this is kinda like resume maybe" (2026-10-10 21:15Z)
- "I get this error, I don't like it, I started a new session and I want to work on the mobile, I don't care about previous unsaved things, just drop it or stash it or whatever, I just want to work on the new thing" (2026-10-10 21:53Z)

UI matters, even in a terminal
- "but I don't want to use herdr either, I think it was clear that we moved to tmux, herdr has the worst UI possible, I just want to use a simple solution and nice UI in phone" (2026-10-10 20:18Z)
- "ok, it's not that bad, now the biggest problem is another, it's termius, I absolutely hate the terminal of cluade code through there. Though I am not sure if I have much of an alternative." (2026-10-17 09:35Z)
- "y but this requires me more work, and it's different for codex, I need some general for every session." (2026-10-17 09:42Z)
- "done, this is much better" (2026-10-17 11:27Z). Context: after the switch to Paseo on the phone.

Which model does the work
- "(Don't send work to codex btw, stick it here into opus 5.5 subagents)" (2026-10-17 06:52Z)
- "shouldn't we start the server from cassaserver? If I start it here then what is the purpose" (2026-10-10 06:29Z)

Talk versus plan
- "do not put it in a plan, we are just talking. CHILLL" (2026-10-19 10:53Z)
- "I know already what are the basic options" (2026-10-06 08:42Z). Rest of the message: private topic: money.

## 5. Ideas and plans he states as his own

- Remote agents across devices: one command moves a project and its live chat (Codex, Claude Code, Pi) between the Mac and the home server, and the phone continues it. See section 2. (2026-10-10 to 2026-10-25)
- "ok, good, now I want to start planning the option to make it work with claude code and pi also, we taked about it right" (2026-10-12 13:28Z)
- "I am thinking of also using paseo in my mac, can this make things easier" (2026-10-17 12:17Z)
- A cleanup command for forgotten server runs: "would mark in red those runs that are more than 24 h ago" (2026-10-18 12:05Z)
- Repos about life, not code: "I want to explore github repositories that go above what is considered typical for a github, project, those that have information aabout life and other things, for example I found this one https://github.com/eternity4719/HowToLiveBetter#github but it's in chinese, it's not directly the topic I am interested but I would like to see if there are similar things in english" (2026-10-06 07:56Z)
- A terminal dictionary with a local model for Estonian (2026-10-13 22:24Z), dropped on 2026-10-23.
- Nomad plan in Europe: Tallinn in October 2026, Munich next. "I have this plan of being nomad for while" (2026-10-19 07:15Z); "I would like to live for a bit in Munich, 2 months" (2026-10-20 08:38Z)
- Van life as an experiment in antifragility: "It has crossed my mind the though of doin van life for a bit around europe." / "1. buy a van where I feel myself good, that I can work quite comfortably in the van, I could do a setup but the van has some limits 2. I would like to explore if this is a position more antifragile than the one I am in right now (following the idea of anitfragil from nnt)" (2026-10-19 07:15Z). Budget lines: private topic: money.
- "i want a van i can park on the street, smaller, like vw bus but cheaper" (2026-10-19 07:29Z)
- "can u maybe show me now some setup of how I could work from there" (2026-10-19 07:39Z)
- "what if I do the conversion on my own, I like it as a dyi project" (2026-10-19 13:33Z); "I go minimal and from there I will increase if needed, nothing fancy" (2026-10-19 13:34Z). Where he would build: private topic: family.
- "ok, another question, now I am not sure about the van, I want to keep exploring countries" (2026-10-20 22:25Z). Rest: private topic: relocation.
- Curiosity prompts: "what is a fun fact, that would genuinly blow the mind of an average human as it comes as unexpected. related to biology. show me 10" (2026-10-17 11:06Z); "make them more weird and obscure" (2026-10-17 11:07Z)

## 6. Voice: verbatim lines

1. "wtf, we are not building the nasa here, just a simple thing." (2026-10-10 12:12Z)
2. "bros top with e2e," (2026-10-10 12:12Z)
3. "It has to be automatic, I dn't want to have to worry about it" (2026-10-16 21:33Z)
4. "do not put it in a plan, we are just talking. CHILLL" (2026-10-19 10:53Z)
5. "Bro if it the wifi stops I don't want to go there" (2026-10-05 20:00Z)
6. "i am on the phone bro, how should I type ctrl u there" (2026-10-10 07:52Z)
7. "kk let's try paseo" (2026-10-17 11:00Z)
8. "done, this is much better" (2026-10-17 11:27Z)
9. "how is it so difficult" (2026-10-17 11:53Z)
10. "wait what are u doing" (2026-10-17 11:53Z)
11. "space is agains almost full, wtf!!" (2026-10-29 09:24Z)
12. "I have again very low disc space :(" (2026-09-29 22:42Z)
13. "snippets are premium :(" (2026-10-10 21:04Z)
14. "leave it configured forever pls" (2026-10-10 09:40Z)
15. "remove the fucking quotes," (2026-10-09 12:09Z)
16. "we have to make it simpler!" (2026-10-10 20:19Z)
17. ""show" is better" (2026-10-10 21:34Z)
18. "herdr can be removed for as I care" (2026-10-10 20:48Z)
19. "Is it running smoothly, make it look cool." (2026-09-15 14:27Z)
20. "1. no, shut up" (2026-10-01 08:42Z). Context: his reply to a checklist item.
21. "okey, to use how it is? have u updated the readme" (2026-10-12 17:40Z)
22. "u created lots of dummy tests, u can remove them" (2026-10-17 13:23Z)
23. "sotckam is 7.5/10 , as the location is perfect but the music is a bit too high and I am the only one working, maybe will add more notes" (2026-10-07 11:55Z)
24. "ok, I am here, is a good place, chill I like it, 8/10 what can be the next place today?" (2026-10-07 10:06Z)
25. "make them more weird and obscure" (2026-10-17 11:07Z)

Pattern notes [paraphrase]: lowercase "u", "w", "bro", "tbf", "kk", "y"; numbered lists for multi-part answers; many typos from fast typing; caps for emphasis ("ACTIVE", "EVERY", "REMOVE", "CHILLL"); emoticons ":(" ; short verdicts with a score out of 10.

## 7. Facts to check

- Mac disk is 500 GB: "I still don't get how from the 500 gb we have so few free space." (2026-09-26 09:17Z)
- Docker took about 16 GB on the Mac: "the docker 16 gb is way to much I think" (2026-09-20 14:25Z)
- bjjgym VPS root disk: 38G total, 29G used, 80 percent, threshold 75 percent [paste] (2026-10-06 08:01Z)
- Qwen 27B model copy of about 16 GB to casaserver (tool notification, not his words, 2026-09-29)
- Tallinn stay: "staying there for a month" (2026-10-01 08:37Z); a Claude summary gives 4 Oct to 3 Nov 2026 (2026-10-20 09:34Z, not his words)
- Coworking: "I just want half a month, I will leave tallin afterwards" (2026-10-09 11:37Z)
- BJJ: "3 times per week" (2026-10-05 09:49Z)
- Cafe scores: Dot cafe "7/10", Caffeine "5-6" (2026-10-06 20:46Z); a library "8/10" (2026-10-07 10:06Z); Stockam "7.5/10" (2026-10-07 11:55Z)
- Munich: "3-4 university libraries" (2026-10-05 19:50Z); TUM library "open from 06 to 12 everyday, including feiertage" (2026-10-09 16:40Z). He likely means 06 to 24.
- Session list wait before the speed work: "now I have to wait 20+ seconds" (2026-10-16 21:33Z)
- node_modules cleanup rule: projects outside maat "that I haven't touched in the last 2 months" (2026-09-06 18:12Z)
- MAAT structure: "the spanish company of MAAT which is part of the UK company" (2026-10-21 05:21Z)
- MAAT history: "I joined pretty early the company" (2026-10-21 07:20Z); "I worked for 5 months as a contractor" (2026-10-21 12:30Z). Dates and equity details: private topic: equity.
- Age: "30 years old" [paste] (2026-10-25 07:14Z)
- Acceptance suite in the spec he pasted: "15 real scenarios against casaserver, about 5 minutes" [paste] (2026-10-12 13:36Z); later tool reports grew it to S52 (not his words)
- Tool versions in the pasted spec: Claude Code 2.1.292 on the Mac, 2.1.295 on the server; Pi 0.87.1 [paste] (2026-10-12 13:36Z)
- "Phone app is Termius. Herdr and Moshi are no longer used." [paste] (2026-10-12 13:36Z); Paseo replaced Termius on 2026-10-17
- Translation CLI: "the first time was muchs lower" then fast (2026-10-13 22:40Z)
- Cleanup rule idea: runs "more than 24 h ago" in red (2026-10-18 12:05Z)

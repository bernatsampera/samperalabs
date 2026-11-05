A support request can require payment data, membership data, and a rule that only one colleague remembers. Giving an AI access to the services does not give it that rule.

At MAAT, we started collecting this knowledge in a structure that both people and AI can read. The first MAAT Brain grew from this work: shared instructions, service guides, and records of previous investigations.

## Give each request a place to start

Early support work used Claude Code with project instructions. As the material grew, we organized it into a tree of files. Small indexes describe the next files to read.

Consider a request to pause a children's program during a holiday. The assistant needs to find the relevant support procedure. It also needs to understand how our subscriptions work and where to read their current state.

The index provides that path. It does not need to contain the whole procedure itself.

```text
Company index
  Support index
    Holiday pause procedure
      Payment service guide
      Membership checks
```

This is a simplified map of the method. The source modules use linked Markdown files and indexes.

## Separate instructions from current facts

The procedure explains which subscriptions to include, what a pause means, and which decisions need confirmation. The service guide explains how to get the data. The service itself tells us what is true for this request.

These are different kinds of information. A procedure can remain useful across many gyms. A subscription list can change between two requests. Saving one list in a guide would make it easy to reuse old facts by mistake.

For the holiday example, the assistant can find the relevant plans and current subscriptions. It can then prepare a scope for review. The written procedure also tells it to consider existing pauses and the effect on booking access.

## Keep useful work after the conversation ends

The support workflow includes a record of the result. It can also produce a proposed change to the procedure when an investigation reveals a useful variation.

That change needs review. An exception for one gym does not automatically become a company rule. We must decide where the information belongs and when it applies.

Markdown makes the files readable. Git records changes. Links let several procedures use the same service guide. The team can inspect the same material that the assistant reads.

## Shared knowledge does not grant permission

An instruction can explain a task without giving the assistant permission to perform it. The support workflow requires review before changes to business data.

That distinction became more important as the Brain developed. Shared context helps an assistant understand the work. Executable playbooks define specific changes that it can run through an approved path.

The first step was to make our knowledge available beyond one person or conversation. Keeping that knowledge correct remains part of the work.

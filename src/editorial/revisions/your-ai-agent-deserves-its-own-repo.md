You start a new session with an AI agent. Before it can help, you explain the same setup again: how billing works, where the data lives, and what happened during yesterday's investigation.

Some of that knowledge may survive in chat history or automatic memory. But you still need a way to inspect it, update it, and choose what the next task needs.

I think that knowledge deserves its own repository.

## Context is a project you maintain

Code tells a machine what to execute. Documentation helps people understand a system. Agent context helps an agent work within that system.

These can share source material. The difference is how you organize it for use. A long document about your backend may contain the answer, but the agent needs a clear path to the relevant part.

A context repository gives that knowledge a structure. It can hold service details, procedures, decisions, and active investigations. You can review changes with Git and correct a file when the system changes.

### Start with a small index

The index should explain what is available and when to open it. It does not need to contain the whole system.

```text
context/
  index.md
  integrations/
    billing.md
    database.md
  workflows/
    investigate-membership.md
    deploy.md
  tasks/
    current-bug.md
```

For example, a membership question can lead to the investigation procedure. That procedure can point to the billing and database files. The agent loads the information that the task needs.

### Give each file a clear purpose

A service file can describe identifiers, relationships, and available tools. A workflow can explain a sequence of checks. An active task can record the evidence, failed hypotheses, and next step.

Keep credentials in the appropriate secret store. A context file can explain how an authorized tool gets access without containing the secret itself.

The useful unit is a piece of knowledge that you can maintain and reuse. The folder structure is only a way to find it.

## Knowledge and execution are different responsibilities

An agent also needs a runtime: the system that runs the model, calls tools, manages sessions, and handles permissions and failures. This is often called an agent harness.

A context repository answers a different question: what does the agent need to know to do this task correctly?

| Responsibility | Example |
| --- | --- |
| Context | Explain how a billing customer maps to a database membership. |
| Runtime | Call the billing and database tools with the right access. |
| Context | Describe the checks required before a deployment. |
| Runtime | Execute an approved command and report its result. |

The two work together. Adding a file does not grant tool access. Adding a tool does not explain the rules of your business.

This is where I place [Gcontext](https://gcontext.ai): organizing reusable knowledge that an agent can load across tasks and sessions. The runtime still has its own work to do.

## Reuse gives you room for the next task

Suppose you have one module for billing and another for memberships. You use both to investigate a missing subscription.

Later, you need to check whether a membership export agrees with billing. Much of the required knowledge already exists. You can reuse it for the new question instead of explaining both systems again.

That is the useful part of betting on optionality: maintain knowledge that can support more than the first task you had in mind.

### Reuse is a possibility, not a guarantee

More modules do not automatically produce more reliable capabilities. Two systems may use different identifiers. A tool may lack an operation. A task may need approval or a workflow that does not yet exist.

The test is practical: can the agent find the right files, identify the relevant relationships, and complete the task with the available tools?

For a stable process with strict rules, an explicit workflow can still be the better choice. Shared context can support that workflow too.

## Why files and version control?

Files make a small knowledge base easy to inspect. Markdown works across many tools. Git records what changed and lets you review those changes.

This is a useful starting point when your knowledge consists of procedures, system descriptions, and decisions. A large collection of changing records may need search or a database. You can document how to query that source without copying all of its contents into the repository.

The maintenance work remains. Someone must remove stale instructions, resolve contradictions, and check what the agent actually loaded. Version control makes changes visible; it does not prove that the information is correct.

## A real example: support work at MAAT

At MAAT, we moved from manual support fixes to an agent with context about our systems. We then started keeping the knowledge from those investigations in a tree of files and runbooks.

The useful change was that the next support task could start with information from earlier work. Read [how we built the context tree](/posts/context-tree-agent-support-tasks) for the concrete example.

## Build yours

Start with one task that makes you repeat the same explanation.

1. Write down the system knowledge needed for that task.
2. Put the procedure in a separate file.
3. Add an index that points to both.
4. Try the task in a fresh session.
5. Correct what the agent could not find or misunderstood.

Then try a related task. See which knowledge transfers and which parts need work.

Your agent's context will change with your system. Give it a place where those changes can be reviewed, corrected, and used again.

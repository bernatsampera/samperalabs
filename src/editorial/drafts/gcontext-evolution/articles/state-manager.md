The July framework defined gcontext as the state manager. Claude Code could handle the conversation and tool use. gcontext could handle the information that remained between tasks.

That changed the implementation. An early iteration had its own interactive loop. A smaller launcher for an existing agent replaced that loop.

## Show what the agent receives

Separating the runtime did not remove the need to understand its input. A context ledger recorded how gcontext treated each source.

| State | Meaning |
| --- | --- |
| Loaded | Included in the current context |
| Available on request | Accessible when needed |
| Skipped | Left out for this task |
| Outside gcontext's control | Supplied by the host or another mechanism |

The last category mattered. A connected service cannot claim control over every instruction that the host agent loads.

The ledger made that limit visible. It also made the context supplied by gcontext inspectable.

## Test the boundary with useful work

A smaller launcher was only an architectural change. It still needed useful context to serve.

Reusable workflows offered a practical test. A procedure could remain available while different sessions supplied the task, inputs, and local settings.

The next work included browser procedures and project operations. Those workflows tested whether the saved instructions could support repeated use without absorbing every detail of each run.

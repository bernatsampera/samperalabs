The early context platform had its own web app. Using the same knowledge from existing AI clients required another connection.

June and July work added a command-line interface, a separate core package, an MCP connection, and shared folder views.

MCP is a protocol that lets an AI client use tools supplied by another service. Here, it offered a route to the context and service instructions outside the original interface.

## Separate the context from its interface

These connection methods served different uses.

| Connection | What it made possible |
| --- | --- |
| CLI | Use the system from a terminal |
| MCP | Connect a compatible AI client |
| Folder viewer | Inspect shared context in a browser |

The implementation work did not make every method a finished public service. Local credentials, client setup, and the boundary between shared information and private configuration remained important parts of the design.

The underlying question was simple: should access to the knowledge depend on using the original chat interface?

## The agent and its context have different lifetimes

An agent runs a conversation and calls tools. The useful information can remain after that conversation ends.

Connecting existing clients made this boundary more explicit. Saved context could develop separately from the software that ran the conversation and tools.

The July framework made that distinction central: gcontext would manage the saved state, while an existing agent could run the task.

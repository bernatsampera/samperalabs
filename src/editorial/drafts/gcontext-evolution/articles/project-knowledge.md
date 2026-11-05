An AI agent needs more than the current request to work on a project. It also needs decisions, procedures, and instructions for the services involved.

The early gcontext work brought those sources into a workspace the agent could access. A personal agent repository supplied project pointers and reusable tools. Bleak added a web interface with chat, a knowledge tree, and context controls.

## Give the task a starting point

Consider an illustrative example: a project guide says that reports can be exported from Settings. The service later moves that function to Reports.

An agent can discover the new location while completing a task. But another session may still read the old guide. The correction remains in one conversation while the saved instructions point elsewhere.

This example connects the journey. It is not a recorded product incident.

Before handling corrections, the system needed a place where an agent could find the instructions at all.

| Source | What it provides |
| --- | --- |
| Project documents | Decisions and knowledge about the work |
| Service guides | Instructions for using external systems |
| Task conversation | The current request and findings |

The workspace made the first two available to the third.

## Access does not select the right information

As more knowledge entered the workspace, each task still needed only a small part of it. An export task did not need every service guide and project document.

The next step was to make context selectable. That would give the task relevant starting instructions, while leaving unrelated material unloaded.

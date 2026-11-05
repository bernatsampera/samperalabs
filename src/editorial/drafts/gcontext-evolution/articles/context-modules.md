The workspace made project knowledge accessible. A task still needed a way to select the relevant part.

Context modules grouped related instructions, documentation, and configuration. Modules could come from Git, and the interface let users choose which ones to load.

## Give the agent the instructions for its task

In the illustrative export example, the task needs the export guide. Billing instructions and unrelated account procedures can remain outside the current context.

This distinction shaped the module design:

| Available knowledge | Loaded context |
| --- | --- |
| The collection the agent can access | The material selected for this task |
| Useful across different kinds of work | Relevant to the current request |

Plain files made the modules inspectable. Shared instructions and private configuration remained separate concerns.

The result was more control over the input to the task. It did not guarantee that those instructions were correct or current.

## The task can discover that the guide is wrong

Suppose the selected guide points to Settings, but the agent finds the export function under Reports.

The agent can use that finding to finish the task. Loading the right module has not updated the module itself.

The correction must reach the saved knowledge if another session is to benefit. That introduces a different decision: which parts of the conversation should remain after the work ends?

The module experiments addressed selection. Task records and reusable procedures then explored what to retain from the work performed with that context.

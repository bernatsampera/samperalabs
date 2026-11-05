“Pause the children's program for the holiday” sounds like one task. It contains several decisions: which plans, which subscriptions, when billing resumes, and what to do with members already paused.

MAAT Brain combines the instructions needed to investigate that request with an executable playbook for the change. The distinction matters. A written procedure explains the work. A playbook runs a specific, reviewed operation.

## Resolve the request before running the change

The support procedure starts with the gym and its plans. It identifies the relevant subscriptions and prepares the proposed scope. The team confirms the dates and the treatment of existing pauses before approving the change.

For a fictional example, suppose the program has three subscriptions. Two need a holiday pause. The third already has one. The selected operation should change the first two and leave the existing pause intact.

| Subscription | Before | Selected treatment |
| --- | --- | --- |
| Member A | Active | Pause collection |
| Member B | Active | Pause collection |
| Member C | Already paused | Leave unchanged |

These are fictional members. No customer records appear in this example.

## Execute reviewed code with explicit inputs

The Brain has a registered `bulk-pause-subscriptions` playbook. Its inputs include the connected payment account, the selected subscription IDs, and the resume date.

The runtime uses a reviewed release of the playbook. It identifies that release by a digest, a value tied to its contents. This keeps the code that runs separate from instructions that an assistant might write during a conversation.

The playbook checks the input formats and reads the subscriptions before making changes. It skips subscriptions that already have a collection pause. If another selected subscription has an unexpected status, the preflight stops before the write phase.

The assistant still has useful work to do: find the procedure, read current facts, resolve the scope, and present the proposed change. The executable operation handles the defined write.

## A pause has specific effects

This playbook sets a collection pause. It does not cancel the subscription. The holiday procedure uses a behavior that voids invoices created during the pause, rather than collecting a backlog later.

After the pause ends, billing follows the normal renewal schedule. The MAAT procedure also notes an effect on booking access. This example does not apply to a request that must keep access while stopping billing.

Those details belong in the shared procedure. Without them, a technically valid call could still implement the wrong request.

## Check the result, including partial changes

The playbook reports the state before and after each change. The wider support procedure includes verification against the relevant services.

A batch is not one atomic transaction. A later write can fail after an earlier subscription changed. The returned results therefore matter: the team must know what changed before deciding how to continue.

This is the useful boundary in the Brain. AI can help investigate a varied request. A reviewed operation makes the agreed change with explicit inputs. The result remains available for inspection.

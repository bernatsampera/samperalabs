# MAAT work: sources for the next reviews

Reviewed on 4 November 2026 after Bernat supplied the migration and support directories.
Read-only review. No workflow, migration, support action, or external write was executed.

## Migration transform

Source root:
`/Users/bsampera/Documents/bleak-dev/gcontext-cloud/.worktrees/maat/platform/src/modules-repo/migration-to-maat/`

Files read: `llms.txt`, `steps.md`, `step_playbooks/2_transform.md`, `functions/2_transform/llms.txt`, and the amount, interval, and status extractors.

Bernat selected Step 2, Transform, as the main subject.
The complete workflow merges inputs, transforms columns, matches customers, resolves prices, creates batches, and uploads subscriptions.
Step 2 produces a normalized CSV. It does not create subscriptions or match Stripe customers.

The useful explanation is how AI prepares the conversion:

1. Inspect the source columns and representative rows.
2. Read the provider notes and the function selection guide.
3. Propose mappings, formats, and treatment of ambiguous fields for human review.
4. Generate a migration-specific script that selects and configures reusable extraction functions.
5. Produce transformed rows, skipped rows with reasons, and documented mapping decisions.
6. Check output counts, formats, dates, and sample rows before later migration steps.

Use a fictional subscription to explain the field transformations:

| Source value | Selected behavior | Output |
| --- | --- | --- |
| `£55.00` | Parse major units as pence | `5500` |
| `monthly` | Normalize the billing interval | `month`, count `1` |
| `Frozen` | Apply a confirmed status mapping | `paused` |

The function library includes criteria for when a function fits and when it does not.
If no function fits, the workflow calls for a new extraction function and updated documentation.
Provider knowledge and reusable functions reduce the need to start each migration from nothing.

Do not present this as AI rewriting every row directly.
Do not claim that the complete pipeline is deterministic or error-proof.
Some functions have defaults, date calculations depend on time, and one identifier function generates random values.
Do not claim universal validation: the examined interval extractor defaults to monthly for an unknown value, and the amount extractor returns zero for empty input.
Mapping review and output checks remain part of the explanation.
No migration speed, cost saving, or accuracy measurement was established in this review.

Video direction: follow one fictional row through column selection, function selection, normalization, and output review.
Use a spreadsheet and code composition. Do not repeat the schedule video's OCR sequence.

## Shared context and support playbooks

Source root:
`/Users/bsampera/Documents/bleak-dev/gcontext-cloud/.worktrees/maat/platform/src/modules-repo/support-task/`

Files read: `llms.txt`, `steps.md`, `playbooks/llms.txt`, and `playbooks/bulk-pause-subscriptions.md`.

The workflow uses an index to find an existing procedure, consults service instructions, presents a plan, and requests approval before business-data writes.
After execution, it records the result and can update the procedure with useful variations.
These are workflow instructions. Reading them does not prove that every run follows them correctly.

Selected candidate example: pause billing for a children's program during a holiday.
Explain it with a fictional gym, plans, dates, and members.

The playbook covers:

- Resolve the plans and affected subscriptions.
- Confirm the resume date and treatment of existing pauses.
- Present the scope and obtain approval.
- Apply the selected pause behavior.
- Check the result and leave excluded subscriptions unchanged.

Do not describe this as cancellation or an immediate catch-up charge on the resume date.
The playbook states that billing resumes at each subscription's normal renewal after the pause ends.
Its stated MAAT behavior also pauses booking access, so it is not the right example for billing-only pauses with access retained.

The older module contains Markdown procedures and code examples. It does not by itself prove that a particular procedure is a registered executable playbook in the newer Brain.
The newer Brain design documents distinguish free-form read operations from vetted executable playbooks with validated parameters.
Sources: `/Users/bsampera/Documents/maat/workspace-app/docs/brain/README.md`, `architecture.md`, and the relevant playbook sections of `v1-design.md`.
The follow-up review found `bulk-pause-subscriptions` in the local MAAT Brain state registry. Its implementation checks inputs and current subscription states, skips existing pauses, and reports sequential write results. The video can therefore explain this registered operation. The local checkout does not establish the currently deployed registry version.

Sources: `/Users/bsampera/Documents/maat/maat-brain-state/playbooks/registry.json` and `playbooks/bulk-pause-subscriptions/playbook.py` in that repository. The source was read only. No operation ran.

Video directions:

- Shared context: follow a support request through the index, relevant service guide, and task procedure.
- Approved playbooks: show the selected task, its inputs, the review of affected members, and the verified result.

Do not copy customer names, account identifiers, private ticket details, credentials, or internal infrastructure into public examples.

## Admin Agent customer access

Bernat confirmed on 4 November 2026 that customers will be able to use the agent tomorrow.
The planned date is therefore 5 November 2026.
The local article now states that date rather than claiming that customer access is already live.
This statement does not confirm universal rollout or write capabilities.
The public database article has not been changed by the local edit.

The proposed replacement also includes code-filled data widgets. The model selects a widget and references its source result. Code supplies its values. The 22 October amendment to `/Users/bsampera/Documents/maat/workspace-app/docs/admin-agent/journal/2026-10-21-AA19.6-code-fills-widgets.md` records result references, sign-off, and merges.

## Remaining limits

There is enough material to prepare migration and Brain review drafts and illustrated video proposals.
The first migration month and first Brain usage month remain unconfirmed.
Do not infer a launch date from a sample, file timestamp, or article publication date.

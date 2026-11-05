A gym export can say `£55.00`, `monthly`, and `Frozen`. MAAT needs an amount in minor units, a billing interval, and a subscription status. The file contains the information. Its fields do not yet mean what our import expects.

We built an AI-assisted migration workflow around this problem. The part I want to show here is Step 2: converting the source CSV into the format that later migration steps use.

## Decide what the fields mean before converting them

Renaming columns is only part of the work. An amount might already be in pence. A status might describe payment collection, membership access, or something else. A date can mean the next payment or the end of a contract.

The assistant first reads the source columns, sample rows, and provider notes. It proposes a mapping and identifies decisions that need review. That review establishes what the conversion should do.

For example, suppose we confirm that this provider uses `Frozen` for paused subscriptions:

| Source | Conversion | Output |
| --- | --- | --- |
| `£55.00` | Pounds to pence | `5500` |
| `monthly` | Standard billing interval | `month`, count `1` |
| `Frozen` | Confirmed status mapping | `paused` |

This is a fictional row. The status mapping applies only after we confirm the provider's meaning.

## Let AI prepare the script

We keep a library of extraction functions. Each function documents when it applies and when it does not. Some parse amounts. Others handle intervals, dates, or statuses.

The assistant selects and configures these functions, then writes a script for the migration. Code applies the selected rules to the rows. The model does not rewrite each subscription as a separate answer.

This gives us a specific object to inspect: the script, its inputs, and the mapping decisions. We can check which rule produced a value. When an existing function does not fit the export, the workflow calls for a new function and its documentation.

## Keep the exceptions visible

The transformation produces a normalized CSV, a file of skipped rows with reasons, and a record of the column mappings. A successful script run does not establish that those outputs are correct.

We still check row counts, amounts, dates, and representative subscriptions. Defaults need attention too. For example, an extractor can return zero for an empty amount or use a monthly interval for an unknown label. Those values can look valid while carrying the wrong meaning.

The review must therefore check the rule as well as the output. If a source value has no clear meaning, it needs a decision before the migration continues.

## Transformation is one part of the migration

Step 2 prepares the data. Later steps match customers, resolve prices, prepare batches, and upload subscriptions. The transformed CSV is an input to that work, not evidence that the migration is complete.

The reusable part is the growing set of provider notes, mappings, and extraction functions. Each migration still needs review, but it can start with rules we already understand.

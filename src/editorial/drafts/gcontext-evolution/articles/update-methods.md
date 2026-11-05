Keeping a correction is not enough if the old instruction remains in place. The system must find the relevant passage and decide how it should change.

In the illustrative example, “Open Settings” needs to become “Open Reports” in the export guide. Related instructions elsewhere may need attention too.

## Find the passages that carry the same meaning

The handbook work compared several approaches. One searched and edited files directly. Another supplied the whole handbook. Other methods selected relevant facts before proposing an edit.

Each approach gave the model a different view of the existing knowledge.

The saved October evaluation describes a direct-search case that missed related statements written in different words. Whole-handbook input supplied more context, but required much more input.

Selecting related facts offered a smaller view. It also exposed a problem with the representation used for editing.

## The correct fact can damage the document

Some methods showed the model a paraphrase of a fact instead of its original passage. The replacement then used that paraphrase.

In a recorded synthetic test, a table row became a sentence inside the table. The new fact was present, so the checks passed. The document structure was broken.

| Narrow check | Problem visible in the file diff |
| --- | --- |
| The new value is present | The table no longer has a valid row |
| The rule changed | Useful surrounding wording disappeared |

The proposed fix was to provide the original source passage when requesting an edit. A fact summary can help find information without being sufficient to replace its text.

The evaluation also reports limited repeats, a disputed case, and gaps in the checks. It does not establish a general winning method.

It does explain why the actual file changes need review before they enter the saved knowledge.

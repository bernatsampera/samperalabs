A browser task often depends on knowledge that is absent from an API reference: where a control appears, which page comes next, and how to check the result.

The browser cookbook experiment collected these procedures for use across projects. Other August work packaged instructions for project operations and recurring tasks.

These gave the framework practical work to support.

## Separate the procedure from one run

A reusable workflow needs instructions that make sense in another workspace. It also needs clear boundaries around local settings and previous results.

| Reusable material | Material specific to a run |
| --- | --- |
| Procedure and required inputs | The inputs supplied this time |
| Service instructions | Local configuration |
| Checks for the result | The observed result |

The workflow should not silently carry private settings into another project. A previous result should not become an instruction merely because it remains in a file.

The repository work included shared workflow modules and browser procedures. Some material later moved into the personal agent repository, where it could serve work across projects.

## Reuse also creates a maintenance problem

The work also explored sharing workflows so other people could supply their own configuration. A marketplace was one possible direction, not an established release.

Even before distribution, repeated use raised a harder question. When a run finds something useful, where should that information go?

Adding a note is easy. Keeping the procedure clear, removing outdated information, and avoiding duplicates need rules. That became a larger part of the context work.

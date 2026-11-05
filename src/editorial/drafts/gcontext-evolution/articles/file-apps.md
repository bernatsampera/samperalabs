A task board and an agent can work on the same task. This experiment tested whether they could also use the same underlying files.

This was a side experiment alongside the framework. A May design explored apps attached to context modules. A September local prototype used folders and Markdown.

## A folder represented the task's state

Each task was a Markdown file. Its folder determined where it appeared on the board.

```text
tasks/
  backlog/
    prepare-example.md
  in-progress/
  done/
```

This is a simplified example. Moving `prepare-example.md` into `in-progress/` changes the task's state. The board can show that move. An agent can make the same change through the files.

The local server exposed operations to read, write, move, list, and append to files. It also supported running scripts from an app's scripts folder.

## One representation, two ways to work

The agent did not need to interpret a screenshot of the board to understand the task. The person did not need to edit Markdown for every action.

The useful experiment was this shared representation. The app gave people a focused view of state that an agent could access directly.

It was a local prototype. It did not establish a complete solution for concurrent editing, access control, or safe execution.

It also left the larger context problem open: the files still needed clear rules about what they meant and how they could change.

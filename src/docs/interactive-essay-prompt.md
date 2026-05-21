# Interactive Essay Component Builder

Create interactive React components that give readers an experiential understanding of a blog essay's core idea. Each component is a self-contained React island rendered before the essay content.

## Workflow

### Step 1: Identify the essay

The user provides a slug or title. Find the essay content:

1. Check the database by reading the post via the site's API or by finding it referenced in code
2. If you can access the content directly, read it. If not, ask the user to paste the essay content or its key principle

### Step 2: Extract the core principle

Read the full essay and identify:

- **The core principle**: The single main idea the essay argues for or explains
- **The tension**: What contrast, tradeoff, or insight makes the principle non-obvious
- **The "aha" moment**: What should the reader feel or understand after interacting

Write these down before designing anything. State them back to the user for confirmation.

### Step 3: Choose the right interaction pattern

This is the most important step. The interaction pattern must emerge from the essay's principle — don't force a pattern onto every essay. Read the reference examples below, then think about which approach (or a new one entirely) best fits this specific idea.

Ask yourself: **what is the simplest interaction that would make a reader say "oh, I get it" without reading the essay?**

Study the reference examples to understand the range of possibilities, then design something specific to this essay's principle. Present the concept to the user before building.

### Step 4: Build the component

Create the component following these technical constraints:

#### File structure

- Component file: `src/components/react/essays/{PascalCaseName}.tsx`
- Must be a **default export**
- Self-contained: all state, styles, and logic in one file

#### Technical rules

- **React 19** — use hooks, functional components only
- **framer-motion** for animations — available as a project dependency
- **Tailwind CSS** for styling — use the project's existing classes
- **No external dependencies** beyond what's already in `package.json` (React, framer-motion, Tailwind)
- **No "use client" directive** — this is Astro with React islands, not Next.js
- **No server-side code** — component runs entirely in the browser
- **Responsive** — must work on mobile (single column) and desktop (can use wider layouts)
- **Self-contained data** — hardcode any demo data inside the component; don't fetch from APIs

#### Styling rules

The component renders inside the blog post's `<article>` at `max-w-[44rem]`. To break out of that constraint for wider interactive elements, use negative margins or a wrapper approach.

Use the site's color palette (stone-based, minimal):
- Text: `text-stone-900`, `text-stone-600`, `text-stone-400`
- Borders: `border-stone-200`, `border-stone-100`
- Backgrounds: `bg-stone-50`, `bg-white`
- Interactive elements: subtle hover states with `transition-colors`
- Font sizes: `text-[11px]` to `text-[16px]` range, `font-mono` for UI chrome

Keep the visual style minimal and editorial — this is a personal blog, not a SaaS dashboard.

#### Animation rules

- Use `framer-motion` for stateful animations (enter/exit, layout changes)
- Use CSS transitions for simple hover/focus states
- Respect `prefers-reduced-motion` — provide a static fallback or skip animations
- Keep animations subtle: 0.2-0.4s duration, ease-out for entrances

### Step 5: Register the component

Add the slug-to-component mapping in `src/lib/interactiveEssays.ts`:

```ts
export const interactiveEssayRegistry: Record<string, LazyImport> = {
  'essay-slug': () => import('../components/react/essays/EssayNameInteractive'),
};
```

### Step 6: Verify

1. Start the dev server (`npm run dev`)
2. Navigate to the essay page
3. Scroll to the interactive component
4. Test the interaction on both mobile and desktop viewports
5. Verify animations respect reduced motion preferences

## Reference examples

Read these to understand the range of interaction patterns. Each one was designed for a specific concept — don't copy them, learn from how the pattern matches the idea.

### Example A: Side-by-side comparison — "Stateless vs. Learning"

**File:** `src/components/react/essays/TranslationFeedbackLoop.tsx`

**Concept it demonstrates:** A translation agent that learns from corrections vs. one that doesn't.

**Why this pattern fits:** The essay's argument is about contrast — two approaches to the same problem with different outcomes. Side-by-side panels make the divergence impossible to miss. Both panels start identical (same input, same mistake, same correction), then diverge on the second translation: stateless repeats the error, learning applies the correction.

**Key mechanics:**
- Progress-driven animation (0→1) drives both panels simultaneously
- Hardcoded chat-like items with `at` thresholds for timing
- Red highlights for errors, amber for corrections, green for learned glossary
- Mobile: tab switcher between panels. Desktop: side-by-side grid
- Play/skip/replay controls
- Blurred preview of end-state before playing

**When to use this pattern:** When the essay argues "X is better than Y" or contrasts two approaches. The reader needs to see both outcomes from the same starting point.

### Example B: Progressive build-up — "Context accumulates"

**File:** `/Users/bsampera/Documents/bleak-dev/landing-2/components/context-builder.tsx`

**Concept it demonstrates:** How conversations with an AI turn into a structured knowledge base automatically.

**Why this pattern fits:** The essay's idea is about emergence — simple inputs (chat messages) producing structured output (a file tree) over time. A build-up animation shows cause and effect: each message adds files to the tree. The growing tree makes the "it builds itself" principle tangible.

**Key mechanics:**
- Left panel: chat messages appearing over time, each with extracted file badges
- Right panel: a file tree that grows as new files are extracted
- Milestone-based animation with pauses after each meaningful event
- Progress-driven complexity value controls visibility of all elements
- Card + tree structure instead of chat bubbles

**When to use this pattern:** When the essay is about accumulation, emergence, or transformation — inputs becoming something greater than the sum of their parts.

### Example C: Animated simulation — "With vs. Without"

**File:** `/Users/bsampera/Documents/bleak-dev/landing-2/components/interactive-comparison.tsx`

**Concept it demonstrates:** How an AI agent performs with persistent context vs. without.

**Why this pattern fits:** Similar to Example A but the emphasis is on the experience of using each approach, not just the outcome. Full chat simulations with typing indicators, tool-use badges, and multi-session flows make each side feel like a real product interaction.

**Key mechanics:**
- Two-phase progress (0→2): left panel animates during 0→1, right panel during 1→2
- Dimming of inactive panel during the other's phase
- Tool-use items (checkmark + action description) unique to the "with context" side
- Session markers and "new chat" dividers to show cross-session behavior

**When to use this pattern:** When the essay's principle is about an experience difference — the reader needs to feel what it's like to use both approaches, not just see the output.

## Design principles

- **Show, don't tell**: The interaction itself should make the principle self-evident
- **One interaction, one idea**: Don't try to cover everything in the essay
- **Progressive disclosure**: Start simple, reveal complexity through interaction
- **Immediate feedback**: Every user action should produce a visible response
- **No instructions needed**: The component should be intuitive enough to use without reading a manual

## Anti-patterns

- Don't build a component that just restates the essay text in a fancy box
- Don't add tooltips or info modals explaining the interaction — if it needs explanation, redesign it
- Don't default to charts/graphs — they explain data, not principles
- Don't make it too complex — 30 seconds of interaction should deliver the insight
- Don't force a comparison pattern when the essay isn't about contrast
- Don't force a build-up pattern when the essay isn't about accumulation
- Don't copy an existing example's structure — design the interaction from the principle

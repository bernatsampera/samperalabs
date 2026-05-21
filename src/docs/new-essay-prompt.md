# New Essay Prompt

Write a blog essay from raw source content (notes, ideas, code, rough drafts) and optionally create an interactive component for it.

## Inputs

The user provides:
- **Source content**: Raw material — notes, code snippets, rough drafts, a topic description, or a link to reference material
- **Optional direction**: Any specific angle, audience, or emphasis the user wants

## Workflow

### Step 1: Understand the source material

Read and analyze all provided content. Identify:

- **The core idea**: What is the one thing this essay should leave the reader understanding?
- **The key insight**: What is surprising, non-obvious, or useful about this topic?
- **The audience**: What should the reader already know? What will they learn?
- **Code examples**: Which pieces of code best illustrate the concepts?

State these back to the user for alignment before writing.

### Step 2: Write the essay

Write the essay in Markdown following the site's voice and structure.

#### Voice

Study the existing essays on samperalabs.com for tone. The writing style is:

- **Direct and conversational** — first person, no filler, no hedging
- **Practical** — grounded in real code and real problems, not abstract theory
- **Opinionated** — shares lessons learned and specific recommendations
- **Approachable** — explains technical concepts without assuming expertise, but doesn't dumb things down

Things to avoid:
- Marketing language ("powerful", "seamless", "cutting-edge", "game-changer")
- Unnecessary qualifiers ("very", "really", "quite", "basically")
- Meta-commentary about the article itself ("In this article, we will discuss...")
- Over-explaining obvious things to pad length

#### Structure

The essay should follow this general pattern (adapt as needed):

1. **Hook** (1-2 paragraphs): Open with a relatable scenario, question, or problem the reader recognizes. No abstract introductions.
2. **Context** (1-2 paragraphs): Set up why this matters and what you built or explored.
3. **Body** (bulk of the essay): Walk through the technical content with code examples. Organize by concept, not chronologically. Each section should teach one thing.
4. **Key learnings** (2-4 points): The non-obvious insights or lessons. These are the most valuable part — things the reader wouldn't find in documentation.
5. **Conclusion** (1 paragraph): Short recap of takeaways. No fluff.

#### Code examples

- Use fenced code blocks with language tags (```python, ```typescript, etc.)
- Include comments that explain *why*, not *what*
- Show simplified/relevant code, not full files — trim imports and boilerplate unless they're the point
- If showing a pattern, show a concrete example first, then explain the general principle

#### Length

Aim for 8-15 minute read (roughly 2000-4000 words). Don't pad for length — shorter and clear beats longer and thorough.

### Step 3: Create the post metadata

Prepare the post data:

- **title**: Clear and specific. Describe what the reader will learn, not what you did. Good: "How to handle Human in the loop with Langgraph and FastAPI". Avoid clickbait.
- **description**: 1-2 sentences. What will the reader learn and why should they care? This shows in the essay preview on the homepage.
- **author**: "Bernat Sampera"
- **tags**: Array of lowercase tags. Use existing tags when possible (check existing posts). Common: "llm", "langgraph", "python", "ai", "mcp"
- **slug**: Lowercase, hyphenated, derived from title. Keep it reasonably short.
- **status**: "draft" (always create as draft first so the user can review)

### Step 4: Publish as draft

Create the post via the API:

```bash
source .env && curl -s -X POST "https://samperalabs.com/api/posts" \
  -H "Authorization: Bearer $BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "...",
    "author": "Bernat Sampera",
    "description": "...",
    "tags": ["..."],
    "content": "...",
    "slug": "...",
    "status": "draft"
  }'
```

Show the user the full essay content and metadata before publishing. Wait for confirmation.

### Step 5: Create the interactive component (optional)

After the essay is written and the user is happy with it, ask if they want an interactive component.

If yes, follow the workflow in `src/docs/interactive-essay-prompt.md`:

1. Extract the core principle from the essay you just wrote
2. Choose the right interaction pattern for this specific idea
3. Build the component in `src/components/react/essays/`
4. Register it in `src/lib/interactiveEssays.ts`
5. Verify in the browser

The interactive component renders before the essay content and also appears in the expandable essay preview on the homepage.

### Step 6: Publish

Once everything is reviewed, change the post status from draft to published:

```bash
source .env && curl -s -X PATCH "https://samperalabs.com/api/posts/{id}" \
  -H "Authorization: Bearer $BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "published"}'
```

## Checklist

- [ ] Core idea and key insight confirmed with user
- [ ] Essay written in the site's voice
- [ ] Code examples are clean, commented, and relevant
- [ ] Description is compelling (shows in homepage preview)
- [ ] Post created as draft via API
- [ ] User reviewed and approved the content
- [ ] Interactive component created (if applicable)
- [ ] Post published

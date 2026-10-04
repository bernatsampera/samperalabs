# Design decisions

## Approved and locked

### Homepage scroll timing and playback controls

Keep each animated section fixed while its scene progresses on desktop screens where the full section fits. Calculate progress from the available fixed scroll distance. Complete the animation at 80 percent of that distance so readers can see the final state before the section moves away. Keep section dimensions stable during scroll.

Use one minimal control row with a thin gray progress line, the text "Scroll to animate", and a plain Play button. Omit the panel, border, icons, and extra instructions. Keep Play available during scrolling. Show Replay after completion without a completion label. On phones (760px or less), play each illustration once when most of it enters view. Keep normal page scrolling and provide Replay. Stop playback when the illustration leaves view or the tab becomes hidden. Do not automatically repeat it. On larger screens where the section is too tall, use Play and Replay controls. Timed playback lasts 3.6 seconds and includes Stop. In desktop scroll mode, scrolling returns control to the scroll position. Keep the article link available throughout. Use explicit page colors for the progress bar instead of native control colors.

Show a complete static scene when JavaScript is unavailable or reduced motion is active. Hide playback controls in these cases. This decision replaces the earlier removal of progress indicators.

### Distinct article visuals and homepage motion

The user requested different diagram styles and homepage animations. Color changes alone do not solve the repetition. Each article needs a distinct composition and drawing style. Each homepage scene needs movement that explains its subject.

The current scenes use text correction, document annotation, session replacement beside a fixed reference, and readers consulting a shared handbook. This replaces the common box-highlight sequence. Preserve the page layout, reading links, stable section dimensions, and reduced-motion support.

Follow the visual concept and variety checks in [../src/docs/post-image-workflow.md](../src/docs/post-image-workflow.md).


### About and contact

The approved biography lives at /about. The header links to it as About & contact beside Writing and Projects. The homepage introduction and contact link are removed. The about page uses the user's approved four-paragraph text about production agents and the context layer. Contact options include info@samperalabs.com, the existing X profile, and the user-supplied LinkedIn profile at https://www.linkedin.com/in/bernat-sampera-195152107/.

### Simple navigation

The header contains the name, Writing, and Projects. Remove the Menu control and its secondary navigation. Notes, About, and Things I Like keep their existing URLs and content but are absent from the main navigation. The homepage has a short introduction and a Contact on X link using the existing public profile.

### Curated five-article homepage

The user approved five homepage articles in date order: context-tree-agent-support-tasks, express-the-general, your-ai-agent-deserves-its-own-repo, lessons-learned-building-a-real-world-ai-agent-with-langgraph, and analyzing-open-deep-research. One selected list supplies both the visible sections and the grouped sidebar links. No article appears only in the sidebar. This replaces the earlier three-feature and full-index rules.

Keep the three existing scenes. The other two articles use compact text previews with a readable width. They have no empty visual column, sticky content, or animation scroll space. Articles outside this selection keep their database records and public URLs.

The user approved a combined agent repository article and a stronger Open Deep Research analysis. These two articles use source-managed Markdown revisions through a shared public read layer. Public metadata is recalculated from the revision. Admin content stays in the database and the edit form explains the source override. No production content write is part of this change.

### Article selection rule

Every retained article must have a visible homepage section, with or without an animation. The sidebar must link to that section. Do not keep articles only in the sidebar. The user will select which of the current 10 articles to retain before the homepage list changes.

The user approved Georgia as the article font fallback for now. Use Poppins for the interface and headings. Do not add Minion Pro without a suitable webfont licence.

### High Agency font and contents correction

Use self-hosted Poppins for the site interface, headings, diagram labels, and captions. The High Agency reference uses Poppins and Minion Pro. Keep Georgia for article text until a licensed Minion Pro font is supplied. Do not copy proprietary fonts from the reference site. Preserve monospace code.

Article contents must reflect real heading levels. Primary sections have stronger labels. Their subsections appear in nested lists with zinc guide lines. Keep the same heading anchors and active-section tracking on desktop and phone. Do not create subsections when the article has none.

### Reading sample and homepage heading correction

The latest user correction takes priority over the earlier article alignment rule. Match the reading style in [ideas.html](ideas.html): centered title and byline inside a calm reading column. Keep the contents rail at the far left. Center the 690-pixel reading column within the main grid column. Use a title up to 44 pixels, a maximum title width of 620 pixels, and Georgia body text at 20 pixels with 1.8 line height. Use a zinc underline on section headings. Keep the back link separate and left aligned. Keep publication dates and reading time above the title. Show the author below the title.

The homepage layout is approved. Remove the visible "Writing on AI." heading and its intro band. Keep a screen-reader heading and the current post anchors, sidebar, projects, and motion. This replaces the prior instruction to show a short homepage title.

### Latest revision: shared left rail and separate products

Homepage and article pages use the same left gutter and responsive rail. The rail grows to 300 pixels on large screens. Article text remains left aligned with a 720-pixel maximum width. The homepage rail ends with the posts. Projects use the full page width below it.

Project slides have no outer borders. Large product names and dark zinc visual panels distinguish products from essays. Keep the purpose, problem, solution, and real product links.

Only one homepage scene is active at a time. On wide, tall screens, fixed CSS scroll space and a sticky inner section give the scene time to finish. Never change section dimensions during scroll. Small screens use normal flow. Respect OS reduced motion. Reading links use a strong dark button.

The user approved these design directions. Preserve them during portfolio work. Change them only when the user requests a new design change.

### Homepage: scrollable post sections

- [scroll.html](scroll.html): Approved homepage layout with one numbered section per post, clear reading links, and contents navigation.
- [scroll.css](scroll.css): Approved homepage styles and responsive layout.
- [scroll.js](scroll.js): Approved scroll-driven visual explanations and current-post tracking.

Blog ideas and experiments lead the site. The portfolio is secondary. Each post preview should explain its subject visually. The contents list must make the current post clear and allow direct jumps. Reading links must remain obvious. Do not replace this with cards, hidden post selectors, or small copies of product interfaces.

### Individual blog posts: original reading style

- [index.html](index.html#post): Approved original post design, selected in the first review.

Keep the calm reading layout inspired by the supplied High Agency reference: large headings, serif body text, generous spacing, a contents list, and useful images within the text. This approval concerns the Post view. The original homepage and portfolio options in that file are not approved.

- [ideas.html](ideas.html): Short local reading samples used by later homepage sketches. These are examples, not a replacement for the approved original post layout.

### Portfolio: project, problem, solution

Every project must explain three things, in this order: what the project is, the problem, and the solution taken. The user approved this principle for all portfolio projects. Remove the redundant "See how I built the solution" link from the sketch.

For BJJGym: help travellers find BJJ gyms around the world. Useful gym details are often missing from listings. The solution uses AI to extract labels from public reviews, such as BJJ, no-gi, clean, good teacher, and high level, and presents this information. Labels are not limited to moods. Explain the whole project before showing the classification step.

- [portfolio-story.html](portfolio-story.html): Revised project-first sketch for the homepage entry and individual project page. Visual design awaits review.
- [portfolio-options.html](portfolio-options.html): Rejected comparison kept for reference. All three options focused too much on classification and did not explain the project.

## Still being explored

The user approved compact project sections below the posts, with direct access from the homepage contents list. The current direction uses these summaries and links to real project sites, without separate project detail pages. The exact layout remains open for review.

- [home-demo.html](home-demo.html): Combined homepage demo for layout review. It includes the user-selected projects: BJJGym, IndoEuroMap, and gcontext. Keep their content brief during design review. IndoEuroMap copy is a draft based on its local README; gcontext copy follows its public site. These replace the old project list for this design.

## Implementation approved

The user approved implementation of the combined direction after an Astra high-effort plan review, using Astra medium-effort implementation agents. Use mainly white, black, and gray. Remove the separate project accent colors and warm tinted surfaces from the sketch. Add life through typography, contrast, useful illustrations, and restrained motion. The approved sketch files remain reference artifacts; changes now go into the real Astro source. Keep production content and old URLs. No commit or deployment is authorised.

## Work limits

### Zinc and natural scroll revision

An Astra high-effort agent planned this pass using UI/UX Pro Max. Year and month groups now live only in the sidebar post index. The mobile index is a compact disclosure. The main page has a short "Writing on AI." heading and three featured essays with individual dates. Remove the personal introduction and project strip. All projects stay at the bottom. Remove the carousel title and tab bar; retain native scroll and previous/next controls. Each project has a bordered panel, a gap, and a visible next edge. Use zinc grayscale with no blue or red accents. Post sections use natural height and flow; scroll changes only the SVG highlight, never layout dimensions. This supersedes earlier color, grouping, and sticky scene choices.

### Latest layout revision

The sidebar contains only featured post titles. Projects use a distinct blue-gray horizontal slider with native scrolling, project links, and previous/next controls. There is no automatic slide rotation. Muted blue and red provide small accents. Featured posts and the full homepage post index use year and month groups with publication dates from the store. The separate /writing page is retired; old links redirect to /#all-posts. Keep all article URLs. This revision replaces the earlier sidebar project list and separate archive decision.

### Design correction after first implementation

Use a direct personal introduction, no slogan. Keep only three featured essays: context-tree-agent-support-tasks, your-ai-agent-deserves-its-own-repo, and lessons-learned-building-a-real-world-ai-agent-with-langgraph. Keep all other published posts in /writing and preserve their URLs and RSS entries. Projects appear in the primary navigation, introduction, and desktop contents rail. Remove eyebrow labels, duplicate headlines, down-arrow prompts, progress counters, and the manual motion toggle. Keep OS reduced motion. Use pale gray page and visual surfaces to separate content. Public code uses one shared renderer; plain text and ASCII diagrams use a light variant without a fake code label. A Codex high-effort review recommended this direction.

- Build small local sketches and ask for feedback early.
- Keep post and preview navigation local. The user authorised links to real project sites. Do not link to the live personal site.
- Mark fictional reviews and sample results clearly. Do not invent measured outcomes, model choices, confidence scores, or production details.
- Keep the approved homepage and post files unchanged during portfolio exploration.
- Do not commit or deploy without the user's explicit instruction.
- The post image workflow is still a small proposal. Full automation is not approved or implemented.

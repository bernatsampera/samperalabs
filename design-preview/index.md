# Design preview

- [header-study.html](header-study.html): Interactive header comparison with a revised Work header and a Project view without the site header.

- [portfolio-soft.html](portfolio-soft.html): Local preview of one broad continuous fade behind the approved portrait pieces.
- [build-portfolio-soft.mjs](build-portfolio-soft.mjs): Builds the local soft-fade preview without changing the production renderer.

- [portfolio-focus.html](portfolio-focus.html): Three centred versions with Geist type, approved structure copy, and new context subtitles.
- [build-portfolio-focus.mjs](build-portfolio-focus.mjs): Builds the Signal, Between, and Reveal preview with version controls and comparison.
- [portfolio-focus-panels.mjs](portfolio-focus-panels.mjs): Three transparent layouts that place figures above, below, or between title lines.

- [portfolio-play.html](portfolio-play.html): Three transparent compositions with stronger type, new copy, and a quieter portrait field.
- [build-portfolio-play.mjs](build-portfolio-play.mjs): Builds the standalone three-version preview with a comparison view.
- [portfolio-play-panels.mjs](portfolio-play-panels.mjs): Impact, Questions, and Margins layouts with the unchanged pruning copy.

- [portfolio-fragments.html](portfolio-fragments.html): Floating typography and minimal figures with no rectangular panels, coloured backing, or hover border.
- [build-portfolio-fragments.mjs](build-portfolio-fragments.mjs): Builds the transparent portrait preview and embeds all assets.
- [portfolio-fragments-panels.mjs](portfolio-fragments-panels.mjs): Clear canvas compositions for the four floating pieces.
- [portfolio-fragments-assets/index.md](portfolio-fragments-assets/index.md): Transparent monochrome figures and complete generation prompts.

- [portfolio-directions.html](portfolio-directions.html): Editorial, Poster, and Split versions with integrated images and shorter copy.
- [build-portfolio-directions.mjs](build-portfolio-directions.mjs): Builds the standalone three-direction portrait preview and comparison view.
- [portfolio-directions-panels.mjs](portfolio-directions-panels.mjs): Date-free introductory cards, concise content, and three visual layouts.

- [portfolio-context.html](portfolio-context.html): Approved opening and three cards in the portrait flight, with new object illustrations.
- [build-portfolio-context.mjs](build-portfolio-context.mjs): Rebuilds the standalone preview with embedded illustrations and the current reading zone.
- [portfolio-context-panels.mjs](portfolio-context-panels.mjs): Approved card text, dynamic date, and distinct opening layout.
- [portfolio-context-assets/index.md](portfolio-context-assets/index.md): Three generated image assets and their generation prompts.

- [information-visuals.html](information-visuals.html): Continuous portrait flight with extended reading zones, Objects selected by default, and a comparison view.
- [build-information-visuals.mjs](build-information-visuals.mjs): Rebuilds the minimal card preview with People, Objects, and Shapes versions.
- [information-visuals-art.mjs](information-visuals-art.mjs): Draws the twelve illustrations with no text inside the visual area.
- [information-reading-zone.mjs](information-reading-zone.mjs): Builds the continuous camera path, centres approaching panels, and softens the surrounding field.

- [information-flight.html](information-flight.html): Continuous portrait flight with four questions, three visual versions, and a comparison view.
- [build-information-flight.mjs](build-information-flight.mjs): Rebuilds information-flight.html from the site renderer, local assets, and the preview content.
- [information-panel-art.mjs](information-panel-art.mjs): Draws twelve panel illustrations across the Paper, Type, and Windows versions.

- [information-journey.html](information-journey.html): Self-contained knowledge map concept that follows a question, reviews a discovery, and carries knowledge into another session.

- [work-flight.html](work-flight.html): Local portrait flight concept with six visual work cards, scroll controls, a gallery, and card details.

- [maat-brain/index.md](maat-brain/index.md): MAAT Brain article, homepage scroll scene, and review screenshots.

- [article-trial/index.md](article-trial/index.md): Local context article trial with an original comic, a diagram, and a full reading preview.
- [implementation-plan.md](implementation-plan.md): Production implementation scope, agent work split, and validation plan.
- [implementation-review.md](implementation-review.md): Implementation results, repeatable checks, and known limits.

- [home-demo.html](home-demo.html): Combined local homepage with approved post sections and compact project stories linked to real project sites.
- [home-demo.css](home-demo.css): Responsive project sections and small visual explanations for the combined demo.
- [home-demo.js](home-demo.js): Preserved post animations, active homepage navigation, and project entrance motion.

- [decisions.md](decisions.md): Locked homepage and post decisions, remaining portfolio choices, and local preview constraints.
- [portfolio-story.html](portfolio-story.html): Current BJJGym sketch with the project purpose, problem, and solution on both portfolio surfaces.
- [portfolio-options.html](portfolio-options.html): Side-by-side review controls for three portfolio concepts and their homepage and individual-page surfaces.
- [portfolio-data.html](portfolio-data.html): Follow the data, a review becomes evidence, labels, and a gym summary.
- [portfolio-compare.html](portfolio-compare.html): Before and after, compare raw reviews with their classified summary.
- [portfolio-inspect.html](portfolio-inspect.html): Inspect one decision, connect a mood label with its supporting review text.
- [scroll.html](scroll.html): Current scrollable homepage with one section per post, a visible reading link, and a contents list that tracks the current section.
- [scroll.css](scroll.css): Open editorial layout, sticky post sections, responsive contents navigation, and reduced-motion layout.
- [scroll.js](scroll.js): Scroll-driven visual explanations and active contents tracking without scroll capture.
- [motion.html](motion.html): Current homepage motion study with one continuous visual, a two-post index, local reading links, and reduced motion controls.
- [motion.js](motion.js): Deterministic six-second scene timeline with spring motion, pause, replay, and scrubbing.
- [ideas.html](ideas.html): Current small direction check with two visual post previews, local reading samples, and a secondary portfolio mention.
- [playground.html](playground.html): Second sketch with a compact Read and Try home page and an interactive product portfolio.
- [playground.css](playground.css): Responsive styles for the second sketch and each product preview.
- [playground.js](playground.js): Local demo interactions, post summaries, filters, and dialog controls.
- [index.html](index.html): Local design sketch with three home page and portfolio options, a shared post view, and a proposed image workflow.

The scroll homepage and original Post view in index.html are approved and locked. Read decisions.md before changing either. Open home-demo.html to review the combined homepage with BJJGym, IndoEuroMap, and gcontext. The previous three portfolio options were rejected. The earlier sketches remain for reference.

The second sketch uses public post and project descriptions. Article card titles are proposed summaries. The original published title appears in each detail view. The gym data, map, context answer, and packing lists are local samples. No demo calls a product API.

To check the preview: switch products, choose a city, filter training types, select a map pin, toggle both context files, choose a trip, check packing items, filter posts, open a post summary, close it with Escape, and switch between Overview and Play with my work. Repeat at a narrow browser width.

This preview uses sample text and existing local images. It needs no build or service. It does not write to the site or its API.

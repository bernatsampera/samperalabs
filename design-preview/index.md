# Design preview

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

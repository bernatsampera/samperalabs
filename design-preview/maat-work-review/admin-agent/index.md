# admin agent

- [index.html](index.html): Editable HyperFrames video composition.
- [DESIGN.md](DESIGN.md): Visual direction, typography, colors, and motion rules.
- [demo.mp4](demo.mp4): Silent rendered explanation at 1920 by 1080 and 30 fps.
- [poster.jpg](poster.jpg): Poster extracted from the video.
- [frames.jpg](frames.jpg): Contact sheet of representative exported frames.
- [transcript.md](transcript.md): On-screen explanations as a text alternative.
- [meta.json](meta.json): Composition identity and title.
- [package.json](package.json): Commands pinned to HyperFrames 0.9.12.
- [hyperframes.json](hyperframes.json): HyperFrames asset and composition configuration.
- [assets/gsap.min.js](assets/gsap.min.js): Local GSAP animation library.
- [AGENTS.md](AGENTS.md): Generated HyperFrames project guidance, subject to user instructions.
- [CLAUDE.md](CLAUDE.md): Generated compatibility guidance for the video project.

## Reproduce

Run `node design-preview/maat-work-review/build.mjs` from the site root.
Run `npm run lint` and `npm run render` from this composition folder.
Run `node design-preview/maat-work-review/serve.mjs` from the site root for the review page.

Browser checks are not authorized in this session. HyperFrames renders the requested artifact. FFmpeg extracts frames for inspection.

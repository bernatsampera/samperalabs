# Schedule import video demo

- [review.html](review.html): Video player with section controls and a text alternative.
- [demo.mp4](demo.mp4): Silent 37-second demonstration at 1920 by 1080 and 30 frames per second.
- [poster.jpg](poster.jpg): Representative frame used before playback.
- [frames.jpg](frames.jpg): Contact sheet from the rendered video for visual review.
- [index.html](index.html): Editable HyperFrames composition with embedded Geist font and five scenes.
- [DESIGN.md](DESIGN.md): Article-specific visual direction, palette, typography, and motion rules.
- [assets/gsap.min.js](assets/gsap.min.js): Local GSAP 3.15.0 dependency used by the composition.
- [package.json](package.json): Commands pinned to HyperFrames 0.9.12.
- [hyperframes.json](hyperframes.json): HyperFrames project configuration.
- [meta.json](meta.json): Project identifier and display name.
- [AGENTS.md](AGENTS.md): Framework instructions supplied by the project generator.
- [CLAUDE.md](CLAUDE.md): Framework instructions supplied for Claude by the project generator.
- [.gitignore](.gitignore): Excludes tool caches and temporary render data.

## Reproduce

From this directory, run:

```text
npx --yes hyperframes@0.9.12 lint --json
npm run render -- --output demo.mp4 --fps 30 --quality standard --workers 2
ffmpeg -y -ss 11 -i demo.mp4 -frames:v 1 -q:v 2 poster.jpg
ffmpeg -y -i demo.mp4 -vf "select='eq(n,120)+eq(n,345)+eq(n,510)+eq(n,600)+eq(n,825)+eq(n,1035)',scale=640:360,tile=2x3" -frames:v 1 -q:v 2 frames.jpg
```

Rendering uses headless Chrome to produce the video. Respect the current session's browser restrictions for separate browser checks.

## Evidence and limits

This is an illustrated explanation, not a recording of a live MAAT session.
The timetable, class, and OCR correction are fictional examples.
The class is Monday, BJJ Fundamentals, 18:00 to 19:00 in every scene.
The approximate 30-minute and 5-minute results come from the author's schedule-import article.
See [article evidence](../../src/editorial/drafts/gym-schedule-import/review-notes.md) for the implementation and measurement limits.
There is no narration or music. On-screen explanations carry the story.

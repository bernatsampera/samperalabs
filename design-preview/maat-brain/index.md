# MAAT Brain draft review

- [comic-phone.jpg](comic-phone.jpg): Phone review of the original comic above the first section.
- [../../src/editorial/drafts/maat-brain-comic.png](../../src/editorial/drafts/maat-brain-comic.png): Generated two-panel comic about sharing instructions with people and AI.
- [../../src/editorial/drafts/maat-brain-comic-prompt.txt](../../src/editorial/drafts/maat-brain-comic-prompt.txt): Saved built-in generation prompt, with no reference images.

- [article-ste.jpg](article-ste.jpg): Restored article with ASD-STE100 clarity edits at the new URL.

- [article-humanizer.jpg](article-humanizer.jpg): Rejected Humanizer edit, retained as a historical screenshot.

- [../../src/editorial/drafts/maat-brain.md](../../src/editorial/drafts/maat-brain.md): Revised article with four main sections, 11 subsections, five code or text examples, and four diagrams.
- [article-desktop-v2.jpg](article-desktop-v2.jpg): Revised title and nested desktop contents.
- [article-phone-v2.jpg](article-phone-v2.jpg): Revised phone opening and first section.
- [../../src/components/home/BrainScene.astro](../../src/components/home/BrainScene.astro): Shared handbook scene with readers and separate motion intervals.
- [home-desktop.jpg](home-desktop.jpg): Desktop homepage with the team step active.
- [article-desktop.jpg](article-desktop.jpg): Desktop article title and opening.
- [article-phone.jpg](article-phone.jpg): Phone article diagram and reading layout.
- [home-phone.jpg](home-phone.jpg): Phone homepage scene with readable labels.

## Preview

Run `npm run dev -- --host 127.0.0.1`. Use the port Astro reports.
The current session uses http://127.0.0.1:4323/.
Open `/posts/building-an-ai-brain-at-maat` to read the article.
Open `/#essay-building-an-ai-brain-at-maat` to review the homepage animation.

The MAAT Brain article is now published in the post database. The homepage, public article route, RSS, and sitemap use the database record. The local draft remains an editorial source.

## Editorial decisions

The author rejected the Humanizer edit. The current article restores the preceding draft and applies small ASD-STE100 clarity edits. It keeps the four main sections, 11 subsections, five code blocks, and four diagrams. Humanizer is no longer installed in this project.

Main claim: shared context needs a hierarchy that people and AI can understand.
Use collective authorship for the work. Focus on deliberate structure and adding knowledge as it grows.
The user confirmed developer questions, support tasks, and migrations as current uses.
The invoice request is fictional. Both folder diagrams are simplified examples.
No private support procedures, customer records, internal infrastructure, or measured results are reproduced.
The article does not claim that knowledge growth is automatic or solved.

## Repeatable review

1. Open the homepage on desktop when browser review is requested. Scroll through the first section. Readers appear around the shared handbook.
2. Use its reading link. Check the four main sections, 11 nested subsections, five code blocks, and four diagrams.
3. Repeat at 375 pixels wide. Check that labels wrap without horizontal page overflow.
4. With reduced motion enabled, the complete handbook scene stays visible. With JavaScript off, all scene content remains present.
5. Run `npm run build` and `git diff --check`.

The first version passed build and whitespace checks. Desktop scroll advanced through the sequence. The article link and contents navigation worked. The revised version has valid anchors for all 15 headings. Phone checks and screenshots are saved here. Reduced motion uses the existing preference handler and a CSS rule; it was reviewed in source, not toggled in the browser.

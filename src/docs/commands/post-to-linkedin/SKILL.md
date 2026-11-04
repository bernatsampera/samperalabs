---
name: post-to-linkedin
description: Prepare a ready-to-paste LinkedIn post, with media (carousel, video, or image), for one published SamperaLabs article. Use when the author invokes post-to-linkedin with an article slug or draft folder name, or asks for a LinkedIn post about a SamperaLabs article.
---

# Prepare a LinkedIn post for a SamperaLabs article

Input: one article slug or draft folder name, for example `why-ai-agents-need-a-global-context` or `global-context`.
Output: a finished post folder in `src/editorial/linkedin/<slug>/` and the post text in the clipboard.

Do the full job without questions.
Make every editorial decision with the rules in [linkedin-guide.md](linkedin-guide.md).
Record each decision and its reason in `post.md`, so the author can reverse it.
Ask the author only when the post cannot be true without a personal fact that no source contains.
In that case, write the post without that fact first, then ask.

Never post to LinkedIn. Never commit or push. Never open a browser for review.

## 1. Locate the site and the article

Resolve this skill's real path through its symlink.
The site root is four directories above this skill directory, or `SAMPERALABS_ROOT`.
Read the site's `index.md` and [linkedin-guide.md](linkedin-guide.md) before you start.

Find the article source in this order:

1. A folder in `src/editorial/drafts/` whose `metadata.json` has this slug, or whose name is the input.
2. A file `src/editorial/drafts/<name>.md` or `src/editorial/revisions/<slug>.md`.
3. The live page `https://samperalabs.com/posts/<slug>`, as text. Use live image URLs for its images.

Confirm that the live URL returns HTTP 200. If it does not, stop: only published articles get a post.
If the local text and the live text differ, the live text wins.

Read the complete article, `review-notes.md` (sources, limits, author decisions), `images.md`, and `metadata.json` when they exist.
Read `src/editorial/linkedin/index.md` to see earlier posts, their ideas, their images, and the calendar.

## 2. Decide the post

Use [linkedin-guide.md](linkedin-guide.md). Decide, in this order:

1. **The gate.** Extract the five inputs from the article: faith, claim, artifact, mechanism (3 to 7 steps), and where it breaks. See "Gate" in the guide. Write them in the `Faith` section of `post.md` before any draft. Do not draft until all five exist.
2. **The hook.** Write five candidate hooks from the claim (statements, 80 characters or fewer). Pick the one closest to the faith and record the others in Decisions.
3. **The example.** The article's own concrete example (fictional or real, with the same label).
4. **The voice.** "I" for the author's opinions and actions as the article states them. "We" for team work. MAAT and the author's role appear only as the article states them.
5. **The media.** Carousel, video, or image, with the decision rule in the guide.
6. **The tag.** Tag the MAAT company page only when the article describes MAAT team work.
7. **The date.** The next free slot in the calendar rule of the guide.

If an earlier post already used the same faith or image, choose another one from this article.

## 3. Write the text

Write the post, the first comment, and the slides or video plan.
Follow the post template, length, and language rules in the guide. The numbered steps in the post and in the slides use the same numbers and the same words.
Use only facts that the article or its review notes support.
Keep each limit next to its claim ("in this test", "a fictional example", "one bench run").
Use the project [ASD-STE100 skill](../../../../.agents/skills/asd-ste100/SKILL.md) in its STE-flavored mode.
Then run the `unslop` skill on the post text for pattern detection.
Then apply the quality bar and the faith test in the guide. Rewrite until both pass.
Do not add opinions, feelings, or experiences that the article does not contain, even when `unslop` suggests more voice.

## 4. Make the media

Run from the site root:

```text
npm run linkedin-media -- image <slug> <repo-relative-image-path>
npm run linkedin-media -- carousel <slug>      # reads slides.json that you write first
npm run linkedin-media -- video <slug>         # only for slugs with a homepage scene
```

For a carousel, write `src/editorial/linkedin/<slug>/slides.json` first. The format is in [../../linkedin-post-command.md](../../linkedin-post-command.md).
For an article without a local draft, download only the images you use into `src/editorial/linkedin/<slug>/source/`, then refer to them there.
Read every generated slide PNG or the video `poster.png` with the image viewer tool.
Fix and render again when text is cut, an image is too small to read, or a slide repeats another slide.
Do not generate new images. Reuse the article images and the homepage scene.

## 5. Write `post.md` and check it

Write `src/editorial/linkedin/<slug>/post.md` with the format in [../../linkedin-post-command.md](../../linkedin-post-command.md).
Run `npm run linkedin-media -- check <slug>`. Fix every failure, then run it again until it passes.
The check covers [failure-modes.md](failure-modes.md) 19 to 24 and [blocked-phrases.json](blocked-phrases.json).

Update `src/editorial/linkedin/index.md`: add or update the row for this post (date, slug, idea, media, status).

## 6. Hand over

Copy the post text (only the `## Post` section) to the clipboard:

```text
awk '/^## Post/{f=1;next}/^## First comment/{f=0}f' src/editorial/linkedin/<slug>/post.md | awk 'NF{p=1} p' | sed -e :a -e '/^\n*$/{$d;N;ba' -e '}' | pbcopy
```

Return, in this order:

1. The faith, in one sentence (for the author only, it is not in the post).
2. The post text, exactly as copied.
3. The first comment.
4. The media file path to attach, and the planned date and time.
5. The decisions, one line each, with their reason.
6. Any fact you left out because no source supports it, with the question that would let you add it.

Post status stays `ready`. The author posts by hand and can then tell you the post URL; record it in the index with status `posted`.

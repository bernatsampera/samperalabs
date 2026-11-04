# LinkedIn media failure modes

These failures were defined before the media script existed.
The script must detect each one and stop with a clear message.
It must not publish, commit, or push.

## Input

1. The slug has no live article (the URL does not return HTTP 200).
2. The output folder is outside `src/editorial/linkedin/`.
3. `slides.json` is missing, is not valid JSON, or has an unknown slide kind.
4. A slide refers to an image file that does not exist.
5. The carousel has fewer than 3 or more than 10 slides.
6. The video request names a slug with no homepage scene.

## Carousel

7. Slide text overflows its box, so a reader cannot see all of it.
8. Text is too small to read on a phone (body text below 34 px at 1080 px width).
9. An image is stretched or cropped so that its text is cut.
10. The PDF page count differs from the slide count.
11. A page has a size other than 1080 x 1350 px.
12. The site font fails to load, and a fallback font renders.

## Video

13. The homepage section `#essay-<slug>` is missing on the live homepage.
14. The capture starts after the animation began, or ends before it finished.
15. The scene is captured in scroll mode, so it does not play.
16. The output has a codec, pixel format, or size that LinkedIn rejects.
17. The video is shorter than 3 s or longer than 60 s.
18. The final frame does not show the complete scene.

## Post check

19. The post text contains an en dash or an em dash.
20. The post text contains a blocked phrase from `blocked-phrases.json`.
21. The post text is shorter than 80 words or longer than 260 words.
22. The article URL is missing from the first comment.
23. The media file named in `post.md` does not exist.
24. The `Facts` table has a claim with no source path.
25. The hook (first line of the post) is longer than 140 characters, or it is a question.
26. The post has more than one paragraph of three words or fewer.

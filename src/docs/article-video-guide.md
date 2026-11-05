# SamperaLabs article videos

Use this guide when Bernat requests a video that explains an article or project.
Use the HyperFrames skills for implementation details. Use this guide for the editorial direction.
An article does not automatically need a video. Keep preparation local until publication is requested.

## Purpose

Explain one useful idea through something the viewer can see change.
The video must work without a reader first reading the article.
Keep the article available for details, code, links, and reading at the reader's own pace.

Do not turn each paragraph into a slide. Do not read the article aloud over moving headings.
Ask what motion can explain better than a still image or a paragraph.
If the answer is unclear, propose a diagram or screenshot instead.

## A shared standard, with a separate direction for each article

Keep these qualities consistent:

- Clear language and titles that describe the actual work.
- Claims supported by the article or its evidence.
- Readable type, accurate captions, clear audio, and controlled pacing.
- Minimal on-screen text. Use labels for meaning, not decoration.
- Product screenshots with correct proportions and legible details.
- Honest distinctions between real recordings, staged examples, and conceptual drawings.

Choose these separately for each video:

- The opening and the example that carries the explanation.
- The visual medium: product recording, document animation, diagram, illustration, code, or a deliberate combination.
- The composition, visual motifs, camera movement, transitions, and pace.
- Whether narration, ambient sound, music, or silence helps explain the subject.
- The duration and ending.

There is no required intro, scene count, problem-solution-result formula, music bed, or closing logo animation.
Do not reuse a previous video's structure and change only its words, colors, or icons.
Reuse rendering code and accessible controls. Choose the story and scenes again.
Do not force novelty when the subject benefits from a familiar visual form.

Read the current site design rules before choosing colors and type.
The site's current interface uses Geist, neutral colors, and blue for emphasis.
Use these as a starting point. An article-specific visual direction can differ when Bernat selects it.
Write the selected direction into the composition's DESIGN.md before animation work begins.
Do not apply a library's default house style without checking whether it suits the article.

## Prepare one review package

Read the complete article and its evidence first.
Keep the author's accepted title and meaning unless the requested edit changes them.
Do not invent personal experiences, rejected tools, production behavior, or measured results.

Prepare one HTML review page with:

1. The viewer's question and the main idea, each in one sentence.
2. Two distinct visual directions, shown through a few representative frames.
3. A recommended direction and the reason it fits this subject.
4. The complete proposed narration beside the corresponding scenes.
5. The intended position of the video on the article page.
6. Only the factual questions that prevent accurate production.

Present the full proposal together. Do not ask Bernat to approve each title, sentence, and scene in separate messages.
If a direction is already approved, proceed within it. Do not reopen settled choices.
Use one review URL through revisions so Bernat can point to parts that need changes.

## Write for the screen and the ear

The current default is a silent explanation with short on-screen sentences.
Show what we built and how it works. Labels alone do not explain the purpose of a step.
Keep each sentence visible while its action happens. Let reading time determine the duration.
Use narration only when it is requested or selected for that article.

Use a concrete example early. Give the viewer enough context to understand why the example matters.
Explain the decision through its effect on the example.
Let a visible action carry the explanation where possible.

Use narration for connections and reasoning that the image cannot explain alone.
Use short spoken sentences. Avoid slogans, dramatic claims, and generic introductions.
Do not repeat narration as large text. Keep subtitles as a separate accessibility layer.
Do not force every element to move. Allow enough time to inspect meaningful states.
Choose transitions that preserve understanding of location, sequence, or cause.

Prepare narration before final timing. If narration is used, time the scenes against the actual recording.
Use the author's recording or an agreed synthetic voice. Do not imitate the author without permission.
Music is optional. It must not compete with speech.

## Schedule import: first proposed direction

Title: Importing classes as JSON from schedule images with OCR.

Use one fictional class as the continuous example. Keep its name, day, and times consistent throughout.
The proposed visual form is a close view of a timetable, editable text, and class fields.

| Moment | What the viewer sees | What it explains |
| --- | --- | --- |
| Manual entry | A timetable cell and the separate fields it must fill | The repeated work the sales team performed |
| Extraction | The class appears in an editable text table | OCR separates image reading from data conversion |
| Review | A clearly marked staged reading error is corrected beside the source image | The team can intervene before conversion |
| Conversion | The same class becomes JSON and then editable schedule fields | How the checked text becomes usable class data |
| Difficult image | Replacement text enters the same review step | A different extraction method can use the rest of the tool |
| Result | The completed schedule and about 30 minutes changing to about 5 minutes | The author's approximate schedule-entry time saving |

Treat these as story material, not six required scenes.
A first cut could be about 60-90 seconds. Adjust the length to the example and spoken script.
Do not animate the real waiting time unless it was measured. Label a staged example where it appears.
Do not imply that an invented OCR error came from a verified model run.

For a MAAT Brain article, a support question moving through linked guides may be a better visual story.
For an Admin Agent article, a question, access boundary, tool call, and answer may carry the explanation.
These are directions to explore, not templates to apply automatically.

## Position on the site

Start with an optional video near the article opening. Keep the text available below it.
Beside the opening text can work on wide screens if the video remains large enough to read.
Use a vertical layout on phones. Do not squeeze a full article and video into permanent narrow columns.

Use a meaningful poster, visible controls, and playback started by the reader.
Do not autoplay narration or use scroll to force playback.
Provide captions and a transcript when the video contains speech.
Describe important visual information through narration or the text alternative.
Use a standard video element for the rendered file unless an interactive composition serves a specific purpose.
Preserve the media aspect ratio. Load the poster first and avoid downloading the entire video on page load.

## HyperFrames production

Check the installed CLI version and its matching documentation before production.
Pin the chosen version for the video project. Keep its source and assets reproducible.
The repository documents Node.js 22 or later and FFmpeg as requirements.
HTML, CSS, media, and seekable animations form the composition. The renderer produces MP4 through headless Chrome and FFmpeg.

Use this order:

1. Establish the article-specific design and complete storyboard.
2. Build the static frame where each scene must be most readable.
3. Add narration and set the scene timing, when narration is part of the direction.
4. Animate the information changes.
5. Run the applicable static checks.
6. Inspect representative frames and transitions, then render a review video when authorized.
7. Review the complete export with sound and without sound.

Session restrictions take precedence over a skill's default commands.
HyperFrames preview, inspect, validation, and rendering can use a browser, including headless Chrome.
Do not run browser operations when the session prohibits them. Report checks that were not run.
Do not install or update global skills as an incidental part of video creation.

Keep the composition source, media, narration, captions, poster, final MP4, tool version, and render command together.
Record which facts and images came from which article sources.
Provide a repeatable render command and a review artifact, not only an implementation description.

## Review criteria

- The video explains its subject without requiring the article first.
- Each scene contributes new information or makes a relationship easier to understand.
- The visual direction fits this article rather than an unrelated product promotion.
- The example remains consistent across scenes.
- The viewer can read each important state before it changes.
- Text, captions, and important controls remain legible at the intended display size.
- Speech, captions, and visible actions agree.
- Images keep their proportions. Nothing important clips or overlaps.
- Limits and staged examples remain clear without dominating the explanation.
- The published article's claims and the video's claims agree.
- Bernat can review the complete result before publication.

## References

- [HyperFrames repository](https://github.com/heygen-com/hyperframes): Framework, supported workflows, requirements, and rendering model.
- [HyperFrames documentation](https://hyperframes.heygen.com/introduction): Current implementation documentation.
- [Editorial guide](editorial-guide.md): Article ownership, evidence, review, and publication rules.
- [Image workflow](post-image-workflow.md): Visual evidence and treatment of fictional examples.
- [Site design tokens](../assets/styles/tokens.css): Current interface type, colors, and spacing.

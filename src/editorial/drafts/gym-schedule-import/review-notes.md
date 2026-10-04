# Article review notes

## Direction

- Reader: a person who builds AI tools for internal work.
- Benefit: the reader can divide image extraction from data conversion and add a useful human review point.
- Main claim: editable Markdown reduces the cost of the normal path and supports a manual fallback for difficult images.
- Title: From a gym schedule picture to classes in MAAT.
- Outline: repeated entry, tool and cost choice, two-step conversion, schedule review, difficult-image fallback.
- Mode: draft from evidence. The author supplied the problem, choice, cost comparison, failure cases, and fallback.
- Language: use the project ASD-STE100 skill's rules for explanatory prose. Preserve the author's team voice.
- Language reference: [ASD-STE100 skill](https://github.com/danyuchn/asd-ste100-skill). The skill does not include the official approved-word dictionary.

## Evidence

Source checkout: `/Users/bsampera/Documents/maat/maat-internal`.
Commit: `1de80aa559f4e131ca76f8effdd24a732366e51a`.
The source had existing local changes. We did not change source files.

Separate API checkout: `/Users/bsampera/Documents/maat/backend`.
Commit: `5efbf6799f146fbf084b644362b687bbb07362f6`.

| Claim | Evidence | Limit |
| --- | --- | --- |
| Manual entry caused tedious work | Author's request | No timing study supplied |
| Feature reached production months ago | Author's request | No release date or production run checked |
| Docling produces Markdown on Modal | `maat-internal/backend/docling_ocr.py` | Code proves implementation, not live deployment state |
| Docling is the active OCR service | `maat-internal/ARCHITECTURE.md` and backend README | API uses `MODAL_OCR_URL`. We did not read production configuration |
| Gemini 2.5 Flash-Lite structures the text | `backend/packages/functions/src/nestjsapi/gym-ops-automation/gym-ops-automation.service.ts`, `parseScheduleStructured` | Current local code, not verified production model configuration |
| Missing end times receive one-hour estimates | `gym-ops-automation.prompts.ts`, `SCHEDULE_PARSE_PROMPT` | Instruction to model, not guaranteed output |
| Image and Markdown review precedes conversion | `maat-internal/frontend/src/app/(protected)/gym-creation/[gymId]/schedule-import/page.tsx` and `_components/markdown-review.tsx` | Frontend screenshots use staged input |
| Editor supports overlap warnings and a weekly grid | Feature docs, page imports, relevant components and hooks | No accuracy claim or full E2E run |
| Image costs EUR 0.01-0.02 versus EUR 0.20-0.50 | Author confirmed euro cents and measured ranges on 4 October 2026 | No invoices, sample size, dates, or expensive model name supplied |
| Text conversion cost was negligible | Author's request | No numeric amount supplied |
| Claude/OpenAI text can replace OCR text | Author's request and editable Markdown frontend | Fallback not executed in this session |

The architecture document names both Gemini and older Ollama/Gemma choices.
The API source confirms Gemini 2.5 Flash-Lite in the current checkout.
The Docling code uses the default DocumentConverter pipeline.
It does not name one specific vision model. Do not invent a model name.

## Visual choices

1. Product screenshots beside the conversion and review sections. Purpose: show the team's actual review controls. Caption: staged frontend views with fictional data. Source: real frontend in a temporary copy, with local fixtures. Static images need no motion.
2. An annotated schedule document beside the tool-choice section. Purpose: show how a single cell becomes day, time, and name fields. Use a document composition with margin notes. Caption: fictional example, not model output. Source: the editable mock SVG. This remains a proposed alternative.

Selected: product screenshots, as the author requested frontend images.
These differ from the recent MAAT Brain and Express the General comics.
The available context article uses navigation diagrams. This article uses product views and a schedule document instead.
The latest three live posts were not retrieved. The comparison uses available local article materials.

## Capture procedure and limits

The first frontend launch failed because another development server owned its lock.
We copied the frontend to `/tmp/maat-schedule-capture.13l3Lf`.
The copy excludes `.env` files, `.next`, and dependencies. It links the existing dependency directory.
Run the copy with `NEXT_PUBLIC_API_URL=http://127.0.0.1:3015` and `DEV_USER_EMAIL=demo@example.com`.
Start it with `npm run dev -- --webpack --hostname 127.0.0.1 --port 3014`.
Start the fixture server from the site with `node src/editorial/drafts/gym-schedule-import/capture-server.mjs`.

The upload screen rendered in the browser.
File selection failed because the extension lacks local file access.
The native picker also failed with a computer-use capture error.
We did not change extension permissions.

For the review capture, we set the image and Markdown initial state in the temporary page copy.
Use `mock-schedule.png` as a base64 data URL for `imageDataUrl`.
Use the fixture server's Markdown value for `ocrMarkdown`.
Reload the page to show the review state.
Select Convert to Schedule to reach the editor through its real handler and local mock API.
The fixture server blocks endpoints outside get-schedule, parse-schedule-ocr, and parse-schedule-structured.
No source images reached Modal, Gemini, or a production API.
No schedule was saved.

Screenshots are desktop JPEG captures at the browser's existing viewport.
We inspected the review and editor captures. The editor screenshot shows part of the longer table.
The article itself has no rendered phone or desktop preview yet.
No OCR accuracy, model output quality, latency, or saving behavior was tested.
No tests were added. No public route, remote draft, upload, commit, push, or deployment was created.

## File checks

- Metadata JSON parsed successfully.
- All article image links and local index links resolve.
- Mock image: 1000 by 580 pixels.
- Upload and review screenshots: 1728 by 935 pixels.
- Editor screenshot: 1713 by 927 pixels.
- `git diff --check` passed.
- The STE linter found one word-consistency issue. We corrected it before the final check.
- No site build was necessary for these local editorial files.

## Author update

The author reports that this task fell from about 30 minutes to five minutes per schedule.
The sales team performs this task around 15-30 times per week.
These figures come from the author's follow-up, not from a timing study inspected in this session.
The derived saving is 25 minutes per schedule.
At the stated volume, this represents 375-750 minutes, or 6.25-12.5 hours, each week.
These figures do not measure other onboarding work or guarantee results for every schedule.

We revised the prose to connect related sentences within paragraphs.
The first version separated too many closely related ideas.
Short sentences remain useful, but sentence length alone does not create flow.

The comic uses one side-view scene at gym reception.
Timetable paper replaces barbell weights, so the manual work becomes a visual joke.
This composition differs from the recent two-panel comics and computer scenes.
An alternative was a long accordion timetable with handwritten margin notes.
The barbell concept connects the joke directly to gyms and repeated work.
The comic is an illustration. Its speech is fictional.
It contains no numeric cost or time claims.

We generated the comic with the built-in image_gen tool.
We inspected the result and checked the speech bubble.
The comic measures 1536 by 1024 pixels.
The revised article passed the STE linter with no findings.
Metadata, local links, and `git diff --check` passed after the revision.
Browser checks were not run for this revision.

## Comic correction

The author rejected the barbell comic because it did not explain the faster process.
The replacement compares the same schedule task before and after automation.
The left scene shows manual class entry in about 30 minutes.
The right scene shows Docling OCR, structured output, and human review in about five minutes.
These times describe schedule setup only. They do not describe all gym onboarding work.
The gym owner's surprised reaction supplies the light humor.
The people and interface drawings are fictional illustrations.
The old comic remains as an unused local asset.
We selected `schedule-import-comic-v2.png` for the article.
We generated it with the built-in image_gen tool.
We checked the main labels, the two times, and the owner's speech bubble.
The small data drawings explain the idea. They do not reproduce the actual API schema or verified model output.
The caption limits the timing claim to schedule setup.

## Homepage animation

The author requested the homepage animation after approving the second comic.
The scene uses one fixed document frame.
The source timetable leaves while Markdown appears.
The table then leaves while structured output fills the calendar.
The class blocks enter their time slots in sequence.
The final review mark and five-minute result appear after the classes.
The 30-minute manual entry label stays visible for comparison.
The timing describes schedule setup only.

The scene reuses the existing homepage scroll controller.
It does not change section dimensions during scroll.
The SVG title and description explain the full sequence to screen readers.
A text caption explains the method and time saving at narrow widths.
The static default includes the filled calendar and both time labels.
The existing reduced-motion mode selects the same final state.

The homepage selection now includes `gym-schedule-image-to-classes`.
Public reads require a published database record.
The article now appears on the public homepage.

Local artifact: `homepage-preview.html`.
Regenerate it with `node src/editorial/drafts/gym-schedule-import/build-homepage-preview.mjs`.
The artifact embeds the shared SVG, homepage CSS, and compiled motion controller.
It uses the draft's metadata and homepage summary.
It does not create a public preview route or make network requests.

Checks: production build and focused ESLint passed.
We inspected a non-browser render of the static scene.
Browser checks were not run for this task.
No existing E2E setup covers this feature. No tests were added.
The initial local checks preceded publication.

## Publication result

The author approved publication and the scoped animation commit.
Post ID: `50`.
Public URL: https://samperalabs.com/posts/gym-schedule-image-to-classes.
Publication date: `2026-10-04`.
Code commit: `1bb8138c72d238bb0883dc4b5629566717a87afa`.
Coolify deployment: `hqvscsplwihskku31vrmmo1e`, finished.
The running site used the release commit.
Public images, article, homepage animation markup, RSS feed, and sitemap passed HTTP checks.
The release kept all existing sitemap URLs.
Tags use existing `AI` and `ocr` values.
The upload API returned a private storage URL, so publication uses verified site images.
The receipt retains the publication results.
The deploy-post read-only check passed against this release.
It found no article changes, new images, or code release requirements.
Browser checks were not run for the release.

## Review issues

- The author approved the final wording and main claim.
- Confirm whether the current source model names match the original release. The article uses the inspected implementation.
- Billing records could strengthen the cost comparison. The article attributes the figures to historical team measurements.
- A real OCR capture would provide stronger evidence than the staged frontend views.
- The release did not include a browser check of the reading layout on phone or desktop.

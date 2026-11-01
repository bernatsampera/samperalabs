# SamperaLabs design system

Approved on 2026-11-01. Values live in [tokens.css](tokens.css).
Approved pages: [clean/index.html](clean/index.html) (home) and [clean/maat.html](clean/maat.html) (MAAT story).

## Source

The system copies the design values of https://ustinov.design/: the 900 px column, the type scale, the spacing, the radii, the pill navigation, light gray bands and one dark section.
The content, code and images are ours. We copied no code, images or text.

The reference face is PP Neue Montreal, a paid font. Geist stands in until a licence is bought. Change `--font-sans` only.

## Palette

Use white, grays, black, and one blue accent. Nothing else.

- **Grounds are light.** Pages are white. Panels and the part view use `--color-canvas` (#F2F2F4).
  Reason: the reference reads as light. Pitch-black slabs and black cards looked aggressive.
- **Dark appears only in small objects.** Solid buttons, number badges and lines that carry meaning use ink. The one exception is the lower section of the home page.
  Reason: dark areas behind or around reading text made every version hard to read.
- **Never put a white reading card on a dark ground.**
  Reason: the jump from white to graphite glared.
- **Blue means "now" and links.** The moving marker, the Now line and "Read" links use the accent. Nothing else is blue.
  Reason: one meaning per color keeps the page quiet. The accent must not be orange.
- **Parts are told apart by number, not color.** Each part of a journey has a black badge (1, 2, 3). The same badge is on its timeline lane and its card.
  Reason: colored parts (teal, coral, sun) broke the agreed palette.

## Contrast

Each gray has one job. Keep these pairs.

| Role | Token | On white | On canvas |
|---|---|---|---|
| Titles | `--color-ink` #14141A | 18:1 | 16:1 |
| Reading text | `--color-graphite` #3C3C43 | 10.4:1 | 9.3:1 |
| Dates, labels | `--color-slate` #5F5F67 | 6.3:1 | 5.6:1 |
| Large display only | `--color-faint` #8E8E95 | 3.2:1 | not used |
| Decoration only | `--color-mist` #9A9AA1 | never text | never text |

Use solid colors, not transparent black or white. Transparent grays looked muddy.

## Type

- **One family.** Use 400 for reading and 500 for headings, names and buttons.
- **Normal letter spacing for text.** Tighten only display sizes (-1.2 px at 56 px).
  Reason: wide tracking and weight 500 on body text made the page look bloated.
- **The scale:**

  | Size / line height | Use |
  |---|---|
  | 56/62 | display |
  | 48/54 | page title |
  | 42/48 | section titles |
  | 38/44 | chapter card title |
  | 21/27 | names |
  | 17/27 | lede |
  | 16/26 | body |
  | 15/20 | buttons |
  | 14/20 | small |
  | 13/18 | meta |
  | 12/16 | ruler |

- **Banned treatments:**
  - capital-letter labels above headings;
  - middle-dot strings in new pages (use commas);
  - arrows on text buttons. Directional controls (Previous, Next, Back) keep their chevrons, and links keep a small chevron.

## Layout

- **One centered column** of 900 px. The phone side padding is 24 px.
- **Home hero:** centered, as in the reference.
- **Structured content is left aligned**, and its title block sits on the same left edge. This covers the timeline, the cards and the story overview.
  Reason: a centered title over a left-aligned table gave two axes and looked loose.
- **Breakpoints:**
  - story phone: 719 px;
  - site phone: 809 px;
  - tablet: 810 to 1199 px;
  - short screens: 820 px high.

## Components

- **Pills** are 36 px high with a radius of 18.
  - Solid ink is the main action. There is one per view.
  - Hairline pills are for the rest, and their border turns ink on hover.
- **Links** use the accent, weight 500, with a small chevron that moves 3 px on hover.
- **Project cards** are white with a hairline border and a radius of 20. Each card shows:
  - its number badge and dates;
  - its name and its question;
  - its chapters with their months;
  - the count and "Open".

  On hover the border turns ink, and the card rises 2 px.
- **Timeline** (journey overview): one light panel.
  - Names with number badges sit in a left column.
  - Each part is a 2 px ink line on a month ruler, with dots at its chapters and a gray dotted line to Now while it is still going.
  - A faint blue Now line runs through all lanes.
  - Hovering a lane highlights its card, and the other way round.
- **Story path** (inside a part): Start plus the chapters. There is no mission stop.
  - Stops are white circles with the chapter icon.
  - Visited stops get an ink ring.
  - The current stop is ink, and the blue marker sits on it.
  - The path behind you is solid ink, and the path ahead is dotted gray.
- **Part opener:** the part name in ink, with its question (the mission) in gray at the same size.
  Reason: the mission belongs in the first view, not at the end of the path.
- **Chapter card:** white, hairline, a radius of 16, and a caret that points at its stop.
  - The title runs across the full width.
  - Below it, the text sits on the left, and "What I learned" sits in a gray panel on the right, aligned at the top.
- **Last chapter:** the Next button reads "Next: (next part)" and opens it.
- **Removed on purpose:**
  - "You are here" (it said nothing new);
  - the mission flag;
  - rounded timeline bars;
  - dark part cards.

## Depth

The system is flat. Separation comes from hairlines and the gray canvas.
One shadow exists, `--shadow-float`, and only the chapter card that floats over the part view uses it.

## Motion

Keep the motion of the accepted flyover-2 flow. It was approved twice.

| Motion | Duration | Easing |
|---|---|---|
| A project card grows to full screen (clip-path), and its part opens | 950 ms | `--ease-move` |
| The marker travels the path to the next stop | 900 ms, plus 140 ms per extra stop | `--ease-move` |
| The chapter card leaves | 200 ms | `--ease-in` |
| The new chapter card rises in | 460 ms | `--ease-out` |
| A ring pulses on arrival | 900 ms | |
| The next part wipes in from the right | 850 ms | |
| A part folds back into its card on exit | 800 ms | |
| Home sections appear on scroll | 800 ms, 80 ms apart | |
| Hover | 200 ms | |

- **Reduced motion:** short crossfades only, no travel, and every change under 1 s.

## Rejected directions

These were tried and rejected on 2026-11-01. Do not bring them back without a new decision.

- **The Islands world and the flyover-2 style:** cream ground, Fraunces, coral pills, dot grid. They "looked very AI".
- **Three concept directions:** Survey sheet (map), Picture statistics (Isotype), Exhibition rooms. All three were rejected as too far from the wanted clean look.
- **Black part cards and a pitch-black part view.** They were too aggressive.
- **A graphite part view with a white card.** The contrast was harsh.
- **Colored parts.** They broke the palette.
- **An orange accent.**

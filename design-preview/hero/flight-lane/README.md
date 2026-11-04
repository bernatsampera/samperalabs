# Hero F, the lane draft: the portrait you fly into

This folder is the draft of the zoomed part: the cards the visitor meets after scrolling. Its first view is a
copy of `../flight/index.html`, which another round owns. When the lane is approved, `content.js`, the lane and
the cards of `flight.js`, and the two one-line edits of `index.html` (the `data-hint` attribute, the box label
without capitals, the box body with line breaks) move into `../flight`.

Open `index.html` in a browser. Scroll on the page to fly in. The face breaks into a field of cards. One lane of
them comes toward you in order; the others fly past. Click a card with a link to open its page (same tab on this site, new tab for other sites). Click a card without a link to open its box. Esc or "Back to the face" returns.

## Change what the visitor sees

Edit `content.js`. Nothing else.

- `cards` is the lane, in order, first to last. The first five are the main ones: who I am, the career list,
  MAAT, enabling AI across MAAT, gcontext. The rest follow at equal weight.
- A card has: `label` (what it is, with commas, no capitals), `title`, `body` (the three lines on the card),
  `detail` (the text in the box, falls back to `body`), `href` and `cta` (the link on the card and the button in
  the box). A click on a card with `href` opens that page directly. A card without `href` opens its box.
- A card can carry `list: [{ when, what }, ...]` instead of a `body` (the career card). Up to seven rows.
- Delete a card to hide it. Move a card to reorder. Add a card by adding an object.
- Keep `body` to about 3 short lines and `title` to 3 lines. Longer text is cut with an ellipsis.
- The cards around the lane are smaller copies of the same cards, chosen at random. There is nothing to edit for them.

Then run the screenshots (below) and look at `shots/desktop-at-*.png`.

## Change how a card looks

`flight.js`, function `drawCard`. It draws the text of a card into the atlas at 768 px wide and returns the card
height, so every card is as tall as its text. Sizes are given in px at a 500 px wide card (`px(30)` is a 30 px
title on a 500 px card). Colors are the site tokens.
The paper, the rounded corners, the hairline and the shadow are drawn by the fragment shader in `flight.js`
(look for `shape`, `line`, `shadow`), so they stay crisp at any zoom.

## Change the rhythm of the flight

Constants at the top of `flight.js`:

- `Z0`, `STEP`: the depth of the first lane card and the depth between lane cards (more `STEP` is more scroll per card).
- `FULLW`: the lane card width in halftone cells (the card size relative to its depth).
- `STRIDE`: one cell in this many is a card around the lane (13). `AROUND`: their width as a share of a lane card.
- `GROW`: the flight distance over which the dots become cards.
- `fRead` in `fit`: the share of the screen width at which a lane card counts as read (0.4 on a desktop, 0.85 on a phone).
- Where the lane runs: `fit` puts it beside the name when a card fits there, else under the name, always above the chips.
- The stagger of the lane (`layLane`) and the dissolve (`vFade` in the vertex shader).

## Files

- `index.html`: the page. The first view (name, dock, chips) is a copy of `../flight/index.html` plus three one-line edits.
- `content.js`: the content. Mock for now; the career rows wait for the LinkedIn list.
- `flight.js`: the portrait, the lane, the cards around, the atlas, the shader, the input.
- The portrait photo comes from `../flight/photo.js`.
- `shoot.mjs`: screenshots and checks. `shots/` is its output, `shots/report.json` the numbers.

## Screenshots and checks

From the repo root:

    node design-preview/hero/flight-lane/shoot.mjs

It needs the network once (Three.js from unpkg, Geist from Google Fonts). It opens the page at the portrait, in the
break-up, and at a set of lane cards (`?at=<n>`, `n` counts from 0 in the order of `content.js`), hovers and
clicks a card, and fails on any page error, horizontal overflow, a field off screen, a view that is not at the
card it asked for, or a click that opens no box.

## URL params for trying things

- `?at=2` puts the camera at lane card 2 at reading distance. `?at=2.5` halfway to card 3.
- `?fly=140` puts the camera 140 world units into the flight (the face in mid break-up).
- `?stride=0` removes the cards around the lane; `?stride=7` doubles them.
- `?demo=0` stops the sample questions typing into the field.

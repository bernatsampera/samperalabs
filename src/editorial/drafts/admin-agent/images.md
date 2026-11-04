# Admin Agent article images

| Filename | Type | Dimensions | Size | Attempts | Limits or deviations |
| --- | --- | --- | ---: | ---: | --- |
| `00-cover.png` | Generated comic | 1536 x 1024 | 878,985 bytes | 1 | No deviation. The final PNG uses a 256-color palette for compression. |
| `01-scope-score.png` | SVG chart rendered to PNG | 1600 x 920 | 97,537 bytes | 2 render passes | The second pass wraps row labels and separates close points. Helvetica and Arial replace unavailable Poppins and Inter. |
| `02-actions.png` | Generated comic | 1672 x 941 | 924,095 bytes | 1 | No deviation. The final PNG uses a 256-color palette for compression. |
| `03-decision-generation.png` | Generated comic | 1672 x 941 | 448,036 bytes | 1 | No deviation. The final PNG uses a 256-color palette for compression. |
| `04-widget-anatomy.png` | SVG mockup rendered to PNG | 1600 x 1160 | 143,353 bytes | 1 render pass | Helvetica and Arial replace unavailable Poppins and Inter. |
| `05-model-screening.png` | SVG chart rendered to PNG | 1600 x 1050 | 90,631 bytes | 1 render pass | Helvetica and Arial replace unavailable Poppins and Inter. |
| `06-intent-map.png` | SVG typographic print rendered to PNG | 1600 x 1180 | 90,475 bytes | 1 render pass | The source contains 134 intents in 15 domains. This matches the expected total. Helvetica and Arial replace unavailable Poppins and Inter. |
| `07-swap-the-model.png` | Generated comic | 1672 x 941 | 596,913 bytes | 1 | No deviation. The final PNG uses a 256-color palette for compression. |

## Editable sources

- `00-cover-prompt.txt`
- `01-scope-score.svg`
- `02-actions-prompt.txt`
- `03-decision-generation-prompt.txt`
- `04-widget-anatomy.svg`
- `05-model-screening.svg`
- `06-intent-map.svg`
- `07-swap-the-model-prompt.txt`

## Intent counts

| Domain | Total | Read | Change | Help |
| --- | ---: | ---: | ---: | ---: |
| members | 25 | 16 | 8 | 1 |
| subscriptions | 22 | 4 | 18 | 0 |
| payments | 15 | 6 | 7 | 2 |
| schedule | 11 | 2 | 8 | 1 |
| attendance | 9 | 7 | 2 | 0 |
| catalog | 9 | 1 | 7 | 1 |
| bookings | 7 | 5 | 2 | 0 |
| grading | 7 | 3 | 3 | 1 |
| account | 5 | 2 | 2 | 1 |
| dropins | 5 | 1 | 4 | 0 |
| gym_settings | 5 | 1 | 4 | 0 |
| staff | 5 | 1 | 3 | 1 |
| communications | 4 | 1 | 3 | 0 |
| reports | 3 | 3 | 0 | 0 |
| migration | 2 | 1 | 1 | 0 |
| Total | 134 | 54 | 72 | 8 |

## Checks

- The four comic images passed visual text and balloon-tail checks.
- The four rendered graphics passed visual overlap and clipping checks.
- All PNG files are below 1.5 MB.
- The U+2013 and U+2014 grep result is clear for all prompt and SVG files.
- No browser check ran, as required.

## Claude review fixes, 16 Oct 2026

- `01-scope-score`: replaced the curved annotation, which suggested 0.93 was at the 0.80 point, with two example markers at 0.21 and 0.93 and a legend entry.
- `05-model-screening`: moved the "Better" arrow so it no longer crosses the label.
- `06-intent-map`: regenerated as one row for each domain with larger marks for phone reading (1600 px wide). Counts unchanged: 54 read, 72 change, 8 help.
- `05-model-screening`: Solar Pro 4 removed at the author's request (16 Oct 2026). The chart shows 4 of 20 screened models.
- `07-swap-the-model`: removed from the article and from `deploy.json`. The file stays as an unused asset.
- `03-decision-generation`: replaced the clipboard line "Widget: table" with "Language: English" and kept the other comic content unchanged.

# Anusheel — The Portfolio Edition

A Forbes-inspired editorial portfolio presented as an interactive magazine: six spreads, twelve pages, serif typography, cream paper, and a restrained crimson accent. The portfolio keeps Anusheel Chapagain’s professional background, project destinations, research link, contact information, résumé, and journal.

## Run locally

No dependency installation, package manager, build step, or backend is required. From the repository directory, run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open [http://localhost:4173](http://localhost:4173). Stop the server with `Ctrl+C`.

## Explore the magazine

| Spread | Pages | Contents |
| --- | --- | --- |
| 1 | 01–02 | Cover and contents |
| 2 | 03–04 | Profile, approach, and education |
| 3 | 05–06 | Professional experience and impact |
| 4 | 07–08 | Selected products and experiments |
| 5 | 09–10 | Research and the journal |
| 6 | 11–12 | Résumé and contact |

Use the previous/next buttons, spread dots, printed contents links, or **Contents** dialog to navigate. In magazine view, `←` and `→` turn spreads, `Home` returns to the cover, and `End` opens the final spread. Keyboard navigation pauses while the contents dialog is open or an editable field has focus. `Escape` closes the contents dialog.

On touch devices, swipe horizontally on a non-interactive part of the magazine to change spreads. Narrow screens stack the two pages of each spread vertically. **Read as a page** reveals the complete edition for continuous scrolling; select **Magazine view** to return. The fullscreen button expands the reader immediately and uses the browser’s Fullscreen API on supported desktop browsers, with a full-window fallback in embedded browsers. Browsers without support do not show that control.

Each spread has a shareable fragment, such as `#spread-4`. Browser Back and Forward restore the corresponding spread. Without JavaScript, the complete portfolio remains visible as a scrolling document. Print styles show all twelve pages. Focus indicators, reduced-motion preferences, and navigation announcements are supported.

## Files and editing

- `index.html` contains the twelve editorial pages, navigation, contents dialog, and metadata. Edit professional content and project links here. Keep the six `spread-N` IDs aligned with `data-spread` controls.
- `style.css` defines the magazine layout, typography, breakpoints, reading view, fullscreen view, and print layout.
- `magazine.js` provides spread navigation, URL/history synchronization, keyboard controls, touch gestures, contents dialog behavior, reading view, and fullscreen controls.
- `blog/index.html` lists journal entries. `blog/action-based-communication/index.html` contains the existing article with its original body copy. `blog/editorial.css` supplies the matching editorial layout.
- `anusheel-chapagain-general-resume.pdf` is the linked résumé. The existing `anusheel-resume-old.pdf` is also retained.
- `anusheel-bg-rmeoved.png` is the original portrait, retained on the profile spread. `assets/anusheel-3d-cover.png` is the transparent, lightly cartoonized 3D-style cover illustration created with the built-in image generation tool. Its final prompt is saved in `assets/anusheel-3d-cover.prompt.txt`. The cover asset is a raster PNG, not a mesh or rotatable model. `assets/favicon.svg` is the portfolio favicon.
- `analytics.js` retains the existing visit and résumé-download counter integration. The `visit-count`, `resume-download-count`, and `data-resume-download` hooks connect it to the new layout. Tracking writes are limited to `anusheeel.github.io`, so local previews do not increment live totals. Reading totals still uses the existing external counter service; a failed request displays “Unavailable” without affecting the portfolio.

The former animation scripts remain in the repository but are not loaded by the magazine. The site uses system serif and sans-serif fonts and has no external font or JavaScript framework dependency.

## GitHub Pages

The site remains compatible with the existing GitHub Pages repository-root deployment. All page, asset, and résumé URLs are relative; spread navigation uses fragments, so no routing rewrites are required. Keep `index.html` at the published root with the other static files.

The redesign is currently local on the `codex/magazine-portfolio` branch. No push or deployment is included in this change. Publishing would use the repository’s existing GitHub Pages workflow after the changes are reviewed and integrated into its publishing branch.

# Portfolio — Shiya Li

A print-first, application-grade portfolio that lives inside the main site's repo and ships with it.

| What | Where |
| --- | --- |
| The page (static HTML/CSS/vanilla JS, no framework) | `public/portfolio/` → served at **`/portfolio/`** |
| All words, links and image paths | `public/portfolio/content/en.js` |
| Layout | `public/portfolio/app.js` (page templates) · `diagrams.js` (SVG) · `portfolio.css` (design system) |
| Fonts (self-hosted, SIL OFL) | `public/portfolio/fonts/` |
| Generated PDF | `public/portfolio/Shiya-Li-Portfolio.pdf` |
| Build tooling (not shipped) | `portfolio/scripts/` |

Vite copies everything in `public/` verbatim, so `npm run build` in the repo root produces `dist/portfolio/` and Cloudflare Pages serves it at `/portfolio/` with no change to the existing site.

## View it

```bash
npm install            # repo root, once
npm run dev            # http://localhost:5173/portfolio/
```

(Any static server over `public/` works too: `cd public && python3 -m http.server 8000`.) Arrow keys / PageUp / PageDown jump between pages.

## Make the PDF

Two ways, same result:

1. **From the browser** — open `/portfolio/` and use *Print / Save PDF* (Chrome or Edge; destination "Save as PDF", margins "None", background graphics on). `@page` sets the paper size to 297 × 167 mm, so no other settings are needed.
2. **From the command line**

```bash
cd portfolio
npm install            # playwright-core only; it drives an installed Chrome/Chromium
CHROME_PATH=/path/to/chrome npm run pdf     # default: /usr/local/bin/google-chrome
npm run pdf -- --list                       # also print every [TO CONFIRM] placeholder
```

The script starts a tiny static server over `public/`, waits for fonts and images, prints in `print` media, and writes `public/portfolio/Shiya-Li-Portfolio.pdf` (with bookmarks). Review screenshots of each page: `npm run shots` → `portfolio/.cache/shots/`.

### Why 297 × 167 mm (16:9 landscape)

* Admissions portals and reviewers read portfolios on screens; 16:9 fills a laptop or projector without letterboxing.
* Phone screens (BLING) sit side by side in a landscape page instead of being stacked into a column.
* It is still A4 wide, so it prints on A4 landscape with a small even margin if a paper copy is ever needed.
* Every dimension is expressed in container-width units (`cqw`), so one page is the *same composition* on a phone, a laptop and paper. Nothing reflows between screen and print, which is what keeps page breaks deliberate: each `.sheet` is exactly one PDF page.

## Visual system (defined in the header of `portfolio.css`)

* **Type** — Pinyon Script for the large titles only; Special Elite (typewriter) for kickers and labels; Newsreader for sentence headlines, quotes and poems; Inter for body copy. All self-hosted (OFL). Body stays a clean text face so the application remains readable. System serif/sans and Korean system faces are the fallbacks.
* **Colour and surface** — dusty blue creased paper and a black photocopy grain (generated textures), bone-white torn frames around photographs, corner scroll ornaments. Text is ink or bone. Placeholders stay a loud yellow.
* **Grid** — 12 × 12 inside a 4.38 cqw (13 mm) margin, 1.35 cqw (4 mm) gutters.
* **Spacing** — 4 mm base: 0.34 / 0.67 / 1.35 / 2.02 / 2.7 / 4.04 cqw.
* **Responsive** — below 860 px wide the pages stop being fixed sheets and reflow to one column with fixed-px tokens.

## Editing content and adding Korean

* Edit text only in `content/en.js`. Unknown facts are written as `[TO CONFIRM: …]`; the renderer highlights them and `npm run pdf -- --list` lists them. Never fill a gap with a guess.
* Korean: copy `content/en.js` to `content/ko.js`, translate the values (keep keys, URLs and image paths; missing keys fall back to English), then add `'ko'` to `availableLangs` in `en.js`. `?lang=ko` loads it, and the language switch appears. Hangul falls back to system Korean faces; choose a Korean web font (e.g. a Noto subset) and add it to `fonts/fonts.css` when translating.

## Images

* Full-size artwork is referenced straight from `public/assets/works/` (nothing duplicated).
* `scripts/optimise-images.py` writes the derived files: 640 px thumbnails for the index pages and compressed BLING screen captures.
* `scripts/capture-bling.mjs` re-creates the BLING captures from a checkout of <https://github.com/shiyaitsme/BLING> (`BLING_DIR=… node scripts/capture-bling.mjs`). The captures show the real prototype, in its Chinese interface.
* Images below the fold use `loading="lazy"`; the print path forces them eager so nothing is missing in the PDF.

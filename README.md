# Shiya the Player — Digital Playground (桃花源)

An interactive multimedia portfolio that behaves like an immersive installation:
a soft, iridescent "treasure map" you explore. Built with **React + Vite +
Tailwind + GSAP + Framer Motion**, matched 1:1 to the Figma design.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle → /dist
npm run preview
```

> Always run from inside the project folder: `cd ~/shiya.the.player_website` first.

---

## The experience

- **Home = the map.** A fixed **1440×900 "stage"** (scaled to cover any screen)
  holds: the brand spiral logo, a transparent 3D **carousel** hub, **lime
  connector lines**, scattered **black `*` star** nodes, and **4 green polygon
  shards** with lime nav labels (`contact · works · about · manifesto`).
- **Click a shard** → cinematic **zoom transition** (the shard grows to a cover
  image, holds, then zooms out as the content page settles in).
- **Click a `*` star** → "Gachapon": a random **work** opens.
- **Content pages** (`works / about / contact / manifesto`) are editorial
  Playfair-serif layouts over a soft section background, fully responsive.

---

## Project structure

```
public/assets/            ← all art (see "Assets" below)
src/
├─ App.jsx                ← composition + view state machine
├─ index.css             ← background, halftone, grain, .stage, .nav-label
├─ data/projects.js      ← ★ ALL CONTENT lives here (works, sections, shards, stars)
├─ hooks/
│  ├─ useMouseParallax.js ← mouse → CSS vars (--mx/--my) for background drift
│  └─ useStageScale.js   ← scales the 1440×900 stage to COVER the viewport
└─ components/
   ├─ Background.jsx      ← bg.png + halftone.png (+ CSS fallbacks), parallax
   ├─ MapLines.jsx       ← renders /assets/lines.svg (the lime lines)
   ├─ HeroCarousel.jsx   ← hero-carousel.webm, GSAP 3D tilt
   ├─ ShardGrid.jsx      ← the 4 shards + lime nav labels (positions from Figma)
   ├─ StarField.jsx      ← black-asterisk Gachapon nodes
   ├─ ShardZoom.jsx      ← the click→zoom-in→hold→zoom-out clip transition
   ├─ Page.jsx           ← content page (works list / about / contact / manifesto / single work)
   ├─ WorkBlock.jsx      ← one work: number badge + media + Playfair copy + link
   └─ NumberBadge.jsx    ← bottle-cap number_N.png
```

**To edit copy or add works/sections, you almost always only touch
`src/data/projects.js`.**

---

## Editing content (`src/data/projects.js`)

- **Add a work:** push to the `works` array — `{ id, number, title, emoji,
  image (or video), body: [...paras], link? }`. It shows up in the `works`
  page and the star Gachapon pool automatically.
- **Edit a section:** `sections.about / contact / manifesto` are plain text
  blocks (`body`, plus `skills` for about, `links` for contact). `sections.works`
  renders the whole `works` list.
- **Section ↔ shard ↔ background ↔ cover** mapping lives in `sections` and
  `shards`. Each section has a fixed `bg` and a zoom `cover`.

---

## Assets (`public/assets/`) & naming

Everything is loaded by exact filename; **drop a file in with the right name and
it "just works"** (components fall back gracefully until then).

| File | Used for |
| --- | --- |
| `bg_1..4.png` | section backgrounds (works=1, about=2, contact=3, manifesto=4) |
| `number_0..9.png` | bottle-cap number badges |
| `green_piece_1..4.png` | the 4 map shards (RGBA, transparent cuts) |
| `lines.svg` | lime connector lines — **generated** from `frame1.svg` (see below) |
| `star.svg`, `logo_s.svg`, `halftone.png`, `bg.png` | map star / logo / textures |
| `hero-carousel.webm` | transparent VP9 carousel loop |
| `work_andromeda_freckles.png` | work #1 image |

### ⏳ Still to upload (code already wired, falls back until then)
- Zoom **cover images**: `contact_roller_coaster.png`, `works_tea_pot.png`,
  `about_cover.png`, `tools_manifesto_cover.png`
- (optional) `work_carousel.png` — otherwise the carousel work uses the webm

### Regenerating `lines.svg` from a new Figma export
`lines.svg` is extracted from `frame1.svg` (the full Frame-1 SVG export). If you
re-export, regenerate the lime lines with:

```bash
cd public/assets
node -e 'const fs=require("fs");let s=fs.readFileSync("frame1.svg","utf8").replace(/<image[\s\S]*?\/>/g,"");const g=(s.match(/<(path|line|polyline|polygon)\b[^>]*\/?>/g)||[]).filter(e=>/b6ff00/i.test(e)).map(e=>e.replace(/\/?>$/,"/>"));fs.writeFileSync("lines.svg",`<svg width="1443" height="901" viewBox="0 0 1443 901" fill="none" xmlns="http://www.w3.org/2000/svg">\n`+g.map(e=>"  "+e).join("\n")+`\n</svg>\n`);console.log("lines:",g.length)'
```

---

## Design system

- **Type:** `Gravitas One` (nav, lime `#b6ff00`) · `Playfair Display` (editorial
  serif body) · `Space Grotesk` (small UI). Loaded in `index.html`.
- **Palette:** soft iridescent macaron (periwinkle / pink / peach / sky) + acid
  lime accents. Tokens in `tailwind.config.js`.
- **Coordinates** in `ShardGrid` / `StarField` / `data` are in the **1440×900
  Figma space**; the `.stage` scales them to the viewport.
- Honors `prefers-reduced-motion` (transitions degrade to instant).
```

(See `CLAUDE.md` for notes aimed at AI coding sessions.)

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
- **Mobile (`<768px`) gets a different home map**, not a shrunk copy of the
  desktop one: `MobileMap.jsx` re-anchors the same art as `%`-of-viewport
  positions (`mobileHub`/`mobileShards`/`mobileStars` in `projects.js`) with
  connector lines computed at runtime, so the whole map fits one screen with
  no pinch/pan. Desktop is untouched. See "Mobile map" below.

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
│  ├─ useStageScale.js   ← scales the 1440×900 stage to COVER the viewport (desktop)
│  └─ useIsMobile.js     ← matchMedia(max-width:767px), live-updating
└─ components/
   ├─ Background.jsx      ← bg.png + halftone.png (+ CSS fallbacks), parallax
   ├─ MapLines.jsx       ← renders /assets/lines.svg (desktop lime lines)
   ├─ HeroCarousel.jsx   ← carousel_hero_v2.webm, GSAP 3D tilt, `mobile` prop,
   │                        iOS/Safari fall back to an animated alpha WebP
   │                        (carousel_hero_v2_mobile.webp; still PNG is a
   │                        last-resort fallback if even that fails to load)
   ├─ ShardGrid.jsx      ← desktop: the 4 shards + lime nav labels (Figma coords)
   ├─ StarField.jsx      ← desktop: black-asterisk Gachapon nodes
   ├─ NavLabel.jsx       ← the lime nav-word PNG (shared by desktop + mobile)
   ├─ MobileMap.jsx      ← phone-width home map (see "Mobile map" below)
   ├─ ShardZoom.jsx      ← the click→zoom-in→hold→zoom-out clip transition
   ├─ Page.jsx           ← content page (works list / about / contact / manifesto / single work)
   ├─ WorkBlock.jsx      ← one work: number badge + media + Playfair copy + link + deep-dive
   ├─ ProjectModal.jsx   ← glassmorphism "project deep-dive" case-study overlay
   ├─ ArchDiagram.jsx    ← inline-SVG architecture pipeline (for the modal)
   ├─ CodeBlock.jsx      ← tiny dependency-free syntax highlighter (for the modal)
   └─ NumberBadge.jsx    ← bottle-cap number_N.png
```

### Mobile map (`<768px`)
`App.jsx` swaps the whole desktop `.stage` tree for `MobileMap.jsx` below that
breakpoint — not a scaled/panned copy of the 1440×900 composition, but a
separate proportional layout so everything is reachable with a normal tap,
no pinch or pan:
- **Anchors are `%`-of-viewport**, not Figma px: `mobileHub` / `mobileShards`
  / `mobileStars` in `projects.js`. Only need to be roughly right — see below.
- **Exactly 5 connector lines, computed at runtime from LIVE element
  positions** (`src/hooks/useMobileLines.js`, not a baked SVG): a straight
  line through about+works bled to both screen edges; one smooth bezier arc
  from contact, cradling under the carousel, out to the right edge; and a
  contact–manifesto–works triangle. Endpoints are `getBoundingClientRect()`
  centers, not the raw `%` numbers, so the layout can't drift out of sync —
  see `CLAUDE.md` for the (surprisingly involved) history of getting the arc
  to read as one smooth curve instead of a polyline.
- Same art as desktop (shard PNGs, lime nav-word PNGs via the shared
  `NavLabel.jsx`, the carousel, `star.svg`) — only the arrangement differs.
- If you add a 5th shard/section, add its entry to `mobileShards` too (it
  won't appear on mobile otherwise — desktop's `shards` array and mobile's
  `mobileShards` are independent).

### Project deep-dive modal (case study)
Each work can carry a `caseStudy` block in `projects.js`
(`goal`, `architecture:{nodes[],caption}`, `code:{language,snippet}`,
`analysis:[]`). In the Works page a **project deep-dive** button opens
`ProjectModal` — a frosted-glass overlay (Framer Motion fade+scale) with the
research goal, an SVG architecture pipeline, a syntax-highlighted code block,
and a critical-analysis section. The highlighter is hand-rolled (no
`react-syntax-highlighter`) to protect the bundle budget.

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

### Nav label PNGs (the lime words on the map)
The four map words are static images, so no browser font rendering is involved
(this killed the "doubled word" look from the text-shadow). Files:
`contact_lime_green.png`, `works_lime_green.png`, `about_lime_green.png`,
`manifesto_lime_green.png` (transparent PNGs, drawn at ~26px tall on the
1440×900 stage). If one is missing, that label falls back to the styled text.

### Zoom cover images (uploaded — these ARE the shard→page transition)
`contact_roller_coaster.png`, `works_tea_pot.png`, `about_cover.png`,
`tools_manifesto_cover.png`. The shard zoom now grows **only** this cover photo
(the green shard is just a pre-decode fallback). The carousel work
("between two infinites") is a video, so it shows
`work_carousel_between_two_infinites_ig_cover.png` and links out to the IG reel
instead of autoplaying.

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

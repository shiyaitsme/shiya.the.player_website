# Shiya the Player — Digital Playground (桃花源)

An interactive multimedia portfolio that behaves like an immersive installation —
a Retro Americana × Acid Graphics "treasure map" built with **React + Vite +
Tailwind + GSAP + Framer Motion**.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in /dist
npm run preview
```

## Architecture

```
src/
├─ App.jsx                  # composition + z-layer stack
├─ index.css                # pure-code macaron gradient, halftone, grain, neon
├─ hooks/
│  └─ useMouseParallax.js   # GSAP quickTo → :root CSS vars (layered depth)
├─ data/projects.js         # Gachapon pool + shard narrative (Carl Sagan)
└─ components/
   ├─ Background.jsx         # 3 fixed layers: macaron / halftone / grain
   ├─ AcidGrid.jsx          # teamLab fluid lines, particles via MotionPathPlugin
   ├─ HeroCarousel.jsx      # transparent VP9+alpha webm, GSAP 3D tilt
   ├─ Header.jsx            # brand spiral logo_s.svg
   ├─ StarField.jsx         # Feature A — random project Gachapon + burst/zoom
   ├─ ProjectReveal.jsx     # cinematic destination page
   └─ ShardGrid.jsx         # Feature B — FLIP shard expansion (layoutId)
```

### Visual system (no background images)
- **Macaron gradient** — layered CSS `radial-gradient()` field, low-saturation
  pink / blue / purple.
- **Halftone** — semi-transparent dot grid via `radial-gradient` background-size.
- **Grain** — inline SVG `feTurbulence` overlay, gently animated.
- **3D parallax** — `useMouseParallax` drives `--mx/--my` (base) and `--mx2/--my2`
  (halftone) at different speeds for depth.

### Feature A — Star "Gachapon" nodes
Chrome acid `*` sparkles. Click → `Math.random()` pulls a project → the star
scales up, bursts a particle ring, a radial flash performs a cinematic
viewport zoom, then fades into `ProjectReveal`.

### Feature B — Shard array FLIP
Shards loop over `green_piece_${id}.png`. Clicking a shard uses Framer Motion
`layoutId` (First-Last-Invert-Play) to expand it to full-bleed; the green tint
filter interpolates to `none` and the narrative copy springs up from the bottom.

## Assets (`/public/assets`)
| File | Notes |
| --- | --- |
| `hero-carousel.webm` | transparent VP9 carousel loop (provided) |
| `green_piece_1–4.png` | polygonal layout shards — **placeholders generated**; drop in the real Rollercoaster / Coffee Cups / Swings / Ferris Wheel art |
| `logo_s.svg` | brand spiral logo |

Honors `prefers-reduced-motion` throughout.

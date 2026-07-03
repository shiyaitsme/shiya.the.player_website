# CLAUDE.md — notes for AI coding sessions

Context for Claude Code (or any agent) working in this repo. Read `README.md`
first for the product/architecture; this file is the operational cheat-sheet.

## What this is
Shiya the Player — a Figma-matched, React/Vite immersive portfolio. The design
source of truth is the user's Figma file; we match it **1:1**.

## Golden rules
- **All content lives in `src/data/projects.js`.** Adding a work, editing copy,
  remapping a shard/section/background — do it there, not in components.
- **Coordinates are in 1440×900 Figma space.** `useStageScale` scales the
  `.stage` with **COVER** (`Math.max`) and the stage is anchored **dead-center**
  (`top/left:50%` + `translate(-50%,-50%)` + `transform-origin:center center`),
  so the lime lines bleed to the page edges on every screen and any crop is
  symmetric + minimal. **cover-vs-contain is a settled, deliberate choice** —
  the user wants the lines to bleed to the edges (esp. the right arc), and
  accepts that cover crops a little at top/bottom on screens wider than 16:10.
  We tried `contain` (whole frame always visible, no crop) and she rejected it
  because the lines then stop short of the viewport edges. **Don't silently flip
  between the two.** If something clips, first nudge the affected element rather
  than switching modes: the top **S logo** is at `top:115` (App.jsx) and the
  **carousel** container at `top:170` (HeroCarousel.jsx) precisely so they clear
  the cover-crop on ~16:9–1.85 screens.
- **Assets load by exact filename with graceful fallback.** New art is added by
  the user via GitHub upload; reference the intended filename and fall back
  (image `onerror` / `new Image()` preload) so the site never breaks. Wired-but-
  -not-yet-uploaded: `*_cover.png` zoom covers, `work_carousel.png`.
- Match the user's design; **don't invent a different visual direction.** Early
  in the project a "neon/rebellious" detour was built and rejected — the real
  target is soft, iridescent, editorial.

## Hard environment constraints (important)
- **Figma's asset host is network-blocked.** `curl`-ing `www.figma.com/...`
  (including MCP `get_screenshot` / `download_assets` URLs) fails with
  *"Host not in allowlist"* — even with the sandbox disabled. You **cannot**
  auto-download Figma assets. Options that DO work:
  - `mcp__Figma__get_screenshot` with `enableBase64Response:true` → you can
    *see* a frame inline (but can't save the bytes to a file).
  - `mcp__Figma__get_design_context` / `get_metadata` → exact colors, fonts,
    coordinates, and node structure (this is how shard/line/star coords were
    obtained).
  - The user **exports from Figma and uploads to the repo** (the reliable path).
- **`lines.svg` was extracted by parsing the user's uploaded `frame1.svg`
  locally** (originally 16 `#B6FF00` elements — stroked lines, filled lines/
  arrowheads, 4 filled **shard-shaped quads**, AND the 4 nav **words** as filled
  vector text: `contact / works / about / tools`). Both the shard quads and the
  word-text sat *under* the real photo shards + the PNG nav labels at the same
  coords, reading as "doubled" shards/words on load — all 8 were removed. If you
  re-extract from a new `frame1.svg`, drop (a) small ~5-point filled `#B6FF00`
  polygons on shard centers and (b) high-point (>100) filled `#B6FF00` paths
  (the word outlines), or the duplicates return. Keep only the thin connector
  lines (stroked, or ≤7-point filled).
- **The user cannot send binary files through chat** (only one `.webm` ever came
  through). Images/SVGs must arrive via GitHub upload. Don't promise to "pull
  their file" from a chat attachment.

## Git
- `git push` from THIS environment works (Claude GitHub App, write access).
  Push to the working branch; don't open PRs unless asked.
- Commits got interrupted by transient `exit 144` a few times — just re-run the
  commit; check `git log --oneline -1` to confirm it landed.
- **⚠️ The user's Mac CANNOT reach GitHub over git** (HTTP2 framing / Recv
  timeout; likely a firewalled network). `git pull` / `git clone` time out for
  them — even after `git config --global http.version HTTP/1.1`. **Their only
  working channel is the browser ZIP download.** So:
  - After every push, give them the branch ZIP URL, NOT a `git pull` command:
    `https://github.com/shiyaitsme/shiya.the.player_website/archive/refs/heads/<branch>.zip`
  - A ZIP is a **snapshot** — they must RE-download after each push or they keep
    running stale code. ZIP folders have no `.git`, so `git pull` there errors
    `not a git repository` — that's expected; just `npm install && npm run dev`.
  - Sanity check which version they're on: have them
    `grep -c 'fill="#B6FF00"' public/assets/lines.svg` (should be 4 now). Many
    "you still haven't fixed it" rounds were simply stale local code.
  - Always tell them to hard-refresh the browser (`Cmd+Shift+R`).
- Other recurring user-env snags: typing `d` instead of `cd`; running from `~`
  instead of the repo folder.

## Verifying visually (headless screenshots)
- `puppeteer` + bundled chrome are used for screenshots (installed as needed;
  **not** committed to `package.json` — `npm i puppeteer` gets pruned by later
  `npm install`s, so reinstall when needed, and `git checkout -- package.json
  package-lock.json` before committing so puppeteer never lands in deps).
  Run `npx vite preview --port <port> --host` (use `run_in_background`; the
  `&`-in-one-call trick gets killed) then screenshot with `NODE_PATH` pointed at
  the project's `node_modules`. Write temp scripts to the scratchpad dir (`/tmp`
  gets cleared mid-session).
- **No GPU / WebGL in this environment** → the 3D butterfly + ArchiveWorld
  (three.js) **cannot be rendered here** (`WebGLRenderer: context could not be
  created`). Verify their code/build/paths, but the *visual* result must be
  checked by the user on their Mac. (Both are wrapped in `SafeMount` so a missing
  WebGL context degrades to nothing instead of crashing the Works page.)
- Tiny upscaled PNGs (the 130×19 `*_lime_green.png` labels) ghost/"double" in
  full-page headless screenshots even though the file + bare render are clean —
  a headless rasterization artifact, not a real bug. Don't chase it; the real
  label "doubling" was the baked text in `lines.svg` (now removed).
- **Gotchas:**
  - Headless Chrome defaults to `prefers-reduced-motion: reduce` → our
    transitions short-circuit. Use `page.emulateMediaFeatures([{name:
    'prefers-reduced-motion', value:'no-preference'}])`.
  - Screenshot capture latency is ~0.8s, so a fast (~1.5s) animation will have
    advanced to its end by the time the PNG is grabbed. To verify mid-animation
    state, **inspect the DOM** (`getComputedStyle(el).transform`) rather than
    trusting a screenshot.
  - The transparent `.webm` may not render in headless — fine, ignore it.

## Performance bar
Keep it smooth. Main bundle ≈ 122KB gzip JS. **three.js / R3F live in a
lazy-loaded chunk** (`ButterflyEgg`/`ArchiveWorld`, ~240KB gzip) that only loads
on the Works page — keep it out of the main bundle. Prefer CSS/GSAP transforms
and Framer; avoid heavy per-frame React state. Honor `prefers-reduced-motion`.

## Works-page 3D (lazy, three.js + @react-three/fiber)
- `components/butterfly/ButterflyEgg.jsx` — green-glass FBX butterfly (exact
  `MeshPhysicalMaterial`: map + transmission .75 / ior 1.52 / clearcoat 1 …,
  the user dictated these). Behaviour: random fly-in → dock in a corner → idle
  "breathing" wing-flap + a CSS glow halo (`.bfly-*` in index.css) on a DOM
  hotspot that tracks its projected position and is the click target. Click →
  `enterArchiveWorld`.
- `components/butterfly/ArchiveWorld.jsx` — "rabbit hole" camera dolly into a
  misty card-cloud (work images on planes), mouse-move parallax, hover-scale,
  click-to-focus. Referenced `reference_world_archive.png`.
- FBX path has spaces/`+` → `encodeURI`. **Both 3D scenes are UNVERIFIED
  visually** (no WebGL here) — ask the user how they actually look and expect to
  tune material/flap/scene on feedback.

## Status / next ideas
- **⚠️ ALWAYS `git fetch origin` and check ALL branches before starting work.**
  A session once built the mobile branch straight off stale `main` and
  silently lost the butterfly/ArchiveWorld/PNG-nav/de-duped-lines work that
  only lived on `busy-maxwell-kzpt97` — `main` (`wonderful-shannon-9rdua0`) is
  *only* the user's raw asset uploads, never merged with the real code
  branches. `git branch -a` / `git fetch` before assuming you're on the latest.
- **Live working branch: `claude/mobile-responsive-design-j4zpzc`** (rebuilt
  from `busy-maxwell-kzpt97`, which is now just its stale parent — don't
  branch from `busy-maxwell-kzpt97` again, branch from *this* one). Has
  everything `busy-maxwell-kzpt97` had (3D butterfly, ArchiveWorld, glass
  ProjectModal, lime PNG nav, de-duped `lines.svg`) **plus** the full mobile
  implementation below. Other branches: `pensive-goodall-749qae` (older),
  `wonderful-shannon-9rdua0` (the user's raw asset uploads only — pull new
  assets from whichever branch she uploaded them to, usually this one).
- **Home-map nav clusters (`ShardGrid.jsx`) are now ONE container each.** The
  shard image + its lime nav label are packed in a single absolutely-positioned
  `flex flex-col items-center` div anchored at the Figma image coords
  (`piece.left/top/w`); the label is pinned 12px (`mt-3`) below the image and
  centered, so image + label share one anchor + one float animation and can
  never drift apart (the old separate-absolute-coords version misaligned and the
  user flagged it). The `label.left/top` fields in `projects.js` `shards[]` are
  now **DEAD** — don't reintroduce separate label positioning.
- **Carousel**: `carousel_hero_v2.webm` (1920×1080 / 10s) at `scale(2.55)`
  (= 1.5× the prior 1.7) in `HeroCarousel.jsx`; container moved up to `top:170`
  to clear the cover-crop. Falls back to `hero-carousel.webm` on error. If it
  ever looks too big/small or clips, tune `scale()` and/or the container `top`.
- **`MapLines.jsx`** renders `lines.svg` as `object-fill` (force-fills the stage,
  no internal letterbox) at `z-[5]`, so it sits UNDER the carousel (z-20) and
  shards/stars (z-30) and the mid-line segments hide beneath the opaque images.
- **manifesto shard** nudged right to `left:1197.41` so its left edge clears the
  converging lines/asterisk (it used to sit on top of them).
- **Responsive / mobile — IMPLEMENTED**, several rounds of user feedback deep.
  Desktop (`≥768px`, `useIsMobile.js`) is **100% untouched** — still the
  pixel-1:1 1440×900 stage. Phone-width viewports render `MobileMap.jsx`
  instead of `.stage`/`ShardGrid`/`StarField`/`MapLines` — a proportional
  layout, hub (carousel) roughly mid-screen with the 4 shards fanned around
  it in a diamond, not a scaled/panned copy of the desktop composition.
  - `mobileHub` / `mobileShards` / `mobileStars` in `projects.js` are **%-of-
    viewport** anchors (not the 1440×900 px space). Only need to be "roughly
    right" — see the line-drawing note below for why.
  - **`src/hooks/useMobileLines.js`** draws the connector lines — this went
    through several iterations, keep the lesson even if you touch it again:
    - Endpoints/waypoints are **always** the elements' LIVE
      `getBoundingClientRect()` centers (or edges — see `edgesOf`), never the
      raw `%` numbers from `projects.js`. That's why the `%` anchors only need
      to be approximate.
    - The user asked for exactly 5 lines, nothing else (an earlier hub→every-
      shard "spoke" version was deleted for being "太混乱" / too busy):
      1. `through` — straight line through `about` + `works`, bled past BOTH
         ends to the screen edge (`rayToEdge()` clips a ray to the container
         rect — same "lines run off the page" language as desktop).
      2. `arc` — contact → a "cradle" point (x = works.x, y = midpoint of the
         carousel's live bottom edge and about's live top edge, so it cradles
         the carousel from underneath instead of cutting through its center)
         → a fixed exit point on the right edge just below mid-height.
      3–5. A **triangle** directly connecting contact–manifesto,
         manifesto–works, works–contact (`about` is deliberately NOT part of
         this triangle).
    - **The `arc` specifically ate 4 failed attempts before landing** —
      worth reading `bumpThrough()`'s doc comment in the file, but briefly:
      (a) two bezier pieces stitched at the cradle point, even
      tangent-matched (C1-continuous) — still read as a polyline to the human
      eye, because *curvature* (not just tangent) jumped at the seam; (b) the
      true circumcircle through all 3 points — genuinely constant curvature,
      but whichever of its 2 possible arcs actually passes through the
      cradle point can be the **major** arc (>180°), which produced a huge
      unwanted loop off the edge of the screen for this layout; (c) landed on
      `bumpThrough()` — ONE unbroken cubic bezier (no seam anywhere, so no
      curvature jump possible), both control points offset from the
      contact→edge chord by the cradle's own perpendicular deviation, scaled
      by a `factor` (currently 1.35) that directly dials how tight/tensioned
      it looks. If asked to make it rounder/tighter again, tune that one
      number first before re-architecting.
  - The label PNG is reused via a shared `NavLabel.jsx` (extracted out of
    `ShardGrid.jsx` so desktop + mobile can't drift apart). Accepts a `style`
    prop — `MobileMap` passes `maxWidth:'none'` (see the squish bug below).
  - **Framer Motion gotcha hit repeatedly building this**: `motion.*`
    components write their own inline `transform` (and appear to silently
    drop `margin*` too) for whatever's in `animate`/`style`, which clobbers a
    Tailwind `-translate-x-1/2` class OR a `marginLeft` used for %-based
    centering. Fix: put the centering `left/top/marginLeft` on a **plain,
    non-motion** wrapper div, and let the `motion.*` child own only the
    entrance/hover/tap animation with no positioning styles of its own. All
    mobile pieces (logo, shards, stars) use this split — don't collapse them
    back into one element.
  - **Nav-label squish bug (latent on desktop too, just not reported)**: an
    `<img>` inside a narrower flex parent gets capped by Tailwind preflight's
    `img{max-width:100%}`, squishing the label horizontally to the shard's
    `piece.w`/`wVw` instead of its true aspect-correct width (verified:
    desktop's own labels are already ~10–20% squished this way). Left desktop
    alone (not reported, don't fix what wasn't asked), but `MobileMap`'s
    `NavLabel` passes `style={{ maxWidth: 'none' }}` so labels like
    "manifesto" (173×20 source, very wide relative to its shard) render at
    full width instead of getting crushed unreadable.
  - `NumberBadge.jsx` had its `drop-shadow-[...]` filter removed — same defect
    class as the nav-label `text-shadow` fixed earlier (`7bae901`): a small
    offset shadow on a small alpha-edged PNG reads as a dirty/un-transparent
    box on some engines (user-reported on iOS Safari), not a subtle shadow.
  - **Butterfly on mobile** (`ButterflyEgg.jsx`): `.bfly-glow` (the lime
    "breathing halo" under the docked butterfly) was **removed entirely** —
    user called it ugly, don't reintroduce it. The 3D model itself is 1/3 size
    on phones (`targetSize` prop, `0.8` vs desktop's `2.4`, gated on
    `useIsMobile()`) — desktop untouched.
  - **iOS/Safari carousel — two layered problems, both fixed:**
    1. *Black box*: desktop Safari + every iOS browser (forced WebKit) don't
       composite the alpha channel of `carousel_hero_v2.webm` at all — solid
       black box. No reliable feature-detect exists, so `HeroCarousel.jsx`
       UA-sniffs (`NEEDS_POSTER_FALLBACK`) and swaps to a pre-baked asset
       instead of the `<video>` on those engines.
    2. *That pre-baked asset must be animated, not a single frame* — a static
       PNG poster "fixes" the black box but the carousel visibly stops
       spinning, which was reported as a bug in its own right. The real fix
       is **`carousel_hero_v2_mobile.webp`** — an *animated* WebP with alpha
       (Safari/iOS have supported alpha WebP since v14). `carousel_hero_v2_
       poster.png` (single frame) is kept only as a last-resort `onError`
       fallback if the animated webp itself fails to load.
    3. **Both of those assets must go through an "unpremultiply" pass or you
       get a black fringe around every edge.** `ffmpeg -c:v libvpx-vp9` is
       the only decoder that surfaces alpha at all (the default `vp9`
       decoder silently drops it, opaque frames despite `ffprobe` reporting
       `alpha_mode: 1`) — but even with that decoder, ffmpeg's raw
       frame-extraction hands back the source's **premultiplied** alpha as
       if it were straight alpha. Diagnostic: sample a partial-alpha edge
       pixel and divide its RGB by its own alpha — if that lands on a
       plausible color (it did: near-black edge pixels unpremultiplied into
       normal pink/cream carousel tones), the source is premultiplied and
       every edge pixel needs `rgb = clamp(rgb * 255 / alpha, 0, 255)`
       applied per-pixel before re-encoding. (Desktop never showed this
       because Chrome's native WebM/VP9 *video* decode path is
       alpha-spec-compliant; only ffmpeg's still-frame dump isn't.) Redo
       both assets this way if you ever regenerate them from the source
       `.webm` — see git history around commit `07f099c` for the exact
       Python un-premultiply + re-encode script (extract RGBA PNG frames →
       numpy `rgb*255/alpha` per pixel → Pillow `save_all=True` animated
       webp). Also: `quality=90`, `560x315`, `15fps` was the size/crispness
       balance that stuck — an earlier `quality=50, 420x236` pass visibly
       fuzzed and speckled the alpha edges (reported as "blurry, dirty
       edges"). Pillow's animated-webp `method=6` encode is **slow** (~4min
       for 150 frames here) — run it via a background task, don't block on it
       inline.
- Project deep-dive modal (`ProjectModal` + `CodeBlock` hand-rolled highlighter +
  `ArchDiagram`) opens from each work; `caseStudy` content is in `projects.js`.
- Figma has empty `Frame 3–5` reserved for future sections.
- About/contact/manifesto copy is drafted placeholder — the user may rewrite it.
- The user writes in Chinese, is highly design-detail-driven, and iterates on
  her own Mac (wide screen, ~1.85 aspect). Trust her visual observations (she
  correctly diagnosed the `lines.svg` baked-layer doubling).

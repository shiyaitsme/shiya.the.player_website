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
- **Live working branch: `claude/busy-maxwell-kzpt97`** = the good
  `pensive-goodall-749qae` base (3D butterfly, ArchiveWorld, glass ProjectModal,
  lime PNG nav, de-duped `lines.svg`) + this session's home-map polish. ⚠️ It was
  rebuilt by `git reset --hard` onto pensive-goodall, so it diverged from the
  stale `87304b5` lineage. Other branches: `pensive-goodall-749qae` (older good
  base), `wonderful-shannon-9rdua0` (the user's raw asset uploads — this is where
  `carousel_hero_v2.webm` came from; pull new assets from whichever branch she
  uploaded them to).
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
- **Big open idea — responsive / mobile** (discussed, NOT started): the site is
  a fixed 1440×900 art board scaled-to-fit; on phones it shrinks to a centered
  strip. The user likes the idea of a "formula/generative" layout — proportional
  anchor points per viewport + lines computed at runtime between them + labels
  always attached to their image — so any screen fills nicely. Tradeoff she
  accepted in principle: that is NOT pixel-1:1 to Figma anymore. One URL serves
  desktop + mobile via responsive rules (no separate mobile site). She wants a
  prototype when ready.
- Project deep-dive modal (`ProjectModal` + `CodeBlock` hand-rolled highlighter +
  `ArchDiagram`) opens from each work; `caseStudy` content is in `projects.js`.
- Figma has empty `Frame 3–5` reserved for future sections.
- About/contact/manifesto copy is drafted placeholder — the user may rewrite it.
- The user writes in Chinese, is highly design-detail-driven, and iterates on
  her own Mac (wide screen, ~1.85 aspect). Trust her visual observations (she
  correctly diagnosed the `lines.svg` baked-layer doubling).

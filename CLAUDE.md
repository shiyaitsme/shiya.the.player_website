# CLAUDE.md — notes for AI coding sessions

Context for Claude Code (or any agent) working in this repo. Read `README.md`
first for the product/architecture; this file is the operational cheat-sheet.

## Start here (2026-07-03)
- **Work on `claude/mobile-responsive-design-j4zpzc`.** As of this date it is
  both the GitHub repo's default branch AND identical (same commit) to every
  other branch in the repo (`wonderful-shannon-9rdua0`, `world-archive-
  redesign-vdf9o6`, `pensive-goodall-749qae`, `busy-maxwell-kzpt97`) — see
  the "Branch history" bullet under Git below for how/why they were unified.
  There is currently no reason to touch any other branch name; don't create
  a new one unless the user asks you to.
- **After pushing meaningful work, that branch alone is enough** — the old
  practice of manually re-pushing to 2-3 other branches to "keep them in
  sync" is retired now that there's only one branch that matters. If you
  ever find the branches have drifted apart again (check with `git log
  origin/claude/mobile-responsive-design-j4zpzc..origin/<other-branch>
  --oneline`), that means something branched off unexpectedly — fast-
  forward/merge it back rather than starting a second parallel-sync habit.
- The user cannot run `git pull`/`git clone` from her Mac (see the Git
  section) — always hand her the branch ZIP URL after pushing:
  `https://github.com/shiyaitsme/shiya.the.player_website/archive/refs/heads/claude/mobile-responsive-design-j4zpzc.zip`

## What this is
Shiya the Player — a Figma-matched, React/Vite immersive portfolio. The design
source of truth is the user's Figma file; we match it **1:1**.

## Golden rules
- **Site content (sections/shards/stars/mobile map) lives in
  `src/data/projects.js`; each individual WORK lives in its own file under
  `src/data/works/`** (added once the count passed 10, heading toward 60+ —
  see "Works data scaling" below for the full rationale). Adding a work,
  editing copy, remapping a shard/section/background — do it in the right
  one of those, not in components.
- **`src/data/works/NN-slug.js` filename prefix IS display order — there is
  no separate ordering field.** `projects.js` collects every file via
  `import.meta.glob('./works/*.js', { eager: true })` and sorts by filename,
  so it's the zero-padded `NN-` prefix (not array position in a hand-edited
  list) that controls order now. Want a piece to appear earlier? Rename its
  file's prefix (neighbors don't need to stay contiguous — they just sort in
  whatever order you leave the prefixes in). The bottle-cap `number` badge is
  still never stored on a work; it's always derived from the resulting
  `works` array position via `workNumber(id)` (exported from `projects.js`,
  used by `WorkBlock.jsx` via its `index` prop and by `ProjectModal.jsx`) —
  inserting/reordering a work never requires renumbering any other entry. A
  work's optional `date` field (if you add one later) is purely
  informational/shown-to-the-reader — it must never drive sort order; the
  user was explicit that "most proud of" beats "most recent" for a
  portfolio's ordering.
- **A work can have multiple outbound links — `links: [{label,href}, …]`
  (plural array), not the old singular `link: {label,href}`.** Several real
  pieces post to both Instagram and Xiaohongshu. `WorkBlock.jsx` only makes
  the whole poster image itself clickable (`MediaWrap`) when there's
  *exactly one* link — with two or more it's ambiguous which one the image
  should open, so multiple links always render as separate labeled buttons
  under the copy instead.
- **`ProjectModal`'s `caseStudy` has two shapes now** — check `Array.isArray
  (cs.tools)` to tell them apart:
  - **simple** `{ tools:[], image?, body:[] }` — a short, plain "made with X,
    Y, Z" writeup for process-based pieces (3D/AI-generation/video-editing
    tools, not code). **Use this shape for all new work entries.** The user
    is an intern, not applying to a top creative-tech studio — keep these
    genuinely brief and modest, not jargon-stacked. `image` is optional (a
    node-graph screenshot, an effects breakdown, etc.) and fails silently
    (`DeepDiveImage` component) if not uploaded yet.
  - **code** `{ goal, architecture:{caption,nodes[]}, code:{language,snippet},
    analysis:[] }` — the original shape, kept only for the two pre-existing
    pieces that are actually code/shader work (`carousel`). Don't use this
    shape for new AI-art/video-edit pieces; it renders an `ArchDiagram` +
    `CodeBlock` that don't make sense without real source code.
- **All copy across the site is English, deliberately — the user asked for
  zero Chinese anywhere in `projects.js` for internationalization.** Even
  though she writes to Claude in Chinese, translate/compose everything that
  ends up in `body`/`caseStudy`/etc. into English; double-check with a CJK
  regex (`/[一-鿿]/`) before considering a content pass done.
- **Deep-dive writeups should read humble, not like a studio pitch deck.**
  The user was explicit: she's an intern, this isn't an application to a
  top-tier creative-technology studio, so case-study copy should be
  concise and matter-of-fact ("modeled in X, animated in Y") rather than
  stacking buzzwords or over-explaining a simple tool chain.
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
- **`WorkBlock`'s media renders at each image's own native aspect ratio —
  don't force a uniform box again.** An earlier version fixed every work's
  media to `aspectRatio: '16 / 10'` + `object-cover`; the user flagged that
  some images are a very different shape and a center-crop into that box
  "只留下中间不好看" (only keeps the middle, looks bad). Fixed by using
  `h-auto w-full` (no `object-fit` needed since there's no fixed box to fit
  into) so a portrait piece stays portrait and a wide one stays wide. The
  fixed `16/10` box is kept ONLY as the fallback placeholder background for
  the broken-image/text-title state (`!imgOk && !work.video`), since that
  case has no real image to derive a ratio from.

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
  "breathing" wing-flap on a DOM hotspot that tracks its projected position
  and is the click target (NO glow halo — removed, see Status below). Sized
  1/3 on mobile via `targetSize` prop (`useIsMobile`), desktop untouched.
  Click → `enterArchiveWorld` (in `Page.jsx`).
- `components/butterfly/WorldArchive.jsx` — "museum-grade" black/deep-blue
  retro-futurist scene: a `SkyDome` (large inverted sphere, vertical-gradient
  shader — rich midnight blue at top AND bottom, near-black at the horizon
  band, `fog:false` so it stays the backdrop fog fades into rather than
  getting fogged itself) instead of a flat background color, `fogExp2`
  (exponential, not linear `fog`) so distant cards melt smoothly into the
  background instead of hitting a visible far-clip "wall", a deliberately
  dim checkerboard floor (`MeshReflectorMaterial` — canvas-drawn checker
  texture in muted navy tones + a soft blurred mirror, `side={DoubleSide}`
  since free-orbit lets the camera swing under it; kept dim/desaturated on
  purpose per the "floating in a void, not a bright boundary plane" ask), a
  global blue-tinted `ambientLight`, a refractive glass sphere
  (`MeshTransmissionMaterial`, the fixed depth/parallax anchor), `drei/
  Stars`, and `@react-three/postprocessing` (Bloom/ChromaticAberration/
  Noise/Vignette). Replaced the original `ArchiveWorld.jsx` (a pale "misty
  card-cloud" — deleted, don't resurrect it).
- **SUPERSEDED — see the "floating pictures now ARE the real works-page
  pictures" and "click-navigation was ultimately abandoned" bullets further
  below.** (Originally the 6 floating pictures were a separate, hardcoded
  `PICTURES`/`archiveWorks` set sourced from `world_archive_pictures/*.png`
  with no copy written yet, and clicking one navigated to a work-detail
  page via `onSelectWork` + an `ARCHIVE_RETURN_KEY` breadcrumb in
  `Page.jsx`. Both of those decisions were reversed: the pictures now come
  straight from `works` in `projects.js`, and all click/navigation code —
  including the `ARCHIVE_RETURN_KEY` plumbing — was deleted. Keeping this
  note so a stale mental model doesn't resurface either piece.)
- **"Museum array" layout — repetition is deliberate, not a placeholder.**
  With only 6 real pictures, the user explicitly asked for the *shock of
  repetition* ("我们追求重复带来的震撼感") rather than 6 lonely cards: 30
  slots (`SLOT_COUNT`) cycle through the 6 pictures (`i % 6`). If she
  uploads more real pictures later, add them to the `PICTURES` array and
  either raise `SLOT_COUNT` or let the existing slots redistribute — don't
  hardcode "6" anywhere else.
- **Layout is a real spherical distribution with enforced padding, not a
  cylinder** (this replaced an earlier cylindrical version after the user
  flagged crowding): `useArchiveLayout()` seeds points via the golden-angle
  /Fibonacci-sphere construction for even angular coverage, then runs
  relaxation passes (60 iterations, trivial at 30 points) that push any pair
  closer than `MIN_CARD_DISTANCE` apart along their connecting line. Angular
  evenness alone doesn't guarantee 3D spacing once radius jitter is added —
  the relaxation pass is what actually enforces the padding, not the
  Fibonacci construction by itself.
- **`MIN_CARD_DISTANCE` must clear a card's own on-screen footprint, not
  just be "some small number" — this was a real interpenetration ("穿模")
  bug, caught from an actual screenshot, not a hypothetical.** Cards are up
  to ~3.5 units wide (widest uploaded image) × 1.9 tall, so a single card's
  diagonal is ~4 units; two cards meeting edge-on need combined clearance of
  ~4 units just to *touch*, not overlap. An earlier version used
  `MIN_CARD_DISTANCE = 3.2` (smaller than one card's own diagonal) — cards
  visibly clipped through each other despite "passing" the distance check,
  because center-to-center distance was never validated against actual card
  size. Now `5.5`, with margin. If cards are resized (the `h = 1.9` constant
  in `ArchiveInstancedGroup`), recompute the worst-case diagonal
  (`sqrt(maxWidth² + h²)`) and keep `MIN_CARD_DISTANCE` comfortably above it.
- **Floor clamp and glass-sphere clearance must be re-applied on EVERY
  relaxation step, not once at the end — this was the actual bug behind the
  interpenetration above, verified numerically.** An earlier version
  clamped `y` above `FLOOR_Y` in a separate pass *after* all relaxation
  iterations finished; since roughly half the raw sphere points start below
  the floor, that single end-clamp yanked ~15 of the 30 points up onto the
  same clearance line with no further separation check, silently undoing
  the padding relaxation had just enforced for exactly those points. A
  standalone Node script confirmed it: clamp-once-at-the-end converged to a
  minimum pairwise distance of ~1.9 (well under a card's ~4-unit diagonal)
  no matter how many iterations ran, while clamp-on-every-step (via
  `clampArchivePoint()`, called both on initial placement and after every
  push in the relaxation loop) converges cleanly to the full
  `MIN_CARD_DISTANCE`. Same reasoning applies to `MIN_CENTER_CLEARANCE`
  (keeps cards from clipping into the central glass sphere) — it's the same
  function, same rule. If you touch this again, verify with a plain Node
  script computing min pairwise distance over the actual output points
  *before* trusting a screenshot — screenshots at the "wrong" camera angle
  can still look fine even when the underlying layout is broken.
- **Instanced rendering, not one mesh per card** — this is what keeps the
  "vast data museum" density at 60fps: `ArchiveInstancedGroup` renders TWO
  `InstancedMesh`es per unique picture (main photo + a cool-cyan glow rim,
  `THREE.PlaneGeometry` translated -0.015 in the rim's own geometry to dodge
  z-fighting instead of relying on a different instance transform), so the
  draw-call count is constant at 12 total (6 pictures × 2 meshes) no matter
  how many of the 30 slots exist. Bumping `SLOT_COUNT` for more density is
  cheap; adding more *unique* pictures adds 2 draw calls each.
- **Navigation is real 3D `OrbitControls` (`enableRotate` + wide polar
  range), not a drag-the-group hack.** An earlier version kept the camera
  fixed and rotated the picture group on drag (to keep the glass sphere
  "anchored"); the user explicitly asked for that to be replaced with actual
  spherical-coordinate camera orbiting — full horizontal freedom, polar
  angle clamped only a hair short of the poles (`0.05` / `π-0.05`) to dodge
  OrbitControls' gimbal singularity, not to restrict the user. Because the
  camera moves now instead of the array, each `ArchiveInstancedGroup`'s
  per-instance billboard can `dummy.lookAt(camera.position)` directly in
  world space — no local-space conversion needed any more (the group itself
  never rotates), which is simpler than the old parent-aware version. Don't
  reintroduce group rotation on drag; if a "fixed anchor" feel is wanted
  again, that has to come from elsewhere (e.g. keeping the sphere large/
  central), not from freezing the camera.
- **Raycasting/click-to-navigate was investigated end-to-end and is
  correct — don't re-diagnose this as a bug without fresh evidence.** A
  session once suspected "pictures don't all open" and instrumented a
  manual `raycaster.intersectObjects(scene.children, true)` alongside the
  real click handler: every single click that actually intersected an
  instance correctly fired `onSelect` (100% of ~11 hits in one grid-sweep
  test); the "many clicks do nothing" impression came from the array being
  visually sparse against a large fogged/dome background at this camera
  distance — most of the canvas legitimately has no card under the cursor,
  which reads as "clicking doesn't work" if you're aiming from a screenshot
  taken moments earlier (bobbing + camera drift shift things slightly). If
  you're asked to fix "clicks don't register" again, verify with a live
  instrumented raycast log before assuming the event wiring is broken. That
  said, the interpenetration bug above (fixed the same session) was a
  second, real contributor to "some pictures don't open": an occluding,
  closer, clipped-through card can legitimately win the raycast over the
  one the user meant to click. Fixing the padding likely fixed some of the
  perceived click failures too, on top of the event wiring already being
  fine.
- **Follow-up, definitively closed: a naive full-canvas click-sweep test can
  itself look exactly like a "some pictures never click" bug — it isn't
  one.** The user reported it again after the padding fix, this time citing
  *specific* pictures that never respond. A grid-sweep test kept finding
  only 1–2 of the 6 unique pictures ever fired `onSelect`, consistently,
  across many reruns — looked damning. Root cause of the TEST result (not
  the app): the instant any click actually lands on a card, `onSelect`
  correctly fires and the app navigates away from the archive; every
  further click in that same sweep loop is now hitting the work-detail page
  instead, which obviously never logs a hit. A sweep can therefore only
  ever record the *one* picture it happened to hit first, no matter how
  healthy the other five are — this looks identical to "5 pictures are
  broken" if you don't control for it. Proven with a corrected test:
  expose `slotsByPicture`/`archiveWorks` and the `OrbitControls` instance
  on `window` for debugging, directly set `controls.object.position` /
  `controls.target` to aim precisely at each picture's own slot in turn
  (re-entering the archive fresh before each one, so a prior success can't
  contaminate the next test), then click screen-center — every picture
  tested this way opened correctly. If this comes up again, reproduce with
  that fresh-entry-per-target methodology before touching the raycasting
  code; a bare click-sweep will lie to you. (Also bumped `Y_COMPRESS = 0.45`
  in `useArchiveLayout` in the same pass — the *uncompressed* sphere put
  some cards as high as y=+13 against a camera sitting at y=3, so those
  cards genuinely needed an extreme upward tilt to even see, which is a
  real reachability problem distinct from the test artifact above; look
  for both if this is reported a third time.)
- **Third round: the user then reported on her REAL machine that literally
  NOTHING was clickable any more, with zero console output on click — a
  different symptom from the two rounds above, and a real one.** This is a
  genuine, well-known OrbitControls-vs-click-to-select interaction, not a
  raycasting bug: native `onClick` in the browser (and R3F's `onClick`,
  which is driven by the native `click` DOM event) only fires if the
  pointerdown→pointerup gesture didn't move "too much" — and a real mouse
  or trackpad click almost always has a few pixels of incidental drift,
  which `OrbitControls` (now doing real camera rotation, per the change
  above) actively interprets as the start of an orbit. Once that happens,
  the browser can skip firing `click` entirely, so R3F's `onClick` silently
  never triggers — meanwhile a headless test's `page.mouse.click()` moves
  zero pixels between down and up, so it never hits this path, which is
  exactly why this only showed up on real hardware and not in any of this
  session's own (admittedly janky) sandbox tests. Fixed by not depending on
  the native `click` event at all: each `ArchiveInstancedGroup` captures its
  candidate on `onPointerDown` (still correctly raycast-resolved to the
  instance under the cursor at press-time, with `stopPropagation` so a
  farther/occluded card can't also claim it), then confirms the selection
  on a **global `window` `pointerup`** listener — deliberately not the
  mesh's own `onPointerUp`, which could miss entirely if the camera rotated
  the card out from under the cursor before release — only if total
  on-screen movement stayed under 8px. If click-to-select ever needs
  touching again anywhere OrbitControls (or any other component that
  actively rotates the camera on drag) is in play, use this pattern, not
  `onClick`.
- **Click-navigation was ultimately abandoned entirely — don't re-add it
  without being asked.** Even after the onPointerDown+global-pointerup fix
  above, it still didn't work reliably for the user on her real machine, and
  she explicitly gave up on it: "算了没关系那这个world archive就纯粹炫技好了，
  具体的跳转会让网站体积太大了" (never mind, make World Archive pure visual
  flair — navigation would bloat the site too much). All `onSelect`/
  `onSelectWork`/`onPointerDown`/global-`pointerup` code was removed from
  `WorldArchive.jsx`, and the now-dead plumbing it left behind
  (`Page.jsx`'s `cameFromArchive` state, `ARCHIVE_RETURN_KEY` sessionStorage
  breadcrumb, `handleBack`, and the `onSelectWork` prop threaded from
  `App.jsx` → `Page` → `WorldArchive`) was deleted too — `Page`'s back
  button is unconditionally `↩ map` again. The scene is intentionally
  look-but-don't-touch now (still fully orbitable via `OrbitControls`,
  hover still brightens a card's tint/rim); if the user asks for
  navigation again later, this is a from-scratch feature, not a bug to fix.
- **The floating pictures now ARE the real works-page pictures, not a
  separate upload.** `archiveWorks` is derived directly from `works` in
  `../../data/projects` (`id`/`title`/`image`, mapped 1:1) instead of a
  hardcoded `PICTURES` array pointing at `/assets/world_archive_pictures/*`
  — the user asked for the archive to mirror the actual works page rather
  than maintain a second, separate set of "starter" images. The old
  `world_archive_pictures` folder/zip is now unused by this component (left
  on disk, not deleted, in case another part of the site still wants it —
  double check before assuming it's dead). Because `works` currently has 10
  entries (not 6), `SLOT_COUNT=30` cycling via `i % archiveWorks.length`
  still applies — no hardcoded "6" was left behind, per the existing
  "museum array" note below.
- **Full upfront preload, not per-card lazy load** (a deliberate reversal of
  an earlier viewport-frustum lazy-load approach) — `useArchiveTextures()`
  `Promise.all`s every picture through `THREE.TextureLoader` before the
  `<Canvas>` even mounts, showing a small "entering the archive…" progress
  bar overlay in the meantime. A failed image resolves to `null` (renders as
  a plain tinted placeholder plane, not a crash) and still counts toward the
  progress total so one bad file can't hang the entrance. This makes sense
  now specifically because there are only 6 unique textures reused across
  30 slots — do NOT reintroduce per-instance viewport lazy-loading if the
  picture count grows into the hundreds; that's a different problem
  (probably worth a texture atlas) rather than "just add the old gate back".
- Hover brightens the card tint (`#9fc2ff` → `#e7f2ff`) and the rim opacity
  (0.26 → 0.75) for the whole `ArchiveInstancedGroup` at once (all repeated
  copies of that picture highlight together — they're the same work, so
  that's correct, not a bug where "only one instance" should light up).
- **Stateful back-navigation** (`Page.jsx`): a work opened by clicking a
  picture in the archive sets `cameFromArchive` + `sessionStorage.setItem
  (ARCHIVE_RETURN_KEY, '1')`; the top-bar button reads `↩ archive` instead
  of `↩ map` and reopens the archive overlay instead of calling `onClose`.
  It's one breadcrumb level, consumed on use — closing the archive again
  (its own `↩ back`) reveals the same work with the flag now cleared, so a
  second "back" from there goes to the map, not an infinite loop. This is
  plain React state (correct here since `Page` never unmounts across the
  archive→work transition) with sessionStorage only as a remount fallback —
  there's no router in this app; don't add URL query params for this unless
  actual deep-linking is required later.
- **Pin `@react-three/drei` to `^9.122.0` and `@react-three/postprocessing`
  to `^2.19.1`** if you ever reinstall — a bare `npm install @react-three/
  drei` grabs v10, which requires `@react-three/fiber@^9` and conflicts with
  our fiber@8. `three` stays at `^0.169.0`; no need to downgrade to 0.160
  despite what you might see referenced elsewhere.
- FBX path has spaces/`+` → `encodeURI`.
- **Headless WebGL here is possible but fragile — don't trust it past a
  sanity check, and budget for real crashes, not just "Context Lost".**
  `puppeteer.launch({ args: [..., '--enable-unsafe-swiftshader'] })` does
  get a software GL context here, enough to confirm the scene graph is
  wired correctly (instanced billboarded cards, sky dome, glass sphere, all
  correctly textured/positioned in a captured screenshot). But this sandbox
  has a real ceiling: `<Bloom mipmapBlur>` alone was enough to crash the tab
  on the very first static frame (no interaction needed) — removed, and
  that's a genuine perf win to keep regardless of environment, not just a
  headless workaround. With `mipmapBlur` off, a static frame survives
  (through a recoverable `Context Lost` blip), but **any further interaction
  (drag, wheel) reliably kills the whole tab** (`TargetCloseError: Target
  closed`) once `MeshReflectorMaterial` + `MeshTransmissionMaterial` +
  `EffectComposer` + instanced-billboard matrix updates are all live
  together — a software-rasterizer ceiling, not a code bug, but also a
  genuine signal that this combination is the most expensive thing in the
  scene. Current mitigations (don't undo without reason): reflector
  `resolution={256} blur={[160,60]}`, transmission `resolution={256}
  samples={4}`, Canvas `dpr={[1,1.3]}`, `Stars count={1400}`, no
  `mipmapBlur`. **Full interactive verification (does dragging stay smooth
  at 60fps, does the atmosphere read right) still has to happen on the
  user's real Mac GPU** — ask for feedback and expect to tune on it.

## Status / next ideas
- **The works list is now 10 real pieces the user wrote copy for** (replacing
  the earlier `andromeda-freckles` + `carousel` placeholder pair — note
  `andromeda-freckles` was **removed entirely**, not kept alongside the new
  ones; ask before re-adding it if that ever seems wrong). Display order (=
  `src/data/works/` filename prefix order, see "Works data scaling" below) is:
  `heart-of-empire`, `carousel` ("between two infinites"), `limited-night`,
  `the-world-is-my-playground`, `blue-lava`, `the-vanishing-tree`, `vocalize`,
  `star-girl`, `see-you-in-spring`, `fake-touch`. Most of their images
  (`public/assets/works/works_p0N_*.png`) are **not uploaded yet** — this is
  expected, not a bug; `WorkBlock`'s `onError` fallback shows the title as
  text instead of a broken image. Nudge the user for them when it's relevant,
  don't fabricate placeholders.
- **Works data scaling — the user said she has 60+ real pieces in the
  pipeline with no upper bound (this is a long-term-maintained portfolio for
  grad-school applications), so three changes landed together ahead of that
  growth instead of waiting for the single-array/single-scroll approach to
  become unworkable:**
  1. **One file per work** (`src/data/works/NN-slug.js`, see the Golden
     Rules bullet above) instead of one growing array in `projects.js` —
     adding a work is "add one file", not "scroll a few-thousand-line array
     to find the right spot."
  2. **Category filter chips** on the Works page (`categories` array in
     `projects.js`, rendered in `Page.jsx` above the works list). Each work
     gets a `category` field — one of `'ai-art' | '3d-animation' |
     'motion-vfx' | 'realtime-generative' | 'illustration'` — assigned by
     **creation medium/tool** (matches `caseStudy.tools`), not mood/theme;
     the user picked this dimension explicitly over a theme-based taxonomy
     because it's stable (a new work's medium is obvious immediately,
     doesn't require re-judging as the collection grows). Filtering preserves
     each work's ORIGINAL array index (and thus its bottle-cap number) via
     `Page.jsx`'s `filteredWorks = works.map((w,i)=>({w,i})).filter(...)` —
     a piece's number must never change depending on which chip is active.
     If you add a new category, add it to the `categories` array too (chip
     order = array order) and to the JSDoc comment above `workModules` in
     `projects.js` documenting the valid values.
  3. **Lazy-loaded media in `WorkBlock.jsx`** — images get native
     `loading="lazy" decoding="async"`; videos (the `work.video` field, not
     currently used by any real work but supported) have no native lazy
     equivalent and autoplay immediately once mounted, so they're gated
     behind a `videoInView` state set by an `IntersectionObserver`
     (`rootMargin: '600px 0px'`, disconnects after first trigger) — the
     `<video>` element itself doesn't mount/fetch until scrolled near. Both
     share the same placeholder background (the existing broken-image
     gradient box) while not yet loaded, so there's no layout jump.
- **Branch history was a real, repeated source of confusion (multiple
  sessions built work on the wrong/stale branch and lost it) — this was
  fixed at the root on 2026-07-03, not just patched around.** Five branches
  (`claude/wonderful-shannon-9rdua0`, `claude/mobile-responsive-design-j4zpzc`,
  `claude/world-archive-redesign-vdf9o6`, `claude/pensive-goodall-749qae`,
  `claude/busy-maxwell-kzpt97`) had all diverged at different points, and it
  turned out every one of them was already a pure ancestor of one HEAD (verified
  with `git merge-base --is-ancestor` for each pair — zero unique commits on
  any of them) — so instead of continuing to hand-sync N branches after every
  push, all five were **fast-forwarded to point at that same single commit**.
  **Going forward: don't reintroduce a multi-branch workflow.** Do all work
  on the branch this session/task was assigned, push once, done — no manual
  "also push to the other branches" step needed *unless a future session
  independently branches off again* (which would recreate exactly this
  problem). If you ever see these branches point to different commits again,
  that means someone branched off instead of continuing on the shared one —
  treat it as a bug to fix (fast-forward/merge back together), not a new
  permanent multi-branch reality.
  - **Done: the user flipped the GitHub repo's default branch by hand**
    (Settings → Branches → Default branch — not something a coding session's
    tools can do via API) to `claude/mobile-responsive-design-j4zpzc`.
    `git remote show origin` → "HEAD branch" now correctly reports that, not
    `wonderful-shannon-9rdua0`. See "Start here" at the top of this file.
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

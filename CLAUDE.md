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
  `.stage` to **cover** the viewport (anchored top-center) so the lime lines
  bleed to the page edges. Don't reintroduce `contain` (it leaves side gaps and
  the lines stop short — the user explicitly rejected that).
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
  locally** (16 `#B6FF00` elements — both stroked lines AND filled lines/arrow-
  heads). Re-extract with the snippet in `README.md` if `frame1.svg` changes.
- **The user cannot send binary files through chat** (only one `.webm` ever came
  through). Images/SVGs must arrive via GitHub upload. Don't promise to "pull
  their file" from a chat attachment.

## Git
- `git push` works (the Claude GitHub App is installed with write access).
  Push to the working branch; don't open PRs unless asked.
- Commits got interrupted by transient `exit 144` a few times — just re-run the
  commit; check `git log --oneline -1` to confirm it landed.
- The user develops from their Mac and frequently runs `git pull && npm run dev`
  from the **wrong folder** (`~` instead of the repo). If they report
  `not a git repository`, the fix is `cd ~/shiya.the.player_website` first.

## Verifying visually (headless screenshots)
- `puppeteer` + bundled chrome are used for screenshots (installed as needed;
  not committed to `package.json`). Run `npx vite preview --port 4173 --host`
  (use `run_in_background`) then screenshot with `NODE_PATH` pointed at the
  project's `node_modules`.
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
Keep it smooth. Current bundle ≈ 117KB gzip JS. Prefer CSS/GSAP transforms and
Framer; avoid heavy per-frame React state. Honor `prefers-reduced-motion`.

## Status / next ideas
- Pending uploads: 4 zoom `*_cover.png` images; optional `work_carousel.png`.
- Figma has empty `Frame 3–5` reserved for future sections.
- About/contact/manifesto copy is drafted placeholder — the user may rewrite it.

// Content model for Shiya the Player.
//   works    — the portfolio pieces (also the random "Gachapon" pool)
//   sections — what each green shard on the map opens (works / about /
//              contact / manifesto), each with a consistent background and a
//              zoom-transition cover image
//   shards   — shard positions on the 1440x900 map, mapped to a section
//   stars    — black-asterisk Gachapon node positions

// Each work is its own file in ./works/, named "NN-slug.js" — the numeric
// prefix IS the display order (also still the only thing workNumber() below
// reads from), so adding a new piece means adding ONE new file instead of
// scrolling a several-thousand-line array to find the right insertion point.
// Want a piece to show up earlier? Rename its file's prefix (and shuffle the
// neighbors' prefixes if you're inserting in the middle — they don't have to
// stay contiguous, just sort in the order you want). `date` (where present)
// is purely informational (shown to the reader), it does not drive order.
// The bottle-cap `number` badge is still never stored — always derived from
// the resulting array position via `workNumber()`.
//
// `category` picks which filter chip (see `categories` below) a work shows
// under on the Works page — one of: 'ai-art' | '3d-animation' |
// 'realtime-generative' | 'motion-vfx' | 'illustration' | 'product-ux'. It's
// assigned by creation medium/tool (what caseStudy.tools already says), not
// mood/theme — keep new work entries consistent with that or add a new
// category below.
const workModules = import.meta.glob('./works/*.js', { eager: true })
export const works = Object.keys(workModules)
  .sort() // filenames sort numerically because of the zero-padded "NN-" prefix
  .map((path) => workModules[path].default)

// Filter chips shown above the Works list — order here is the chip order.
// A work's `category` must match one of these `key`s to be filterable; a
// work with no `category` (or an unrecognized one) only shows under "all".
export const categories = [
  { key: 'all', label: 'all' },
  { key: 'ai-art', label: 'AI art' },
  { key: '3d-animation', label: '3D & animation' },
  { key: 'motion-vfx', label: 'motion & VFX' },
  { key: 'realtime-generative', label: 'real-time & generative' },
  { key: 'illustration', label: 'graphic design & illustration' },
  { key: 'product-ux', label: 'product & UX' },
]

// The bottle-cap badge number is always derived from array position — never
// stored on the work itself — so reordering `works[]` (the only thing that
// controls display order) never requires touching any other entry.
export const workNumber = (id) => works.findIndex((w) => w.id === id) + 1

export const sections = {
  works: {
    key: 'works',
    nav: 'works',
    kind: 'works',
    bg: '/assets/bg_1.png',
    cover: '/assets/works_tea_pot.png',
    title: 'works',
    blurb: 'A small playground of immersive pieces — read them slowly.',
  },
  about: {
    key: 'about',
    nav: 'about',
    kind: 'text',
    bg: '/assets/bg_2.png',
    cover: '/assets/about_cover.png',
    title: 'about',
    body: [
      'Shiya the Player — a visual creator working across 3D, motion, and AI-assisted image-making, turning short pieces into small worlds you can step into.',
      'Each project starts from a feeling or a line of text, then moves through whatever tools actually fit it — sometimes a generated 3D model, sometimes an illustration, sometimes a node graph pushing pixels into particles.',
    ],
    skills: [
      'Blender · Tripo AI 3D modeling',
      'TouchDesigner · node-based real-time visuals',
      'After Effects · DaVinci Resolve · CapCut',
      'Adobe Illustrator · Photoshop',
      'Midjourney · AI-assisted image-making',
    ],
  },
  contact: {
    key: 'contact',
    nav: 'contact',
    kind: 'text',
    bg: '/assets/bg_3.png',
    cover: '/assets/contact_roller_coaster.png',
    title: 'contact',
    body: [
      'Let’s build something impossible together — installations, rides, and playgrounds for strangers to leave light for one another.',
    ],
    links: [
      { label: 'email', value: 'shiya9863@gmail.com', href: 'mailto:shiya9863@gmail.com' },
      {
        label: 'instagram',
        value: '@shiya.the.player',
        href: 'https://www.instagram.com/shiya.the.player?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
      },
      {
        label: 'xiaohongshu',
        value: '@shiya.the.player',
        href: 'https://www.xiaohongshu.com/user/profile/62530962000000001000a493',
      },
    ],
  },
  manifesto: {
    key: 'manifesto',
    nav: 'manifesto',
    kind: 'text',
    bg: '/assets/bg_4.png',
    cover: '/assets/tools_manifesto_cover.png',
    title: 'manifesto',
    body: [
      'The purest emotion, the most forward-looking image — that’s the whole ambition. Let’s have fun together: explore every form art can take, and the strange, infinite shapes a life can take too. Just make some interesting stuff.',
      'On the subway once, I noticed my nail polish had chipped from a solid coat into scattered fragments — bathwater and air were its authors. Walking back to the office, I saw a chalk figure drawn on the pavement, made by some kid I’ll never meet. Who says a writer only counts if they’re hunched over a desk? Who says a poet needs perfect meter, or an artist needs expensive materials?',
      'Creation doesn’t only move from nothing to something. It can move from many to few, from now to later, from never-existed to existing. Time is a creator too — it turns a child into an adult, the small into the strong. In some sense, everything creates. As people, we should hold onto that ability, and that chance.',
      'I call myself, simply, a visual creator. To formalize, to memorize. That’s it.',
    ],
  },
}

// green polygon shards — coordinates from the Figma demo (1440x900)
// contact/works nudged so the shard's own nearest visible tip (the piece
// PNGs are irregular cut shapes, not plain rectangles — their opaque
// corners sit at different spots than the padded canvas corners) touches
// its nearest lines.svg line endpoint instead of floating a gap away from it.
export const shards = [
  { id: 1, section: 'contact', piece: { left: 103.03, top: 120.59, w: 141.56, rot: -3.19 }, label: { left: 124.41, top: 265.18 } },
  { id: 2, section: 'works', piece: { left: 1119.84, top: 109.22, w: 128.73, rot: 7.35 }, label: { left: 1140.41, top: 223.18 } },
  { id: 3, section: 'about', piece: { left: 876.49, top: 333.75, w: 132.89, rot: 18.79 }, label: { left: 906.41, top: 456.18 } },
  // manifesto: shard nestled into the bottom-right lime-line convergence (its
  // upper-left corner meets the star + converging lines), label below it.
  { id: 4, section: 'manifesto', piece: { left: 1197.41, top: 660.18, w: 147.79, rot: 1.23 }, label: { left: 1140.41, top: 800.18 } },
]

export const stars = [
  { left: 299.41, top: 158.18, size: 34 },
  { left: 150.41, top: 422.18, size: 33 },
  { left: 241.41, top: 336.18, size: 31 },
  { left: 419.41, top: 361.18, size: 33 },
  { left: 405.41, top: 640.18, size: 34 },
  { left: 1217.41, top: 281.18, size: 31 },
  { left: 1116.41, top: 676.18, size: 30 },
]

export const workById = (id) => works.find((w) => w.id === id)
export const pickRandomWork = () => works[Math.floor(Math.random() * works.length)]

// ---------------------------------------------------------------------------
// MOBILE MAP — a separate, proportional (%-of-viewport) layout for phones.
// Not a scaled-down copy of the 1440x900 Figma stage (that either shrinks to
// a centered strip or requires pinch/pan to reach every element — both
// rejected). Instead every anchor is a % position generated to fill a
// portrait screen edge-to-edge; connector lines are drawn at runtime between
// the hub and each shard (see MobileMap.jsx) instead of a baked SVG. Same
// assets (shard art, lime nav PNGs, carousel, star icon), new arrangement.
// rot is kept purely as a cosmetic tilt (matches the desktop shards' spirit).
// ---------------------------------------------------------------------------
// Hub sits mid-screen (not up top) with the 4 shards fanned around it in a
// diamond, per the user's reference sketch — the 5 connector lines are drawn
// by useMobileLines.js, which snaps to each element's LIVE center at render
// time, so these percentages only need to be "roughly right"; they don't
// have to hand-align with a hardcoded line endpoint.
export const mobileHub = { xPct: 50, yPct: 53, wVw: 50 }

export const mobileShards = [
  { id: 1, section: 'contact', xPct: 30, yPct: 24, wVw: 26, rot: -3.19 },
  { id: 2, section: 'works', xPct: 71, yPct: 29, wVw: 24, rot: 7.35 },
  { id: 3, section: 'about', xPct: 27, yPct: 64, wVw: 24, rot: 18.79 },
  { id: 4, section: 'manifesto', xPct: 71, yPct: 73, wVw: 26, rot: 1.23 },
]

// Re-tuned (2026-07-03) to sit in the gaps between the hub carousel, the 4
// shard photos, AND their nav labels — several used to land right on top of
// "works"/"contact"/"about" text or clip the carousel artwork. Checked
// against measured on-screen rects, not just eyeballed: with `mobileHub` at
// (50,53)/50vw and `mobileShards` above, the shard+label footprints are
// roughly contact x16-46/y23-40, works x56-86/y28-43, about x10-44/y62-79,
// manifesto x56-86/y72-85 (in %), and the carousel's actual VISIBLE artwork
// (its bounding box is much bigger than that because the webm/PNG frame has
// transparent padding) is roughly x35-66/y40-64. Every star below sits
// outside all of those.
export const mobileStars = [
  { xPct: 72, yPct: 18, size: 22 },
  { xPct: 16, yPct: 14, size: 20 },
  { xPct: 12, yPct: 47, size: 18 },
  { xPct: 16, yPct: 58, size: 20 },
  { xPct: 50, yPct: 69, size: 20 },
  { xPct: 85, yPct: 48, size: 19 },
  { xPct: 80, yPct: 61, size: 21 },
]

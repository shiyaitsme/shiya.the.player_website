// Content model for Shiya the Player.
//   works    — the portfolio pieces (also the random "Gachapon" pool)
//   sections — what each green shard on the map opens (works / about /
//              contact / manifesto), each with a consistent background and a
//              zoom-transition cover image
//   shards   — shard positions on the 1440x900 map, mapped to a section
//   stars    — black-asterisk Gachapon node positions

// Array order IS display order — no separate ordering field to maintain.
// Want a piece to show up earlier? Move its object up in this array. `date`
// (where present) is purely informational (shown to the reader), it does not
// drive sort order. The bottle-cap `number` badge is never stored — it's
// always derived from array position via `workNumber()` below, so inserting
// a new work anywhere never requires renumbering anything else.
export const works = [
  {
    id: 'heart-of-empire',
    title: 'heart of empire',
    emoji: '',
    image: '/assets/works/works_p01_heart-of-empire.png',
    body: [
      'Footprints across the plains, the snow mountains at her back—she stands at the summit of the world, her colors unchanged.',
      'Her blade can cleave through snowstorms, or become the corner where a butterfly rests.',
      'People crave oxygen only when they’re suffocating; she craves the thinness of the air, the life force surging up like molten lava. A new order is being born, and she stands as its last watcher.',
      'The heart of the empire still beats—for the last frozen blue rose and emerald on earth.',
    ],
    links: [
      {
        label: 'watch on instagram',
        href: 'https://www.instagram.com/reel/DZ-4QVtTp1T/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
      },
      {
        label: 'watch on xiaohongshu',
        href: 'https://www.xiaohongshu.com/discovery/item/6a3e61ba000000000702dc72?source=webshare&xhsshare=pc_web&xsec_token=AB2Q5foZcFczdXNL5tWbC7p2lEw0LP7u9edWDZuqZ0y6g=&xsec_source=pc_share',
      },
    ],
    caseStudy: {
      tools: ['Tripo AI 3D modeling', 'Blender animation', 'DaVinci Resolve color grading', 'CapCut editing'],
      body: [
        'Modeled in Tripo AI, then brought into Blender for animation and lighting. Color graded in DaVinci Resolve and cut together in CapCut.',
      ],
    },
  },
  {
    id: 'carousel',
    title: 'between two infinites',
    emoji: '🎠',
    // This piece is a video; embedding/autoplaying it on the page is heavy, so
    // we show its Instagram cover and link out to the reel instead.
    image: '/assets/works/works_p02_between-two-infinites.png',
    body: [
      'Where the desert ends, the sea begins. Between two infinities, a carousel stands — pointing the lost toward a way forward, though we both know every road is long. So walk it as a pilgrimage.',
      'Don’t linger here. This is just one stop in the vast playground of the world. Ahead, the sands and the waves are waiting.',
    ],
    links: [
      {
        label: 'watch on instagram',
        href: 'https://www.instagram.com/reel/DZ0yKRXTXtL/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
      },
    ],
    caseStudy: {
      goal: 'Between Two Infinites stages a carousel at the seam of desert and sea — a waypoint for the lost. The research question: can a looping ride encode "keep moving" without a single word of text?',
      architecture: {
        nodes: ['Rotary Encoder', 'OSC Bus', 'TouchDesigner', 'Projection + Spatial Audio'],
        caption:
          'The carousel’s real rotation (a hardware encoder, not a timer) is broadcast over OSC; TouchDesigner blends a projection-mapped horizon and orbits a spatial-audio bed so the room breathes in lockstep with the ride.',
      },
      code: {
        language: 'javascript',
        snippet: `// map carousel angle -> horizon blend + sound pan
const TAU = Math.PI * 2;

function onRotation(angle) {
  const t = (angle % TAU) / TAU;          // 0..1 per turn
  const horizon = smoothstep(0.0, 1.0, t);
  setProjectionBlend('desert', 1.0 - horizon);
  setProjectionBlend('sea', horizon);
  spatial.pan(Math.sin(angle));           // sound orbits the room
}`,
      },
      analysis: [
        'Sourcing rotation from the encoder rather than a clock kept image and motion phase-locked even when visitors shoved the ride — the illusion collapses the instant the sound lags the turn.',
        'The hardest edit was restraint. An early build cross-faded six scenes per rotation and read as noise; two infinities, one transition per turn — the piece only worked once it did less.',
      ],
    },
  },
  {
    id: 'limited-night',
    title: 'limited night',
    emoji: '',
    image: '/assets/works/works_p03_deep-dive_limited-night.png',
    body: [
      'That she wrote, "Speech to the Young: Speech to the Progress Toward"',
      'Say to them, say to the down-keepers, the sun-slappers, the self-soilers, the harmony-hushers',
      'Even if you are not ready for the day, it cannot always be night',
      'Darkness sweeps across the entire cliff face lit by moonlight. The wings still carry the salt of seawater, its taste soaked deep into every feather. Petals are scattered by the midnight ocean wind, falling from the highlands down into the drifting surface of the sea.',
      'Is the night endless? She prays for a limited night.',
    ],
    links: [
      {
        label: 'watch on instagram',
        href: 'https://www.instagram.com/reel/DXSSWkYkkXQ/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
      },
      {
        label: 'watch on xiaohongshu',
        href: 'https://www.xiaohongshu.com/discovery/item/69f88aac000000001a02c054?source=webshare&xhsshare=pc_web&xsec_token=ABnlM4ORKJobEAdr8OyjHBzQuj1PrUzgYIpQDKkDyWAtk=&xsec_source=pc_share',
      },
    ],
    caseStudy: {
      tools: ['TouchDesigner'],
      image: '/assets/works/works_p03_deep-dive_limited-night.png',
      body: [
        'A real-time TouchDesigner network that turns 2D video into a field of 3D particles — each pixel\'s brightness pushed into height, so the image slowly rebuilds itself as geometry.',
        'The pipeline reads a video\'s color into a flat array, merges it with a grid of positions, and uses that to drive instanced geometry: brightness becomes depth and scale. A feedback loop adds a bit of trailing, ghost-like motion, and bloom in the render pass gives the particles a soft, overloaded glow.',
        'The main challenge was performance — feeding a full-resolution image straight into this pipeline crushed the frame rate. Downsampling the source before converting it to data kept the silhouette readable while getting things back to a steady 60fps. A little noise and a few LFOs on top keep the whole field breathing instead of sitting still.',
      ],
    },
  },
  {
    id: 'the-world-is-my-playground',
    title: 'the world is my playground',
    emoji: '',
    image: '/assets/works/works_p04_the-world-is-my-playground.png',
    body: [
      'I imagine an oyster that holds not a pearl, but an entire Earth.',
      '"The world is my oyster" feels less like conquest, and more like a playground.',
      'When I open the oyster, I become both the explorer and the visitor—the one who enters a world made for curiosity.',
      'Without curiosity, an oyster is just an oyster. With it, the inside could be a whole planet, a place to play, to discover, to live differently.',
      'The "amusement park" isn\'t a place but a mindset. When we choose wonder over routine, the entire Earth turns into a playground.',
      'And maybe weightlessness is simply the mind reacting to scale—the way a tiny oyster can suddenly hold a world, breaking reality for a moment, letting us drift.',
    ],
    caseStudy: {
      tools: ['Adobe Illustrator', 'Photoshop'],
      body: ['Illustrated in Illustrator, then composited and finished in Photoshop.'],
    },
  },
  {
    id: 'blue-lava',
    title: 'blue lava',
    emoji: '',
    image: '/assets/works/works_p05_blue-lava.png',
    body: [
      'Somewhere between memory and malfunction, the screen starts to bleed blue. Old signals don’t fade quietly — they melt, glow, and leave color scars across the dark.',
      'Call it static as lava: slow, hot, and hard to look away from.',
    ],
    links: [
      {
        label: 'watch on instagram',
        href: 'https://www.instagram.com/reel/DRrY6KhkeNI/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
      },
      {
        label: 'watch on xiaohongshu',
        href: 'https://www.xiaohongshu.com/discovery/item/692c2123000000001e02b3ff?source=webshare&xhsshare=pc_web&xsec_token=ABKud05yrbfiTf10y7-tpCnNH4_XiM8nze7GtlR5f3Jzg=&xsec_source=pc_share',
      },
    ],
    caseStudy: {
      tools: ['After Effects'],
      image: '/assets/works/works_p05_deep-dive_blue-lava.png',
      body: [
        'A CRT-glitch look built entirely from After Effects\' own built-in tools, no third-party plugins.',
        'Card Wipe slices the type into thin vertical strips to mimic an old CRT\'s phosphor grille. Separating and offsetting the RGB channels gives that classic red/blue fringing at the edges. A displacement map driven by noise pushes those strips apart for the glitchy break-up moments, and Glow blends the separated colors back into a warm, overloaded halo.',
        'Sticking to stock effects instead of a plugin kept the project light and easy to reuse — and meant actually understanding what a displacement map or a channel shift does, instead of dragging a preset onto the timeline.',
      ],
    },
  },
  {
    id: 'the-vanishing-tree',
    title: 'the vanishing tree',
    emoji: '',
    image: '/assets/works/works_p06_the-vanishing-tree.png',
    body: [
      'Spring is coming, I think. The trees are budding again — the same trees I’ve walked past every day for years, the same ones that will keep budding long after I’m gone. There’s something quietly devastating about that. Not loss exactly, but the slow realization that what I called "forever" was really just "for now, without noticing."',
      'My grandmother’s hair turned white. I don’t know when. My grandfather started walking smaller. I missed the moment it happened — there was no moment, that’s the point. The world doesn’t announce its changes. It just keeps going, and one day you look back and the light is completely different.',
      'The tree will outlast my time here. That feels both impossible and inevitable — which is maybe the only honest thing I can say about anything I’ve ever taken for granted.',
      'Made with Midjourney, AIGC art.',
    ],
  },
  {
    id: 'vocalize',
    title: 'vocalize',
    emoji: '',
    image: '/assets/works/works_p07_vocalize.png',
    body: [
      'I suddenly thought of The Taste of Tea while brainstorming—tracks extending from the neck, a train like the words she speaks, like the precious thoughts she leaves behind.',
      'She could be Beauvoir, Woolf… or you, or me.',
      'The tracks and the running train are a kind of voice. The wind, the waves—they batter her, they wear her down, yet she keeps choosing to speak, even if the next moment she might vanish.',
      'We are no longer trapped subjects; we are those who speak for collective rights. Even when the tracks are uneven, even when we risk falling into the sea, we still let the train run toward the horizon, letting words reach far-off shores.',
      'Made with Midjourney, AIGC art.',
    ],
  },
  {
    id: 'star-girl',
    title: 'star girl',
    emoji: '',
    image: '/assets/works/works_p08_star-girl.png',
    body: [
      'Stars blooming across monotone black hair, carrying the Milky Way inside the body — a quiet rebellion against the dullness of living.',
      'Made with Midjourney, AIGC art.',
    ],
  },
  {
    id: 'see-you-in-spring',
    title: 'see you in spring',
    emoji: '',
    image: '/assets/works/works_p09_see-you-in-spring.png',
    body: [
      'Hong Kong, spring of the nineties — humid, salt-tinged air, the far-off ring of a tram bell. In the flower field, all she can hear is her own heartbeat and petals moving in the wind.',
      'She had watched him fall once, on a rainy street lit pink by neon. He looked toward her hiding place, just for a moment — the way you’d glance at something by accident. He had always known: months before, he’d found her out, put the document back in its drawer, and simply said, "go." He spent everything he had to buy her one spring.',
      'She remembers a jazz bar, winter, a glance across the room that meant nothing at the time. Years later she understands: the whole weight of it was folded into that one look.',
      '"See you in spring," he’d written once, carelessly, inside the cover of an old book — maybe already knowing neither of them would get one. She opens her eyes now, hears the wind move through the field, and says it back.',
      'Made with Midjourney, AIGC art.',
    ],
  },
  {
    id: 'fake-touch',
    title: 'fake touch',
    emoji: '',
    image: '/assets/works/works_p10_fake-touch.png',
    body: [
      'The touch may not be real.',
      'But the warmth between them, the wind over the grass, the light — all of it is.',
      'Fake Touch.',
      'A android. A lamb. A moment that never needed to be real to matter.',
      'Made with Midjourney, AIGC art.',
    ],
  },
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
    badge: 0,
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
    badge: 3,
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
    badge: 8,
    body: [
      'The purest emotion, the most forward-looking image — that’s the whole ambition. Let’s have fun together: explore every form art can take, and the strange, infinite shapes a life can take too. Just make some interesting stuff.',
      'On the subway once, I noticed my nail polish had chipped from a solid coat into scattered fragments — bathwater and air were its authors. Walking back to the office, I saw a chalk figure drawn on the pavement, made by some kid I’ll never meet. Who says a writer only counts if they’re hunched over a desk? Who says a poet needs perfect meter, or an artist needs expensive materials?',
      'Creation doesn’t only move from nothing to something. It can move from many to few, from now to later, from never-existed to existing. Time is a creator too — it turns a child into an adult, the small into the strong. In some sense, everything creates. As people, we should hold onto that ability, and that chance.',
      'I call myself, simply, a visual creator. To formalize, to memorize. That’s it.',
    ],
  },
}

// green polygon shards — coordinates from the Figma demo (1440x900)
export const shards = [
  { id: 1, section: 'contact', piece: { left: 114.89, top: 135.25, w: 141.56, rot: -3.19 }, label: { left: 124.41, top: 265.18 } },
  { id: 2, section: 'works', piece: { left: 1139.73, top: 98.72, w: 128.73, rot: 7.35 }, label: { left: 1140.41, top: 223.18 } },
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

export const mobileStars = [
  { xPct: 72, yPct: 18, size: 22 },
  { xPct: 26, yPct: 33, size: 20 },
  { xPct: 18, yPct: 38, size: 18 },
  { xPct: 71, yPct: 58, size: 20 },
  { xPct: 40, yPct: 74, size: 20 },
  { xPct: 11, yPct: 51, size: 19 },
  { xPct: 88, yPct: 41, size: 21 },
]

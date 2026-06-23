// Content model for Shiya the Player.
//   works    — the portfolio pieces (also the random "Gachapon" pool)
//   sections — what each green shard on the map opens (works / about /
//              contact / manifesto), each with a consistent background and a
//              zoom-transition cover image
//   shards   — shard positions on the 1440x900 map, mapped to a section
//   stars    — black-asterisk Gachapon node positions

export const works = [
  {
    id: 'andromeda-freckles',
    number: 1,
    title: 'andromeda freckles',
    emoji: '✨',
    image: '/assets/work_andromeda_freckles.png',
    body: [
      'In Cosmos, Carl Sagan said the nitrogen in our DNA, the calcium in our bones, the iron in our blood, the carbon in our apple pies — all these atoms were forged inside ancient stars. We are a way for the universe to know itself.',
      'And mapped across her face is Andromeda, born 10 billion years ago. Read her closely and you can read the countless secrets of the cosmos — countless stars that lived, and died. Everyone’s freckles are galaxies; everyone‘s own constellation of moles makes them who they are, and no one else.',
    ],
    caseStudy: {
      goal: 'Can a face become a star map? Andromeda Freckles treats each freckle as a catalogued star and fits the Andromeda galaxy onto a live portrait, so skin reads as a navigable sky rather than a surface.',
      architecture: {
        nodes: ['Webcam', 'Face Landmarks', 'UV Remap', 'Star Shader', 'Composite'],
        caption:
          'Real-time face landmarks anchor a UV remap that pins a star catalogue to the skin; a GPU fragment shader scatters and twinkles the constellation before compositing it back over the portrait.',
      },
      code: {
        language: 'glsl',
        snippet: `// fragment: scatter twinkling stars along remapped skin UVs
uniform sampler2D uFace;
uniform float uTime;
varying vec2 vUv;

float star(vec2 p, float s) {
  float d = length(fract(p) - 0.5);
  return smoothstep(s, 0.0, d);
}

void main() {
  vec3 skin = texture2D(uFace, vUv).rgb;
  float tw = 0.5 + 0.5 * sin(uTime * 2.0);
  float s = star(vUv * 40.0, 0.08 * tw);
  vec3 lime = vec3(0.71, 1.0, 0.0);
  gl_FragColor = vec4(skin + lime * s, 1.0);
}`,
      },
      analysis: [
        'Landmark jitter was the hard constraint: raw detections wobble a couple of pixels, which made the whole constellation crawl across the face. A one-euro filter on the UV anchors traded a little latency for a sky that finally held still.',
        'Mapping a real catalogue instead of random noise turned out to be the point — viewers who recognised Andromeda stopped reading it as a filter and started reading it as a claim: that they are, literally, made of stars.',
      ],
    },
  },
  {
    id: 'carousel',
    number: 2,
    title: 'between two infinites',
    emoji: '🎠',
    // This piece is a video; embedding/autoplaying it on the page is heavy, so
    // we show its Instagram cover and link out to the reel instead.
    image: '/assets/work_carousel_between_two_infinites_ig_cover.png',
    body: [
      'Where the desert ends, the sea begins. Between two infinities, a carousel stands — pointing the lost toward a way forward, though we both know every road is long. So walk it as a pilgrimage.',
      'Don’t linger here. This is just one stop in the vast playground of the world. Ahead, the sands and the waves are waiting.',
    ],
    link: {
      label: 'watch on instagram',
      href: 'https://www.instagram.com/reel/DZ0yKRXTXtL/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
    },
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
]

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
      'Shiya the Player — a creative technologist and immersive-media designer building interactive worlds where wonder becomes a way of knowing.',
      'I design installations and narrative rides at the seam of art and engineering: real-time graphics, spatial sound, and physical space choreographed into one breathing thing.',
    ],
    skills: [
      'WebGL · Three.js · GLSL',
      'GSAP · Framer Motion',
      'TouchDesigner · Blender · Houdini',
      'spatial audio · creative direction',
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
      'I make playgrounds because I believe wonder is a form of knowledge — that a room can teach you something a sentence never could.',
      'My creative language is collision: retro Americana against acid graphics, analog warmth against digital impossibility, the sacred against the silly. I want the work to feel hand-made and faintly impossible at once.',
      'The vision is a digital 桃花源 — a utopia you stumble into, where strangers quietly leave light for people they will never meet. Every project is one stop on that map. Don’t linger. Ahead, the sands and the waves are waiting.',
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
  { id: 4, section: 'manifesto', piece: { left: 1132.41, top: 660.18, w: 147.79, rot: 1.23 }, label: { left: 1140.41, top: 800.18 } },
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

// Mock portfolio data — the "Gachapon" pool for the star nodes,
// and the narrative shard array mapped to green_piece_1..4.png.

export const projects = [
  {
    id: 'aurora-field',
    title: 'AURORA FIELD',
    field: 'Immersive Installation',
    year: '2025',
    color: '#e9a6c9',
    blurb:
      'A 360° responsive light garden where visitor footsteps bloom volumetric aurora ribbons across a 24-projector dome.',
  },
  {
    id: 'tide-machine',
    title: 'TIDE MACHINE',
    field: 'Kinetic Sculpture',
    year: '2024',
    color: '#a9c4e8',
    blurb:
      'Seven hundred suspended mirrors choreographed to a generative tide model — the room breathes like an ocean at dusk.',
  },
  {
    id: 'sugar-circuit',
    title: 'SUGAR CIRCUIT',
    field: 'Theme Park Dark Ride',
    year: '2025',
    color: '#c4a7e7',
    blurb:
      'A narrative dark ride through a candy-coded utopia — riders rewrite the story by collecting light during the journey.',
  },
  {
    id: 'bloom-protocol',
    title: 'BLOOM PROTOCOL',
    field: 'Real-time WebGL',
    year: '2023',
    color: '#b7d36a',
    blurb:
      'A browser-native particle ecosystem of 1.2M agents that gardens itself based on the collective cursor weather of its visitors.',
  },
  {
    id: 'paper-moon',
    title: 'PAPER MOON',
    field: 'Projection Mapping',
    year: '2024',
    color: '#f3c7dc',
    blurb:
      'Architectural projection that folds a civic facade into a slow-motion origami moonrise, scored for 40 hidden speakers.',
  },
  {
    id: 'echo-orchard',
    title: 'ECHO ORCHARD',
    field: 'Spatial Audio',
    year: '2025',
    color: '#8fb98f',
    blurb:
      'An orchard of acoustic trees — shake a branch of light and harvest a melody seeded from a stranger who visited before you.',
  },
]

// Shard array — one narrative card per polygonal layout shard.
// Loop sequentially via `green_piece_${id}.png`.
export const shards = [
  {
    id: 1,
    name: 'ROLLERCOASTER',
    nav: 'works',
    accent: '#ff2d95',
    quote:
      '“We are made of star-stuff. We are a way for the cosmos to know itself.”',
    cite: 'Carl Sagan',
    copy: 'Selected immersive works — the rides I have built across domes, facades and the open web.',
  },
  {
    id: 2,
    name: 'COFFEE CUPS',
    nav: 'about',
    accent: '#00e5ff',
    quote:
      '“Somewhere, something incredible is waiting to be known.”',
    cite: 'Carl Sagan',
    copy: 'A creative technologist orbiting immersive media, narrative theme parks and acid-bright play.',
  },
  {
    id: 3,
    name: 'SWINGS',
    nav: 'tools',
    accent: '#ff5fd2',
    quote:
      '“Imagination will often carry us to worlds that never were. But without it we go nowhere.”',
    cite: 'Carl Sagan',
    copy: 'WebGL · Three.js · GSAP · TouchDesigner · Blender · Houdini · spatial audio rigs.',
  },
  {
    id: 4,
    name: 'FERRIS WHEEL',
    nav: 'contact',
    accent: '#9d00ff',
    quote:
      '“For small creatures such as we, the vastness is bearable only through love.”',
    cite: 'Carl Sagan',
    copy: 'Let us build a playground together. Reach out for installations, rides and collaborations.',
  },
]

export const pickRandomProject = () =>
  projects[Math.floor(Math.random() * projects.length)]

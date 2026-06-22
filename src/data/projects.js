// Mock portfolio data.
// `projects` = the random "Gachapon" pool for the black star (*) nodes.
// `shards`   = the 4 green polygon shards, positioned to match the Figma
//              demo (1440x900 stage) and each opening an editorial detail.

export const projects = [
  {
    id: 'andromeda-freckles',
    number: 1,
    title: 'andromeda freckles',
    field: 'Immersive Portrait',
    year: '2025',
    image: '/assets/work_1.jpg',
    body: [
      'In Cosmos, Carl Sagan said the nitrogen in our DNA, the calcium in our bones, the iron in our blood, the carbon in our apple pies — all these atoms were forged inside ancient stars. We are a way for the universe to know itself.',
      'And mapped across her face is Andromeda, born 10 billion years ago. Read her closely and you can read the countless secrets of the cosmos — countless stars that lived, and died. Everyone’s freckles are galaxies; everyone‘s own constellation of moles makes them who they are, and no one else.',
    ],
  },
  {
    id: 'tide-machine',
    number: 2,
    title: 'tide machine',
    field: 'Kinetic Sculpture',
    year: '2024',
    image: '/assets/work_2.jpg',
    body: [
      'Seven hundred suspended mirrors choreographed to a generative tide model. The room breathes like an ocean at dusk, and the audience drifts beneath a sky they are quietly rewriting.',
      'We borrow the moon’s arithmetic and hand it to strangers. The pull you feel is real; gravity is just love at a distance, doing the math.',
    ],
  },
  {
    id: 'sugar-circuit',
    number: 3,
    title: 'sugar circuit',
    field: 'Theme Park Dark Ride',
    year: '2025',
    image: '/assets/work_3.jpg',
    body: [
      'A narrative dark ride through a candy-coded utopia. Riders collect light through the journey and, without noticing, author the ending they arrive at.',
      'Every child leaves convinced the ride remembered them. It did. Somewhere in the machine, their constellation is still glowing.',
    ],
  },
  {
    id: 'echo-orchard',
    number: 4,
    title: 'echo orchard',
    field: 'Spatial Audio',
    year: '2025',
    image: '/assets/work_4.jpg',
    body: [
      'An orchard of acoustic trees. Shake a branch of light and harvest a melody seeded by a stranger who visited before you — a small, bearable piece of the vastness.',
      'For small creatures such as we, the vastness is bearable only through love. So we planted a place to leave songs for people we will never meet.',
    ],
  },
]

// Green polygon shards — coordinates lifted from the Figma demo (1440x900).
export const shards = [
  {
    id: 1,
    nav: 'contact',
    projectId: 'andromeda-freckles',
    piece: { left: 114.89, top: 135.25, w: 141.56, rot: -3.19 },
    label: { left: 124.41, top: 265.18 },
  },
  {
    id: 2,
    nav: 'works',
    projectId: 'tide-machine',
    piece: { left: 1139.73, top: 98.72, w: 128.73, rot: 7.35 },
    label: { left: 1140.41, top: 223.18 },
  },
  {
    id: 3,
    nav: 'about',
    projectId: 'sugar-circuit',
    piece: { left: 876.49, top: 333.75, w: 132.89, rot: 18.79 },
    label: { left: 906.41, top: 456.18 },
  },
  {
    id: 4,
    nav: 'tools',
    projectId: 'echo-orchard',
    piece: { left: 1185.41, top: 676.18, w: 147.79, rot: 1.23 },
    label: { left: 1214.41, top: 799.18 },
  },
]

// Scattered black asterisks (positions from the Figma demo, 1440x900).
export const stars = [
  { left: 299.41, top: 158.18, size: 34 },
  { left: 150.41, top: 422.18, size: 33 },
  { left: 241.41, top: 336.18, size: 31 },
  { left: 419.41, top: 361.18, size: 33 },
  { left: 405.41, top: 640.18, size: 34 },
  { left: 1217.41, top: 281.18, size: 31 },
  { left: 1116.41, top: 676.18, size: 30 },
]

export const projectById = (id) => projects.find((p) => p.id === id)

export const pickRandomProject = () =>
  projects[Math.floor(Math.random() * projects.length)]

export default {
  id: 'coral-dream',
  title: 'coral dream',
  emoji: '',
  category: '3d-animation',
  image: '/assets/works/works_coral-dream.png',
  body: [
    'The dream begins with falling — deep into the sea. Sharks, shipwrecks. Or jellyfish, treasure.',
    'Fighting the water’s pull, dragging myself toward the surface —',
    'and there it was. A reef.',
  ],
  links: [
    {
      label: 'watch on instagram',
      href: 'https://www.instagram.com/reel/DaZ1vQBpHz2/?utm_source=ig_web_copy_link',
    },
    {
      label: 'watch on xiaohongshu',
      href: 'https://www.xiaohongshu.com/discovery/item/6a4a47e6000000000702a59d?source=webshare&xhsshare=pc_web&xsec_token=AB7cjkpHTvc31QbL4J82Ia_BgYxIPHtRL2TiS6o9SLi28=&xsec_source=pc_share',
    },
  ],
  caseStudy: {
    tools: ['Blender shading', 'Blender particle system'],
    image: [
      '/assets/works/works_deep-dive_coral-dream_01.png',
      '/assets/works/works_deep-dive_coral-dream_02.png',
    ],
    body: [
      'The water is really two shaders stacked on top of each other: a surface shader for what breaks the light at the top, and a volume shader underneath for the murky feeling of actually being underwater.',
      'The surface is a Principled BSDF with low roughness and water’s real IOR, so it reflects and refracts like glass. Rather than pushing real geometry around for waves, a noise texture drives the bump instead — cheaper to render, and it still reads as rippling water from any normal viewing distance.',
      'The volume shader is what gives the underwater murk: high anisotropy scatters light forward the way real water does, and a separate absorption pass darkens and blues the color out with depth, mixed back in under the surface. Keeping surface and volume as two shaders instead of one made it easier to tune how murky the water feels without touching the surface reflections at all.',
      'Bubbles are a particle system, a couple thousand of them, with some Brownian motion added so they drift and jitter on the way up instead of rising in a straight line — closer to how real bubbles get pushed around by moving water.',
    ],
  },
}

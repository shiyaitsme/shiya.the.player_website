export default {
  id: 'limited-night',
  title: 'limited night',
  emoji: '',
  category: 'realtime-generative',
  image: '/assets/works/works_p03_limited-night.jpg',
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
    image: '/assets/works/works_p03_deep-dive_limited-night.jpg',
    body: [
      'A real-time TouchDesigner network that turns 2D video into a field of 3D particles — each pixel\'s brightness pushed into height, so the image slowly rebuilds itself as geometry.',
      'The pipeline reads a video\'s color into a flat array, merges it with a grid of positions, and uses that to drive instanced geometry: brightness becomes depth and scale. A feedback loop adds a bit of trailing, ghost-like motion, and bloom in the render pass gives the particles a soft, overloaded glow.',
      'The main challenge was performance — feeding a full-resolution image straight into this pipeline crushed the frame rate. Downsampling the source before converting it to data kept the silhouette readable while getting things back to a steady 60fps. A little noise and a few LFOs on top keep the whole field breathing instead of sitting still.',
    ],
  },
}

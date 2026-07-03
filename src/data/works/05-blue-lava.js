export default {
  id: 'blue-lava',
  title: 'blue lava',
  emoji: '',
  category: 'motion-vfx',
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
}

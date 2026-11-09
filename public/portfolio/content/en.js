/* ==========================================================================
   Portfolio copy — ENGLISH (primary).
   --------------------------------------------------------------------------
   All user-facing text lives in this file; layout lives in app.js + CSS.
   To add Korean: copy this file to `ko.js`, translate the values (keep the
   keys, image paths and URLs), and open /portfolio/?lang=ko. Any key missing
   from ko.js falls back to English.

   RULES
   • Nothing here may be invented. Facts come from: the brief, the live site's
     data (src/data/projects.js, src/data/works/*), and the BLING repo
     (https://github.com/shiyaitsme/BLING).
   • Anything unknown is written as  [TO CONFIRM: …]  — the renderer
     highlights those in yellow and `npm run pdf` lists them.
   ========================================================================== */

const W = '../assets/works/' // full-size artwork already shipped with the site
const T = './img/thumbs/' // 640px thumbnails made by portfolio/scripts/optimise-images.py
const B = './img/bling/' // phone captures of the BLING prototype

export default {
  lang: 'en',
  // Languages the switcher offers. Add 'ko' here once content/ko.js exists.
  availableLangs: ['en'],
  ui: {
    pageTitle: 'Shiya Li — Portfolio',
    barTitle: 'Shiya Li · Portfolio',
    downloadPdf: 'Download PDF',
    print: 'Print / Save PDF',
    toSite: 'Main site',
    langSwitch: 'EN / 한국어',
    running: 'Shiya Li — Portfolio',
    caseStudy: 'Case study',
    noscript: 'This portfolio is rendered with JavaScript. Please enable it, or open the PDF.',
  },

  person: {
    name: 'Shiya Li',
    alias: 'Shiya the Player',
    email: 'shiya9863@gmail.com',
    instagram: { handle: '@shiya.the.player', href: 'https://www.instagram.com/shiya.the.player' },
    xiaohongshu: { handle: '@shiya.the.player', href: 'https://www.xiaohongshu.com/user/profile/62530962000000001000a493' },
    site: { label: 'shiya-the-player-website.pages.dev', href: 'https://shiya-the-player-website.pages.dev/' },
    pdf: './Shiya-Li-Portfolio.pdf',
  },

  cover: {
    kicker: 'Portfolio',
    disciplines: 'Interaction Design · Digital Media · AI Immersive Media Contents',
    name: 'Shiya Li',
    alias: 'a.k.a. Shiya the Player',
    meta: [
      ['Application', 'Graduate study, Hongik University, Seoul'],
      ['Intake', '[TO CONFIRM: intake year / semester]'],
    ],
    image: W + 'works_psyche-and-cupid.jpg',
    imageAlt: 'Psyche and Cupid: two figures with wings on a cliff above the sea',
    imageCap: 'Psyche and Cupid — AI art',
  },

  statement: {
    section: 'Statement',
    kicker: 'Statement',
    headline: 'Small worlds, started from a feeling and a line of text.',
    body: [
      'I am a third-year undergraduate in Sports Economics and Management at Beijing Sport University. Image-making is not what I am studying — it is what I taught myself: AI art, 3D, motion and interaction.',
      'Every project starts from a feeling or a line of text, then moves through whichever tools fit it: a generated 3D model, an illustration, a node graph that pushes pixels into particles.',
      'My degree is about how sport becomes an industry — audiences, communities, merchandise. BLING, the product study in this portfolio, sits where that meets aesthetics.',
      'I am applying to work in AI immersive media: to move from pieces that are watched to worlds that can be entered and shaped. [TO CONFIRM: one or two sentences in your own words — why Hongik, why now]',
    ],
    facts: [
      ['Education', 'Sports Economics and Management, Beijing Sport University — third year. [TO CONFIRM: degree title, expected graduation]'],
      ['Practice', 'AI art · 3D · Motion · Interaction'],
      ['Tools', 'Blender, Tripo AI, TouchDesigner, After Effects, DaVinci Resolve, CapCut, Illustrator, Photoshop, Midjourney, HTML/CSS/JS'],
      ['Languages', '[TO CONFIRM: languages and test scores, e.g. TOPIK / IELTS]'],
    ],
    quote: {
      text: 'Creation doesn’t only move from nothing to something. It can move from many to few, from now to later, from never-existed to existing.',
      cite: 'From my manifesto, shiya-the-player-website.pages.dev',
    },
  },

  contents: {
    section: 'Contents',
    kicker: 'Contents',
    title: 'Contents',
    note: 'Three case studies, then a short index of other work.',
    // `at` = page id; page numbers are computed from the final page order.
    items: [
      { at: 'statement', title: 'Statement', sub: 'Who I am and what I am working toward' },
      { at: 'bling-open', no: '01', title: 'BLING', sub: 'A figure-skating aesthetics app with a private critic · product / interaction' },
      { at: 'world-open', no: '02', title: 'The world is my playground', sub: 'An illustrated oyster that holds a planet · graphic design / illustration' },
      { at: 'series-open', no: '03', title: 'Narrative visual series', sub: 'Eight pieces that start from a line of text · AI art / 3D animation' },
      { at: 'others', no: '04', title: 'Other work', sub: 'AI art, 3D, motion and real-time studies' },
      { at: 'contact', title: 'Contact', sub: 'Links, and where to see the work live' },
    ],
  },

  /* ------------------------------------------------------------------ BLING */
  bling: {
    section: '01 · BLING',
    kicker: 'Case study 01 · Product / Interaction',
    title: 'BLING',
    subtitle: 'A figure-skating aesthetics app, with a private critic named MUSE.',
    facts: [
      ['Type', 'Product concept and working front-end prototype'],
      ['Role', 'Independent — concept, interface, copy, front-end build'],
      ['Year', '[TO CONFIRM: year and duration]'],
      ['Built with', 'HTML · CSS · JavaScript (no framework), Cloudflare Pages'],
      ['Interface', 'Simplified Chinese — screens shown as built, with English annotations'],
      ['Live', 'bling-eoo.pages.dev'],
    ],
    liveHref: 'https://bling-eoo.pages.dev/',
    repoHref: 'https://github.com/shiyaitsme/BLING',
    capHome: 'Home — “Today’s pick” hero, soundtrack strip, MUSE and year-in-review entries',
    capMuse: 'MUSE — “Tonight, what shall we talk about?”',

    problem: {
      kicker: 'Problem',
      headline: 'Figure-skating content splits in two.',
      body: [
        'Technical forums are dry and hard to enter. Aesthetic appreciation is scattered across reposts, with no shared vocabulary.',
        'Neither treats a blade’s arc as geometry and a costume’s drape as narrative at the same time.',
      ],
      venn: { a: 'Technical forums', aSub: 'dry, hard to enter', b: 'Aesthetic appreciation', bSub: 'scattered, no shared vocabulary' },
      questionLabel: 'Question',
      question: 'Can one product hold both — and make the sport’s visual language something you can learn, discuss and even wear?',
      conceptLabel: 'Concept',
      concept: [
        'BLING is organised around five ways people actually engage with the sport: learning its visual language, following individual skaters, understanding specific programs, talking with others, and finally owning a piece of it.',
        'It is built as a small, opinionated magazine that happens to update — not a feed.',
      ],
      pillars: [
        { zh: '美学', en: 'Aesthetics', d: 'Learn the visual language' },
        { zh: '运动员', en: 'Athletes', d: 'Follow individual skaters' },
        { zh: '节目', en: 'Programs', d: 'Understand a performance' },
        { zh: '社区', en: 'Community', d: 'Discuss with others' },
        { zh: '周边', en: 'Merchandise', d: 'Own a piece of it' },
      ],
      processSlot: '[TO CONFIRM: early sketches, wireframes or references that led to this structure]',
    },

    system: {
      kicker: 'System · structure',
      headline: 'Five pillars, seventeen screens.',
      body: [
        'The five pillars on the home screen map onto the screens a visitor actually moves through. Reading, asking, listening and joining all lead toward the same destination: turning appreciation into something physical.',
        'The prototype has no backend. State — favourites, cart, notes, comments — lives in the browser, and checkout is simulated.',
      ],
      mapNote: 'Information architecture of the prototype. Bottom navigation: Home · Community · Discover · Merch · Favourites · Me.',
    },

    muse: {
      kicker: 'System · the AI commentator',
      headline: 'MUSE is a critic with a point of view, not a chatbot.',
      body: [
        'MUSE only talks about figure-skating aesthetics, in a consistent vocabulary — “mono no aware”, “the poetics of gravity” — instead of encyclopedic answers.',
        'In the current build MUSE answers from six pre-written question-and-answer pairs, with a typing delay and follow-up chips for the questions not yet asked. Inference cost was not justified for a personal project, so the design work went into defining who MUSE is: her tone, her opinions, the limits of what she will discuss.',
        'That definition is what would become the system prompt and few-shot examples if a live language model were connected later.',
      ],
      flowTitle: 'Interaction logic (as implemented)',
      flow: {
        input: 'Visitor asks',
        inputSub: 'tap a suggested chip, or type',
        match: 'Matches one of six authored questions?',
        yes: 'Answer in MUSE’s voice',
        yesSub: '~0.9 s typing indicator, then the reply',
        no: 'Graceful fallback',
        noSub: 'admits it is not ready, points to what she can discuss',
        loop: 'Remaining unasked questions return as chips',
      },
      persona: {
        label: 'Persona definition',
        items: ['Only aesthetics: programs, costumes, choreography, the poetry on ice', 'Opinionated, specific, never encyclopedic', 'Speaks in a recurring vocabulary'],
      },
      capIntro: 'Entry state: suggested questions',
      capAnswer: 'An answer, then the next prompts',
      zhNote: 'Question shown: “What is mono no aware in figure skating?”',
    },

    community: {
      kicker: 'System · community and discovery',
      headline: 'Specific posts set the tone for specific writing.',
      body: [
        'The community tab is built from opinionated posts rather than generic updates. Captions such as “why does Yuzuru’s spin make me unable to breathe” set the register on purpose, nudging people to write with the same specificity instead of leaving vague reactions.',
        'Discover adds an editorial layer on top: weekly features, trending topics and curated long reads — less a feed, more a small magazine.',
        'Readers can like, comment, follow, save favourites, and write either a public article or a private note.',
      ],
      capCommunity: 'Community — posts with tags, likes, comments',
      capDiscover: 'Discover — editor’s pick, trending topics, long reads',
      capMusic: 'Program page — today’s soundtrack and the costume inspirations drawn from it',
      zhNote: 'Interface labels: 社区 Community · 发现 Discover · 热门话题 Trending topics · 编辑推荐 Editor’s picks',
    },

    print: {
      kicker: 'System · from appreciation to ownership',
      headline: 'Music print customisation.',
      body: [
        'A favourite program soundtrack becomes an abstract print on a physical product. The flow is five steps: choose a program, read its mood, generate a print, choose a product, preview and confirm.',
        'Each program ships with an authored palette and mood tags; the print itself is generated in the browser from a random seed — soft blobs, ellipses and arcs in that palette (one program, Delulu, uses supplied artwork). It is a prototype of the idea, not audio analysis or a trained model.',
      ],
      steps: [
        { k: 'print-1-program', n: '01', t: 'Choose a program', zh: '选择节目' },
        { k: 'print-2-mood', n: '02', t: 'Read its mood', zh: '氛围解析' },
        { k: 'print-3-pattern', n: '03', t: 'Generate a print', zh: '生成印花' },
        { k: 'print-4-product', n: '04', t: 'Choose a product', zh: '选择单品' },
        { k: 'print-5-preview', n: '05', t: 'Preview and confirm', zh: '预览确认' },
      ],
      foot: 'Six programs · six product types (T-shirt, hoodie, trousers, canvas shoes, tote, phone case) · the confirmed item goes to the cart.',
    },

    outcome: {
      kicker: 'Outcome and reflection',
      headline: 'A working prototype of a whole product loop.',
      stats: [
        ['17', 'screens'],
        ['6', 'authored MUSE answers'],
        ['6', 'soundtrack programs'],
        ['5', 'step print flow'],
      ],
      statsNote: 'Counted from the BLING repository.',
      built: [
        'Built and deployed independently as a test of whether “art × tech × subculture” can hold up as a real product.',
      ],
      limitsLabel: 'What the prototype does not do yet',
      limits: [
        'MUSE does not call a live language model.',
        'Nothing persists between sessions, and payment is simulated.',
        'Prints are generated procedurally; they do not analyse audio.',
        'No user testing is documented. [TO CONFIRM: any feedback from real skating fans]',
      ],
      reflectLabel: 'Reflection',
      reflect: '[TO CONFIRM: what you learned from building BLING, and what you would test or change next — in your own words]',
      capArc: 'Year-in-review entry (“Your ice archive”)',
      links: [['View live demo', 'https://bling-eoo.pages.dev/'], ['Source on GitHub', 'https://github.com/shiyaitsme/BLING']],
      assetNote: 'Screens include third-party athlete photographs and a commercial soundtrack as placeholders. [TO CONFIRM: usage rights, or replace before submission]',
    },
  },

  /* ----------------------------------------------------- THE WORLD IS MY PLAYGROUND */
  world: {
    section: '02 · The world is my playground',
    kicker: 'Case study 02 · Graphic design / Illustration',
    title: 'The world is my playground',
    subtitle: 'An oyster that holds not a pearl, but an entire Earth.',
    image: W + 'works_p04_the-world-is-my-playground.jpg',
    imageAlt: 'An open oyster shell holding the planet Earth against a starfield, with the title lettering around it',
    facts: [
      ['Type', 'Illustrated poster / composite'],
      ['Tools', 'Adobe Illustrator, Photoshop'],
      ['Year', '[TO CONFIRM: year]'],
      ['Format', '[TO CONFIRM: original size / intended use]'],
    ],
    cap: 'The world is my playground',

    concept: {
      kicker: 'Question and concept',
      headline: 'What if “the world is my oyster” was about play, not conquest?',
      body: [
        'The idiom reads as ownership. I wanted it to read as curiosity. Without curiosity, an oyster is just an oyster; with it, the inside can be a whole planet — a place to play, to discover, to live differently.',
        'The amusement park, then, is not a place but a mindset. When we choose wonder over routine, the entire Earth turns into a playground.',
      ],
      quote: 'When I open the oyster, I become both the explorer and the visitor — the one who enters a world made for curiosity.',
      diagram: {
        a: 'Oyster',
        aSub: 'closed — just an oyster',
        b: 'Curiosity',
        bSub: 'the act of opening',
        c: 'Earth',
        cSub: 'a planet inside the shell',
        d: 'Playground',
        dSub: 'a mindset, not a place',
        scale: 'Scale breaks reality for a moment: a tiny oyster holds a world, and weightlessness is the mind reacting to scale.',
      },
    },

    making: {
      kicker: 'Making',
      headline: 'Illustrated, then composited.',
      body: [
        'The piece was illustrated in Illustrator, then composited and finished in Photoshop. The notes on the right read the finished image layer by layer.',
      ],
      anatomy: [
        { n: 1, t: 'Starfield ground', d: 'A dark, grainy sky gives the oyster a place to float — weightlessness as the starting condition.' },
        { n: 2, t: 'Oyster and Earth', d: 'The shell is the most tactile element; the planet sits inside it like the pearl it replaces.' },
        { n: 3, t: 'Type that drifts', d: 'The title bends around the object in two voices — a serif for “The world is my”, a soft blurred script for “Playground”.' },
        { n: 4, t: 'Line and registration marks', d: 'A single looping line and small crosshair marks keep the surface feeling drawn, not just photographed.' },
      ],
      slots: [
        '[TO CONFIRM: sketches / first compositions]',
        '[TO CONFIRM: references and image sources — the Earth, oyster and starfield need credits]',
        '[TO CONFIRM: iterations — what changed between versions]',
      ],
      reflectLabel: 'Reflection',
      reflect: '[TO CONFIRM: what this piece taught you, and how it connects to immersive work — in your own words]',
    },
  },

  /* ----------------------------------------------------------- NARRATIVE SERIES */
  series: {
    section: '03 · Narrative visual series',
    kicker: 'Case study 03 · AI art / 3D animation',
    title: 'Narrative visual series',
    subtitle: 'A line of text becomes a short image or animation.',
    lead: 'In the parallel world, Cupid is stripped of his godhood by Zeus, and Psyche never becomes a goddess. The end of their life is no longer his kiss, his rescue — it is the two of them at the cliff’s edge, looking out at the border between the mountains and the sea.',
    leadCite: 'Psyche and Cupid',
    facts: [
      ['Pieces', 'Eight, shown here (more on the live site)'],
      ['Media', 'AI art and 3D animation'],
      ['Method', 'Start from a written seed — a poem, a myth, a label, a memory — then find the image'],
      ['Year', '[TO CONFIRM: year(s)]'],
      ['Tools', 'Psyche and Cupid: [TO CONFIRM: AI tool]. Others: see the process study, [TO CONFIRM: tools per piece]'],
    ],
    imageCap: 'Psyche and Cupid · AI art',

    seeds: {
      kicker: 'The seeds',
      headline: 'Eight pieces, eight lines.',
      note: 'Each piece’s own words — the starting point for the image.',
      items: [
        { id: 'psyche', title: 'Psyche and Cupid', medium: 'AI art', img: T + 'works_psyche-and-cupid.jpg', line: 'Cupid is stripped of his godhood; Psyche never becomes a goddess.' },
        { id: 'sand', title: 'black sand rite', medium: '3D animation', img: T + 'works_black-sand-rite.jpg', line: 'Mist seals the cross, waves swallow black sand — the blade rises as offering.' },
        { id: 'akarsz', title: 'Akarsz-e játszani?', medium: '3D animation', img: T + 'works_Akarsz-e-játszani.jpg', line: 'Will you, will you — play at death with me?' },
        { id: 'fragile', title: 'FRAGILE', medium: '3D animation', img: T + 'works_fragile.jpg', line: 'DO NOT INVERT. DO NOT IMMERSE. DO NOT WAKE.' },
        { id: 'taste', title: '사랑의 맛 love’s taste', medium: '3D animation', img: T + 'works_loves-taste.jpg', line: 'Self-immolation, once the lighter is lit.' },
        { id: 'summer', title: 'exclusive summer', medium: '3D animation', img: T + 'works_exclusive-summer.jpg', line: 'We live through countless summers we can never return to.' },
        { id: 'roses', title: 'roses of transcendent love', medium: '3D animation', img: T + 'works_roses-of-transcendent-love.jpg', line: 'The violent rose of ruined and transcendent lovers.' },
        { id: 'funeral', title: 'black funeral', medium: '3D animation', img: T + 'works_black-funeral.jpg', line: 'Of all I have lost, I miss myself the most. Here, I bury me.' },
      ],
    },

    texts: {
      kicker: 'Text to image',
      headline: 'Borrowed words, then my own.',
      left: {
        title: 'Akarsz-e játszani?',
        medium: '3D animation',
        image: W + 'works_Akarsz-e-játszani.jpg',
        poem: ['Akarsz-e élni, élni mindörökkön,', 'játékban élni, mely valóra vált?', 'Virágok közt feküdni lenn a földön,', 's akarsz, akarsz-e játszani halált?'],
        src: 'Kosztolányi Dezső, “Akarsz-e játszani?” (1912)',
        note: 'The poem is quoted in full on the piece’s page, with an English rendering: “Will you live, live forever and ever, live inside a game that has finally come true?”',
      },
      right: {
        title: 'roses of transcendent love',
        medium: '3D animation',
        image: W + 'works_roses-of-transcendent-love.jpg',
        poem: ['Eye in a trance silent mirror', 'As I approach I depart', 'Buoy in the battlements', 'The violent rose', 'Of ruined and transcendent lovers.'],
        src: 'Inspired by René Char, “The Violent Rose”',
        note: 'Her own paragraph follows the epigraph: a buoy straining to hold the breakwater’s stones, “wrapped in metal chains, blooming quietly beneath the starry sky”.',
      },
      slot: '[TO CONFIRM: how you move from a written seed to a visual — your steps, references, rejected directions]',
    },

    process: {
      kicker: 'Process study · coral dream',
      headline: 'Water as two shaders, bubbles as a particle system.',
      body: [
        'The dream begins with falling — deep into the sea — then dragging myself toward the surface, and there it was: a reef. This is the one piece of the series where the working files are documented.',
        'The water is two shaders stacked. A surface shader — Principled BSDF with low roughness and water’s IOR of 1.333 — handles reflection and refraction, with a noise texture driving a bump map instead of real wave geometry. A volume shader beneath it supplies the murk: high anisotropy scatters light forward, and a separate absorption pass blues and darkens it with depth.',
        'Keeping surface and volume as two shaders made it possible to tune how murky the water feels without touching the reflections.',
        'Bubbles are a Blender particle system: 2,000 emitted over the shot, with Brownian motion so they drift and jitter on the way up.',
      ],
      shots: [
        { img: W + 'works_deep-dive_coral-dream_01.jpg', cap: 'Shader graph — surface (bump from noise) mixed with a volume (scatter + absorption)' },
        { img: W + 'works_deep-dive_coral-dream_02.jpg', cap: 'Viewport — rocks, coral and the bubble emitter (2,000 particles, Brownian 0.5)' },
      ],
      still: W + 'works_coral-dream.jpg',
      stillCap: 'Coral dream — final frame',
      tools: 'Blender shading · Blender particle system',
      reflectLabel: 'Reflection',
      reflect: '[TO CONFIRM: what connects the pieces in this series, and what you would push further — in your own words]',
    },
  },

  /* ---------------------------------------------------------------- OTHER WORK */
  others: {
    section: '04 · Other work',
    kicker: 'Index · other work',
    headline: 'Other work.',
    note: 'More on the live site, including a photography archive and the full series.',
    groups: [
      {
        label: 'AI art',
        note: 'Midjourney where stated · [TO CONFIRM: year of each piece]',
        items: [
          { t: 'the vanishing tree', img: T + 'works_p06_the-vanishing-tree.jpg', y: 'AI art' },
          { t: 'vocalize', img: T + 'works_p07_vocalize.jpg', y: 'AI art' },
          { t: 'star girl', img: T + 'works_p08_star-girl.jpg', y: 'AI art' },
          { t: 'see you in spring', img: T + 'works_p09_see-you-in-spring.jpg', y: 'AI art' },
          { t: 'fake touch', img: T + 'works_p10_fake-touch.jpg', y: 'AI art' },
          { t: '1992 manga shards', img: T + 'works_1992_manga_shards.jpg', y: 'AI art · [TO CONFIRM: tool]' },
        ],
      },
      {
        label: '3D · Motion · Real-time',
        note: 'Tripo AI · Blender · After Effects · TouchDesigner',
        items: [
          { t: 'heart of empire', img: T + 'works_p01_heart-of-empire.jpg', y: '3D animation' },
          { t: 'between two infinites', img: T + 'works_p02_between-two-infinites.jpg', y: '3D animation' },
          { t: 'blue lava', img: T + 'works_p05_blue-lava.jpg', y: 'Motion' },
          { t: 'limited night', img: T + 'works_p03_limited-night.jpg', y: 'Real-time' },
        ],
      },
    ],
    studies: {
      kicker: 'Technical studies',
      headline: 'Three small pipelines.',
      items: [
        {
          t: 'heart of empire',
          tag: '3D animation',
          d: 'Modeled in Tripo AI, brought into Blender for animation and lighting, graded in DaVinci Resolve and cut together in CapCut.',
          steps: ['Tripo AI', 'Blender', 'DaVinci Resolve', 'CapCut'],
          img: W + 'works_p01_heart-of-empire.jpg',
          cap: 'heart of empire — final frame',
        },
        {
          t: 'limited night',
          tag: 'Real-time · TouchDesigner',
          d: 'A real-time network that turns 2D video into a field of 3D particles — each pixel’s brightness pushed into height. A feedback loop adds trailing motion; downsampling the source before converting it to data brought the frame rate back to a steady 60 fps.',
          img: W + 'works_p03_deep-dive_limited-night.jpg',
          cap: 'TouchDesigner network',
        },
        {
          t: 'blue lava',
          tag: 'Motion · After Effects',
          d: 'A CRT-glitch look built only from After Effects’ stock effects: Card Wipe for phosphor-grille strips, separated RGB channels for fringing, a noise displacement for break-up and Glow to blend it back.',
          img: W + 'works_p05_deep-dive_blue-lava.jpg',
          cap: 'After Effects composition',
        },
      ],
    },
  },

  /* ------------------------------------------------------------------- CONTACT */
  contact: {
    section: 'Contact',
    kicker: 'Contact',
    headline: 'Let’s build something impossible together.',
    sub: 'Installations, rides, and playgrounds for strangers to leave light for one another.',
    labels: { email: 'Email', instagram: 'Instagram', xiaohongshu: 'Xiaohongshu', site: 'Live work', bling: 'BLING demo', pdf: 'This portfolio (PDF)' },
    closing: 'Shiya Li — Portfolio',
    colophon: 'Set in Newsreader and Inter. Page size 297 × 167 mm (16:9).',
    image: W + 'works_roses-of-transcendent-love.jpg',
    imageCap: 'roses of transcendent love — 3D animation',
  },
}

export default {
  id: 'bling',
  title: 'BLING',
  emoji: '',
  category: 'product-ux',
  image: '/assets/works/works_BLING_v2.png',
  body: [
    'Figure skating content usually splits in two: technical forums that are dry, aesthetic appreciation that’s scattered. BLING holds both at once.',
    'MUSE is the core — not a general chatbot, but a private critic who only talks aesthetics, in her own vocabulary, not encyclopedia answers.',
    'Soundtrack picks come with a full choreography breakdown — testing the idea that a good recommendation should explain itself.',
    'Print customization turns the aesthetic experience into something physical — a favorite soundtrack becomes a print you can wear.',
    'Built and deployed independently, as a test of whether “art × tech × subculture” can hold up as a real product.',
  ],
  links: [
    { label: 'view live demo', href: 'https://bling-eoo.pages.dev/' },
  ],
  caseStudy: {
    tools: ['HTML/CSS/JS', 'Cloudflare Pages'],
    body: [
      {
        heading: 'the problem',
        text: 'Figure skating content online tends to split into two extremes: technical forums that are dry and hard to enter, or aesthetic appreciation that’s scattered across scattered reposts with no shared vocabulary. BLING tries to hold both at once — treating a blade’s arc as geometry and a costume’s drape as narrative, inside one coherent product.',
      },
      {
        heading: 'information architecture',
        text: 'The app is organized around five pillars — Aesthetics, Athletes, Programs, Community, Merchandise — each mapping to a different way people actually engage with the sport: learning the visual language, following individual skaters, understanding specific performances, discussing with others, and finally, owning a piece of it.',
      },
      {
        images: [
          '/assets/works/works_deep-dive_BLING_MUSE_v2.png',
          '/assets/works/works_deep-dive_BLING_community_v2.png',
        ],
      },
      {
        heading: 'MUSE',
        text: 'MUSE is meant to be a private critic, not a general-purpose chatbot — someone who only talks about figure skating aesthetics, using a consistent vocabulary (“mono no aware,” “the poetics of gravity”) rather than encyclopedic answers. PS: in the current build, MUSE runs on pre-written question-and-answer pairs rather than a live LLM API, since inference cost wasn’t justified for a personal portfolio project. The actual design work here was defining who MUSE is — her tone, her opinions, the boundaries of what she’d talk about — which would serve as the system prompt / few-shot foundation if a real model were wired in later.',
      },
      {
        heading: 'community',
        text: 'The community tab is built around specific, opinionated posts rather than generic updates — captions like “why does Yuzuru’s spin make me unable to breathe” set the tone deliberately, encouraging users to write with the same specificity rather than posting vague reactions.',
      },
      {
        images: [
          '/assets/works/works_deep-dive_BLING_find_v2.png',
          '/assets/works/works_deep-dive_BLING_merchandise_v2.png',
        ],
      },
      {
        heading: 'discover',
        text: 'The Discover page runs on an editorial layer on top of the content — weekly features, trending topics, and curated long-reads — treating the app less like a feed and more like a small, opinionated magazine that happens to update.',
      },
      {
        heading: 'merchandise',
        text: 'Merchandise closes the loop from appreciation to ownership. The “music print customization” feature turns a user’s favorite program soundtrack into an abstract print applied to physical goods — testing the idea that aesthetic engagement shouldn’t stop at looking, it should be able to leave the screen.',
      },
      {
        heading: 'stack',
        text: 'Built as a single-page HTML/CSS/JS app, deployed on Cloudflare Pages — no backend, all state (favorites, cart, notes) handled client-side.',
      },
    ],
  },
}

export default {
  id: 'bling',
  title: 'BLING',
  emoji: '',
  category: 'product-ux',
  image: '/assets/works/works_BLING.png',
  body: [
    'Figure skating fandom content tends to split in two: technical forums that are dry, and aesthetic appreciation that’s scattered across disconnected reposts. BLING tries to hold both at once — a blade’s arc is geometry, a costume is narrative — turning observations that used to live only in my own viewing notes into an interface that’s actually theirs.',
    'MUSE is the core of it. Not a general-purpose chatbot, but a private critic who only talks about figure skating aesthetics — giving opinionated readings in her own vocabulary (“mono no aware,” “the poetics of gravity”) instead of encyclopedia answers.',
    'A daily soundtrack recommendation comes with a full breakdown of the choreography logic behind it, from the opening mood to the closing silence — testing the idea that a good recommendation should be able to explain itself.',
    'Print customization extends the content experience into something physical — a favorite soundtrack can become a print you actually wear.',
    'From information architecture to favorites, cart, and community posts, BLING is a product I built and shipped entirely on my own, to test whether “art × technology × subculture” can actually work as a real direction.',
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
        heading: 'MUSE',
        text: 'MUSE is meant to be a private critic, not a general-purpose chatbot — someone who only talks about figure skating aesthetics, using a consistent vocabulary (“mono no aware,” “the poetics of gravity”) rather than encyclopedic answers. PS: in the current build, MUSE runs on pre-written question-and-answer pairs rather than a live LLM API, since inference cost wasn’t justified for a personal portfolio project. The actual design work here was defining who MUSE is — her tone, her opinions, the boundaries of what she’d talk about — which would serve as the system prompt / few-shot foundation if a real model were wired in later.',
      },
      {
        heading: 'community',
        text: 'The community tab is built around specific, opinionated posts rather than generic updates — captions like “why does Yuzuru’s spin make me unable to breathe” set the tone deliberately, encouraging users to write with the same specificity rather than posting vague reactions.',
        image: '/assets/works/works_deep-dive_BLING_community.png',
      },
      {
        heading: 'discover',
        text: 'The Discover page runs on an editorial layer on top of the content — weekly features, trending topics, and curated long-reads — treating the app less like a feed and more like a small, opinionated magazine that happens to update.',
        image: '/assets/works/works_deep-dive_BLING_find.png',
      },
      {
        heading: 'merchandise',
        text: 'Merchandise closes the loop from appreciation to ownership. The “music print customization” feature turns a user’s favorite program soundtrack into an abstract print applied to physical goods — testing the idea that aesthetic engagement shouldn’t stop at looking, it should be able to leave the screen.',
        image: '/assets/works/works_deep-dive_BLING_merchandise.png',
      },
      {
        heading: 'stack',
        text: 'Built as a single-page HTML/CSS/JS app, deployed on Cloudflare Pages — no backend, all state (favorites, cart, notes) handled client-side.',
      },
    ],
  },
}

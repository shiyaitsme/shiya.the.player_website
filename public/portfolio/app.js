/* Portfolio renderer — builds the deck from content/<lang>.js.
   Layout is code; words are data. No dependencies. */
import { iaDiagram, museFlow, worldDiagram, pipeline, vennDiagram } from './diagrams.js'

const params = new URLSearchParams(location.search)
const lang = params.get('lang') === 'ko' ? 'ko' : 'en'

const deepMerge = (base, over) => {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return over === undefined ? base : over
  const out = { ...base }
  for (const k of Object.keys(over || {})) out[k] = deepMerge(base[k], over[k])
  return out
}

let C = (await import('./content/en.js')).default
if (lang === 'ko') {
  try {
    C = deepMerge(C, (await import('./content/ko.js')).default)
  } catch {
    console.warn('content/ko.js not found — showing English')
  }
}
document.documentElement.lang = C.lang
document.title = C.ui.pageTitle

/* ---------- helpers ---------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
/** escape + highlight [TO CONFIRM: …] placeholders */
const t = (s) => esc(s).replace(/\[TO CONFIRM:[^\]]*\]/g, (m) => `<span class="todo">${m}</span>`)
const url = (p) => encodeURI(p)
const paras = (arr) => arr.map((p) => `<p>${t(p)}</p>`).join('')
const at = (col, row, extra = '') => `style="--col:${col};--row:${row};${extra}"`

const img = (src, alt = '', cls = 'fill', extra = '') =>
  `<img class="${cls}" src="${url(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>`

const fig = (src, { col, row, cap, alt = '', cls = '', fit = 'fill', ar = '4 / 3' }) =>
  `<figure class="fig ${cls}" ${at(col, row, `--ar:${ar}`)}><div class="ph">${img(src, alt, fit)}</div>${cap ? `<figcaption>${t(cap)}</figcaption>` : ''}</figure>`

const shot = (k, { cap, label } = {}) =>
  `<figure class="shot"><div class="ph">${img(`./img/bling/${k}.jpg`, label || cap || '', '', 'width="752" height="1660"')}</div>${
    cap || label ? `<figcaption>${label ? `<b>${t(label)}</b>` : ''}${cap ? t(cap) : ''}</figcaption>` : ''
  }</figure>`

const kicker = (txt, n) => `<p class="kicker">${n ? `<span class="n">${n}</span>` : ''}${t(txt)}</p>`
const facts = (rows) => `<dl class="facts">${rows.map(([k, v]) => `<dt>${t(k)}</dt><dd>${t(v)}</dd>`).join('')}</dl>`

/* ---------- page shell ---------- */
const pages = []
function page(id, { night = false, section = '', build }) {
  pages.push({ id, night, section, build })
}

/* =============================== PAGES =============================== */

page('cover', {
  night: true,
  section: '',
  build: () => `
    <div class="g">
      <div ${at('1 / 8', '1')}>${kicker(C.cover.kicker)}</div>
      <div ${at('1 / 8', '5 / 9')} style="--col:1 / 8;--row:5 / 9;align-self:end"><h1 class="display">${t(C.cover.name)}</h1></div>
      <div ${at('1 / 8', '9 / 10')} style="--col:1 / 8;--row:9 / 10;align-self:start;padding-top:var(--s3)"><p class="h3" style="font-style:italic">${t(C.cover.alias)}</p></div>
      <div ${at('1 / 8', '11 / 13')} style="--col:1 / 7;--row:11 / 13;align-self:end">
        <p class="label" style="margin-bottom:var(--s3)">${t(C.cover.disciplines)}</p>
        <dl class="facts">${C.cover.meta.map(([k, v]) => `<dt>${t(k)}</dt><dd>${t(v)}</dd>`).join('')}</dl>
      </div>
      <figure class="fig" ${at('8 / 13', '1 / 13')}><div class="ph">${img(C.cover.image, C.cover.imageAlt, 'fill right', 'fetchpriority="high"').replace('loading="lazy"', 'loading="eager"')}</div></figure>
    </div>`,
})

page('statement', {
  section: C.statement.section,
  build: () => {
    const s = C.statement
    return `
    <div class="g">
      <div ${at('1 / 7', '1')}>${kicker(s.kicker)}</div>
      <div ${at('1 / 8', '2 / 5')}><h2 class="h2">${t(s.headline)}</h2></div>
      <div ${at('1 / 7', '5 / 13')} class="body">${paras(s.body)}</div>
      <div ${at('8 / 13', '2 / 9')}>${facts(s.facts)}</div>
      <blockquote ${at('8 / 13', '9 / 13')} class="quote" style="--col:8 / 13;--row:9 / 13;font-size:var(--t2);align-self:end;margin:0">“${t(s.quote.text)}”<cite>${t(s.quote.cite)}</cite></blockquote>
    </div>`
  },
})

page('contents', {
  section: C.contents.section,
  build: () => {
    const c = C.contents
    return `
    <div class="g">
      <div ${at('1 / 5', '1')}>${kicker(c.kicker)}</div>
      <div ${at('1 / 5', '2 / 6')}><h2 class="h1">${t(c.title)}</h2></div>
      <div ${at('1 / 5', '10 / 13')} class="body" style="--col:1 / 5;--row:10 / 13;align-self:end"><p>${t(c.note)}</p></div>
      <ol ${at('6 / 13', '2 / 13')} class="toc" data-toc>${c.items
        .map((i) => `<li><span class="no">${i.no || '—'}</span><a class="tt" href="#${i.at}">${t(i.title)}<small>${t(i.sub)}</small></a><span class="pg" data-pg="${i.at}"></span></li>`)
        .join('')}</ol>
    </div>`
  },
})

/* ----------------------------------------------------------- BLING */
const BL = C.bling

page('bling-open', {
  night: true,
  section: BL.section,
  build: () => `
    <div class="g">
      <div ${at('1 / 7', '1')}>${kicker(BL.kicker)}</div>
      <div ${at('1 / 7', '2 / 7')} style="--col:1 / 7;--row:2 / 7;align-self:end"><h1 class="display">${t(BL.title)}</h1></div>
      <div ${at('1 / 6', '7 / 9')} style="--col:1 / 6;--row:7 / 9"><p class="lead">${t(BL.subtitle)}</p></div>
      <div ${at('1 / 7', '9 / 13')} style="--col:1 / 7;--row:9 / 13;align-self:end">${facts(BL.facts.filter(([k]) => k !== 'Live' && k !== 'Interface'))}</div>
      <div ${at('8 / 13', '1 / 13')} class="shots" style="--col:8 / 13;--row:1 / 13;--ph:36cqw;justify-content:space-between">
        ${shot('home', { cap: BL.capHome })}
        <div style="padding-top:calc(var(--s6))">${shot('muse-intro', { cap: BL.capMuse })}</div>
      </div>
    </div>`,
})

page('bling-problem', {
  section: BL.section,
  build: () => {
    const p = BL.problem
    return `
    <div class="g">
      <div ${at('1 / 6', '1')}>${kicker(p.kicker, '01')}</div>
      <div ${at('1 / 7', '2 / 6')}><h2 class="h2">${t(p.headline)}</h2></div>
      <div ${at('1 / 6', '4 / 7')} class="body" style="--col:1 / 6;--row:4 / 7">${paras(p.body)}</div>
      <div ${at('1 / 7', '7 / 13')} class="dia-wrap" style="--col:1 / 7;--row:7 / 13;--ar:440 / 190;align-self:end">${vennDiagram(BL)}</div>
      <div ${at('7 / 13', '1 / 5')} style="--col:7 / 13;--row:2 / 6">
        <p class="label">${t(p.questionLabel)}</p>
        <p class="lead" style="margin-top:var(--s2)">${t(p.question)}</p>
      </div>
      <div ${at('7 / 13', '6 / 13')} style="--col:7 / 13;--row:6 / 13;border-top:1px solid var(--hair);padding-top:var(--s3)">
        <p class="label">${t(p.conceptLabel)}</p>
        <div class="body" style="margin-top:var(--s2)">${paras(p.concept)}</div>
        <ul class="pillars" style="display:grid;grid-template-columns:repeat(5,1fr);gap:var(--s2);margin-top:var(--s4)">${p.pillars
          .map((x, i) => `<li style="border-top:2px solid var(--ink);padding-top:var(--s2)"><span class="cap" style="display:block">0${i + 1}</span><span class="h3" style="display:block;font-size:var(--t1)">${t(x.en)}</span><span class="cap" style="display:block;margin-top:.2em">${t(x.zh)}</span></li>`)
          .join('')}</ul>
        <div class="slot" style="margin-top:var(--s4);padding:var(--s2)">${t(p.processSlot)}</div>
      </div>
    </div>`
  },
})

page('bling-system', {
  section: BL.section,
  build: () => {
    const s = BL.system
    return `
    <div class="g">
      <div ${at('1 / 6', '1')}>${kicker(s.kicker, '02')}</div>
      <div ${at('1 / 6', '2 / 6')}><h2 class="h2">${t(s.headline)}</h2></div>
      <div ${at('1 / 6', '6 / 13')} class="body">${paras(s.body)}</div>
      <div ${at('7 / 13', '2 / 12')} class="dia-wrap" style="--ar:449 / 420">${iaDiagram(BL)}</div>
      <p ${at('7 / 13', '12 / 13')} class="cap" style="align-self:end">${t(s.mapNote)}</p>
    </div>`
  },
})

page('bling-muse', {
  section: BL.section,
  build: () => {
    const m = BL.muse
    return `
    <div class="g">
      <div ${at('1 / 5', '1')}>${kicker(m.kicker, '03')}</div>
      <div ${at('1 / 5', '2 / 5')}><h2 class="h3" style="font-size:var(--t3);line-height:1.08">${t(m.headline)}</h2></div>
      <div ${at('1 / 5', '5 / 13')} class="body" style="font-size:calc(var(--t0)*.96)">${paras(m.body)}</div>
      <div ${at('5 / 10', '1 / 2')}><p class="label">${t(m.flowTitle)}</p></div>
      <div ${at('5 / 10', '2 / 13')} class="dia-wrap" style="--ar:372 / 475">${museFlow(BL)}</div>
      <div ${at('10 / 13', '1 / 13')} class="shots" style="--col:10 / 13;--row:1 / 13;--ph:36cqw;justify-content:flex-end">${shot('muse-answer', { cap: `${m.capAnswer}. ${m.zhNote}` })}</div>
    </div>`
  },
})

page('bling-community', {
  section: BL.section,
  build: () => {
    const c = BL.community
    return `
    <div class="g">
      <div ${at('1 / 5', '1')}>${kicker(c.kicker, '04')}</div>
      <div ${at('1 / 5', '2 / 6')}><h2 class="h3" style="font-size:var(--t3);line-height:1.08">${t(c.headline)}</h2></div>
      <div ${at('1 / 5', '6 / 13')} class="body" style="font-size:calc(var(--t0)*.96)">${paras(c.body)}</div>
      <div ${at('5 / 13', '1 / 13')} class="shots" style="--col:5 / 13;--row:1 / 13;--ph:35cqw;justify-content:space-between">
        ${shot('community', { cap: c.capCommunity, label: '社区' })}
        ${shot('discover', { cap: c.capDiscover, label: '发现' })}
        ${shot('music', { cap: c.capMusic, label: '节目' })}
      </div>
    </div>`
  },
})

page('bling-print', {
  section: BL.section,
  build: () => {
    const p = BL.print
    return `
    <div class="g">
      <div ${at('1 / 5', '1')}>${kicker(p.kicker, '05')}</div>
      <div ${at('1 / 5', '2 / 5')}><h2 class="h2">${t(p.headline)}</h2></div>
      <div ${at('5 / 13', '1 / 5')} class="body two" style="--col:5 / 13;--row:1 / 5;display:grid;grid-template-columns:1fr 1fr;column-gap:var(--gap);align-items:start;font-size:calc(var(--t0)*.96)">${paras(p.body)}</div>
      <div ${at('1 / 10', '5 / 13')} class="shots" style="--col:1 / 10;--row:5 / 13;--ph:24.5cqw;justify-content:space-between">
        ${p.steps.map((s) => shot(s.k, { label: `${s.n} ${s.t}`, cap: s.zh })).join('')}
      </div>
      <div ${at('10 / 13', '5 / 13')} class="body" style="--col:10 / 13;--row:5 / 13;align-self:end;border-top:1px solid var(--hair);padding-top:var(--s3)"><p>${t(p.foot)}</p></div>
    </div>`
  },
})

page('bling-outcome', {
  section: BL.section,
  build: () => {
    const o = BL.outcome
    return `
    <div class="g">
      <div ${at('1 / 7', '1')}>${kicker(o.kicker, '06')}</div>
      <div ${at('1 / 7', '2 / 5')}><h2 class="h2">${t(o.headline)}</h2></div>
      <div ${at('1 / 7', '5 / 8')} style="--col:1 / 7;--row:5 / 7;display:grid;grid-template-columns:repeat(4,1fr);gap:var(--gap);align-self:start">${o.stats
        .map(([n, l]) => `<div style="border-top:2px solid var(--ink);padding-top:var(--s2)"><span class="h1" style="display:block;font-size:var(--t5)">${n}</span><span class="cap">${t(l)}</span></div>`)
        .join('')}</div>
      <p ${at('1 / 7', '7 / 8')} class="cap" style="--col:1 / 7;--row:7 / 8;align-self:end">${t(o.statsNote)}</p>
      <div ${at('1 / 7', '8 / 13')} class="body" style="font-size:calc(var(--t0)*.96)">${paras(o.built)}
        <p class="label" style="margin-top:var(--s3)">${t(o.limitsLabel)}</p>
        <ul style="margin-top:var(--s2)">${o.limits.map((l) => `<li style="padding:.28em 0;border-top:1px solid var(--hair)">${t(l)}</li>`).join('')}</ul>
      </div>
      <div ${at('7 / 10', '1 / 13')} style="--col:7 / 10;--row:2 / 13;--ph:34cqw" class="shots">${shot('arc-1', { cap: o.capArc })}</div>
      <div ${at('10 / 13', '2 / 13')} style="--col:10 / 13;--row:2 / 13;display:flex;flex-direction:column;gap:var(--s3)">
        <div><p class="label">${t(o.reflectLabel)}</p><p class="body" style="margin-top:var(--s2)">${t(o.reflect)}</p></div>
        <div style="margin-top:auto" class="body">
          <p class="cap" style="margin-bottom:var(--s3)">${t(o.assetNote)}</p>
          <p>${o.links.map(([l, h]) => `<a class="chip" style="margin:0 .5em .5em 0" href="${h}" target="_blank" rel="noopener">${t(l)}</a>`).join('')}</p>
        </div>
      </div>
    </div>`
  },
})

/* ---------------------------------------------- THE WORLD IS MY PLAYGROUND */
const WO = C.world

page('world-open', {
  night: true,
  section: WO.section,
  build: () => `
    <div class="g">
      <div ${at('1 / 6', '1')}>${kicker(WO.kicker)}</div>
      <div ${at('1 / 7', '3 / 8')} style="--col:1 / 7;--row:3 / 8;align-self:end"><h1 class="h1" style="font-size:var(--t6)">${t(WO.title)}</h1></div>
      <div ${at('1 / 6', '8 / 10')} style="--col:1 / 6;--row:8 / 10"><p class="lead">${t(WO.subtitle)}</p></div>
      <div ${at('1 / 6', '10 / 13')} style="--col:1 / 6;--row:10 / 13;align-self:end">${facts(WO.facts)}</div>
      ${fig(WO.image, { col: '8 / 13', row: '1 / 13', alt: WO.imageAlt, cap: '', cls: 'right', fit: 'fill right' }).replace('loading="lazy"', 'loading="eager"')}
    </div>`,
})

page('world-concept', {
  section: WO.section,
  build: () => {
    const c = WO.concept
    return `
    <div class="g">
      <div ${at('1 / 6', '1')}>${kicker(c.kicker, '01')}</div>
      <div ${at('1 / 9', '2 / 6')}><h2 class="h2">${t(c.headline)}</h2></div>
      <div ${at('1 / 6', '6 / 13')} class="body">${paras(c.body)}</div>
      <blockquote ${at('7 / 13', '6 / 9')} class="quote" style="--col:7 / 13;--row:6 / 9;font-size:var(--t2);margin:0">“${t(c.quote)}”</blockquote>
      <div ${at('7 / 13', '9 / 13')} style="--col:7 / 13;--row:9 / 13;display:flex;flex-direction:column;justify-content:flex-end;gap:var(--s3)">
        <div class="dia-wrap" style="--ar:452 / 156;height:auto">${worldDiagram(WO)}</div>
        <p class="cap" style="border-top:1px solid var(--hair);padding-top:var(--s2)">${t(c.diagram.scale)}</p>
      </div>
    </div>`
  },
})

page('world-making', {
  section: WO.section,
  build: () => {
    const m = WO.making
    return `
    <div class="g">
      <div ${at('1 / 5', '1')}>${kicker(m.kicker, '02')}</div>
      <div ${at('1 / 5', '2 / 5')}><h2 class="h2">${t(m.headline)}</h2></div>
      <figure class="fig" ${at('1 / 5', '5 / 13')} style="--col:1 / 5;--row:5 / 13;display:block">
        <div class="ph" style="height:100%;max-width:100%;aspect-ratio:1072 / 1442">${img(WO.image, WO.imageAlt, 'fill')}
          ${[
            [88, 50], [50, 60], [24, 27], [80, 11],
          ].map(([x, y], i) => `<span class="pin" style="left:${x}%;top:${y}%">${i + 1}</span>`).join('')}
        </div>
      </figure>
      <div ${at('5 / 9', '1 / 13')} style="--col:5 / 9;--row:2 / 13">
        <div class="body">${paras(m.body)}</div>
        <ol style="margin-top:var(--s3)">${m.anatomy
          .map((a) => `<li style="display:grid;grid-template-columns:2em 1fr;padding:var(--s2) 0;border-top:1px solid var(--hair)"><span class="pin static">${a.n}</span><span class="body" style="font-size:calc(var(--t0)*.94)"><strong>${t(a.t)}.</strong> ${t(a.d)}</span></li>`)
          .join('')}</ol>
      </div>
      <div ${at('9 / 13', '2 / 13')} style="--col:9 / 13;--row:2 / 13;display:flex;flex-direction:column;gap:var(--s2)">
        ${m.slots.map((s) => `<div class="slot" style="flex:1">${t(s)}</div>`).join('')}
        <div><p class="label" style="margin-top:var(--s3)">${t(m.reflectLabel)}</p><p class="body" style="margin-top:var(--s2)">${t(m.reflect)}</p></div>
      </div>
    </div>`
  },
})

/* ----------------------------------------------------- NARRATIVE SERIES */
const SE = C.series

page('series-open', {
  night: true,
  section: SE.section,
  build: () => `
    <div class="g">
      <div ${at('1 / 7', '1')}>${kicker(SE.kicker)}</div>
      <div ${at('1 / 8', '2 / 7')} style="--col:1 / 8;--row:2 / 7;align-self:end"><h1 class="h1" style="font-size:var(--t6)">${t(SE.title)}</h1></div>
      <div ${at('1 / 7', '7 / 9')} style="--col:1 / 7;--row:7 / 9"><p class="lead">${t(SE.subtitle)}</p></div>
      <div ${at('1 / 7', '9 / 13')} style="--col:1 / 7;--row:9 / 13;align-self:end">${facts(SE.facts)}</div>
      ${fig(C.cover.image, { col: '8 / 13', row: '1 / 13', alt: 'Psyche and Cupid', fit: 'fill right', cls: 'right' }).replace('loading="lazy"', 'loading="eager"')}
    </div>`,
})

page('series-seeds', {
  section: SE.section,
  build: () => {
    const s = SE.seeds
    return `
    <div class="g">
      <div ${at('1 / 5', '1')}>${kicker(s.kicker, '01')}</div>
      <div ${at('1 / 5', '2 / 6')}><h2 class="h2">${t(s.headline)}</h2></div>
      <div ${at('1 / 5', '6 / 10')} class="body"><p>${t(s.note)}</p></div>
      <blockquote ${at('1 / 5', '10 / 13')} class="quote" style="--col:1 / 5;--row:10 / 13;font-size:var(--t1);align-self:end;margin:0">“${t(SE.lead)}”<cite>${t(SE.leadCite)}</cite></blockquote>
      <div ${at('5 / 13', '1 / 13')} style="--col:5 / 13;--row:1 / 13;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,1fr);gap:var(--gap)" class="seeds">
        ${s.items
          .map(
            (i) => `<figure style="display:flex;flex-direction:column;gap:var(--s2);min-height:0"><div class="ph" style="flex:1;min-height:0;background:var(--paper-2)">${img(i.img, i.title, 'cover')}</div><figcaption><b class="h3" style="display:block;font-size:var(--t0);font-style:normal;font-family:var(--sans);font-weight:600">${t(i.title)}</b><span class="cap" style="display:block">${t(i.medium)}</span><i class="cap" style="display:block;margin-top:.25em;font-family:var(--serif);font-size:var(--t0);color:var(--ink-2);line-height:1.25">${t(i.line)}</i></figcaption></figure>`
          )
          .join('')}
      </div>
    </div>`
  },
})

page('series-texts', {
  section: SE.section,
  build: () => {
    const x = SE.texts
    const text = (c, cls = '') => `
      <p class="label">${t(c.title)} <span class="cap" style="text-transform:none;letter-spacing:0;font-weight:400">· ${t(c.medium)}</span></p>
      <div class="poem ${cls}" style="margin-top:var(--s3)">${c.poem.map((l) => `<p>${t(l)}</p>`).join('')}</div>
      <p class="cap" style="margin-top:var(--s3)"><strong style="color:var(--ink);font-weight:600">${t(c.src)}</strong></p>
      <p class="body" style="margin-top:var(--s2);font-size:calc(var(--t0)*.92)">${t(c.note)}</p>`
    return `
    <div class="g">
      <div ${at('1 / 7', '1')}>${kicker(x.kicker, '02')}</div>
      <div ${at('7 / 13', '1 / 3')} style="--col:7 / 13;--row:1 / 3;align-self:start"><h2 class="h3" style="font-size:var(--t3);line-height:1.05">${t(x.headline)}</h2></div>
      ${fig(x.left.image, { col: '1 / 4', row: '2 / 13', alt: x.left.title })}
      <div ${at('4 / 7', '2 / 13')} style="--col:4 / 7;--row:2 / 13">${text(x.left)}</div>
      ${fig(x.right.image, { col: '7 / 13', row: '3 / 8', alt: x.right.title })}
      <div ${at('7 / 13', '8 / 13')} style="--col:7 / 13;--row:8 / 13">${text(x.right, 'sm')}</div>
    </div>`
  },
})

page('series-process', {
  section: SE.section,
  build: () => {
    const p = SE.process
    return `
    <div class="g">
      <div ${at('1 / 6', '1')}>${kicker(p.kicker, '03')}</div>
      <div ${at('1 / 6', '2 / 5')}><h2 class="h2" style="font-size:var(--t3);line-height:1.08">${t(p.headline)}</h2></div>
      <div ${at('1 / 6', '5 / 13')} class="body" style="font-size:calc(var(--t0)*.94)">${paras(p.body)}</div>
      ${fig(p.shots[0].img, { col: '6 / 13', row: '1 / 7', cap: p.shots[0].cap, alt: 'Blender shader node graph', fit: 'fill' })}
      ${fig(p.shots[1].img, { col: '6 / 10', row: '7 / 13', cap: p.shots[1].cap, alt: 'Blender viewport', fit: 'fill' })}
      ${fig(p.still, { col: '10 / 13', row: '7 / 11', cap: p.stillCap, alt: 'coral dream final frame', fit: 'cover' })}
      <div ${at('10 / 13', '11 / 13')} style="--col:10 / 13;--row:11 / 13;align-self:end"><p class="label">${t(p.reflectLabel)}</p><p class="cap" style="margin-top:var(--s1)">${t(p.reflect)}</p></div>
    </div>`
  },
})

/* ------------------------------------------------------------- OTHER WORK */
const OT = C.others

page('others', {
  section: OT.section,
  build: () => `
    <div class="g">
      <div ${at('1 / 4', '1')}>${kicker(OT.kicker, '04')}</div>
      <div ${at('1 / 4', '2 / 6')}><h2 class="h2">${t(OT.headline)}</h2></div>
      <div ${at('1 / 4', '6 / 10')} class="body"><p>${t(OT.note)}</p></div>
      ${OT.groups
        .map(
          (g, gi) => `
        <div ${at('4 / 13', gi ? '8 / 13' : '1 / 8')} style="--col:4 / 13;--row:${gi ? '8 / 13' : '1 / 8'};display:flex;flex-direction:column;gap:var(--s2)">
          <p class="label" style="border-top:1px solid var(--ink);padding-top:var(--s2);display:flex;justify-content:space-between"><span>${t(g.label)}</span><span class="cap" style="text-transform:none;letter-spacing:0;font-weight:400">${t(g.note)}</span></p>
          <div class="tiles" style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(${g.items.length > 4 ? 6 : 4},1fr);gap:var(--gap)">
            ${g.items
              .map(
                (i) => `<figure style="display:flex;flex-direction:column;gap:var(--s1);min-height:0"><div class="ph" style="flex:1;min-height:0;background:var(--paper-2)">${img(i.img, i.t, 'cover')}</div><figcaption><b style="display:block;font:400 var(--t0)/1.15 var(--serif)">${t(i.t)}</b><span class="cap">${t(i.y)}</span></figcaption></figure>`
              )
              .join('')}
          </div>
        </div>`
        )
        .join('')}
    </div>`,
})

page('studies', {
  section: OT.section,
  build: () => {
    const s = OT.studies
    return `
    <div class="g">
      <div ${at('1 / 6', '1')}>${kicker(s.kicker, '05')}</div>
      <div ${at('1 / 6', '2 / 5')}><h2 class="h2">${t(s.headline)}</h2></div>
      ${s.items
        .map((i, n) => {
          const col = ['1 / 5', '5 / 9', '9 / 13'][n]
          return `<div ${at(col, '4 / 13')} style="--col:${col};--row:4 / 13;display:flex;flex-direction:column;gap:var(--s3);border-top:1px solid var(--ink);padding-top:var(--s2)">
            <div><p class="h3">${t(i.t)}</p><p class="cap">${t(i.tag)}</p></div>
            ${i.img ? `<figure style="flex:1;min-height:0;display:flex;flex-direction:column;gap:var(--s1)"><div class="ph" style="flex:1;min-height:0;background:var(--paper-2)">${img(i.img, i.cap, 'fill mid')}</div><figcaption class="cap">${t(i.cap)}</figcaption></figure>` : ''}
            ${i.steps ? `<div class="dia-wrap" style="--ar:416 / 34;height:auto">${pipeline(i.steps)}</div>` : ''}
            <p class="body" style="font-size:calc(var(--t0)*.92)">${t(i.d)}</p>
          </div>`
        })
        .join('')}
    </div>`
  },
})

/* ----------------------------------------------------------------- CONTACT */
page('contact', {
  night: true,
  section: C.contact.section,
  build: () => {
    const c = C.contact
    const P = C.person
    const row = (k, label, text, href) => `<dt>${t(label)}</dt><dd><a href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>${t(text)}</a></dd>`
    return `
    <div class="g">
      <div ${at('1 / 7', '1')}>${kicker(c.kicker)}</div>
      <div ${at('1 / 8', '2 / 7')} style="--col:1 / 8;--row:2 / 7;align-self:end"><h1 class="h1" style="font-size:var(--t5)">${t(c.headline)}</h1></div>
      <div ${at('1 / 7', '7 / 9')} style="--col:1 / 7;--row:7 / 9"><p class="lead">${t(c.sub)}</p></div>
      <dl ${at('1 / 8', '9 / 13')} class="facts" style="--col:1 / 8;--row:9 / 13;align-self:end;grid-template-columns:max-content 1fr">
        ${row('email', c.labels.email, P.email, 'mailto:' + P.email)}
        ${row('ig', c.labels.instagram, P.instagram.handle, P.instagram.href)}
        ${row('xhs', c.labels.xiaohongshu, P.xiaohongshu.handle, P.xiaohongshu.href)}
        ${row('site', c.labels.site, P.site.label, P.site.href)}
        ${row('bling', c.labels.bling, 'bling-eoo.pages.dev', C.bling.liveHref)}
      </dl>
      ${fig(c.image, { col: '8 / 13', row: '1 / 8', alt: c.imageCap, cap: c.imageCap, cls: 'right', fit: 'fill right' })}
      <p ${at('9 / 13', '11 / 13')} class="cap" style="--col:9 / 13;--row:11 / 13;align-self:end;text-align:right">${t(c.closing)}<br>${t(c.colophon)}</p>
    </div>`
  },
})

/* ============================== RENDER ============================== */
/* A tag may carry two style="" attributes (positioning helper + local tweaks); browsers keep only the first, so merge them. */
const mergeStyles = (html) =>
  html.replace(/<([a-zA-Z][\w-]*)((?:[^>"]|"[^"]*")*)>/g, (m, tag, attrs) => {
    const styles = [...attrs.matchAll(/\sstyle="([^"]*)"/g)].map((x) => x[1].replace(/;?\s*$/, ';'))
    if (styles.length < 2) return m
    return `<${tag}${attrs.replace(/\sstyle="[^"]*"/g, '')} style="${styles.join('')}">`
  })

const pageNo = Object.fromEntries(pages.map((p, i) => [p.id, i + 1]))
const deck = document.getElementById('deck')
const pad = (n) => String(n).padStart(2, '0')

deck.innerHTML = pages
  .map((p, i) => {
    const running = p.id === 'cover' ? '' : `<header class="run"><span>${t(C.ui.running)}</span><span>${t(p.section)}</span></header>`
    const folio = p.id === 'cover' ? '' : `<footer class="folio"><span>${t(C.person.name)}</span><span>${pad(i + 1)} / ${pad(pages.length)}</span></footer>`
    return `<section class="sheet${p.night ? ' night' : ''}" id="${p.id}" aria-label="${esc(p.section || p.id)}"><div class="page">${running}${mergeStyles(p.build())}${folio}</div></section>`
  })
  .join('')

document.querySelectorAll('[data-pg]').forEach((el) => (el.textContent = pad(pageNo[el.dataset.pg])))

/* screen chrome */
const bar = document.getElementById('bar')
bar.innerHTML = `<b>${t(C.ui.barTitle)}</b><span class="sp"></span>
  ${C.availableLangs.length > 1 ? `<a class="lang" href="?lang=${lang === 'ko' ? 'en' : 'ko'}">${t(C.ui.langSwitch)}</a>` : ''}
  <a href="${C.person.site.href}">${t(C.ui.toSite)}</a>
  <a href="${C.person.pdf}" download>${t(C.ui.downloadPdf)}</a>
  <button type="button" id="print">${t(C.ui.print)}</button>`
document.getElementById('print').addEventListener('click', () => window.print())

/* Lazy images must be loaded before the browser paginates. */
const eager = () => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'))
window.addEventListener('beforeprint', eager)
if (params.has('print')) eager()

/* Keyboard: arrows / PageUp/Down jump between pages */
addEventListener('keydown', (e) => {
  const keys = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1 }
  if (!(e.key in keys) || e.metaKey || e.ctrlKey || e.altKey) return
  const sheets = [...document.querySelectorAll('.sheet')]
  const mid = innerHeight / 2
  const cur = sheets.findIndex((s) => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid })
  const next = sheets[Math.max(0, Math.min(sheets.length - 1, (cur < 0 ? 0 : cur) + keys[e.key]))]
  if (next) { e.preventDefault(); next.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
})

document.documentElement.dataset.ready = '1'

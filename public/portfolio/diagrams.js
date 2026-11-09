/* Clean SVG diagrams. Every string comes from the content file so they translate.
   viewBox units are 1/10 of a page-width percent (so 10 units ≈ 1cqw ≈ 3 mm in print). */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const INK = '#121212'
const INK3 = '#6e6a61'
const HAIR = 'rgba(18,18,18,.35)'
const ACC = '#f3e4dc'

const arrow = (id) => `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1.5 L8 5 L1 8.5" fill="none" stroke="${INK}" stroke-width="1.3"/></marker>`

/** Information architecture: five pillars -> the screens that realise them. */
export function iaDiagram(c) {
  const pillars = c.problem.pillars
  const screens = [
    ['Articles · editor’s picks · trends', 'Discover 发现'],
    ['Athlete profiles', 'e.g. Yuzuru Hanyu, Alysa Liu'],
    ['Program page · soundtrack player', 'costume inspirations'],
    ['Posts · comments · follow', 'compose an article or a private note'],
    ['Shop · cart · checkout (simulated)', 'music print customiser'],
  ]
  const W = 449
  const rowH = 66
  const y0 = 22
  let out = `<svg class="dia" viewBox="0 0 ${W} 470" role="img" aria-label="Information architecture"><defs>${arrow('ia-a')}</defs>`
  out += `<text x="0" y="8" font-size="8.1" letter-spacing="1.1" fill="${INK3}" font-weight="600">PILLAR</text><text x="248" y="8" font-size="8.1" letter-spacing="1.1" fill="${INK3}" font-weight="600">SCREENS BUILT</text>`
  pillars.forEach((p, i) => {
    const y = y0 + i * rowH
    out += `<rect x="0" y="${y}" width="196" height="46" fill="${i === 4 ? ACC : 'none'}" stroke="${INK}" stroke-width="1"/>`
    out += `<text x="12" y="${y + 20}" font-size="15" class="d-serif" fill="${INK}">${esc(p.en)}</text>`
    out += `<text x="12" y="${y + 36}" font-size="9.4" fill="${INK3}">${esc(p.zh)} · ${esc(p.d)}</text>`
    out += `<line x1="196" y1="${y + 23}" x2="238" y2="${y + 23}" stroke="${INK}" stroke-width="1" marker-end="url(#ia-a)"/>`
    out += `<text x="248" y="${y + 20}" font-size="11" fill="${INK}" font-weight="500">${esc(screens[i][0])}</text>`
    out += `<text x="248" y="${y + 36}" font-size="9.4" fill="${INK3}">${esc(screens[i][1])}</text>`
    out += `<line x1="244" y1="${y + 46 + 6}" x2="${W}" y2="${y + 46 + 6}" stroke="${HAIR}" stroke-width=".6" ${i === 4 ? 'opacity="0"' : ''}/>`
  })
  const yb = y0 + 5 * rowH + 8
  out += `<line x1="0" y1="${yb - 6}" x2="${W}" y2="${yb - 6}" stroke="${INK}" stroke-width="1"/>`
  out += `<text x="0" y="${yb + 12}" font-size="8.1" letter-spacing="1.1" fill="${INK3}" font-weight="600">ACROSS ALL PILLARS</text>`
  out += `<text x="0" y="${yb + 32}" font-size="11" fill="${INK}" font-weight="500">MUSE critic · Favourites 收藏 · Profile 我的 · BLING ARC year in review</text>`
  out += `</svg>`
  return out
}

/** MUSE decision flow (vertical). */
export function museFlow(c) {
  const f = c.muse.flow
  const W = 372
  const cx = 186
  const box = (x, y, w, h, title, sub, fill) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill || 'none'}" stroke="${INK}" stroke-width="1"/>` +
    `<text x="${x + w / 2}" y="${y + 21}" font-size="11.5" font-weight="600" text-anchor="middle" fill="${INK}">${esc(title)}</text>` +
    (sub ? `<text x="${x + w / 2}" y="${y + 37}" font-size="9.2" text-anchor="middle" fill="${INK3}">${esc(sub)}</text>` : '')
  const wrap = (t, max) => {
    const words = t.split(' ')
    const lines = []
    let line = ''
    words.forEach((w) => {
      if ((line + ' ' + w).trim().length > max) { lines.push(line); line = w } else line = (line + ' ' + w).trim()
    })
    lines.push(line)
    return lines
  }
  const sub2 = (x, y, t, max) => wrap(t, max).map((l, i) => `<text x="${x}" y="${y + i * 12}" font-size="9.2" text-anchor="middle" fill="${INK3}">${esc(l)}</text>`).join('')
  let o = `<svg class="dia" viewBox="0 0 ${W} 475" role="img" aria-label="MUSE interaction flow"><defs>${arrow('mu-a')}</defs>`
  // input
  o += box(cx - 100, 0, 200, 48, f.input, f.inputSub, ACC)
  o += `<line x1="${cx}" y1="48" x2="${cx}" y2="82" stroke="${INK}" marker-end="url(#mu-a)"/>`
  // decision
  o += `<path d="M${cx} 84 L${cx + 150} 128 L${cx} 172 L${cx - 150} 128 Z" fill="none" stroke="${INK}" stroke-width="1"/>`
  wrap(f.match, 22).forEach((l, i, a) => { o += `<text x="${cx}" y="${128 + (i - (a.length - 1) / 2) * 13 + 3}" font-size="10.4" font-weight="600" text-anchor="middle" fill="${INK}">${esc(l)}</text>` })
  // branches
  o += `<path d="M${cx - 150} 128 H62 V214" fill="none" stroke="${INK}" marker-end="url(#mu-a)"/><text x="${cx - 156}" y="118" font-size="9" font-weight="600" text-anchor="end" fill="${INK}">YES</text>`
  o += `<path d="M${cx + 150} 128 H310 V214" fill="none" stroke="${INK}" marker-end="url(#mu-a)"/><text x="${cx + 156}" y="118" font-size="9" font-weight="600" fill="${INK}">NO</text>`
  o += `<rect x="2" y="216" width="150" height="86" fill="none" stroke="${INK}"/><text x="77" y="240" font-size="11.5" font-weight="600" text-anchor="middle" fill="${INK}">${esc(f.yes)}</text>${sub2(77, 257, f.yesSub, 26)}`
  o += `<rect x="220" y="216" width="150" height="86" fill="none" stroke="${INK}" stroke-dasharray="3 3"/><text x="295" y="240" font-size="11.5" font-weight="600" text-anchor="middle" fill="${INK}">${esc(f.no)}</text>${sub2(295, 257, f.noSub, 26)}`
  // merge
  o += `<path d="M77 302 V334 H${cx - 4}" fill="none" stroke="${INK}"/><path d="M295 302 V334 H${cx + 4}" fill="none" stroke="${INK}"/>`
  o += `<line x1="${cx}" y1="334" x2="${cx}" y2="356" stroke="${INK}" marker-end="url(#mu-a)"/>`
  o += box(cx - 120, 358, 240, 52, f.loop, '', ACC).replace(/<text[^>]*>[^<]*<\/text>$/, '')
  // loop-back
  o += `<path d="M${cx + 120} 384 H${W - 6} V24 H${cx + 100}" fill="none" stroke="${INK3}" stroke-dasharray="2 3" marker-end="url(#mu-a)"/>`
  o += `</svg>`
  // re-draw the loop label with wrapping (the box helper centres one line)
  o = o.replace('</svg>', wrap(f.loop, 30).map((l, i, a) => `<text x="${cx}" y="${384 + (i - (a.length - 1) / 2) * 13 + 3}" font-size="10.4" font-weight="600" text-anchor="middle" fill="${INK}">${esc(l)}</text>`).join('') + '</svg>')
  return o
}

/** Concept diagram for "the world is my playground": oyster -> curiosity -> Earth -> playground. */
export function worldDiagram(c) {
  const d = c.concept.diagram
  const W = 452
  const nodes = [
    { x: 38, t: d.a, s: d.aSub, r: 26 },
    { x: 150, t: d.b, s: d.bSub, r: 0 },
    { x: 262, t: d.c, s: d.cSub, r: 36 },
    { x: 400, t: d.d, s: d.dSub, r: 52 },
  ]
  let o = `<svg class="dia" viewBox="0 0 ${W} 156" role="img" aria-label="Concept diagram"><defs>${arrow('wo-a')}</defs>`
  // growing circles show scale
  o += `<circle cx="${nodes[0].x}" cy="60" r="${nodes[0].r}" fill="none" stroke="${INK}"/>`
  o += `<path d="M${150 - 22} 60 H${150 + 22}" stroke="${INK}" stroke-dasharray="2 3"/><path d="M150 38 V82" stroke="${INK}" stroke-dasharray="2 3"/>`
  o += `<circle cx="${nodes[1].x}" cy="60" r="4" fill="${ACC}" stroke="${INK}"/>`
  o += `<circle cx="${nodes[2].x}" cy="60" r="${nodes[2].r}" fill="none" stroke="${INK}"/><circle cx="${nodes[2].x}" cy="60" r="${nodes[2].r * 0.48}" fill="${ACC}" stroke="${INK}"/>`
  o += `<circle cx="${nodes[3].x - 4}" cy="60" r="${nodes[3].r}" fill="none" stroke="${INK}"/><circle cx="${nodes[3].x - 4}" cy="60" r="${nodes[3].r * 0.7}" fill="none" stroke="${INK}" stroke-dasharray="2 3"/><circle cx="${nodes[3].x - 4}" cy="60" r="${nodes[3].r * 0.34}" fill="${ACC}" stroke="${INK}"/>`
  ;[[66, 128], [180, 224]].forEach(([a, b]) => { o += `<line x1="${a}" y1="60" x2="${b}" y2="60" stroke="${INK}" marker-end="url(#wo-a)"/>` })
  o += `<line x1="304" y1="60" x2="338" y2="60" stroke="${INK}" marker-end="url(#wo-a)"/>`
  nodes.forEach((n, i) => {
    const cx = i === 3 ? n.x - 4 : n.x
    o += `<text x="${cx}" y="${132}" font-size="14" class="d-serif" text-anchor="middle" fill="${INK}">${esc(n.t)}</text>`
    o += `<text x="${cx}" y="${147}" font-size="8.6" text-anchor="middle" fill="${INK3}">${esc(n.s)}</text>`
  })
  o += `</svg>`
  return o
}

/** Small linear pipeline: step -> step -> step. */
export function pipeline(steps) {
  const w = 100
  const W = steps.length * w + (steps.length - 1) * 16
  let o = `<svg class="dia" viewBox="0 0 ${W} 34" role="img"><defs>${arrow('pl-a')}</defs>`
  steps.forEach((s, i) => {
    const x = i * (w + 16)
    o += `<rect x="${x}" y="2" width="${w}" height="28" fill="${i === 0 ? ACC : 'none'}" stroke="${INK}"/><text x="${x + w / 2}" y="20" font-size="9.4" font-weight="600" text-anchor="middle" fill="${INK}">${esc(s)}</text>`
    if (i < steps.length - 1) o += `<line x1="${x + w}" y1="16" x2="${x + w + 16}" y2="16" stroke="${INK}" marker-end="url(#pl-a)"/>`
  })
  return o + '</svg>'
}

/** Two overlapping gaps in figure-skating content, and where BLING sits. */
export function vennDiagram(c) {
  const v = c.problem.venn
  const wrap = (t, max) => { const w = t.split(' '); const l = []; let s = ''; w.forEach((x) => { if ((s + ' ' + x).trim().length > max) { l.push(s); s = x } else s = (s + ' ' + x).trim() }); l.push(s); return l }
  const lines = (x, y, t, max, anchor = 'middle', fs = 9.4, fill = INK3) => wrap(t, max).map((l, i) => `<text x="${x}" y="${y + i * (fs + 3.2)}" font-size="${fs}" text-anchor="${anchor}" fill="${fill}">${esc(l)}</text>`).join('')
  // Labels sit in the outer crescent of each circle, clear of the stroke and of the lens.
  const block = (cx, title, sub) => {
    const titleLines = wrap(title, 12)
    const subLines = wrap(sub, 16)
    const fsT = 11, fsS = 8.2
    const h = titleLines.length * (fsT + 2.4) + 6 + subLines.length * (fsS + 2.6)
    let y = 112 - h / 2
    let out = ''
    titleLines.forEach((l) => { y += fsT; out += `<text x="${cx}" y="${y}" font-size="${fsT}" font-weight="600" text-anchor="middle" fill="${INK}">${esc(l)}</text>`; y += 2.4 })
    y += 6
    subLines.forEach((l) => { y += fsS; out += `<text x="${cx}" y="${y}" font-size="${fsS}" text-anchor="middle" fill="${INK3}">${esc(l)}</text>`; y += 2.6 })
    return out
  }
  let o = `<svg class="dia" viewBox="0 0 470 230" role="img" aria-label="Venn diagram">`
  o += `<defs><clipPath id="venn-left"><circle cx="145" cy="115" r="125"/></clipPath></defs>`
  o += `<circle cx="315" cy="115" r="125" fill="${ACC}" clip-path="url(#venn-left)"/>`
  o += `<circle cx="145" cy="115" r="125" fill="none" stroke="${INK}"/><circle cx="315" cy="115" r="125" fill="none" stroke="${INK}"/>`
  o += block(88, v.a, v.aSub)
  o += block(382, v.b, v.bSub)
  o += `<text x="230" y="120" font-size="15" class="d-serif" text-anchor="middle" letter-spacing="1" fill="${INK}">BLING</text>`
  return o + '</svg>'
}

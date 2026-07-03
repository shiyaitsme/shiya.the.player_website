import { useEffect, useState } from 'react'

const pt = (p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`

/** Quadratic bezier path between two points, bowed perpendicular to the line
 * by `bow` px (sign picks which side it bulges toward) for a hand-drawn feel
 * instead of a dead-straight connector. */
function bowPath(a, b, bow) {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const ctrl = { x: mx + (-dy / len) * bow, y: my + (dx / len) * bow }
  return `M ${pt(a)} Q ${pt(ctrl)} ${pt(b)}`
}

/** Where a ray from `origin` in direction `dir` exits the [0,w]x[0,h] rect —
 * used to "bleed" a line out to the screen edge like the desktop lines do. */
function rayToEdge(origin, dir, w, h) {
  const len = Math.hypot(dir.x, dir.y) || 1
  const dx = dir.x / len
  const dy = dir.y / len
  let t = Infinity
  if (dx > 0) t = Math.min(t, (w - origin.x) / dx)
  if (dx < 0) t = Math.min(t, (0 - origin.x) / dx)
  if (dy > 0) t = Math.min(t, (h - origin.y) / dy)
  if (dy < 0) t = Math.min(t, (0 - origin.y) / dy)
  if (!isFinite(t) || t < 0) t = 0
  return { x: origin.x + dx * t, y: origin.y + dy * t }
}

/** Live center of `el`, in the coordinate space of `base` (a DOMRect). */
function centerIn(el, base) {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top }
}

/** Live top/bottom edge y (in `base`'s coordinate space) of `el`. */
function edgesOf(el, base) {
  const r = el.getBoundingClientRect()
  return { top: r.top - base.top, bottom: r.bottom - base.top }
}

/**
 * One smooth cubic-bezier "bump" from `a` to `b` that bulges toward
 * `through` (roughly — see below) — a SINGLE, unbroken curve, so there is
 * no seam anywhere for curvature to jump at.
 *
 * Two things were tried before this and both still read as a polyline:
 * (1) two bezier pieces stitched at the through-point — even tangent-
 * matched (C1-continuous), the curvature itself still jumped at the seam,
 * which the eye reads as a corner; (2) the true circumcircle through all 3
 * points — genuinely constant curvature, but whichever arc actually passes
 * through the through-point can turn out to be the *major* arc (>180°) if
 * that point sits past the circle's far side relative to the a-b chord —
 * here that produced a huge unwanted loop out past the edge of the screen.
 *
 * This sidesteps both: it's one Bezier segment (no seam, so no curvature
 * jump), and both control points are offset from the chord by the SAME
 * vector (the through-point's perpendicular deviation from its own foot on
 * the chord, scaled by `factor`), which is the standard construction for a
 * single symmetric hump — no risk of an unexpected long way around, and
 * `factor` directly dials the bulge/tension up or down.
 */
function bumpThrough(a, b, through, factor = 1) {
  const ux = b.x - a.x
  const uy = b.y - a.y
  const uLen = Math.hypot(ux, uy) || 1
  const along = ((through.x - a.x) * ux + (through.y - a.y) * uy) / uLen
  const foot = { x: a.x + (ux / uLen) * along, y: a.y + (uy / uLen) * along }
  const dev = { x: (through.x - foot.x) * factor, y: (through.y - foot.y) * factor }
  const c1 = { x: a.x + ux / 3 + dev.x, y: a.y + uy / 3 + dev.y }
  const c2 = { x: a.x + (ux * 2) / 3 + dev.x, y: a.y + (uy * 2) / 3 + dev.y }
  return `M ${pt(a)} C ${pt(c1)} ${pt(c2)} ${pt(b)}`
}

/**
 * The mobile map's exact 5 connector lines — everything else was deleted
 * (the old hub-spoke lines to all 4 shards read as too busy/overlapping).
 * All endpoints are snapped to LIVE element centers (getBoundingClientRect),
 * never hand-picked coordinates, so they can't drift out of sync:
 *   1. `through`   — straight line through about + works, bled past BOTH
 *      ends until it exits the screen.
 *   2. `arc`       — one single, unbroken bezier "bump" (see bumpThrough —
 *      no seam anywhere, so curvature can't jump/read as a corner) from
 *      contact toward a cradle point — x aligned with works, y halfway
 *      between the carousel's bottom edge and about's top edge — then back
 *      up to a fixed exit point on the right edge, just below center.
 *   3–5. a triangle directly connecting contact–manifesto, manifesto–works,
 *      and works–contact (about is NOT part of this triangle).
 */
export function computeMobileLines({ hubEl, contactEl, worksEl, aboutEl, manifestoEl, containerEl }) {
  const empty = { through: null, arc: null, triCM: null, triMW: null, triWC: null, size: { w: 0, h: 0 } }
  if (!hubEl || !contactEl || !worksEl || !aboutEl || !manifestoEl || !containerEl) return empty

  const base = containerEl.getBoundingClientRect()
  const w = containerEl.clientWidth
  const h = containerEl.clientHeight
  const contact = centerIn(contactEl, base)
  const works = centerIn(worksEl, base)
  const about = centerIn(aboutEl, base)
  const manifesto = centerIn(manifestoEl, base)

  // 1. through about + works, bled to both edges
  const dirAW = { x: works.x - about.x, y: works.y - about.y }
  const forwardEdge = rayToEdge(works, dirAW, w, h)
  const backwardEdge = rayToEdge(about, { x: -dirAW.x, y: -dirAW.y }, w, h)
  const through = `M ${pt(backwardEdge)} L ${pt(about)} L ${pt(works)} L ${pt(forwardEdge)}`

  // 2. contact -> cradle point -> right edge, just below mid-height — one
  // true circular arc (see arcThrough3) through all three points. The
  // cradle sits under the carousel's right side rather than dead-center: x
  // lines up with works, y is the midpoint between the carousel's bottom
  // edge and about's top edge (both live-measured, not hand-picked). factor
  // 1.35 gives the curve real tension instead of barely bending.
  const hubEdges = edgesOf(hubEl, base)
  const aboutEdges = edgesOf(aboutEl, base)
  const cradle = { x: works.x, y: (hubEdges.bottom + aboutEdges.top) / 2 }
  const edgeExit = { x: w, y: h * 0.56 }
  const arc = bumpThrough(contact, edgeExit, cradle, 1.35)

  // 3–5. contact/manifesto/works triangle (about excluded)
  const triCM = bowPath(contact, manifesto, 14)
  const triMW = bowPath(manifesto, works, -14)
  const triWC = bowPath(works, contact, 10)

  return { through, arc, triCM, triMW, triWC, size: { w, h } }
}

/**
 * Keeps computeMobileLines() in sync with live layout: runs once on mount,
 * every frame for ~2s after (to track Framer Motion's entrance-animation
 * settle), then only on resize/orientation change.
 */
export function useMobileLines(refs, containerRef) {
  const [value, setValue] = useState(() => computeMobileLines({}))

  useEffect(() => {
    const recompute = () =>
      setValue(
        computeMobileLines({
          hubEl: refs.hub.current,
          contactEl: refs.contact.current,
          worksEl: refs.works.current,
          aboutEl: refs.about.current,
          manifestoEl: refs.manifesto.current,
          containerEl: containerRef.current,
        })
      )
    recompute()

    let raf
    const start = performance.now()
    const tick = (t) => {
      recompute()
      if (t - start < 2000) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    window.addEventListener('resize', recompute)
    window.addEventListener('orientationchange', recompute)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', recompute)
      window.removeEventListener('orientationchange', recompute)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return value
}

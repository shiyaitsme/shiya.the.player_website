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

/** Point just below `el`'s live bottom edge, horizontally centered — the
 * arc threads through here instead of the hub's center so it cradles the
 * carousel from underneath rather than cutting through the middle of it. */
function belowBottomOf(el, base, pad = 14) {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2 - base.left, y: r.bottom - base.top + pad }
}

/**
 * The mobile map's exact 5 connector lines — everything else was deleted
 * (the old hub-spoke lines to all 4 shards read as too busy/overlapping).
 * All endpoints are snapped to LIVE element centers (getBoundingClientRect),
 * never hand-picked coordinates, so they can't drift out of sync:
 *   1. `through`   — straight line through about + works, bled past BOTH
 *      ends until it exits the screen.
 *   2. `arc`       — one smooth curve (SVG Q...T, so the on-curve points are
 *      hit exactly) from contact down to just below the carousel — cradling
 *      it from underneath, not cutting through its center — then back up to
 *      a fixed exit point on the right edge, vertically just below center.
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

  // 2. contact -> just below the carousel (exactly on-curve) -> right edge,
  // just below mid-height. Two independent Q segments sharing the cradle
  // point, each with its control point pinned to the SAME y as the cradle —
  // that makes the y-component of both segments monotonic (provably, since
  // it collapses to a 2-point interpolation in y), so the curve can only
  // ever approach `cradle.y` and never dip past it. A naive single Q...T
  // curve was tried first, but T's mirrored control point overshot well
  // past the cradle depth (down toward/past manifesto) instead of stopping
  // there — this construction is what actually keeps the real bottom of the
  // arc pinned at the cradle height instead of just passing through it.
  const cradle = belowBottomOf(hubEl, base)
  const edgeExit = { x: w, y: h * 0.56 }
  const ctrl1 = { x: contact.x + (cradle.x - contact.x) * 0.6, y: cradle.y }
  const ctrl2 = { x: cradle.x + (edgeExit.x - cradle.x) * 0.4, y: cradle.y }
  const arc = `M ${pt(contact)} Q ${pt(ctrl1)} ${pt(cradle)} Q ${pt(ctrl2)} ${pt(edgeExit)}`

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

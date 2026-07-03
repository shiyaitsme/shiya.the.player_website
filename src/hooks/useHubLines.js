import { useEffect, useState } from 'react'

/** Quadratic bezier path between two points, bowed perpendicular to the line
 * by `bow` px (sign picks which side it bulges toward) for a hand-drawn feel
 * instead of dead-straight spokes. */
function bowPath(x1, y1, x2, y2, bow) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const cx = mx + nx * bow
  const cy = my + ny * bow
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
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

/**
 * Builds one bezier path per node, connecting it to the hub, with both
 * endpoints snapped to the elements' LIVE centers (via getBoundingClientRect)
 * rather than any hand-authored coordinate — so the lines stay correct no
 * matter how the layout is tuned, animates, or reflows.
 *
 * @param hubEl       the center element (e.g. the carousel wrapper)
 * @param nodeEls     array of surrounding elements (shards) — null entries
 *                    are skipped, so callers can pass refs that aren't
 *                    mounted yet without filtering first
 * @param containerEl the positioned ancestor the <svg> is drawn against
 *                    (its top-left corner is the path coordinate origin)
 * @param bows        optional array of per-node bow amounts (px); defaults
 *                    to an alternating gentle curve so lines fan out
 * @returns array of `d` path strings, same order/length as nodeEls
 */
export function computeHubLines(hubEl, nodeEls, containerEl, bows) {
  if (!hubEl || !containerEl) return []
  const base = containerEl.getBoundingClientRect()
  const hub = centerIn(hubEl, base)
  return nodeEls.map((el, i) => {
    if (!el) return null
    const node = centerIn(el, base)
    const bow = bows ? bows[i] : (i % 2 === 0 ? 1 : -1) * (18 + (i % 3) * 6)
    return bowPath(hub.x, hub.y, node.x, node.y, bow)
  })
}

/**
 * Two extra "bleed" lines in the desktop's spirit (lines run past their
 * anchors out to the screen edge, they don't just stop at a node):
 *  - `through`: a straight line through the about + works centers, extended
 *    past BOTH of them until it exits the container on each side.
 *  - `arc`: a single smooth curve (SVG `Q ... T ...`, so it's guaranteed to
 *    pass exactly through all three on-curve points) from contact, down
 *    through the hub, then mirrored back upward past the hub out to the edge
 *    — a shallow valley with the hub as its low point.
 */
export function computeExtraLines(hubEl, contactEl, worksEl, aboutEl, containerEl) {
  if (!hubEl || !contactEl || !worksEl || !aboutEl || !containerEl) {
    return { through: null, arc: null }
  }
  const base = containerEl.getBoundingClientRect()
  const w = containerEl.clientWidth
  const h = containerEl.clientHeight
  const hub = centerIn(hubEl, base)
  const contact = centerIn(contactEl, base)
  const works = centerIn(worksEl, base)
  const about = centerIn(aboutEl, base)

  const dirAW = { x: works.x - about.x, y: works.y - about.y }
  const forwardEdge = rayToEdge(works, dirAW, w, h)
  const backwardEdge = rayToEdge(about, { x: -dirAW.x, y: -dirAW.y }, w, h)
  const through = [
    `M ${backwardEdge.x.toFixed(1)} ${backwardEdge.y.toFixed(1)}`,
    `L ${about.x.toFixed(1)} ${about.y.toFixed(1)}`,
    `L ${works.x.toFixed(1)} ${works.y.toFixed(1)}`,
    `L ${forwardEdge.x.toFixed(1)} ${forwardEdge.y.toFixed(1)}`,
  ].join(' ')

  // contact -> hub travels down-right; mirror the vertical delta so the path
  // continues rightward but now climbs — a valley with the hub at bottom.
  const d = { x: hub.x - contact.x, y: hub.y - contact.y }
  const edgeExit = rayToEdge(hub, { x: d.x, y: -d.y }, w, h)
  const bow = 22
  const mid = { x: (contact.x + hub.x) / 2, y: (contact.y + hub.y) / 2 }
  const dLen = Math.hypot(d.x, d.y) || 1
  const ctrl = { x: mid.x + (-d.y / dLen) * bow, y: mid.y + (d.x / dLen) * bow }
  const arc = [
    `M ${contact.x.toFixed(1)} ${contact.y.toFixed(1)}`,
    `Q ${ctrl.x.toFixed(1)} ${ctrl.y.toFixed(1)} ${hub.x.toFixed(1)} ${hub.y.toFixed(1)}`,
    `T ${edgeExit.x.toFixed(1)} ${edgeExit.y.toFixed(1)}`,
  ].join(' ')

  return { through, arc }
}

/**
 * Shared lifecycle for anything computed from live DOM positions: runs
 * `compute` once on mount, every frame for ~2s after (to track Framer
 * Motion's entrance-animation settle), then only on resize/orientation
 * change — so it isn't paying a per-frame cost forever.
 */
function useLiveGeometry(compute) {
  const [value, setValue] = useState(() => compute())

  useEffect(() => {
    const recompute = () => setValue(compute())
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

/** Hub→node spoke lines (see computeHubLines) kept in sync with live layout. */
export function useHubLines(hubRef, nodeRefs, containerRef, bows) {
  return useLiveGeometry(() => {
    const el = containerRef.current
    if (!el) return { paths: [], size: { w: 0, h: 0 } }
    return {
      paths: computeHubLines(hubRef.current, nodeRefs.map((r) => r.current), el, bows),
      size: { w: el.clientWidth, h: el.clientHeight },
    }
  })
}

/** The two bleed lines (see computeExtraLines) kept in sync with live layout. */
export function useBleedLines(hubRef, contactRef, worksRef, aboutRef, containerRef) {
  return useLiveGeometry(() =>
    computeExtraLines(hubRef.current, contactRef.current, worksRef.current, aboutRef.current, containerRef.current)
  )
}

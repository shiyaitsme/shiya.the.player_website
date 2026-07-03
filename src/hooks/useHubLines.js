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
  const centerOf = (el) => {
    const r = el.getBoundingClientRect()
    return { x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top }
  }
  const hub = centerOf(hubEl)
  return nodeEls.map((el, i) => {
    if (!el) return null
    const node = centerOf(el)
    const bow = bows ? bows[i] : (i % 2 === 0 ? 1 : -1) * (18 + (i % 3) * 6)
    return bowPath(hub.x, hub.y, node.x, node.y, bow)
  })
}

/**
 * React hook wrapper: keeps hub→node bezier paths (and the pixel size to
 * draw them at) in sync with live layout. Recomputes on resize/orientation
 * change, and for ~2s after mount to track entrance-animation movement
 * (Framer Motion spring-ins shift elements after first paint), then settles
 * to resize-only updates so it isn't running every frame forever.
 */
export function useHubLines(hubRef, nodeRefs, containerRef, bows) {
  const [state, setState] = useState({ paths: [], size: { w: 0, h: 0 } })

  useEffect(() => {
    const recompute = () => {
      const el = containerRef.current
      if (!el) return
      setState({
        paths: computeHubLines(hubRef.current, nodeRefs.map((r) => r.current), el, bows),
        size: { w: el.clientWidth, h: el.clientHeight },
      })
    }
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

  return state
}

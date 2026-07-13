import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Lightbox from './Lightbox'

const GAP = 16 // px
const MOBILE_BREAKPOINT = 768 // matches the rest of the site's desktop cutoff

/**
 * Real masonry via absolute positioning (not CSS `columns` — which locks
 * every item to one column, so a landscape photo just renders short — and
 * not a CSS Grid with a quantized `grid-auto-rows` unit either, which left
 * a visible seam under any photo whose true height didn't land on an exact
 * row-unit multiple). Every photo's exact box (top/left/width/height) is
 * computed in one synchronous pass from its known aspect ratio
 * (`work.width`/`height`, resolved ahead of time — not measured from the
 * live `<img>` on load, which would make the whole layout depend on
 * unpredictable network/decode order), so photos actually touch with zero
 * leftover gap, matching the density of the very first version.
 *
 * Landscape photos occupy a FIXED column pair (1-2 or 3-4 on desktop, the
 * only pair on mobile) rather than an arbitrary 2-column span wherever a
 * generic dense-packing algorithm happens to fit it — the previous
 * CSS-Grid version let `dense` auto-placement put wide photos at an
 * off-alignment start column (e.g. 2-3), which read as visually chaotic.
 * Whichever pair is currently shorter gets the next landscape photo, same
 * shortest-column logic a portrait photo uses among single columns.
 */
function useMasonryLayout(works, containerWidth) {
  return useMemo(() => {
    if (!containerWidth) return { items: [], height: 0 }
    const columns = containerWidth < MOBILE_BREAKPOINT ? 2 : 4
    const colWidth = (containerWidth - (columns - 1) * GAP) / columns
    const colHeights = new Array(columns).fill(0)
    const pairCount = Math.floor(columns / 2)

    const items = works.map((w, i) => {
      const aspect = w.width && w.height ? w.width / w.height : 1
      const landscape = aspect > 1

      let col
      let span
      if (landscape) {
        let bestPair = 0
        let bestHeight = Infinity
        for (let p = 0; p < pairCount; p++) {
          const h = Math.max(colHeights[p * 2], colHeights[p * 2 + 1])
          if (h < bestHeight) {
            bestHeight = h
            bestPair = p
          }
        }
        col = bestPair * 2
        span = 2
      } else {
        col = colHeights.indexOf(Math.min(...colHeights))
        span = 1
      }

      const width = colWidth * span + GAP * (span - 1)
      const height = width / aspect
      const top = span === 2 ? Math.max(colHeights[col], colHeights[col + 1]) : colHeights[col]
      const left = col * (colWidth + GAP)

      const bottom = top + height + GAP
      if (span === 2) {
        colHeights[col] = bottom
        colHeights[col + 1] = bottom
      } else {
        colHeights[col] = bottom
      }

      return { work: w, index: i, top, left, width, height }
    })

    return { items, height: Math.max(0, ...colHeights) - GAP }
  }, [works, containerWidth])
}

export default function PhotoGrid({ works }) {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { items, height } = useMasonryLayout(works, containerWidth)

  return (
    <>
      <div ref={containerRef} className="relative" style={{ height }}>
        {items.map(({ work, index, top, left, width, height: h }) => (
          <button
            key={work.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="absolute overflow-hidden rounded-[2px] transition-opacity duration-200 hover:opacity-85"
            style={{ top, left, width, height: h }}
          >
            <img
              src={work.image}
              alt="photography"
              className="block h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <Lightbox
            works={works}
            index={openIndex}
            onClose={() => setOpenIndex(null)}
            onNavigate={setOpenIndex}
          />
        )}
      </AnimatePresence>
    </>
  )
}

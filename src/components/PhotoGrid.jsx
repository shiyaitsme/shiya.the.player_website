import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Lightbox from './Lightbox'

// grid-auto-rows unit (px) — smaller = finer-grained masonry packing, at the
// cost of more DOM writes per item. Must be kept in sync with GAP below (the
// grid's actual row-gap) for the row-span math to land close to gapless.
const ROW_UNIT = 8
const GAP = 16

/** One grid cell: sizes itself into the right number of ROW_UNIT rows for its
 *  own rendered height (via ResizeObserver, so it re-settles automatically on
 *  image load, breakpoint change, or window resize — no manual listeners),
 *  and spans 2 columns instead of 1 if the photo is landscape. This is what
 *  a plain CSS `columns` masonry can't do — a `columns` item is always
 *  exactly one column wide, so a wide photo just renders short instead of
 *  wide (flagged by the user after the first version shipped). */
function GridItem({ work, index, onOpen }) {
  // Deliberately observing the BUTTON, not the outer grid-cell div: the
  // outer div's height is *set by* gridRowEnd (the grid track size), so
  // observing it would just read back whatever span we last wrote — a
  // circular 1-row-forever loop (this was a real bug, caught from a
  // screenshot where every photo rendered as an 8px sliver). The button is
  // a plain block child sized by its own content (the image's natural
  // rendered height), independent of the grid span imposed on its parent.
  const innerRef = useRef(null)
  const [rowSpan, setRowSpan] = useState(1)
  const [wide, setWide] = useState(false)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height
      if (h > 0) setRowSpan(Math.max(1, Math.ceil((h + GAP) / (ROW_UNIT + GAP))))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div style={{ gridRowEnd: `span ${rowSpan}`, gridColumn: wide ? 'span 2' : undefined }}>
      <button
        ref={innerRef}
        type="button"
        onClick={() => onOpen(index)}
        className="block w-full overflow-hidden rounded-[2px] transition-opacity duration-200 hover:opacity-85"
      >
        <img
          src={work.image}
          alt="photography"
          className="block h-auto w-full"
          loading="lazy"
          decoding="async"
          onLoad={(e) => setWide(e.target.naturalWidth > e.target.naturalHeight)}
        />
      </button>
    </div>
  )
}

/** Masonry wall for the 'photography' category — CSS Grid (not `columns`) so
 *  a landscape photo can span 2 columns instead of being squeezed into one;
 *  each photo keeps its own native aspect ratio either way. No titles/copy;
 *  click opens Lightbox. */
export default function PhotoGrid({ works }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <>
      <div
        className="grid grid-cols-2 gap-4 [grid-auto-flow:dense] sm:grid-cols-3 md:grid-cols-4"
        style={{ gridAutoRows: `${ROW_UNIT}px` }}
      >
        {works.map((w, i) => (
          <GridItem key={w.id} work={w} index={i} onOpen={setOpenIndex} />
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

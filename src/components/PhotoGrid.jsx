import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Lightbox from './Lightbox'

/** Masonry wall for the 'photography' category — CSS `columns` (not `grid`)
 *  so photos of any aspect ratio stack at their own native height instead of
 *  being cropped into uniform cells. No titles/copy; click opens Lightbox. */
export default function PhotoGrid({ works }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <>
      <div className="columns-2 gap-3 sm:columns-3 md:columns-4 md:gap-4">
        {works.map((w, i) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="mb-3 block w-full break-inside-avoid overflow-hidden rounded-[2px] transition-opacity duration-200 hover:opacity-85 md:mb-4"
          >
            <img
              src={w.image}
              alt="photography"
              className="block h-auto w-full"
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

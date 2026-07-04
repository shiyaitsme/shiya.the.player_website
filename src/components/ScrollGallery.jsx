import { lazy, Suspense, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import SafeMount from './butterfly/SafeMount'

// three.js/R3F stay out of the main bundle — only fetched once this section
// is actually rendered (mirrors ButterflyEgg/WorldArchive's lazy pattern).
const ScrollGalleryScene = lazy(() => import('./ScrollGalleryScene'))

const PHOTO_COUNT = 12

function StaticGrid() {
  return (
    <div className="grid h-full w-full grid-cols-4 grid-rows-3 place-items-center gap-3 p-6 md:gap-4 md:p-10">
      {Array.from({ length: PHOTO_COUNT }, (_, i) => (
        <img
          key={i}
          src={`/assets/scroll_gallery/scroll_gallery_${String(i + 1).padStart(2, '0')}.jpg`}
          alt=""
          loading="lazy"
          decoding="async"
          className="aspect-square h-full w-full rounded-sm object-cover shadow-[0_18px_40px_rgba(20,16,31,0.18)]"
        />
      ))}
    </div>
  )
}

export default function ScrollGallery() {
  const trackRef = useRef(null)
  const reduceMotion = useReducedMotion()

  return (
    <section ref={trackRef} className="relative z-20 h-[300vh] w-full">
      <div className="sticky top-0 h-dvh w-full overflow-hidden">
        {/* title graphic sits fixed and centered behind the photos for the
            whole pinned section — never animated, just the flight of tiles
            passing in front of/around it */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          <img
            src="/assets/scorll_gallery_luminous-flight.png"
            alt=""
            className="max-h-[50vh] max-w-[50vw] object-contain"
          />
        </div>

        <div className="relative z-10 h-full w-full">
          {reduceMotion ? (
            <StaticGrid />
          ) : (
            <SafeMount>
              <Suspense fallback={<StaticGrid />}>
                <ScrollGalleryScene trackRef={trackRef} />
              </Suspense>
            </SafeMount>
          )}
        </div>
      </div>
    </section>
  )
}

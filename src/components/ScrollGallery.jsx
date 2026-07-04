import { lazy, Suspense, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import SafeMount from './butterfly/SafeMount'

// three.js/R3F stay out of the main bundle — only fetched once this section
// is actually rendered (mirrors ButterflyEgg/WorldArchive's lazy pattern).
const ScrollGalleryScene = lazy(() => import('./ScrollGalleryScene'))

const PHOTO_COUNT = 12

function StaticGrid() {
  return (
    <div className="grid h-full w-full grid-cols-3 grid-rows-4 place-items-center gap-3 p-6 md:grid-cols-4 md:grid-rows-3 md:gap-4 md:p-10">
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

        {/* title graphic sits fixed and centered IN FRONT of the photos,
            closer to the viewer than anything else in this section — never
            animated, just sitting over the flight of tiles for the whole
            pinned scroll */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <img
            src="/assets/scroll_gallery_luminous-flight_v2.svg"
            alt=""
            className="max-h-[75vh] max-w-[75vw] object-contain"
            style={{
              filter:
                'drop-shadow(0 0 6px rgba(255,255,255,0.85)) drop-shadow(0 0 16px rgba(255,255,255,0.55))',
            }}
          />
        </div>
      </div>
    </section>
  )
}

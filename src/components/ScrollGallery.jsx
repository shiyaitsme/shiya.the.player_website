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
        <div key={i} className="relative aspect-square h-full w-full">
          <img
            src={`/assets/scroll_gallery/scroll_gallery_${String(i + 1).padStart(2, '0')}.jpg`}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full rounded-sm object-cover shadow-[0_18px_40px_rgba(20,16,31,0.18)]"
          />
          {/* 35% black scrim so the white title text reads consistently
              over every photo, light or dark */}
          <div className="absolute inset-0 rounded-sm bg-black/35" />
        </div>
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
            pinned scroll. It's a plain white-fill/white-stroke asset now,
            rendered as-is — legibility over the photos comes from the 35%
            black scrim on every tile (see Tile/StaticGrid), not from any
            filter/blend-mode trick on the title itself. */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <img
            src="/assets/scroll_gallery_luminous-flight_white-fill_white-stroke.svg"
            alt=""
            className="max-h-[75vh] max-w-[75vw] object-contain"
          />
        </div>
      </div>
    </section>
  )
}

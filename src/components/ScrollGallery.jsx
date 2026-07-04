import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

/**
 * Scattered photo-wall layout — position/size/rotation only, hand-tuned
 * (not random per-render) so the composition is stable across reloads.
 * Each image also gets its own [start, end] scroll-progress window so the
 * wall fills in unevenly: some photos are already crisp while others have
 * barely begun, same as the reference site's staggered reveal.
 */
const PHOTOS = [
  { src: '01', top: '10%', left: '18%', w: '30vw', rotate: -6, range: [0.0, 0.42] },
  { src: '02', top: '6%', left: '58%', w: '19vw', rotate: 5, range: [0.08, 0.5] },
  { src: '03', top: '52%', left: '6%', w: '19vw', rotate: 4, range: [0.04, 0.46] },
  { src: '04', top: '46%', left: '62%', w: '23vw', rotate: -4, range: [0.14, 0.56] },
  { src: '05', top: '14%', left: '38%', w: '20vw', rotate: -3, range: [0.22, 0.64] },
  { src: '06', top: '66%', left: '30%', w: '28vw', rotate: 3, range: [0.18, 0.6] },
  { src: '07', top: '10%', left: '78%', w: '21vw', rotate: 6, range: [0.3, 0.72] },
  { src: '08', top: '58%', left: '78%', w: '18vw', rotate: -5, range: [0.26, 0.68] },
  { src: '09', top: '2%', left: '4%', w: '17vw', rotate: 3, range: [0.38, 0.8] },
  { src: '10', top: '70%', left: '58%', w: '14vw', rotate: -6, range: [0.34, 0.76] },
  { src: '11', top: '38%', left: '20%', w: '24vw', rotate: 5, range: [0.46, 0.88] },
  { src: '12', top: '34%', left: '48%', w: '20vw', rotate: -3, range: [0.5, 0.94] },
]

function Photo({ photo, progress }) {
  const reduceMotion = useReducedMotion()
  const opacity = useTransform(progress, photo.range, [0, 1])
  const scale = useTransform(progress, photo.range, [0.72, 1])
  const y = useTransform(progress, photo.range, [40, 0])

  if (reduceMotion) {
    return (
      <img
        src={`/assets/scroll_gallery/scroll_gallery_${photo.src}.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute rounded-sm object-cover shadow-[0_18px_40px_rgba(20,16,31,0.18)]"
        style={{
          top: photo.top,
          left: photo.left,
          width: photo.w,
          rotate: `${photo.rotate}deg`,
        }}
      />
    )
  }

  return (
    <motion.img
      src={`/assets/scroll_gallery/scroll_gallery_${photo.src}.jpg`}
      alt=""
      loading="lazy"
      decoding="async"
      className="absolute rounded-sm object-cover shadow-[0_18px_40px_rgba(20,16,31,0.18)]"
      style={{
        top: photo.top,
        left: photo.left,
        width: photo.w,
        rotate: `${photo.rotate}deg`,
        opacity,
        scale,
        y,
      }}
    />
  )
}

export default function ScrollGallery() {
  const trackRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section ref={trackRef} className="relative z-20 h-[320vh] w-full">
      <div className="sticky top-0 h-dvh w-full overflow-hidden">
        {PHOTOS.map((photo) => (
          <Photo key={photo.src} photo={photo} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  )
}

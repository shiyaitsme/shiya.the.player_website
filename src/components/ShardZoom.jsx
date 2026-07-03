import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Cinematic "clip transition" for opening a shard:
 *   1. ZOOM IN  — the clicked spot grows from the shard's position to fill the
 *      screen, revealing the section's cover photo (roller coaster / tea pot /
 *      about / manifesto).
 *   2. HOLD     — a brief beat on the full-bleed cover.
 *   3. ZOOM OUT — the portal pulls back + fades as the detail page fades in
 *      beneath it (match-cut pull-back).
 *
 * onReveal fires at the start of the zoom-out (mount the detail page then);
 * onComplete fires when the portal finishes (unmount this overlay).
 *
 * We zoom the section's cover image only — no green shard fallback.
 */
export default function ShardZoom({ coverSrc, label, originRect, onReveal, onComplete }) {
  const [phase, setPhase] = useState('in') // 'in' | 'out'

  // reduced-motion: skip straight to the detail page
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onReveal?.()
      onComplete?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const iw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const ih = typeof window !== 'undefined' ? window.innerHeight : 900

  const initialT = {
    x: originRect.left,
    y: originRect.top,
    scaleX: originRect.width / iw,
    scaleY: originRect.height / ih,
    opacity: 1,
  }
  const fullT = { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 }
  const outT = { x: iw * 0.1, y: ih * 0.1, scaleX: 0.8, scaleY: 0.8, opacity: 0 }

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]">
      {/* soft pastel backdrop that blooms in as we push through */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 45%, rgba(247,230,214,0.96) 0%, rgba(206,214,240,0.9) 70%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'out' ? 0 : 0.92 }}
        transition={{ duration: phase === 'out' ? 0.4 : 0.7 }}
      />

      {/* the zooming portal */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={{ transformOrigin: 'top left' }}
        initial={initialT}
        animate={phase === 'out' ? outT : fullT}
        transition={
          phase === 'out'
            ? { duration: 0.62, ease: [0.4, 0, 0.2, 1] }
            : { duration: 0.8, ease: [0.72, 0, 0.28, 1] }
        }
        onAnimationComplete={() => {
          if (phase === 'in') {
            // HOLD, then hand off to the detail page + zoom out
            window.setTimeout(() => {
              onReveal?.()
              setPhase('out')
            }, 360)
          } else {
            onComplete?.()
          }
        }}
      >
        {/* section cover photo — the only thing that zooms */}
        <img
          className="absolute inset-[6%] h-[88%] w-[88%] object-contain drop-shadow-[0_20px_50px_rgba(40,30,60,0.3)]"
          src={coverSrc}
          alt={label}
          draggable={false}
        />
      </motion.div>
    </div>
  )
}

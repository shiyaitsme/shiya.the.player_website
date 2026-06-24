import { useEffect } from 'react'

/**
 * Scales the fixed 1440x900 art-directed stage to fit the viewport while
 * preserving the exact Figma composition (contain-fit, centered).
 */
export default function useStageScale(ref, { width = 1440, height = 900 } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      // COVER + center: fill the viewport so the lime lines (esp. the right
      // arc) bleed all the way to the page edges. Combined with the stage's
      // `transform-origin: center center`, any overflow is split evenly
      // top/bottom (or left/right), so the crop is symmetric and minimal —
      // nothing important clips on ~16:10 / 16:9 screens.
      const scale = Math.max(window.innerWidth / width, window.innerHeight / height)
      el.style.setProperty('--stage-scale', String(scale))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [ref, width, height])
}

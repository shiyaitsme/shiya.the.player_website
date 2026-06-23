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
      // COVER: fill the viewport so the lime lines bleed to the page edges
      // (the stage is anchored top-center, so the logo/top row stay visible)
      const scale = Math.max(window.innerWidth / width, window.innerHeight / height)
      el.style.setProperty('--stage-scale', String(scale))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [ref, width, height])
}

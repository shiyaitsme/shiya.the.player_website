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
      const scale = Math.min(window.innerWidth / width, window.innerHeight / height)
      el.style.setProperty('--stage-scale', String(scale))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [ref, width, height])
}

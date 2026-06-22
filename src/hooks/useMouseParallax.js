import { useEffect } from 'react'
import gsap from 'gsap'

/**
 * Ties the global mouse coordinates (X, Y) to CSS custom properties via GSAP,
 * driving the macaron base + halftone layers at slightly different speeds for
 * a layered depth effect. Also exposes a quickTo for the hero carousel tilt.
 *
 * Returns a ref-free API: the heavy lifting is done on :root CSS vars so any
 * component can opt into the parallax just by reading the variables.
 */
export default function useMouseParallax() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    // independent quickTo tweens => buttery, interruption-safe motion
    const setMX = gsap.quickTo(root, '--mx', { duration: 0.6, ease: 'power3' })
    const setMY = gsap.quickTo(root, '--my', { duration: 0.6, ease: 'power3' })
    const setMX2 = gsap.quickTo(root, '--mx2', { duration: 0.4, ease: 'power3' })
    const setMY2 = gsap.quickTo(root, '--my2', { duration: 0.4, ease: 'power3' })

    const onMove = (e) => {
      const cx = e.clientX / window.innerWidth - 0.5 // -0.5 .. 0.5
      const cy = e.clientY / window.innerHeight - 0.5
      // base layer drifts slow, halftone drifts faster + opposite => parallax
      // vars are unitless; CSS applies the px via calc()
      setMX(cx * -36)
      setMY(cy * -36)
      setMX2(cx * 60)
      setMY2(cy * 60)
    }

    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
}

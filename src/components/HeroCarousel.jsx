import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Transparent central carousel (carousel_hero_v2.webm, VP9 + alpha; falls back
 * to the original hero-carousel.webm if v2 isn't present). Sits in the Figma
 * carousel slot on the 1440x900 stage; minor GSAP 3D tilt follows the cursor
 * for a soft spatial drift. Soft + desaturated to match the dreamy palette.
 */
export default function HeroCarousel() {
  const wrapRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rotY = gsap.quickTo(wrap, 'rotationY', { duration: 0.9, ease: 'power3' })
    const rotX = gsap.quickTo(wrap, 'rotationX', { duration: 0.9, ease: 'power3' })
    const onMove = (e) => {
      const cx = e.clientX / window.innerWidth - 0.5
      const cy = e.clientY / window.innerHeight - 0.5
      rotY(cx * 12)
      rotX(cy * -9)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const ensurePlay = () => {
    const v = videoRef.current
    if (v && v.paused) v.play().catch(() => {})
  }

  // graceful fallback: if v2 fails to load, swap to the original webm once
  const onError = () => {
    const v = videoRef.current
    if (v && !v.src.includes('hero-carousel.webm')) {
      v.src = '/assets/hero-carousel.webm'
      v.load()
      v.play().catch(() => {})
    }
  }

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{ left: 469, top: 233, width: 511, height: 631, perspective: 1000 }}
    >
      <div
        ref={wrapRef}
        className="h-full w-full animate-floaty"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-contain drop-shadow-[0_24px_44px_rgba(60,50,80,0.22)]"
          style={{ transform: 'scale(2.55)', transformOrigin: 'center center' }}
          src="/assets/carousel_hero_v2.webm"
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={ensurePlay}
          onError={onError}
        />
      </div>
    </div>
  )
}

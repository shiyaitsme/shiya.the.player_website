import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Transparent central carousel video.
 * hero-carousel.webm is a VP9 + alpha WebM, so it composites cleanly over the
 * pure-code gradient with zero background-box masking.
 *
 * Choreography: minor GSAP 3D perspective tilts bound to the cursor drift,
 * faking a spatial rotation of the carousel as the pointer moves.
 */
export default function HeroCarousel() {
  const wrapRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const rotX = gsap.quickTo(wrap, 'rotationX', { duration: 0.8, ease: 'power3' })
    const rotY = gsap.quickTo(wrap, 'rotationY', { duration: 0.8, ease: 'power3' })
    const moveX = gsap.quickTo(wrap, 'x', { duration: 0.9, ease: 'power3' })
    const moveY = gsap.quickTo(wrap, 'y', { duration: 0.9, ease: 'power3' })

    const onMove = (e) => {
      const cx = e.clientX / window.innerWidth - 0.5
      const cy = e.clientY / window.innerHeight - 0.5
      rotY(cx * 16) // turn left/right
      rotX(cy * -12) // tip up/down
      moveX(cx * 26)
      moveY(cy * 18)
    }

    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // browsers occasionally block autoplay until a gesture — keep it resilient
  const ensurePlay = () => {
    const v = videoRef.current
    if (v && v.paused) v.play().catch(() => {})
  }

  return (
    <div
      className="pointer-events-none relative z-20 flex items-center justify-center"
      style={{ perspective: '1000px' }}
    >
      <div
        ref={wrapRef}
        className="animate-floaty"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        <video
          ref={videoRef}
          className="w-[min(60vw,560px)] drop-shadow-[0_30px_60px_rgba(42,37,53,0.25)]"
          src="/assets/hero-carousel.webm"
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={ensurePlay}
        />
      </div>
    </div>
  )
}

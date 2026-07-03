import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

/**
 * Safari/WebKit (desktop Safari + every iOS browser, since iOS forces
 * WebKit's video pipeline) doesn't composite the alpha channel in a
 * transparent VP9 .webm — it just shows the opaque RGB plane, which reads as
 * a solid black box behind the carousel. There's no reliable feature-detect
 * for "can this engine composite webm alpha", so we UA-sniff and swap to an
 * **animated WebP** (`carousel_hero_v2_mobile.webp`, real alpha + all 120
 * frames — extracted the same way as the still poster, via
 * `ffmpeg -c:v libvpx-vp9`, then re-encoded with `-vcodec libwebp`) instead
 * of the video on those engines. WebP with alpha (animated or not) has been
 * supported in Safari/iOS since version 14, so this keeps the carousel
 * actually spinning instead of freezing on one frame the way a static PNG
 * poster did (that was the very first fix here, before this was animated —
 * don't regress back to the static poster, it visibly doesn't rotate).
 */
const NEEDS_POSTER_FALLBACK = (() => {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /^((?!chrome|android|crios|fxios|edg).)*safari/i.test(ua)
  return isIOS || isSafari
})()

/**
 * Transparent central carousel (carousel_hero_v2.webm, VP9 + alpha; falls back
 * to the original hero-carousel.webm if v2 isn't present). Sits in the Figma
 * carousel slot on the 1440x900 stage; minor GSAP 3D tilt follows the cursor
 * for a soft spatial drift. Soft + desaturated to match the dreamy palette.
 *
 * `mobile` swaps the outer box from the fixed 1440-space absolute position to
 * a plain relative box that fills whatever percentage-sized wrapper MobileMap
 * gives it — everything else (poster fallback, tilt, error recovery) is
 * identical on both layouts.
 */
export default function HeroCarousel({ mobile = false }) {
  const wrapRef = useRef(null)
  const videoRef = useRef(null)
  const [webpFailed, setWebpFailed] = useState(false)

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

  const scale = mobile ? 1.9 : 2.55

  return (
    <div
      className={mobile ? 'pointer-events-none relative h-full w-full' : 'pointer-events-none absolute z-20'}
      style={mobile ? { perspective: 1000 } : { left: 469, top: 170, width: 511, height: 631, perspective: 1000 }}
    >
      <div
        ref={wrapRef}
        className="h-full w-full animate-floaty"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {NEEDS_POSTER_FALLBACK ? (
          <img
            className="h-full w-full object-contain drop-shadow-[0_24px_44px_rgba(60,50,80,0.22)]"
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
            src={webpFailed ? '/assets/carousel_hero_v2_poster.png' : '/assets/carousel_hero_v2_mobile.webp'}
            onError={() => setWebpFailed(true)}
            alt=""
            draggable={false}
          />
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full object-contain drop-shadow-[0_24px_44px_rgba(60,50,80,0.22)]"
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
            src="/assets/carousel_hero_v2.webm"
            autoPlay
            loop
            muted
            playsInline
            onCanPlay={ensurePlay}
            onError={onError}
          />
        )}
      </div>
    </div>
  )
}

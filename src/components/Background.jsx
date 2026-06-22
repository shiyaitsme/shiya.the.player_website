import { useEffect, useState } from 'react'

/**
 * Pure-code soft background that prefers the user's exported Figma assets
 * when present, falling back to the CSS gradient/halftone otherwise.
 *   - /assets/bg.png        → gradient field (node "gradient" 14:21)
 *   - /assets/halftone.png  → halftone overlay (node "half_tone" 17:123)
 * Both layers keep the subtle GSAP mouse parallax (via the CSS classes).
 */
function useImageReady(src) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    let live = true
    const img = new Image()
    img.onload = () => live && setOk(true)
    img.onerror = () => live && setOk(false)
    img.src = src
    return () => {
      live = false
    }
  }, [src])
  return ok
}

export default function Background() {
  const bgOk = useImageReady('/assets/bg.png')
  const halftoneOk = useImageReady('/assets/halftone.png')

  return (
    <>
      {/* gradient field — keeps the .macaron-base parallax transform */}
      <div className="macaron-base" aria-hidden="true">
        {bgOk && (
          <img
            src="/assets/bg.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      {/* halftone — image overlay if exported, else the CSS dot grid */}
      {halftoneOk ? (
        <div className="halftone" aria-hidden="true" style={{ backgroundImage: 'none' }}>
          <img
            src="/assets/halftone.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="halftone" aria-hidden="true" />
      )}

      <div className="grain" aria-hidden="true" />
    </>
  )
}

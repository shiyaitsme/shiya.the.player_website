/**
 * Global "Afterglow" night backdrop: near-black ground, faint concentric
 * rings and film grain. The ground and rings keep the subtle GSAP mouse
 * parallax (driven by the --mx/--my CSS vars from useMouseParallax).
 *
 * Also hosts the one shared SVG <filter id="grain"> that plates elsewhere
 * reference (`filter="url(#grain)"`) so the same speckle texture can sit
 * inside individual cards without duplicating the filter definition.
 */
export default function Background() {
  return (
    <>
      <svg width="0" height="0" className="pointer-events-none absolute" aria-hidden="true">
        <defs>
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="11" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  9 0 0 0 -4.7"
            />
          </filter>
        </defs>
      </svg>
      <div className="night-base" aria-hidden="true" />
      <div className="rings" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  )
}

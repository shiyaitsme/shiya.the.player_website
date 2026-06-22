/**
 * Pure-code Retro Americana / Acid background.
 * Three stacked fixed layers — no raster images:
 *   1. .macaron-base  — fluid low-saturation radial-gradient field
 *   2. .halftone      — semi-transparent dot grid (retro print)
 *   3. .grain         — SVG feTurbulence noise overlay
 * Layers 1 & 2 are parallaxed at different speeds by useMouseParallax (CSS vars).
 */
export default function Background() {
  return (
    <>
      <div className="macaron-base" aria-hidden="true" />
      <div className="halftone" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  )
}

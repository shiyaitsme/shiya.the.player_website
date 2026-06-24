import { useEffect, useState } from 'react'

/**
 * Map connector lines. Prefers the user's exported Figma lines
 * (/assets/lines.svg — the exact lime-green hand-drawn paths). If that's not
 * present yet, falls back to static lime curves. No streaming animation —
 * the lines are still, as requested.
 */
const FALLBACK_PATHS = [
  'M 185 235 C 430 150, 760 150, 980 250 S 1180 210, 1210 175',
  'M 168 438 C 360 470, 520 520, 700 540 S 880 470, 940 400',
  'M 725 560 C 860 470, 980 470, 1010 470 S 1180 640, 1255 735',
  'M 300 720 C 460 660, 600 600, 720 580 S 900 600, 1010 470',
  'M 200 270 C 240 360, 300 420, 420 470',
]

export default function MapLines() {
  const [linesOk, setLinesOk] = useState(false)
  useEffect(() => {
    let live = true
    const img = new Image()
    img.onload = () => live && setLinesOk(true)
    img.onerror = () => live && setLinesOk(false)
    img.src = '/assets/lines.svg'
    return () => {
      live = false
    }
  }, [])

  if (linesOk) {
    return (
      <img
        src="/assets/lines.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] h-full w-full object-fill"
      />
    )
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      {FALLBACK_PATHS.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="#b6ff00"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.95"
        />
      ))}
    </svg>
  )
}

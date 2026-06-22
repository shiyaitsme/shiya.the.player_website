import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

/**
 * Delicate hand-drawn-style lime connector lines linking the map nodes
 * (carousel hub → shards → stars), with a few micro-particles drifting
 * gently along them. Thin and airy, matching the Figma demo — not neon tubes.
 * Drawn on the 1440x900 stage coordinate system.
 */
const PATHS = [
  // top sweep: contact shard → over carousel → works shard
  'M 185 235 C 430 150, 760 150, 980 250 S 1180 210, 1210 175',
  // left star cluster → carousel hub
  'M 168 438 C 360 470, 520 520, 700 540 S 880 470, 940 400',
  // carousel hub → about shard → tools shard
  'M 725 560 C 860 470, 980 470, 1010 470 S 1180 640, 1255 735',
  // lower diagonal: bottom-left → carousel base
  'M 300 720 C 460 660, 600 600, 720 580 S 900 600, 1010 470',
  // contact shard → down to mid stars
  'M 200 270 C 240 360, 300 420, 420 470',
]

const NODES = [
  [185, 200], [1205, 170], [940, 400], [1260, 735], [725, 540],
  [299, 158], [150, 422], [241, 336], [419, 361], [405, 640],
  [1217, 281], [1116, 676],
]

export default function MapLines() {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dots = svg.querySelectorAll('.flow-dot')
    const tweens = []
    dots.forEach((dot) => {
      const sel = dot.getAttribute('data-path')
      tweens.push(
        gsap.to(dot, {
          duration: gsap.utils.random(4.5, 8),
          repeat: -1,
          ease: 'none',
          delay: gsap.utils.random(0, 5),
          motionPath: {
            path: svg.querySelector(sel),
            align: svg.querySelector(sel),
            alignOrigin: [0.5, 0.5],
          },
        })
      )
    })
    return () => tweens.forEach((t) => t.kill())
  }, [])

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1440 900"
      fill="none"
      aria-hidden="true"
    >
      {PATHS.map((d, i) => (
        <path
          key={i}
          id={`map-path-${i}`}
          d={d}
          stroke="#a9e34b"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}

      {PATHS.map((_, i) =>
        Array.from({ length: 3 }).map((_, j) => (
          <circle
            key={`f-${i}-${j}`}
            className="flow-dot"
            data-path={`#map-path-${i}`}
            r="2.4"
            fill="#b6ff00"
          />
        ))
      )}

      {NODES.map(([x, y], i) => (
        <circle key={`n-${i}`} cx={x} cy={y} r="2.2" fill="#a9e34b" opacity="0.55" />
      ))}
    </svg>
  )
}

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

/**
 * Acid fluid grid lines.
 * Instead of rigid static SVG strokes, micro-particles stream rhythmically
 * along curved green paths that connect the layout nodes (teamLab style).
 * Each path carries several staggered dots tweened with MotionPathPlugin.
 */

// curved connectors across the viewport (viewBox 0..1000 x 0..700)
const PATHS = [
  'M 80 120 C 280 40, 520 220, 760 120 S 980 320, 940 460',
  'M 60 520 C 240 600, 420 420, 640 540 S 900 480, 960 600',
  'M 500 80 C 420 260, 600 360, 500 540 S 360 600, 460 660',
  'M 120 300 C 300 280, 360 460, 560 420 S 820 260, 900 300',
]

const NODES = [
  [80, 120], [760, 120], [940, 460], [60, 520],
  [640, 540], [960, 600], [500, 80], [500, 540],
  [120, 300], [900, 300], [460, 660], [560, 420],
]

export default function AcidGrid() {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dots = svg.querySelectorAll('.stream-dot')
    const tweens = []
    dots.forEach((dot) => {
      const pathSel = dot.getAttribute('data-path')
      const t = gsap.to(dot, {
        duration: gsap.utils.random(4, 7),
        repeat: -1,
        ease: 'none',
        delay: gsap.utils.random(0, 4),
        motionPath: {
          path: svg.querySelector(pathSel),
          align: svg.querySelector(pathSel),
          alignOrigin: [0.5, 0.5],
        },
      })
      tweens.push(t)
    })

    // gentle node pulse
    const pulse = gsap.to(svg.querySelectorAll('.grid-node'), {
      scale: 1.6,
      transformOrigin: 'center',
      opacity: 0.9,
      duration: 1.8,
      ease: 'sine.inOut',
      stagger: { each: 0.25, repeat: -1, yoyo: true },
    })

    return () => {
      tweens.forEach((t) => t.kill())
      pulse.kill()
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none fixed inset-0 z-10 h-full w-full"
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="acidLine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8fb98f" stopOpacity="0.0" />
          <stop offset="0.5" stopColor="#8fb98f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#b7d36a" stopOpacity="0.0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* fluid connector lines */}
      {PATHS.map((d, i) => (
        <path
          key={i}
          id={`acid-path-${i}`}
          d={d}
          fill="none"
          stroke="url(#acidLine)"
          strokeWidth="1.4"
          strokeDasharray="2 9"
          strokeLinecap="round"
        />
      ))}

      {/* streaming micro-particles (several per path, staggered) */}
      {PATHS.map((_, i) =>
        Array.from({ length: 5 }).map((_, j) => (
          <circle
            key={`d-${i}-${j}`}
            className="stream-dot"
            data-path={`#acid-path-${i}`}
            r={1.8 + (j % 2) * 0.9}
            fill={j % 2 ? '#c6ff5e' : '#8fb98f'}
            filter="url(#glow)"
          />
        ))
      )}

      {/* nodes */}
      {NODES.map(([x, y], i) => (
        <circle
          key={`n-${i}`}
          className="grid-node"
          cx={x}
          cy={y}
          r="2.6"
          fill="#8fb98f"
          opacity="0.55"
        />
      ))}
    </svg>
  )
}

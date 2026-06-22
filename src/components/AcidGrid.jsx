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
        // faster, denser stream => immersive teamLab flow
        duration: gsap.utils.random(1.6, 3.2),
        repeat: -1,
        ease: 'none',
        delay: gsap.utils.random(0, 2),
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
        <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* radiant neon-green connector lines */}
      {PATHS.map((d, i) => (
        <path
          key={i}
          id={`acid-path-${i}`}
          d={d}
          fill="none"
          stroke="#00FF00"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#glow)"
          opacity="0.92"
          style={{ filter: 'drop-shadow(0 0 8px #00FF00)' }}
        />
      ))}

      {/* dense streaming micro-particles (more per path, staggered) */}
      {PATHS.map((_, i) =>
        Array.from({ length: 11 }).map((_, j) => (
          <circle
            key={`d-${i}-${j}`}
            className="stream-dot"
            data-path={`#acid-path-${i}`}
            r={2.2 + (j % 3) * 0.8}
            fill={j % 2 ? '#eaffd4' : '#00FF00'}
            filter="url(#glow)"
            style={{ filter: 'drop-shadow(0 0 6px #00FF00)' }}
          />
        ))
      )}

      {/* glowing nodes */}
      {NODES.map(([x, y], i) => (
        <circle
          key={`n-${i}`}
          className="grid-node"
          cx={x}
          cy={y}
          r="3.2"
          fill="#00FF00"
          opacity="0.9"
          style={{ filter: 'drop-shadow(0 0 8px #00FF00)' }}
        />
      ))}
    </svg>
  )
}

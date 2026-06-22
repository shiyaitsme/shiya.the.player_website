import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pickRandomProject } from '../data/projects'

/**
 * Feature A — Star (*) "Gachapon" nodes.
 * Scattered chrome acid asterisks. Clicking any star:
 *   1. Math.random() pulls a project from the pool.
 *   2. The star scales up dramatically + bursts a ring of particles.
 *   3. A cinematic viewport zoom (radial flash) pulls the camera in,
 *      then fades into the randomly pulled project page (onSelect).
 */

// scattered positions (vw / vh) + base scale
const STARS = [
  { x: 14, y: 22, s: 1.1 },
  { x: 84, y: 18, s: 0.8 },
  { x: 24, y: 72, s: 0.95 },
  { x: 72, y: 66, s: 1.25 },
  { x: 50, y: 14, s: 0.7 },
  { x: 90, y: 48, s: 0.9 },
  { x: 8, y: 52, s: 0.85 },
  { x: 62, y: 86, s: 1.0 },
]

const BURST = Array.from({ length: 14 })

export default function StarField({ onSelect }) {
  const [burst, setBurst] = useState(null) // { x, y, color }

  const fire = (star, e) => {
    const project = pickRandomProject()
    const rect = e.currentTarget.getBoundingClientRect()
    setBurst({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      color: project.color,
    })
    // let the burst + zoom play, then hand off to the project page
    window.setTimeout(() => {
      setBurst(null)
      onSelect(project)
    }, 850)
  }

  return (
    <>
      {STARS.map((star, i) => (
        <motion.button
          key={i}
          type="button"
          aria-label="Open a random project"
          onClick={(e) => fire(star, e)}
          className="chrome-star pointer-events-auto absolute z-30 select-none font-display leading-none"
          style={{
            left: `${star.x}vw`,
            top: `${star.y}vh`,
            fontSize: `${star.s * 2.6}rem`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, rotate: 360 }}
          transition={{
            delay: 0.2 + i * 0.08,
            rotate: { duration: 9, repeat: Infinity, ease: 'linear' },
            scale: { type: 'spring', stiffness: 200, damping: 12 },
          }}
          whileHover={{ scale: 1.45, filter: 'brightness(1.3)' }}
          whileTap={{ scale: 2.2 }}
        >
          *
        </motion.button>
      ))}

      {/* cinematic zoom + particle burst */}
      <AnimatePresence>
        {burst && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[70]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* radial flash that scales to fill the viewport (camera pull-in) */}
            <motion.div
              className="absolute rounded-full"
              style={{
                left: burst.x,
                top: burst.y,
                width: 40,
                height: 40,
                marginLeft: -20,
                marginTop: -20,
                background: `radial-gradient(circle, ${burst.color} 0%, rgba(255,255,255,0.9) 40%, ${burst.color}00 70%)`,
              }}
              initial={{ scale: 0, opacity: 0.95 }}
              animate={{ scale: 90, opacity: [0.95, 0.95, 1] }}
              transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
            />
            {/* particle ring */}
            {BURST.map((_, k) => {
              const ang = (k / BURST.length) * Math.PI * 2
              return (
                <motion.span
                  key={k}
                  className="absolute h-2 w-2 rounded-full"
                  style={{ left: burst.x, top: burst.y, background: burst.color }}
                  initial={{ x: -4, y: -4, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(ang) * 220 - 4,
                    y: Math.sin(ang) * 220 - 4,
                    opacity: 0,
                    scale: 0.2,
                  }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

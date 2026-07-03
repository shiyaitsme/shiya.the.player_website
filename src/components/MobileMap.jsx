import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mobileHub, mobileShards, mobileStars, sections, pickRandomWork } from '../data/projects'
import NavLabel from './NavLabel'
import HeroCarousel from './HeroCarousel'

/** Quadratic bow from (x1,y1) to (x2,y2) in % coords — a hand-drawn curve
 * computed at runtime instead of a baked SVG (see projects.js comment). */
function bowPath(x1, y1, x2, y2, bow) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const cx = mx + nx * bow
  const cy = my + ny * bow
  return `M ${x1} ${y1} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x2} ${y2}`
}

function MobileLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      {mobileShards.map((s, i) => (
        <path
          key={s.id}
          d={bowPath(mobileHub.xPct, mobileHub.yPct + 10, s.xPct, s.yPct - 6, i % 2 === 0 ? 5 : -5)}
          stroke="#b6ff00"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.9"
        />
      ))}
    </svg>
  )
}

function MobileShards({ onOpen }) {
  return (
    <>
      {mobileShards.map((shard, i) => {
        const section = sections[shard.section]
        const open = (e) =>
          onOpen(shard.section, shard.id, e.currentTarget.getBoundingClientRect())
        return (
          // Positioning lives on a plain (non-motion) wrapper. Framer Motion
          // owns `transform` on the motion.button below for the entrance +
          // float animation — if the centering margin lived on that same
          // element, Framer's inline `transform` write would coexist fine,
          // but framer-motion silently drops `margin*` from elements it
          // animates (it reserves those keys for its own layout engine), so
          // the button would render un-centered. Keeping position and motion
          // on separate elements sidesteps that entirely.
          <div
            key={shard.id}
            className="pointer-events-none absolute z-30"
            style={{
              left: `${shard.xPct}%`,
              top: `${shard.yPct}%`,
              width: `${shard.wVw}vw`,
              marginLeft: `calc(${shard.wVw}vw / -2)`,
            }}
          >
            <motion.button
              type="button"
              onClick={open}
              aria-label={`Open ${section.nav}`}
              className="pointer-events-auto flex w-full flex-col items-center"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { delay: 0.5 + i * 0.12, duration: 0.6 },
                scale: { delay: 0.5 + i * 0.12, type: 'spring', stiffness: 140, damping: 14 },
                y: { duration: 7 + i, repeat: Infinity, ease: 'easeInOut' },
              }}
              whileTap={{ scale: 0.92 }}
            >
              <img
                src={`/assets/green_piece_${shard.id}.png`}
                alt=""
                className="w-full select-none"
                style={{ transform: `rotate(${shard.rot}deg)` }}
                draggable={false}
              />
              {/* maxWidth:none — the label renders at its true aspect-correct
                  width (it can be wider than the shard photo, e.g. "manifesto")
                  instead of being squashed to match the image's narrower box */}
              <span className="mt-2 block">
                <NavLabel section={section} className="h-[19px] w-auto" style={{ maxWidth: 'none' }} />
              </span>
            </motion.button>
          </div>
        )
      })}
    </>
  )
}

function MobileStars({ onSelect }) {
  const [bloom, setBloom] = useState(null)
  const [starOk, setStarOk] = useState(true)

  const fire = (e) => {
    const work = pickRandomWork()
    const r = e.currentTarget.getBoundingClientRect()
    setBloom({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
    window.setTimeout(() => {
      setBloom(null)
      onSelect(work)
    }, 720)
  }

  return (
    <>
      {mobileStars.map((s, i) => {
        // grow the invisible tap area toward a comfortable touch target
        const hit = Math.max(44, s.size)
        return (
          // Same split as MobileShards: centering margin on a plain wrapper,
          // Framer's transform on the motion child — see the comment there.
          <div
            key={i}
            className="pointer-events-none absolute z-30"
            style={{
              left: `${s.xPct}%`,
              top: `${s.yPct}%`,
              width: hit,
              height: hit,
              marginLeft: -hit / 2,
              marginTop: -hit / 2,
            }}
          >
            <motion.button
              type="button"
              aria-label="Open a random work"
              onClick={fire}
              className="star-asterisk pointer-events-auto grid h-full w-full place-items-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.07, type: 'spring', stiffness: 220, damping: 14 }}
              whileTap={{ scale: 1.8 }}
            >
              {starOk ? (
                <img
                  src="/assets/star.svg"
                  alt=""
                  style={{ width: s.size, height: s.size }}
                  className="object-contain"
                  draggable={false}
                  onError={() => setStarOk(false)}
                />
              ) : (
                <span style={{ fontSize: s.size }}>*</span>
              )}
            </motion.button>
          </div>
        )
      })}

      <AnimatePresence>
        {bloom && (
          <motion.div
            className="pointer-events-none fixed rounded-full"
            style={{
              left: bloom.x - 30,
              top: bloom.y - 30,
              width: 60,
              height: 60,
              zIndex: 70,
              background:
                'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(242,182,212,0.6) 45%, rgba(255,255,255,0) 72%)',
            }}
            initial={{ scale: 0, opacity: 0.95 }}
            animate={{ scale: 60, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.6, 0, 0.2, 1] }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * Phone-width map: a proportional, generative layout (see the `mobileHub` /
 * `mobileShards` / `mobileStars` comment in projects.js) instead of the
 * desktop's pixel-1:1 1440x900 stage. Everything fits one screen — no pinch
 * or pan required — using the same art (shard PNGs, lime nav words, carousel,
 * star icon), just re-anchored as percentages so it fills a portrait screen.
 */
export default function MobileMap({ onOpen, onSelectWork }) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <MobileLines />

      <div
        className="pointer-events-none absolute z-30"
        style={{ left: '50%', top: '5%', width: 36, height: 49, marginLeft: -18 }}
      >
        <motion.img
          src="/assets/logo_s.svg"
          alt="Shiya the Player"
          className="h-full w-full animate-floaty"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        />
      </div>

      <div
        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${mobileHub.xPct}%`,
          top: `${mobileHub.yPct}%`,
          width: `${mobileHub.wVw}vw`,
          height: `${mobileHub.wVw * 1.23}vw`,
        }}
      >
        <HeroCarousel mobile />
      </div>

      <MobileStars onSelect={onSelectWork} />
      <MobileShards onOpen={onOpen} />
    </div>
  )
}

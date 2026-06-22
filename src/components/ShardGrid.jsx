import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { shards } from '../data/projects'

/**
 * Feature B — Shard array layout with seamless FLIP transition.
 * Assets are looped from green_piece_1.png .. green_piece_4.png via
 * string interpolation. Each shard is a nav marker paired with its polygon.
 *
 * Framer Motion's `layoutId` gives us First-Last-Invert-Play for free:
 * the clicked shard expands organically from its slot to cover 100% of the
 * viewport. The green tint filter interpolates to `none`, and the narrative
 * copy drifts up from the bottom on a soft spring.
 */

// resting slots around the hero (vw/vh) + a slight art-direction rotation
const SLOTS = [
  { left: '7vw', top: '24vh', rot: -8 },
  { right: '8vw', top: '20vh', rot: 7 },
  { left: '12vw', bottom: '12vh', rot: 6 },
  { right: '10vw', bottom: '14vh', rot: -6 },
]

// resting state keeps the real texture readable (no flat fill) with a light
// acid push + neon rim; expanding interpolates to fully crisp color.
const tintIn =
  'saturate(1.15) contrast(1.08) hue-rotate(-8deg) drop-shadow(0 0 10px rgba(0,255,0,0.45))'
const tintOut = 'saturate(1) contrast(1) hue-rotate(0deg) drop-shadow(0 0 0 transparent)'

export default function ShardGrid() {
  const [active, setActive] = useState(null)
  const activeShard = shards.find((s) => s.id === active)

  return (
    <>
      {/* resting shard array */}
      {shards.map((shard, i) => {
        const slot = SLOTS[i]
        return (
          <motion.button
            key={shard.id}
            type="button"
            layoutId={`shard-${shard.id}`}
            onClick={() => setActive(shard.id)}
            className="pointer-events-auto absolute z-30 flex flex-col items-center gap-2"
            style={{ ...slot }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0, rotate: slot.rot }}
            transition={{ delay: 0.4 + i * 0.12, type: 'spring', stiffness: 120, damping: 16 }}
            whileHover={{ scale: 1.08, rotate: 0 }}
          >
            {/* float wrapper isolates the slow drift from Framer's FLIP transform */}
            <span
              className="shard-float block"
              style={{ animationDelay: `${i * -1.4}s`, animationDuration: `${7 + i}s` }}
            >
              <motion.img
                layoutId={`shard-img-${shard.id}`}
                src={`/assets/green_piece_${shard.id}.png`}
                alt={shard.name}
                className="w-[clamp(140px,16vw,240px)]"
                style={{ filter: tintIn }}
                draggable={false}
              />
            </span>
            <span className="neon-hover font-display text-sm uppercase">
              {shard.nav}
            </span>
          </motion.button>
        )
      })}

      {/* expanded full-bleed shard (FLIP target) */}
      <AnimatePresence>
        {activeShard && (
          <motion.div
            className="shard-overlay flex items-end justify-center overflow-hidden"
            onClick={() => setActive(null)}
          >
            {/* dim scrim */}
            <motion.div
              className="absolute inset-0 bg-ink/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              layoutId={`shard-${activeShard.id}`}
              className="absolute inset-0"
            >
              <motion.img
                layoutId={`shard-img-${activeShard.id}`}
                src={`/assets/green_piece_${activeShard.id}.png`}
                alt={activeShard.name}
                className="h-full w-full object-cover"
                initial={{ filter: tintIn }}
                animate={{ filter: tintOut }}
                exit={{ filter: tintIn }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
                draggable={false}
              />
            </motion.div>

            {/* narrative copy drifts up on a soft spring */}
            <motion.div
              className="relative z-10 mb-[8vh] max-w-2xl px-8 text-center text-macaron-cream"
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 90, damping: 16, delay: 0.15 }}
            >
              <p className="font-display text-sm uppercase tracking-[0.4em] text-acid-neon">
                {activeShard.name} · {activeShard.nav}
              </p>
              <p className="retro-stroke mt-4 font-display text-3xl leading-snug sm:text-4xl">
                {activeShard.quote}
              </p>
              <p className="mt-3 font-body text-sm uppercase tracking-widest text-macaron-cream/70">
                — {activeShard.cite}
              </p>
              <p className="mx-auto mt-6 max-w-lg font-body text-base text-macaron-cream/85">
                {activeShard.copy}
              </p>
              <span className="mt-8 inline-block font-body text-xs uppercase tracking-[0.3em] text-macaron-cream/60">
                click anywhere to fold back
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

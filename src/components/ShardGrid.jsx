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

const tintIn = 'sepia(0.5) hue-rotate(55deg) saturate(1.4) brightness(0.96)'
const tintOut = 'sepia(0) hue-rotate(0deg) saturate(1) brightness(1)'

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
            whileHover={{ scale: 1.06, rotate: 0 }}
          >
            <motion.img
              layoutId={`shard-img-${shard.id}`}
              src={`/assets/green_piece_${shard.id}.png`}
              alt={shard.name}
              className="w-[clamp(120px,14vw,210px)] drop-shadow-[0_14px_30px_rgba(42,37,53,0.25)]"
              style={{ filter: tintIn }}
              draggable={false}
            />
            <span className="neon-hover font-display text-sm uppercase tracking-[0.35em] text-ink/80">
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

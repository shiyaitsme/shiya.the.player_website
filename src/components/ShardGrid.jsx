import { useState } from 'react'
import { motion } from 'framer-motion'
import { shards, sections } from '../data/projects'

/**
 * The 4 green polygon shards + lime nav labels, positioned to the Figma demo
 * (1440x900 stage). Clicking a shard (or its label) opens that section's
 * content via the cinematic zoom (handled in App). Each shard slowly drifts.
 *
 * The lime nav words are rendered as static PNGs
 * (`/assets/<section>_lime_green.png`), so what shows is exactly the user's
 * artwork — no browser font rendering. If a PNG isn't uploaded yet, it falls
 * back to the styled text so nothing breaks.
 */
function NavLabel({ section }) {
  const [imgOk, setImgOk] = useState(true)
  return imgOk ? (
    <img
      src={`/assets/${section.key}_lime_green.png`}
      alt={section.nav}
      onError={() => setImgOk(false)}
      draggable={false}
      className="pointer-events-none h-[26px] w-auto select-none drop-shadow-[0_2px_5px_rgba(40,55,0,0.35)]"
    />
  ) : (
    <span className="nav-label lowercase">{section.nav}</span>
  )
}

export default function ShardGrid({ onOpen }) {
  return (
    <>
      {shards.map((shard, i) => {
        const { piece, label } = shard
        const section = sections[shard.section]
        const open = (e) =>
          onOpen(shard.section, shard.id, e.currentTarget.getBoundingClientRect())
        return (
          <div key={shard.id}>
            <motion.button
              type="button"
              onClick={open}
              aria-label={`Open ${section.nav}`}
              className="pointer-events-auto absolute z-30"
              style={{ left: piece.left, top: piece.top, width: piece.w }}
              initial={{ opacity: 0, scale: 0.6, rotate: piece.rot }}
              animate={{ opacity: 1, scale: 1, rotate: piece.rot, y: [0, -10, 0] }}
              transition={{
                opacity: { delay: 0.5 + i * 0.12, duration: 0.6 },
                scale: { delay: 0.5 + i * 0.12, type: 'spring', stiffness: 140, damping: 14 },
                y: { duration: 7 + i, repeat: Infinity, ease: 'easeInOut' },
              }}
              whileHover={{ scale: 1.07, rotate: 0 }}
              whileTap={{ scale: 0.94 }}
            >
              <img
                src={`/assets/green_piece_${shard.id}.png`}
                alt={section.nav}
                className="w-full select-none drop-shadow-[0_8px_18px_rgba(60,50,80,0.22)]"
                draggable={false}
              />
            </motion.button>

            <motion.button
              type="button"
              onClick={open}
              aria-label={`Open ${section.nav}`}
              className="pointer-events-auto absolute z-30 whitespace-nowrap"
              style={{ left: label.left, top: label.top }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.12 }}
            >
              <NavLabel section={section} />
            </motion.button>
          </div>
        )
      })}
    </>
  )
}

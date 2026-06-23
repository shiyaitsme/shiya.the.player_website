import { motion } from 'framer-motion'
import { shards, sections } from '../data/projects'

/**
 * The 4 green polygon shards + lime nav labels, positioned to the Figma demo
 * (1440x900 stage). Clicking a shard (or its label) opens that section's
 * content via the cinematic zoom (handled in App). Each shard slowly drifts.
 */
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
              className="nav-label pointer-events-auto absolute z-30 whitespace-nowrap lowercase"
              style={{ left: label.left, top: label.top }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.12 }}
            >
              {section.nav}
            </motion.button>
          </div>
        )
      })}
    </>
  )
}

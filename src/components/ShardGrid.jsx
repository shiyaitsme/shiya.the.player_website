import { useState } from 'react'
import { motion } from 'framer-motion'
import { shards, sections } from '../data/projects'

/**
 * The 4 nav clusters (contact / works / about / manifesto). Each cluster is a
 * SINGLE absolutely-positioned container that holds its green shard image with
 * the lime nav label centered directly beneath it.
 *
 * Why one container: the image and its label used to be positioned separately
 * with their own absolute coords, so they drifted apart (and the floating
 * animation only moved the image). Packing them in one flex-column container
 * means they share the same anchor and animation — they stay perfectly aligned
 * and centered at every screen size, and can never overlap or misalign.
 *
 * Coordinates (piece.left/top/w) are the Figma image positions on the 1440x900
 * stage. Clicking anywhere on the cluster opens that section via the zoom.
 *
 * The lime nav word is the user's PNG artwork (`/assets/<key>_lime_green.png`);
 * if it isn't uploaded yet it falls back to styled `.nav-label` text.
 */
function NavLabel({ section }) {
  const [imgOk, setImgOk] = useState(true)
  return imgOk ? (
    <img
      src={`/assets/${section.key}_lime_green.png`}
      alt={section.nav}
      onError={() => setImgOk(false)}
      draggable={false}
      className="pointer-events-none h-[26px] w-auto select-none"
    />
  ) : (
    <span className="nav-label lowercase">{section.nav}</span>
  )
}

export default function ShardGrid({ onOpen }) {
  return (
    <>
      {shards.map((shard, i) => {
        const { piece } = shard
        const section = sections[shard.section]
        const open = (e) =>
          onOpen(shard.section, shard.id, e.currentTarget.getBoundingClientRect())
        return (
          <motion.button
            key={shard.id}
            type="button"
            onClick={open}
            aria-label={`Open ${section.nav}`}
            className="pointer-events-auto absolute z-30 flex flex-col items-center"
            style={{ left: piece.left, top: piece.top, width: piece.w }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
            transition={{
              opacity: { delay: 0.5 + i * 0.12, duration: 0.6 },
              scale: { delay: 0.5 + i * 0.12, type: 'spring', stiffness: 140, damping: 14 },
              y: { duration: 7 + i, repeat: Infinity, ease: 'easeInOut' },
            }}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.94 }}
          >
            {/* shard image — keeps its Figma tilt; label below stays horizontal */}
            <img
              src={`/assets/green_piece_${shard.id}.png`}
              alt=""
              className="w-full select-none drop-shadow-[0_8px_18px_rgba(60,50,80,0.22)]"
              style={{ transform: `rotate(${piece.rot}deg)` }}
              draggable={false}
            />
            {/* label is pinned 12px under the image, centered — never drifts */}
            <span className="mt-3 block">
              <NavLabel section={section} />
            </span>
          </motion.button>
        )
      })}
    </>
  )
}

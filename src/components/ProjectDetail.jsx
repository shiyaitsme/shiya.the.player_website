import { useState } from 'react'
import { motion } from 'framer-motion'
import BottleCap from './BottleCap'

/**
 * Frame 2 — the work detail page (Gachapon target / shard expansion).
 * Soft iridescent field, crimped bottle-cap number, portrait, and an
 * editorial Playfair Display column. Enters with a soft FLIP-style spring.
 */
const CAP_COLORS = ['#22305f', '#7a1f3d', '#1f5a3a', '#5a3a8f']

export default function ProjectDetail({ project, onClose }) {
  const [imgOk, setImgOk] = useState(true)
  const capColor = CAP_COLORS[(project.number - 1) % CAP_COLORS.length]

  return (
    <motion.div
      className="fixed inset-0 z-[80] overflow-hidden"
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* soft iridescent backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 60% at 18% 20%, rgba(174,185,236,0.95) 0%, rgba(174,185,236,0) 60%),' +
            'radial-gradient(50% 55% at 88% 32%, rgba(246,211,178,0.9) 0%, rgba(246,211,178,0) 60%),' +
            'radial-gradient(60% 60% at 70% 85%, rgba(242,182,212,0.95) 0%, rgba(242,182,212,0) 62%),' +
            'linear-gradient(125deg,#cfd6f0,#f0d8e6 45%,#f7e6d6 72%,#cdddf1)',
        }}
      />
      <div className="grain" />

      <div className="relative mx-auto flex h-full max-w-6xl flex-col px-8 py-[10vh] md:px-16">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
          {/* left: number + portrait */}
          <motion.div
            className="flex items-start gap-5"
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 90, damping: 16 }}
          >
            <BottleCap number={project.number} color={capColor} size={56} />
            <div className="h-[222px] w-[min(70vw,426px)] overflow-hidden rounded-[2px] shadow-[0_18px_40px_rgba(40,30,60,0.3)]">
              {/* starry fallback if the work image isn't present yet */}
              <div
                className="grid h-full w-full place-items-center"
                style={{
                  background:
                    'radial-gradient(120% 120% at 30% 20%, #2b2545 0%, #0e0b1c 70%)',
                }}
              >
                {imgOk ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover"
                    onError={() => setImgOk(false)}
                  />
                ) : (
                  <span className="px-4 text-center font-body text-xs uppercase tracking-[0.3em] text-white/55">
                    {project.title}
                    <br />
                    portrait
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* right: editorial serif column */}
          <motion.div
            className="max-w-xl font-serif text-ink"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 80, damping: 18 }}
          >
            <h2 className="font-serif text-2xl md:text-[26px]">
              {project.title} <span aria-hidden>✨</span>
            </h2>
            <p className="mt-1 font-body text-xs uppercase tracking-[0.3em] text-ink/55">
              {project.field} · {project.year}
            </p>
            {project.body.map((para, i) => (
              <p key={i} className="mt-5 text-[17px] leading-relaxed md:text-[19px]">
                {para}
              </p>
            ))}
          </motion.div>
        </div>

        <motion.button
          type="button"
          onClick={onClose}
          className="nav-label mt-auto self-start lowercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          ↩ back to the map
        </motion.button>
      </div>
    </motion.div>
  )
}

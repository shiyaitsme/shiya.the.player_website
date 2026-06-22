import { motion } from 'framer-motion'

/**
 * The randomly-pulled project "page" the Gachapon star fades into.
 * Enters with a cinematic settle; exit handled by AnimatePresence in App.
 */
export default function ProjectReveal({ project, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center p-6"
      style={{
        background: `radial-gradient(circle at 50% 40%, ${project.color}cc 0%, #2a2535 75%)`,
      }}
      initial={{ opacity: 0, scale: 1.15 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="grain" />
      <div className="relative max-w-2xl text-center text-macaron-cream">
        <motion.p
          className="mb-3 font-body text-sm uppercase tracking-[0.4em] text-acid-neon"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {project.field} · {project.year}
        </motion.p>
        <motion.h2
          className="retro-stroke font-display text-5xl leading-none sm:text-7xl"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 90, damping: 14 }}
        >
          {project.title}
        </motion.h2>
        <motion.p
          className="mx-auto mt-6 max-w-xl font-body text-lg text-macaron-cream/85"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          {project.blurb}
        </motion.p>
        <motion.button
          type="button"
          onClick={onClose}
          className="neon-hover mt-10 rounded-full border border-acid-neon/60 px-7 py-3 font-display text-sm uppercase tracking-widest text-acid-neon"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
        >
          ↩ back to the map
        </motion.button>
      </div>
    </motion.div>
  )
}

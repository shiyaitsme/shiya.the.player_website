import { motion } from 'framer-motion'

/**
 * Top-center brand spiral logo + wordmark.
 */
export default function Header() {
  return (
    <motion.header
      className="pointer-events-none absolute left-1/2 top-6 z-40 flex -translate-x-1/2 flex-col items-center"
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <img
        src="/assets/logo_s.svg"
        alt="Shiya the Player"
        className="h-16 w-16 animate-floaty drop-shadow-[0_6px_14px_rgba(42,37,53,0.2)]"
      />
      <h1 className="retro-stroke mt-1 font-display text-lg uppercase tracking-[0.45em] text-ink/85">
        Shiya the Player
      </h1>
      <p className="font-body text-[0.6rem] uppercase tracking-[0.5em] text-ink/55">
        digital playground · 桃花源
      </p>
    </motion.header>
  )
}

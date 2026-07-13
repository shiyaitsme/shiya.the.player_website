import { useEffect } from 'react'
import { motion } from 'framer-motion'
import ArrowIcon from './ArrowIcon'

const EASE = [0.22, 1, 0.36, 1]

/** Full-screen photo viewer for PhotoGrid — Esc/backdrop-click to close,
 *  ←/→ (and on-screen arrows) to step through the same set that's open. */
export default function Lightbox({ works, index, onClose, onNavigate }) {
  const work = works[index]

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowRight') onNavigate((index + 1) % works.length)
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + works.length) % works.length)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [index, works.length, onClose, onNavigate])

  if (!work) return null

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-[4vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <div
        className="fixed inset-0 bg-[#1a1726]/85 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      <button
        type="button"
        onClick={onClose}
        aria-label="close"
        className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/30 text-white/80 transition hover:border-white/60 hover:text-white md:right-8 md:top-8"
      >
        ✕
      </button>

      <button
        type="button"
        onClick={() => onNavigate((index - 1 + works.length) % works.length)}
        aria-label="previous photo"
        className="absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 text-white/75 transition hover:border-white/60 hover:text-white md:left-6"
      >
        <ArrowIcon deg={180} style={{ width: '1em', height: '1em' }} />
      </button>
      <button
        type="button"
        onClick={() => onNavigate((index + 1) % works.length)}
        aria-label="next photo"
        className="absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 text-white/75 transition hover:border-white/60 hover:text-white md:right-6"
      >
        <ArrowIcon style={{ width: '1em', height: '1em' }} />
      </button>

      <motion.img
        key={work.id}
        src={work.image}
        alt="photography"
        className="relative max-h-[88vh] max-w-full rounded-[2px] object-contain shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
        draggable={false}
      />
    </motion.div>
  )
}

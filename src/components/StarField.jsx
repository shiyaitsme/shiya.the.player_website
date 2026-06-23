import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stars, pickRandomWork } from '../data/projects'

/**
 * Feature A — scattered black star "Gachapon" nodes at the Figma coordinates.
 * Prefers the user's exported star art (/assets/star.svg). If it isn't there
 * yet, falls back to a Gravitas asterisk. Click → random work + soft bloom.
 */
export default function StarField({ onSelect }) {
  const [bloom, setBloom] = useState(null)
  const [starOk, setStarOk] = useState(false)

  useEffect(() => {
    let live = true
    const img = new Image()
    img.onload = () => live && setStarOk(true)
    img.onerror = () => live && setStarOk(false)
    img.src = '/assets/star.svg'
    return () => {
      live = false
    }
  }, [])

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
      {stars.map((s, i) => (
        <motion.button
          key={i}
          type="button"
          aria-label="Open a random work"
          onClick={fire}
          className="star-asterisk pointer-events-auto absolute z-30 grid place-items-center"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, fontSize: s.size }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 + i * 0.07, type: 'spring', stiffness: 220, damping: 14 }}
          whileHover={{ scale: 1.35, rotate: 90 }}
          whileTap={{ scale: 1.9 }}
        >
          {starOk ? (
            <img src="/assets/star.svg" alt="" className="h-full w-full object-contain" draggable={false} />
          ) : (
            '*'
          )}
        </motion.button>
      ))}

      <AnimatePresence>
        {bloom && (
          <motion.div
            className="pointer-events-none fixed rounded-full"
            style={{
              left: bloom.x,
              top: bloom.y,
              width: 60,
              height: 60,
              marginLeft: -30,
              marginTop: -30,
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

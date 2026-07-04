import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { mobileHub, mobileShards, mobileStars, sections, pickRandomWork } from '../data/projects'
import NavLabel from './NavLabel'
import HeroCarousel from './HeroCarousel'
import { useMobileLines } from '../hooks/useMobileLines'

/** Renders exactly the 5 connector lines the user asked for (see
 * useMobileLines.js) — no other lines. Every endpoint is snapped to a LIVE
 * element center (getBoundingClientRect), never a hand-picked coordinate,
 * so nothing can drift out of sync with the layout. */
function MobileLines({ refs, containerRef }) {
  const { through, arc, triCM, triMW, triWC, size } = useMobileLines(refs, containerRef)
  if (!size.w || !size.h) return null
  const line = (d) => d && <path d={d} stroke="#b6ff00" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full"
      viewBox={`0 0 ${size.w} ${size.h}`}
      fill="none"
      aria-hidden="true"
    >
      {line(through)}
      {line(arc)}
      {line(triCM)}
      {line(triMW)}
      {line(triWC)}
    </svg>
  )
}

function MobileShards({ onOpen, setNodeRef }) {
  return (
    <>
      {mobileShards.map((shard, i) => {
        const section = sections[shard.section]
        const open = (e) =>
          onOpen(shard.section, shard.id, e.currentTarget.getBoundingClientRect())
        return (
          // Positioning lives on a plain (non-motion) wrapper. Framer Motion
          // owns `transform` on the motion.button below for the entrance +
          // float animation — if the centering margin lived on that same
          // element, Framer's inline `transform` write would coexist fine,
          // but framer-motion silently drops `margin*` from elements it
          // animates (it reserves those keys for its own layout engine), so
          // the button would render un-centered. Keeping position and motion
          // on separate elements sidesteps that entirely.
          <div
            key={shard.id}
            className="pointer-events-none absolute z-30"
            style={{
              left: `${shard.xPct}%`,
              top: `${shard.yPct}%`,
              width: `${shard.wVw}vw`,
              marginLeft: `calc(${shard.wVw}vw / -2)`,
            }}
          >
            <motion.button
              type="button"
              onClick={open}
              aria-label={`Open ${section.nav}`}
              className="pointer-events-auto flex w-full flex-col items-center"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { delay: 0.5 + i * 0.12, duration: 0.6 },
                scale: { delay: 0.5 + i * 0.12, type: 'spring', stiffness: 140, damping: 14 },
                y: { duration: 7 + i, repeat: Infinity, ease: 'easeInOut' },
              }}
              whileTap={{ scale: 0.92 }}
            >
              {/* ref'd — this is the node the connector line snaps to */}
              <img
                ref={(el) => setNodeRef(i, el)}
                src={`/assets/green_piece_${shard.id}.png`}
                alt=""
                className="w-full select-none"
                style={{ transform: `rotate(${shard.rot}deg)` }}
                draggable={false}
              />
              <span className="mt-2 block">
                <NavLabel section={section} />
              </span>
            </motion.button>
          </div>
        )
      })}
    </>
  )
}

function MobileStars({ onSelect }) {
  const [bloom, setBloom] = useState(null)
  const [starOk, setStarOk] = useState(true)

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
      {mobileStars.map((s, i) => {
        // grow the invisible tap area toward a comfortable touch target
        const hit = Math.max(44, s.size)
        return (
          // Same split as MobileShards: centering margin on a plain wrapper,
          // Framer's transform on the motion child — see the comment there.
          <div
            key={i}
            className="pointer-events-none absolute z-30"
            style={{
              left: `${s.xPct}%`,
              top: `${s.yPct}%`,
              width: hit,
              height: hit,
              marginLeft: -hit / 2,
              marginTop: -hit / 2,
            }}
          >
            <motion.button
              type="button"
              aria-label="Open a random work"
              onClick={fire}
              className="star-asterisk pointer-events-auto grid h-full w-full place-items-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.07, type: 'spring', stiffness: 220, damping: 14 }}
              whileTap={{ scale: 1.8 }}
            >
              {starOk ? (
                <img
                  src="/assets/star.svg"
                  alt=""
                  style={{ width: s.size, height: s.size }}
                  className="object-contain"
                  draggable={false}
                  onError={() => setStarOk(false)}
                />
              ) : (
                <span style={{ fontSize: s.size }}>*</span>
              )}
            </motion.button>
          </div>
        )
      })}

      <AnimatePresence>
        {bloom && (
          <motion.div
            className="pointer-events-none fixed rounded-full"
            style={{
              left: bloom.x - 30,
              top: bloom.y - 30,
              width: 60,
              height: 60,
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

/**
 * Phone-width map: a proportional, generative layout (see the `mobileHub` /
 * `mobileShards` / `mobileStars` comment in projects.js) instead of the
 * desktop's pixel-1:1 1440x900 stage. The hub sits mid-screen with the 4
 * shards fanned around it; the 5 connector lines are drawn by
 * useMobileLines.js, which snaps every endpoint to each element's live
 * on-screen center — they can't drift out of alignment no matter how the %
 * anchors are tuned.
 */
export default function MobileMap({ onOpen, onSelectWork }) {
  const containerRef = useRef(null)
  const hubRef = useRef(null)
  // mobileShards order is [contact, works, about, manifesto] — index 0..3
  const nodeRefs = useRef(mobileShards.map(() => ({ current: null })))
  const setNodeRef = (i, el) => {
    nodeRefs.current[i].current = el
  }
  const lineRefs = {
    hub: hubRef,
    contact: nodeRefs.current[0],
    works: nodeRefs.current[1],
    about: nodeRefs.current[2],
    manifesto: nodeRefs.current[3],
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <MobileLines refs={lineRefs} containerRef={containerRef} />

      <div
        className="pointer-events-none absolute z-30"
        style={{ left: '50%', top: '5%', width: 36, height: 49, marginLeft: -18 }}
      >
        <motion.img
          src="/assets/logo_s.svg"
          alt="Shiya the Player"
          className="h-full w-full animate-floaty"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        />
      </div>

      <div
        ref={hubRef}
        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${mobileHub.xPct}%`,
          top: `${mobileHub.yPct}%`,
          width: `${mobileHub.wVw}vw`,
          height: `${mobileHub.wVw * 1.23}vw`,
        }}
      >
        <HeroCarousel mobile />
      </div>

      <MobileStars onSelect={onSelectWork} />
      <MobileShards onOpen={onOpen} setNodeRef={setNodeRef} />
    </div>
  )
}

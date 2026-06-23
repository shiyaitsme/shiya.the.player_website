import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import NumberBadge from './NumberBadge'

/**
 * One portfolio piece: bottle-cap number + media (image or video) + editorial
 * Playfair copy + optional link. Reveals on scroll; the media gets a soft
 * cursor-tilt (a small, performant touch of craft). Fully responsive.
 */
export default function WorkBlock({ work, index = 0, single = false }) {
  const mediaRef = useRef(null)
  const [imgOk, setImgOk] = useState(true)
  const flip = index % 2 === 1 // alternate sides for rhythm

  const onTilt = (e) => {
    const el = mediaRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${py * -7}deg) scale(1.02)`
  }
  const resetTilt = () => {
    if (mediaRef.current) mediaRef.current.style.transform = ''
  }

  return (
    <motion.article
      className={`flex flex-col items-start gap-6 md:gap-10 ${
        flip ? 'md:flex-row-reverse' : 'md:flex-row'
      }`}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15%' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* media */}
      <div className="w-full md:w-[52%]">
        <div
          ref={mediaRef}
          onMouseMove={onTilt}
          onMouseLeave={resetTilt}
          className="relative overflow-hidden rounded-[3px] shadow-[0_22px_50px_rgba(40,30,60,0.32)] transition-transform duration-200 ease-out will-change-transform"
          style={{ aspectRatio: '16 / 10', background: 'radial-gradient(120% 120% at 30% 20%, #2b2545, #0e0b1c 72%)' }}
        >
          {work.video ? (
            <video
              className="h-full w-full object-contain"
              src={work.video}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : imgOk ? (
            <img
              src={work.image}
              alt={work.title}
              className="h-full w-full object-cover"
              onError={() => setImgOk(false)}
              draggable={false}
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-center font-body text-xs uppercase tracking-[0.3em] text-white/55">
              {work.title}
            </span>
          )}
          {/* number badge tucked on the media corner */}
          <div className="absolute -left-3 -top-3 md:-left-4 md:-top-4">
            <NumberBadge n={work.number} size={single ? 60 : 52} />
          </div>
        </div>
      </div>

      {/* copy */}
      <div className="w-full font-serif text-ink md:w-[48%]">
        <h3 className="text-3xl leading-tight md:text-[34px]">
          {work.title} <span aria-hidden>{work.emoji}</span>
        </h3>
        {work.body.map((para, i) => (
          <p key={i} className="mt-4 text-[16px] leading-relaxed md:text-[18px]">
            {para}
          </p>
        ))}
        {work.link && (
          <a
            href={work.link.href}
            target="_blank"
            rel="noreferrer"
            className="nav-label mt-6 inline-block lowercase"
          >
            ↗ {work.link.label}
          </a>
        )}
      </div>
    </motion.article>
  )
}

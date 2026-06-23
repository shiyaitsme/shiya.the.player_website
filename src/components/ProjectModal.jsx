import { useEffect } from 'react'
import { motion } from 'framer-motion'
import ArchDiagram from './ArchDiagram'
import CodeBlock from './CodeBlock'

/**
 * ProjectModal — the "project deep-dive" / case-study overlay opened from a
 * work in the Works page.
 *
 * Props:
 *   project : a work object; its `caseStudy` drives the body
 *             { goal, architecture:{caption,nodes[]}, code:{language,snippet}, analysis:[] }
 *   onClose : close handler (also bound to Esc + backdrop click)
 *
 * Style — frosted "glassmorphism" tuned to the site's iridescent gradient, so
 * the panel reads as part of the dreamy background rather than a hard dialog.
 * Motion — light, slow, flowing (soft easing, gentle scale + lift), so the
 * window breathes in/out without a jarring stop. Mounted under <AnimatePresence>
 * by the caller so the exit animation plays.
 */
const EASE = [0.22, 1, 0.36, 1] // gentle, flowing ease-out

export default function ProjectModal({ project, onClose }) {
  const cs = project?.caseStudy || {}

  // Esc to close + lock body scroll while open
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto overscroll-contain px-4 py-[6vh] md:py-[8vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* tinted, blurred scrim that melts into the gradient (click to close) */}
      <div
        className="fixed inset-0 bg-[#1a1726]/30 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      {/* glass panel */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} case study`}
        className="relative w-full max-w-3xl overflow-hidden rounded-[26px] border border-white/30 bg-white/15 shadow-[0_30px_80px_rgba(26,23,38,0.4)] backdrop-blur-2xl"
        initial={{ opacity: 0, scale: 0.965, y: 26 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.985, y: 16 }}
        transition={{ duration: 0.62, ease: EASE }}
        style={{ willChange: 'transform, opacity' }}
      >
        {/* faint iridescent sheen across the glass */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(120% 90% at 12% 0%, rgba(174,185,236,0.35) 0%, rgba(174,185,236,0) 45%), radial-gradient(120% 90% at 100% 10%, rgba(242,182,212,0.32) 0%, rgba(242,182,212,0) 50%)',
          }}
          aria-hidden
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-white/20 text-ink/80 transition hover:bg-white/40"
        >
          <span className="text-lg leading-none">×</span>
        </button>

        <div className="relative max-h-[82vh] overflow-y-auto px-6 py-8 md:px-10 md:py-10">
          {/* [Header] title + research goal */}
          <header>
            <span className="font-body text-[11px] uppercase tracking-[0.4em] text-ink/55">
              case study · {String(project.number).padStart(2, '0')}
            </span>
            <h2 className="mt-2 font-serif text-3xl lowercase text-ink md:text-5xl">
              {project.title} <span aria-hidden>{project.emoji}</span>
            </h2>
            {cs.goal && (
              <p className="mt-4 max-w-2xl font-serif text-[17px] leading-relaxed text-ink/80 md:text-[19px]">
                <span className="font-body text-[11px] uppercase tracking-[0.3em] text-lime-grass">
                  research goal —{' '}
                </span>
                {cs.goal}
              </p>
            )}
          </header>

          {/* [Section 1] technical architecture */}
          <Section label="01 · technical architecture">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 md:p-6">
              <ArchDiagram nodes={cs.architecture?.nodes} />
            </div>
            {cs.architecture?.caption && (
              <p className="mt-3 font-body text-[13px] leading-relaxed text-ink/60">
                {cs.architecture.caption}
              </p>
            )}
          </Section>

          {/* [Section 2] core code */}
          <Section label="02 · core code">
            <CodeBlock code={cs.code?.snippet} language={cs.code?.language} />
          </Section>

          {/* [Section 3] critical analysis */}
          {cs.analysis?.length > 0 && (
            <Section label="03 · critical analysis">
              <div className="flex flex-col gap-4 font-serif text-[16px] leading-relaxed text-ink/80 md:text-[18px]">
                {cs.analysis.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </Section>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function Section({ label, children }) {
  return (
    <section className="mt-9 border-t border-white/20 pt-7">
      <h3 className="mb-4 font-body text-[12px] uppercase tracking-[0.34em] text-ink/55">
        {label}
      </h3>
      {children}
    </section>
  )
}

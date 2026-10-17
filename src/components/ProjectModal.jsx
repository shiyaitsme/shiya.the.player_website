import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ArchDiagram from './ArchDiagram'
import CodeBlock from './CodeBlock'
import { workNumber } from '../data/projects'

/**
 * ProjectModal — the "project deep-dive" / case-study overlay opened from a
 * work in the Works page.
 *
 * Props:
 *   project : a work object; its `caseStudy` drives the body. Two shapes:
 *     - simple  { tools:[], image?, body:[] } — a short, plain "what I made
 *       it with" writeup for process-based pieces (3D/AI/video-edit tools,
 *       not code). This is the shape new work entries should use.
 *     - code    { goal, architecture:{caption,nodes[]}, code:{language,snippet},
 *       analysis:[] } — the older, code-project shape (kept for the two
 *       existing pieces that actually are code/shader work).
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
  const isSimple = Array.isArray(cs.tools)

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
      className="no-scrollbar fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto overscroll-contain px-4 py-[6vh] md:py-[8vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* dark blurred scrim (click to close) */}
      <div
        className="fixed inset-0 bg-[#060606]/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      {/* glass panel */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${project.title} case study`}
        className="relative w-full max-w-3xl overflow-hidden border border-white/85 bg-[#090909]"
        initial={{ opacity: 0, scale: 0.965, y: 26 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.985, y: 16 }}
        transition={{ duration: 0.62, ease: EASE }}
        style={{ willChange: 'transform, opacity' }}
      >
        {/* inner hairline of the double rule */}
        <div className="pointer-events-none absolute inset-[6px] border border-white/35" aria-hidden />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center border border-white/60 text-ink/80 transition hover:bg-white hover:text-night"
        >
          <span className="text-lg leading-none">×</span>
        </button>

        <div className="no-scrollbar relative max-h-[82vh] overflow-y-auto px-6 py-8 md:px-10 md:py-10">
          {/* [Header] title + research goal */}
          <header>
            <span className="font-body text-[11px] uppercase tracking-[0.4em] text-ink/55">
              case study · {String(workNumber(project.id)).padStart(2, '0')}
            </span>
            <h2 className="mt-2 font-script text-5xl font-normal lowercase leading-[1.05] text-ink md:text-7xl">
              {project.title} <span aria-hidden>{project.emoji}</span>
            </h2>
            {cs.goal && (
              <p className="mt-4 max-w-2xl font-body font-light text-[16px] leading-relaxed text-ink/80 md:text-[18px]">
                <span className="font-body text-[11px] uppercase tracking-[0.3em] text-white">
                  research goal —{' '}
                </span>
                {cs.goal}
              </p>
            )}
          </header>

          {isSimple ? (
            <>
              {/* [Section] tools */}
              <Section label="made with">
                <div className="flex flex-wrap gap-2">
                  {cs.tools.map((tool) => (
                    <span
                      key={tool}
                      className="border border-white/40 px-3 py-1 font-body text-xs uppercase tracking-[0.15em] text-ink/70"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </Section>

              {/* [Section] process image(s), if there are any */}
              {cs.image &&
                (Array.isArray(cs.image) ? cs.image : [cs.image]).map((src, i) => (
                  <DeepDiveImage key={src} src={src} alt={`${project.title} process ${i + 1}`} />
                ))}

              {/* [Section] short writeup — a body entry is either a plain
                  paragraph string, {heading, text, image} for a labeled
                  section with its own inline screenshot, or {images: [a, b]}
                  for a standalone side-by-side pair with no text of its own. */}
              {cs.body?.length > 0 && (
                <div className="mt-6 flex flex-col gap-5 font-body font-light text-[15px] leading-relaxed text-ink/80 md:text-[17px]">
                  {cs.body.map((para, i) => {
                    if (typeof para === 'string') return <p key={i}>{para}</p>
                    if (para.images) {
                      return (
                        <div key={i} className="grid grid-cols-2 gap-4">
                          {para.images.map((src, j) => (
                            <DeepDiveImage
                              key={src}
                              src={src}
                              alt={`${project.title} process ${i + 1}.${j + 1}`}
                              className=""
                            />
                          ))}
                        </div>
                      )
                    }
                    return (
                      <div key={i} className="flex flex-col gap-3">
                        {para.heading && (
                          <p className="font-body text-[11px] uppercase tracking-[0.3em] text-white">
                            {para.heading}
                          </p>
                        )}
                        <p>{para.text}</p>
                        {para.image && (
                          <DeepDiveImage src={para.image} alt={`${project.title} — ${para.heading}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {/* [Section 1] technical architecture */}
              <Section label="01 · technical architecture">
                <div className="border border-white/25 bg-white/5 p-4 md:p-6">
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
                  <div className="flex flex-col gap-4 font-body font-light text-[15px] leading-relaxed text-ink/80 md:text-[17px]">
                    {cs.analysis.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </Section>
              )}
            </>
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

/** A deep-dive process screenshot (e.g. a node graph or an effects
 *  breakdown) — quietly disappears on load failure instead of showing a
 *  broken-image icon, since these assets may not be uploaded yet. */
function DeepDiveImage({ src, alt, className = 'mt-6' }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <div className={`overflow-hidden border border-white/25 ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setOk(false)} />
    </div>
  )
}

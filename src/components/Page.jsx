import { lazy, Suspense, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import WorkBlock from './WorkBlock'
import NumberBadge from './NumberBadge'
import ProjectModal from './ProjectModal'
import SafeMount from './butterfly/SafeMount'
import { works } from '../data/projects'

// 3D scenes — lazy so three.js stays out of the main bundle
const ButterflyEgg = lazy(() => import('./butterfly/ButterflyEgg'))
const WorldArchive = lazy(() => import('./butterfly/WorldArchive'))

/**
 * The content page a shard / star opens into. Soft section background image
 * (consistent per section), editorial Playfair copy, scrollable + responsive.
 *
 * view:
 *   { type:'section', section }  → works list | about | contact | manifesto
 *   { type:'work', work }        → a single piece (random Gachapon pull)
 */
export default function Page({ view, onClose }) {
  const section = view.type === 'section' ? view.section : null
  const bg = section ? section.bg : '/assets/bg_1.png'
  const [caseProject, setCaseProject] = useState(null) // open project deep-dive
  const [entering, setEntering] = useState(false) // brief white "fall" flash
  const [archiveOpen, setArchiveOpen] = useState(false) // 3D world archive

  // butterfly clicked → flash white, then drop into the 3D archive world
  const enterArchiveWorld = () => {
    setEntering(true)
    window.setTimeout(() => {
      setArchiveOpen(true)
      setEntering(false)
    }, 650)
  }

  return (
    <motion.div
      className="no-scrollbar fixed inset-0 z-[80] overflow-y-auto overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* fixed soft background (parallaxes against the scroll) */}
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="grain" />

      {/* sticky top bar */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 md:px-12"
        style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="nav-label lowercase"
        >
          ↩ map
        </button>
        <span className="font-display text-sm uppercase tracking-[0.3em] text-ink/70">
          {section ? section.title : 'works'}
        </span>
      </div>

      <div
        className="relative mx-auto max-w-5xl px-6 pt-[4vh] md:px-12"
        style={{ paddingBottom: 'max(18vh, calc(4vh + env(safe-area-inset-bottom)))' }}
      >
        {/* big title */}
        <motion.h1
          className="mb-12 font-serif text-4xl lowercase text-ink sm:text-5xl md:mb-20 md:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
        >
          {section ? section.title : view.work.title}
        </motion.h1>

        {/* ---- WORKS SECTION: list every piece ---- */}
        {section?.kind === 'works' && (
          <div className="flex flex-col gap-24 md:gap-36">
            {works.map((w, i) => (
              <WorkBlock key={w.id} work={w} index={i} onOpenCase={setCaseProject} />
            ))}
          </div>
        )}

        {/* ---- SINGLE WORK (Gachapon) ---- */}
        {view.type === 'work' && (
          <WorkBlock
            work={view.work}
            index={works.findIndex((w) => w.id === view.work.id)}
            single
            onOpenCase={setCaseProject}
          />
        )}

        {/* ---- TEXT SECTIONS: about / contact / manifesto ---- */}
        {section?.kind === 'text' && (
          <div className="max-w-2xl font-serif text-ink">
            {section.badge != null && (
              <div className="mb-8">
                <NumberBadge n={section.badge} size={64} />
              </div>
            )}
            {section.body.map((para, i) => (
              <motion.p
                key={i}
                className="mb-6 text-[18px] leading-relaxed md:text-[22px]"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
              >
                {para}
              </motion.p>
            ))}

            {/* about → skills */}
            {section.skills && (
              <ul className="mt-10 grid grid-cols-1 gap-2 font-body text-sm uppercase tracking-[0.2em] text-ink/75 sm:grid-cols-2">
                {section.skills.map((s) => (
                  <li key={s} className="flex items-center gap-2">
                    <span aria-hidden className="text-lime-grass">✦</span>
                    {s}
                  </li>
                ))}
              </ul>
            )}

            {/* contact → links */}
            {section.links && (
              <div className="mt-10 flex flex-col gap-4">
                {section.links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-baseline gap-4"
                  >
                    <span className="font-body text-xs uppercase tracking-[0.3em] text-ink/55">
                      {l.label}
                    </span>
                    <span className="nav-label lowercase">{l.value}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3D butterfly easter egg (Works page only, hidden once we've dropped in) */}
      {section?.kind === 'works' && !archiveOpen && (
        <SafeMount>
          <Suspense fallback={null}>
            <ButterflyEgg onEnter={enterArchiveWorld} />
          </Suspense>
        </SafeMount>
      )}

      {/* the 3D world archive (entered by clicking the butterfly) */}
      <AnimatePresence>
        {archiveOpen && (
          <SafeMount key="archive">
            <Suspense fallback={null}>
              <WorldArchive onClose={() => setArchiveOpen(false)} />
            </Suspense>
          </SafeMount>
        )}
      </AnimatePresence>

      {/* rabbit-hole teaser (placeholder until the archive world is wired) */}
      <AnimatePresence>
        {entering && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[130] grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xl" />
            <motion.span
              className="relative font-serif text-2xl lowercase text-ink/80 md:text-4xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              falling into the archive…
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* project deep-dive / case-study modal */}
      <AnimatePresence>
        {caseProject && (
          <ProjectModal project={caseProject} onClose={() => setCaseProject(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

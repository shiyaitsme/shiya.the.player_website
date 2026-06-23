import { motion } from 'framer-motion'
import WorkBlock from './WorkBlock'
import NumberBadge from './NumberBadge'
import { works } from '../data/projects'

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

  return (
    <motion.div
      className="fixed inset-0 z-[80] overflow-y-auto overflow-x-hidden"
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
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 md:px-12">
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

      <div className="relative mx-auto max-w-5xl px-6 pb-[18vh] pt-[4vh] md:px-12">
        {/* big title */}
        <motion.h1
          className="mb-12 font-serif text-5xl lowercase text-ink md:mb-20 md:text-7xl"
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
              <WorkBlock key={w.id} work={w} index={i} />
            ))}
          </div>
        )}

        {/* ---- SINGLE WORK (Gachapon) ---- */}
        {view.type === 'work' && <WorkBlock work={view.work} single />}

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
    </motion.div>
  )
}

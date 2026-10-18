/**
 * Page footer: just a quiet colophon. Contact details deliberately do NOT
 * live here — the user pointed out the Contact page on the map already has
 * them, so repeating them at the bottom was redundant. A plain solid
 * full-width hairline (no ornament — the user asked for it solid), then one
 * bar of small spaced caps (credit / what the site is / back to top).
 */
export default function HomeFooter() {
  return (
    <footer className="relative z-20 mt-[clamp(56px,7vw,104px)] w-full text-white">
      <div className="mx-[17px] h-px bg-white/35" aria-hidden="true" />

      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-3 px-[clamp(24px,11vw,160px)] py-8 font-body text-[12px] uppercase tracking-[0.3em] text-white/80 sm:grid sm:grid-cols-3">
        <span className="sm:justify-self-start">© 2026 Shiya the Player</span>
        <span className="sm:justify-self-center">3D · AI art · Motion</span>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="uppercase tracking-[0.3em] transition-colors hover:text-white sm:justify-self-end"
        >
          Back to top
        </button>
      </div>
    </footer>
  )
}

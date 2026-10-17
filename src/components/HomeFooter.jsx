/**
 * Page footer: just a quiet colophon. Contact details deliberately do NOT
 * live here — the user pointed out the Contact page on the map already has
 * them, so repeating them at the bottom was redundant. A hairline rule
 * broken by the Afterglow outlined-box-and-dot ornament, then one bar of
 * small spaced caps (credit / what the site is / back to top).
 */
export default function HomeFooter() {
  return (
    <footer className="relative z-20 w-full text-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-[clamp(20px,4vw,56px)] pt-[clamp(56px,7vw,104px)]" aria-hidden="true">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/45" />
        <span className="relative block h-[11px] w-[11px] border border-white/80">
          <span className="absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/45" />
      </div>

      <div className="mx-auto mt-[clamp(28px,3vw,44px)] flex max-w-[1440px] flex-col items-center gap-3 px-[clamp(20px,4vw,56px)] pb-9 font-body text-[12px] uppercase tracking-[0.3em] text-white/80 sm:grid sm:grid-cols-3">
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

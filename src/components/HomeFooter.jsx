import { sections } from '../data/projects'

const links = sections.contact.links
const email = links.find((l) => l.label === 'email')
const socials = links.filter((l) => l.label !== 'email')

/**
 * Page footer, after the Afterglow reference (script title, one line of
 * copy, hairline-ruled colophon bar) but with portfolio content and NO form
 * or input — the user didn't want to ask visitors for their email. The
 * contact email is shown as a plain mailto link, with the social accounts
 * below it. Contact data comes from
 * `sections.contact.links` so it only ever has to be edited in one place.
 */
export default function HomeFooter() {
  return (
    <footer className="relative z-20 w-full text-white">
      <div className="mx-auto max-w-[1440px] px-[clamp(20px,4vw,56px)] pb-[clamp(48px,5vw,72px)] pt-[clamp(72px,8vw,120px)]">
        <h2 className="m-0 font-script text-[clamp(56px,7vw,104px)] font-normal leading-none">Get in touch</h2>
        <p className="mb-0 mt-[clamp(24px,3vw,40px)] max-w-[720px] font-body text-[clamp(17px,1.7vw,24px)] font-light leading-[1.6]">
          Open to collaborations, commissions and new projects.
        </p>

        <a
          href={email.href}
          className="mt-[clamp(32px,4vw,56px)] inline-block break-all border-b border-white/50 pb-2 font-body text-[clamp(20px,2.6vw,36px)] font-light text-white transition-colors hover:border-white"
        >
          {email.value}
        </a>

        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 font-body text-[13px] uppercase tracking-[0.28em]">
          {socials.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-transparent pb-1 text-white/80 transition-colors hover:border-white hover:text-white"
            >
              {l.label} <span className="text-white/45">{l.value}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-white/30">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-3 px-[clamp(20px,4vw,56px)] py-8 font-body text-[12px] uppercase tracking-[0.3em] text-white/80 sm:grid sm:grid-cols-3">
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
      </div>
    </footer>
  )
}

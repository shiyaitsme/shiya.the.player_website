import { sections } from '../data/projects'

const links = sections.contact.links
const email = links.find((l) => l.label === 'email')
const socials = links.filter((l) => l.label !== 'email')

/**
 * Page footer, laid out after the Afterglow reference (script title, one
 * line of copy, an outlined field beside a solid white button, then a
 * hairline-ruled colophon bar) but with portfolio content: the email address
 * sits in the outlined field and the white button opens a mail to it; the
 * social accounts follow as plain links. Contact data comes from
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

        <div className="mt-[clamp(40px,5vw,72px)]">
          <div className="font-body text-[13px] uppercase tracking-[0.28em]">Email</div>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:gap-7">
            <a
              href={email.href}
              className="min-w-0 flex-1 break-all rounded-none border border-white/85 px-6 py-5 font-body text-[18px] font-light text-white transition-colors hover:border-white hover:bg-white/5"
            >
              {email.value}
            </a>
            <a
              href={email.href}
              className="rounded-none border border-white bg-white px-14 py-5 text-center font-body text-[13px] uppercase tracking-[0.32em] text-[#0b0b0b] transition-colors hover:bg-transparent hover:text-white"
            >
              Say hello
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-3 font-body text-[13px] uppercase tracking-[0.28em]">
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

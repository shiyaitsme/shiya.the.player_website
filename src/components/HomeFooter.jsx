import { useState } from 'react'
import { sections } from '../data/projects'

const EMAIL = sections.contact.links.find((l) => l.label === 'email')?.value

/**
 * Page footer, after the Afterglow reference: a script "Write to me" title,
 * one line of copy, an outlined email field with a solid white SEND button,
 * then a hairline rule over a spaced-caps colophon bar.
 *
 * There is no backend, so SEND opens the visitor's own mail app addressed to
 * the contact email, with their address prefilled in the body.
 */
export default function HomeFooter() {
  const [from, setFrom] = useState('')

  const send = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent('Hello from your portfolio')
    const body = encodeURIComponent(`Reply to: ${from}\n\n`)
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`
  }

  return (
    <footer className="relative z-20 w-full text-white">
      <div className="mx-auto max-w-[1440px] px-[clamp(20px,4vw,56px)] pb-[clamp(48px,5vw,72px)] pt-[clamp(72px,8vw,120px)]">
        <h2 className="m-0 font-script text-[clamp(56px,7vw,104px)] font-normal leading-none">Write to me</h2>
        <p className="mb-0 mt-[clamp(24px,3vw,40px)] max-w-[720px] font-body text-[clamp(17px,1.7vw,24px)] font-light leading-[1.6]">
          Leave an address and I will answer when the lights are low.
        </p>

        <form onSubmit={send} className="mt-[clamp(40px,5vw,72px)]">
          <label htmlFor="footer-email" className="block font-body text-[13px] uppercase tracking-[0.28em]">
            Email
          </label>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:gap-7">
            <input
              id="footer-email"
              type="email"
              required
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="you@domain.com"
              className="min-w-0 flex-1 rounded-none border border-white/85 bg-transparent px-6 py-5 font-body text-[18px] font-light text-white outline-none placeholder:text-white/40 focus:border-white"
            />
            <button
              type="submit"
              className="rounded-none border border-white bg-white px-14 py-5 font-body text-[13px] uppercase tracking-[0.32em] text-[#0b0b0b] transition-colors hover:bg-transparent hover:text-white"
            >
              Send
            </button>
          </div>
        </form>
      </div>

      <div className="border-t border-white/30">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-3 px-[clamp(20px,4vw,56px)] py-8 font-body text-[12px] uppercase tracking-[0.3em] text-white/80 sm:grid sm:grid-cols-3">
          <span className="sm:justify-self-start">© 2026 Shiya the Player</span>
          <span className="sm:justify-self-center">Made in grain and light</span>
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

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import ArrowIcon from './ArrowIcon'
import useIsMobile from '../hooks/useIsMobile'

/** Outlined pill with two different fill interactions:
 *  - desktop: the fill grows as a circle from wherever the cursor
 *    enters/moves (--mx/--my tracked on mousemove), via :hover.
 *  - mobile: touch has no reliable :hover (and no mouseleave to clear a
 *    "stuck" hover after a tap), and Safari/WebKit has also been seen to
 *    fail parsing `circle(0% at var(--mx) var(--my))` — the var() inside
 *    the position silently invalidates the whole clip-path, which then
 *    defaults to "no clipping" = permanently fully filled. So mobile
 *    skips :hover and circle() entirely: a tap sets `tapped`, which
 *    switches a plain inset() clip-path from "collapsed at the bottom
 *    edge" to "fully open" — a simple bottom-up wipe, no var() involved. */
// how long the bottom-up wipe gets to play before the tap actually
// navigates — long enough to read as an animation, short enough that the
// tap still feels responsive (the fill's own transition is 0.85s total)
const MOBILE_TAP_NAV_DELAY = 450

function LinkPill({ href, label }) {
  const ref = useRef(null)
  const isMobile = useIsMobile()
  const [tapped, setTapped] = useState(false)
  const navigating = useRef(false)

  const trackMouse = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  // on mobile, a real <a target="_blank"> navigates near-instantly — the
  // tab switches away before the fill has any time to visibly play. So we
  // hold the tap here, let the wipe animate, then open it ourselves.
  const handleMobileTap = (e) => {
    e.preventDefault()
    setTapped(true)
    if (navigating.current) return
    navigating.current = true
    window.setTimeout(() => {
      window.open(href, '_blank', 'noopener,noreferrer')
    }, MOBILE_TAP_NAV_DELAY)
  }

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={isMobile ? undefined : trackMouse}
      onMouseMove={isMobile ? undefined : trackMouse}
      onClick={isMobile ? handleMobileTap : undefined}
      className={`link-pill lowercase ${isMobile ? 'link-pill-mobile' : ''} ${tapped ? 'is-filled' : ''}`}
      // real values from first paint — never rely on var(--mx, 50%)'s
      // fallback inside circle()'s position argument, which is unreliable
      // (see the note above the component)
      style={{ '--mx': '50%', '--my': '50%' }}
    >
      <span className="link-pill-fill" aria-hidden="true" />
      <span className="link-pill-label">
        <ArrowIcon deg={-45} className="link-pill-icon" />
        {label}
      </span>
    </a>
  )
}

/**
 * One portfolio piece: bottle-cap number + media (image or video) + editorial
 * Playfair copy + optional link. Reveals on scroll; the media gets a soft
 * cursor-tilt (a small, performant touch of craft). Fully responsive.
 */
/** Wraps the media in a link (new tab) when there's exactly one place to send
 *  people — with two+ links (e.g. an Instagram reel AND a Xiaohongshu post)
 *  it's ambiguous which one the poster itself should open, so those render
 *  as separate labeled links under the copy instead (see below). */
function MediaWrap({ link, children }) {
  if (!link) return children
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer"
      aria-label={link.label}
      className="group block cursor-pointer"
    >
      {children}
    </a>
  )
}

export default function WorkBlock({ work, index = 0, single = false, onOpenCase }) {
  const mediaRef = useRef(null)
  const [imgOk, setImgOk] = useState(true)
  const flip = index % 2 === 1 // alternate sides for rhythm
  const links = work.links || []

  // Videos have no native lazy-load equivalent (unlike <img loading="lazy">
  // below) and autoplay immediately once mounted — with 60+ works on one
  // page that's 60+ simultaneous video downloads. Only mount the <video>
  // (and let it start fetching/playing) once it's within 600px of the
  // viewport; before that render the same placeholder background the
  // broken-image state uses, so there's no layout jump.
  const [videoInView, setVideoInView] = useState(false)
  useEffect(() => {
    if (!work.video || videoInView) return
    const el = mediaRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideoInView(true)
          io.disconnect()
        }
      },
      { rootMargin: '600px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [work.video, videoInView])

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
      {/* media — a clickable poster only when there's a single, unambiguous link out */}
      <div className="w-full md:w-[52%]">
        <MediaWrap link={work.video || links.length !== 1 ? null : links[0]}>
          <div
            ref={mediaRef}
            onMouseMove={onTilt}
            onMouseLeave={resetTilt}
            className="relative overflow-hidden rounded-[3px] shadow-[0_22px_50px_rgba(40,30,60,0.32)] transition-transform duration-200 ease-out will-change-transform"
            // Only forced to a fixed box when there's no real media to show its
            // own aspect ratio — every other work keeps its native proportions
            // (a portrait piece stays portrait, a wide one stays wide) instead
            // of being center-cropped into a uniform frame.
            style={
              (!imgOk && !work.video) || (work.video && !videoInView)
                ? { aspectRatio: '16 / 10', background: 'radial-gradient(120% 120% at 30% 20%, #2b2545, #0e0b1c 72%)' }
                : undefined
            }
          >
            {work.video ? (
              videoInView && (
                <video className="block h-auto w-full" src={work.video} autoPlay loop muted playsInline />
              )
            ) : imgOk ? (
              <img
                src={work.image}
                alt={work.title}
                className="block h-auto w-full"
                loading="lazy"
                decoding="async"
                onError={() => setImgOk(false)}
                draggable={false}
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-center font-body text-xs uppercase tracking-[0.3em] text-white/55">
                {work.title}
              </span>
            )}

            {/* play affordance over a linked poster (reads as "watch the reel") */}
            {!work.video && links.length > 0 && imgOk && (
              <span className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-black/70 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110 md:h-16 md:w-16">
                  <span className="ml-1 border-y-[10px] border-l-[16px] border-y-transparent border-l-white md:border-y-[12px] md:border-l-[19px]" />
                </span>
              </span>
            )}
          </div>
        </MediaWrap>
      </div>

      {/* copy */}
      <div className="w-full font-serif text-ink md:w-[48%]">
        {/* Single-work (Gachapon star) view already shows the title as the
            page's big <h1> in Page.jsx — repeating it here as a small <h3>
            read as a duplicated heading, so it's only shown in the works list. */}
        {!single && (
          <h3 className="text-3xl leading-tight md:text-[34px]">
            {work.title} <span aria-hidden>{work.emoji}</span>
          </h3>
        )}
        {work.body.map((para, i) => (
          <p key={i} className={i === 0 && single ? 'text-[16px] leading-relaxed md:text-[18px]' : 'mt-4 text-[16px] leading-relaxed md:text-[18px]'}>
            {para}
          </p>
        ))}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          {links.map((l) => (
            <LinkPill key={l.href} href={l.href} label={l.label} />
          ))}
          {work.caseStudy && onOpenCase && (
            <button
              type="button"
              onClick={() => onOpenCase(work)}
              className="group inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.3em] text-ink/70 transition hover:text-ink"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full border border-ink/40 text-ink/70 transition group-hover:border-ink group-hover:bg-ink/5">
                ⌖
              </span>
              project deep-dive
            </button>
          )}
        </div>
      </div>
    </motion.article>
  )
}

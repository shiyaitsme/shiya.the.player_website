/**
 * Page footer: a white cloud bank rising from the bottom edge with the site
 * name cut into it in black script — the Afterglow closing flourish.
 */
export default function HomeFooter() {
  return (
    <footer className="relative z-20 w-full overflow-hidden" style={{ height: 'clamp(260px, 30vw, 440px)' }}>
      <svg
        viewBox="0 0 1000 220"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[78%] w-full"
      >
        <path
          fill="#ffffff"
          d="M0 140 C40 90 90 80 130 110 C160 60 230 50 280 90 C320 40 400 30 450 80 C500 30 580 30 620 80 C670 40 740 40 780 90 C820 50 900 60 930 100 C960 80 990 90 1000 100 L1000 220 L0 220 Z"
        />
      </svg>
      <h2 className="absolute inset-x-0 bottom-[16%] m-0 text-center font-script text-[clamp(56px,11vw,168px)] font-normal leading-[0.95] text-[#0b0b0b]">
        Shiya the Player
      </h2>
      <p className="absolute inset-x-0 bottom-[5%] m-0 text-center font-body text-[10px] uppercase tracking-[0.24em] text-[#0b0b0b]/70">
        © 2026 Shiya the Player
      </p>
    </footer>
  )
}

/**
 * "Afterglow" engraved frame: a double hairline rule inset from the edge,
 * plus an ornate scrolled corner flourish in each corner. Purely decorative
 * (pointer-events-none), sized to fill its nearest positioned ancestor.
 *
 *   corner — flourish width (any CSS length); 0/'none' draws only the rules
 */
const CORNER_PATHS = [
  'M8 210 C8 110 30 50 96 30 C140 17 188 26 196 60 C202 86 170 98 156 80 C146 66 160 54 172 62',
  'M8 150 C22 124 58 122 68 150 C76 172 50 186 36 170 C26 158 40 144 52 152',
  'M60 8 C60 40 84 62 112 56',
  'M100 8 C120 24 150 22 176 8',
]

function Corner({ pos, size }) {
  const flip = {
    tl: undefined,
    tr: 'scaleX(-1)',
    bl: 'scaleY(-1)',
    br: 'scale(-1,-1)',
  }[pos]
  const place = {
    tl: { top: 10, left: 10 },
    tr: { top: 10, right: 10 },
    bl: { bottom: 10, left: 10 },
    br: { bottom: 10, right: 10 },
  }[pos]
  return (
    <svg
      viewBox="0 0 220 220"
      fill="none"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
      className="absolute h-auto"
      style={{ width: size, transform: flip, ...place }}
    >
      {CORNER_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
      <circle cx="204" cy="20" r="2.4" fill="#ffffff" />
    </svg>
  )
}

export default function Frame({ corner = 'clamp(72px, 9vw, 132px)', className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <div className="absolute inset-[10px] border border-white/90" />
      <div className="absolute inset-[17px] border border-white/50" />
      {corner && corner !== 'none' && (
        <>
          <Corner pos="tl" size={corner} />
          <Corner pos="tr" size={corner} />
          <Corner pos="bl" size={corner} />
          <Corner pos="br" size={corner} />
        </>
      )}
    </div>
  )
}

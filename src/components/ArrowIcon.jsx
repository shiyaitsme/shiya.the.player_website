/**
 * A plain line-drawn arrow (stroke only, no fill) — used instead of Unicode
 * arrow glyphs (←, ↗, ↩...) which some platforms render as colorful emoji
 * icons rather than plain text. Points right at deg=0; rotate via `deg`
 * (180 = left/back, -45 = up-right/external-link).
 */
export default function ArrowIcon({ deg = 0, className = '', style }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ transform: `rotate(${deg}deg)`, ...style }}
    >
      <line x1="4" y1="12" x2="18" y2="12" />
      <polyline points="12 6 18 12 12 18" />
    </svg>
  )
}

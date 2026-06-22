/**
 * Retro crimped bottle-cap number badge (pure CSS), matching the Figma demo.
 * Used to number each work on its detail page.
 */
export default function BottleCap({ number = 1, color = '#22305f', size = 56 }) {
  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* crimped outer rim (scalloped teeth) */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `repeating-conic-gradient(${color} 0deg 11deg, #f7efe2 11deg 22deg)`,
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))',
        }}
      />
      {/* cap face */}
      <div
        className="absolute rounded-full"
        style={{
          inset: size * 0.12,
          background: `radial-gradient(circle at 35% 28%, ${shade(color, 28)} 0%, ${color} 55%, ${shade(color, -22)} 100%)`,
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -2px 4px rgba(0,0,0,0.3)',
        }}
      />
      {/* number */}
      <span
        className="relative font-display leading-none text-macaron-cream"
        style={{ fontSize: size * 0.42, textShadow: '0 1px 1px rgba(0,0,0,0.4)' }}
      >
        {number}
      </span>
    </div>
  )
}

// quick hex lighten/darken
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const clamp = (v) => Math.max(0, Math.min(255, v))
  const r = clamp((n >> 16) + amt)
  const g = clamp(((n >> 8) & 0xff) + amt)
  const b = clamp((n & 0xff) + amt)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

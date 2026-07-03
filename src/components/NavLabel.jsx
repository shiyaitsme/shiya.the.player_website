import { useState } from 'react'

/**
 * The lime nav word for a section. Prefers the user's PNG artwork
 * (`/assets/<key>_lime_green.png`); falls back to styled `.nav-label` text
 * if it isn't uploaded yet. Shared by the desktop map (ShardGrid) and the
 * mobile map (MobileMap) so both stay in sync automatically.
 */
export default function NavLabel({ section, className = 'h-[26px] w-auto', style }) {
  const [imgOk, setImgOk] = useState(true)
  return imgOk ? (
    <img
      src={`/assets/${section.key}_lime_green.png`}
      alt={section.nav}
      onError={() => setImgOk(false)}
      draggable={false}
      className={`pointer-events-none select-none ${className}`}
      style={style}
    />
  ) : (
    <span className="nav-label lowercase">{section.nav}</span>
  )
}

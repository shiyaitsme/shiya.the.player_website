/**
 * The lime nav word for a section — styled text (#B6FF00, Butler Free Med
 * St) rather than the user's old PNG artwork, which is now retired. Shared
 * by the desktop map (ShardGrid) and the mobile map (MobileMap) so both stay
 * in sync automatically.
 */
export default function NavLabel({ section }) {
  return <span className="nav-label lowercase">{section.nav}</span>
}

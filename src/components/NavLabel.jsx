/**
 * The white script nav word for a section — styled text (Pinyon Script)
 * rather than image artwork. Shared by the desktop map (ShardGrid) and the
 * mobile map (MobileMap) so both stay in sync automatically.
 */
export default function NavLabel({ section }) {
  return <span className="nav-label lowercase">{section.nav}</span>
}

import { useEffect, useState } from 'react'

const QUERY = '(max-width: 767px)'

/**
 * True on narrow/phone-width viewports. Re-evaluates on resize/orientation
 * change (e.g. a foldable or a rotated phone) so the map can swap layouts
 * live instead of only at first paint.
 */
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches
  )

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}

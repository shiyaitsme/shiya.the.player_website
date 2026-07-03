/**
 * Retro bottle-cap number badge using the real /assets/number_N.png art.
 *
 * NO filter: drop-shadow — same class of bug as the nav-label text-shadow
 * (see index.css): a soft offset shadow around a small alpha-edged PNG reads
 * as a dirty/un-transparent box on some engines (reported on iOS Safari)
 * instead of a subtle shadow. Keep this flat/clean like the home shards.
 */
export default function NumberBadge({ n = 1, size = 58, className = '' }) {
  return (
    <img
      src={`/assets/number_${n}.png`}
      alt={`number ${n}`}
      width={size}
      height={size}
      className={`select-none ${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
      draggable={false}
    />
  )
}

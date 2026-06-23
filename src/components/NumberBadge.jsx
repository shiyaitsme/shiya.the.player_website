/**
 * Retro bottle-cap number badge using the real /assets/number_N.png art.
 */
export default function NumberBadge({ n = 1, size = 58, className = '' }) {
  return (
    <img
      src={`/assets/number_${n}.png`}
      alt={`number ${n}`}
      width={size}
      height={size}
      className={`select-none drop-shadow-[0_3px_6px_rgba(40,30,60,0.35)] ${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
      draggable={false}
    />
  )
}

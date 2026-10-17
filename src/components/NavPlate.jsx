import { forwardRef } from 'react'

/**
 * A map nav plate — the "Afterglow" replacement for the old green photo
 * shards. An opaque near-black card (engraved rings + a blurred white ghost
 * shape) with a double hairline frame, a script numeral and a small outlined
 * box + dot. It is opaque on purpose: the white connector lines run UNDER
 * the plates and disappear behind them, the same "lines go into the card"
 * read the old shards had.
 *
 * Fills its parent's width (callers set the width); height follows the
 * 6/7 aspect ratio. `rot` tilts the card the way the Figma shards were
 * tilted. The ref lands on the rotated card element — MobileMap snaps its
 * connector lines to that element's live center.
 */
const GHOSTS = [
  // per-plate ghost silhouette + decorative box so the four cards differ
  { l: 28, t: 16, w: 44, h: 76, r: '50% 50% 10% 10%', box: [62, 60, 34, 22] },
  { l: 40, t: 24, w: 32, h: 68, r: '50% 50% 14% 14%', box: [12, 44, 40, 26] },
  { l: 22, t: 20, w: 48, h: 70, r: '50% 50% 8% 8%', box: [58, 30, 28, 28] },
  { l: 34, t: 14, w: 36, h: 80, r: '50% 50% 12% 12%', box: [14, 66, 38, 18] },
]

const NavPlate = forwardRef(function NavPlate({ numeral, rot = 0, variant = 0 }, ref) {
  const g = GHOSTS[variant % GHOSTS.length]
  return (
    <div
      ref={ref}
      className="plate-hover w-full select-none"
      style={{ transform: `rotate(${rot}deg)` }}
    >
      <div
        className="plate-inner plate-ground relative w-full overflow-hidden"
        style={{ aspectRatio: '6 / 7' }}
      >
        <div
          className="absolute bg-white opacity-90"
          style={{
            left: `${g.l}%`,
            top: `${g.t}%`,
            width: `${g.w}%`,
            height: `${g.h}%`,
            borderRadius: g.r,
            filter: 'blur(9px)',
          }}
        />
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-25" aria-hidden="true">
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
        <div className="absolute inset-[7px] border border-white/85" />
        <div className="absolute inset-[11px] border border-white/35" />
        <span className="absolute left-[18px] top-[12px] font-script text-[34px] leading-none text-white">
          {numeral}
        </span>
        <span
          className="absolute border border-white/85"
          style={{ left: `${g.box[0]}%`, top: `${g.box[1]}%`, width: `${g.box[2]}%`, height: `${g.box[3]}%` }}
        >
          <span className="absolute left-1/2 top-1/2 h-[4px] w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </span>
      </div>
    </div>
  )
})

export default NavPlate

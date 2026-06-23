/**
 * A small, self-contained SVG pipeline diagram for the case-study "technical
 * architecture" section. It's a static inline SVG (one node per `nodes[]`
 * label, joined by arrows) — cheap to paint and easy for the user to swap for a
 * real architecture export later. Renders a soft placeholder if no nodes.
 */
export default function ArchDiagram({ nodes = [] }) {
  if (!nodes.length) {
    return (
      <div className="grid h-40 place-items-center rounded-xl border border-dashed border-white/25 bg-white/5 font-body text-xs uppercase tracking-[0.3em] text-ink/45">
        architecture diagram
      </div>
    )
  }

  const W = 820
  const H = 150
  const padX = 16
  const n = nodes.length
  const slot = (W - padX * 2) / n
  const bw = Math.min(slot - 22, 150)
  const bh = 58
  const cy = H / 2

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Pipeline: ${nodes.join(' → ')}`}
    >
      <defs>
        <linearGradient id="archNode" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
        </linearGradient>
        <marker id="archArrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#b6ff00" />
        </marker>
      </defs>

      {nodes.map((label, i) => {
        const cx = padX + slot * i + slot / 2
        const x = cx - bw / 2
        const nextCx = padX + slot * (i + 1) + slot / 2
        const edgeStart = cx + bw / 2
        const edgeEnd = nextCx - bw / 2
        return (
          <g key={label}>
            {i < n - 1 && (
              <line
                x1={edgeStart + 3}
                y1={cy}
                x2={edgeEnd - 8}
                y2={cy}
                stroke="#b6ff00"
                strokeWidth="2"
                strokeOpacity="0.7"
                markerEnd="url(#archArrow)"
              />
            )}
            <rect
              x={x}
              y={cy - bh / 2}
              width={bw}
              height={bh}
              rx="12"
              fill="url(#archNode)"
              stroke="rgba(255,255,255,0.35)"
            />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              className="fill-ink/85 font-body"
              style={{ fontSize: 13, letterSpacing: '0.02em' }}
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

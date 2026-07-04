import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import useIsMobile from '../hooks/useIsMobile'

const UNIT = 2 // each square is 2x2 world units
const GAP = 0.35
const STEP = UNIT + GAP

// How far the initial scatter sits outside each tile's final grid slot —
// >1 pushes tiles out toward/past the viewport edge so the opening frame
// reads as "surrounded by art," not a shrunk-down thumbnail array.
const SPREAD_XY = 1.5
const JITTER_XY = 0.45
// Camera only pulls back a little from the exact-fit distance at rest —
// combined with SPREAD_XY this is what keeps the opening frame full-bodied
// instead of a tiny distant cluster.
const CAMERA_START_MULT = 1.2
// Desktop only: the top and bottom rows dock slightly past the viewport
// edge (each cropped by this fraction of a tile's own height) instead of
// the whole grid comfortably fitting inside with margin — a tighter, more
// "bled to the frame" final composition.
const EDGE_CROP_FRACTION = 0.1

const smoothstep = (t) => t * t * (3 - 2 * t)
const deg = (d) => (d * Math.PI) / 180

/** Deterministic pseudo-random (mulberry32) so the scatter/wobble seeds
 *  don't reshuffle on every re-render/reload — same approach as
 *  WorldArchive's layout seed. */
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand01 = (rand) => rand()
const randRange = (rand, min, max) => min + rand() * (max - min)
const randSign = (rand) => (rand() < 0.5 ? -1 : 1)

/** Each tile's fixed final grid slot (x, y — never animated), its initial
 *  scattered pose (position/scale/opacity it starts from), and its own
 *  "kite" wobble signature (amplitude/frequency/phase per axis, all
 *  different, so 12 tiles never sway in lockstep). The reveal window
 *  (start/end) is derived from how far back a tile starts, so shallower
 *  tiles settle into the grid first and deeper ones catch up later. */
function useTileLayout(cols, rows) {
  return useMemo(() => {
    const rand = mulberry32(20260704)

    return Array.from({ length: cols * rows }, (_, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const gridX = (col - (cols - 1) / 2) * STEP
      const gridY = ((rows - 1) / 2 - row) * STEP

      const startZ = -randRange(rand, 1, 4)
      const startX = gridX * SPREAD_XY + (rand01(rand) * 2 - 1) * JITTER_XY
      const startY = gridY * SPREAD_XY + (rand01(rand) * 2 - 1) * JITTER_XY
      const startScale = randRange(rand, 0.88, 1.08)
      const startOpacity = randRange(rand, 0.5, 0.7)

      // base tilt + a wobble riding on top of it — both randomized per axis
      const baseRotX = randSign(rand) * deg(randRange(rand, 10, 20))
      const baseRotY = randSign(rand) * deg(randRange(rand, 10, 20))
      const baseRotZ = randSign(rand) * deg(randRange(rand, 3, 7))
      const wobbleAmpX = deg(randRange(rand, 4, 10))
      const wobbleAmpY = deg(randRange(rand, 4, 10))
      const wobbleAmpZ = deg(randRange(rand, 1.5, 4))
      const freqX = randRange(rand, 0.4, 1.1)
      const freqY = randRange(rand, 0.4, 1.1)
      const freqZ = randRange(rand, 0.4, 1.1)
      const phaseX = randRange(rand, 0, Math.PI * 2)
      const phaseY = randRange(rand, 0, Math.PI * 2)
      const phaseZ = randRange(rand, 0, Math.PI * 2)

      const lateness = (-startZ - 1) / 3 // 0 (shallow) .. 1 (deepest)
      const start = lateness * 0.5
      const end = Math.min(1, start + 0.55)

      return {
        gridX,
        gridY,
        startX,
        startY,
        startZ,
        startScale,
        startOpacity,
        baseRotX,
        baseRotY,
        baseRotZ,
        wobbleAmpX,
        wobbleAmpY,
        wobbleAmpZ,
        freqX,
        freqY,
        freqZ,
        phaseX,
        phaseY,
        phaseZ,
        start,
        end,
      }
    })
  }, [cols, rows])
}

/** Non-monotonic rotation envelope: through the first 70% of a tile's own
 *  local journey the tilt actually GROWS past its resting amplitude (the
 *  "brushing past at an angle" perspective swoop the reference site has),
 *  holds near that peak through 70-85%, then rapidly smooths to dead flat
 *  by 100% so every tile still docks cleanly into the grid. */
function rotationEnvelope(local) {
  if (local < 0.7) {
    return 1 + 0.6 * smoothstep(local / 0.7)
  }
  if (local < 0.85) {
    return THREE.MathUtils.lerp(1.6, 1.5, smoothstep((local - 0.7) / 0.15))
  }
  return THREE.MathUtils.lerp(1.5, 0, smoothstep((local - 0.85) / 0.15))
}

function Tile({ tile, texture, progressRef }) {
  const ref = useRef(null)

  useFrame(({ clock }) => {
    const mesh = ref.current
    if (!mesh) return
    const p = progressRef.current
    const local = THREE.MathUtils.clamp((p - tile.start) / (tile.end - tile.start), 0, 1)
    const posT = smoothstep(local)
    const t = clock.elapsedTime

    mesh.position.set(
      THREE.MathUtils.lerp(tile.startX, tile.gridX, posT),
      THREE.MathUtils.lerp(tile.startY, tile.gridY, posT),
      THREE.MathUtils.lerp(tile.startZ, 0, posT),
    )

    const envelope = rotationEnvelope(local)
    mesh.rotation.set(
      (tile.baseRotX + tile.wobbleAmpX * Math.sin(t * tile.freqX + tile.phaseX)) * envelope,
      (tile.baseRotY + tile.wobbleAmpY * Math.sin(t * tile.freqY + tile.phaseY)) * envelope,
      (tile.baseRotZ + tile.wobbleAmpZ * Math.sin(t * tile.freqZ + tile.phaseZ)) * envelope,
    )

    mesh.scale.setScalar(THREE.MathUtils.lerp(tile.startScale, 1, posT))
    if (mesh.material) mesh.material.opacity = THREE.MathUtils.lerp(tile.startOpacity, 1, posT)
  })

  return (
    <mesh ref={ref} position={[tile.startX, tile.startY, tile.startZ]}>
      <planeGeometry args={[UNIT, UNIT]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}

/** Camera dolly: reads live scroll progress off the track element's own
 *  bounding rect every frame (no React state in the hot path) and eases the
 *  actual camera position toward it with a damped lerp, so releasing the
 *  scroll gesture glides a little further before settling instead of
 *  snapping — the "inertia" the reference site has. */
function CameraRig({ trackRef, progressRef, cols, rows, cropEdges }) {
  const { camera, size } = useThree()
  const smoothed = useRef(0)

  useFrame((_, delta) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const scrollable = rect.height - window.innerHeight
    const raw = scrollable > 0 ? -rect.top / scrollable : 0
    const target = THREE.MathUtils.clamp(raw, 0, 1)

    // frame-rate independent damping
    const damping = 1 - Math.pow(0.015, delta)
    smoothed.current += (target - smoothed.current) * damping
    progressRef.current = smoothed.current

    const gridWidth = cols * STEP
    const gridHeight = rows * STEP
    const aspect = size.width / size.height
    const vFov = (camera.fov * Math.PI) / 180
    const fitWidth = gridWidth / 2 / (Math.tan(vFov / 2) * aspect)

    let fitDistance
    if (cropEdges) {
      // target a visible height slightly SHORTER than the full grid, so the
      // top/bottom rows dock partly past the viewport edge — guarded by
      // fitWidth so columns never crop on an unusually narrow window.
      const croppedHeight = gridHeight - 2 * EDGE_CROP_FRACTION * UNIT
      const fitHeightCropped = croppedHeight / 2 / Math.tan(vFov / 2)
      fitDistance = Math.max(fitHeightCropped, fitWidth)
    } else {
      const fitHeight = gridHeight / 2 / Math.tan(vFov / 2)
      fitDistance = Math.max(fitHeight, fitWidth) * 1.15
    }

    const startZ = fitDistance * CAMERA_START_MULT
    camera.position.z = THREE.MathUtils.lerp(startZ, fitDistance, smoothed.current)
  })

  return null
}

function Scene({ trackRef, cols, rows, cropEdges }) {
  const tiles = useTileLayout(cols, rows)
  const progressRef = useRef(0)
  const urls = useMemo(
    () => tiles.map((_, i) => `/assets/scroll_gallery/scroll_gallery_${String(i + 1).padStart(2, '0')}.jpg`),
    [tiles],
  )
  const textures = useTexture(urls)

  return (
    <>
      <CameraRig trackRef={trackRef} progressRef={progressRef} cols={cols} rows={rows} cropEdges={cropEdges} />
      {tiles.map((tile, i) => (
        <Tile key={i} tile={tile} texture={textures[i]} progressRef={progressRef} />
      ))}
    </>
  )
}

export default function ScrollGalleryScene({ trackRef }) {
  const isMobile = useIsMobile()
  const cols = isMobile ? 3 : 4
  const rows = isMobile ? 4 : 3

  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene trackRef={trackRef} cols={cols} rows={rows} cropEdges={!isMobile} />
    </Canvas>
  )
}

import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

const COLS = 4
const ROWS = 3
const UNIT = 2 // each square is 2x2 world units
const GAP = 0.35
const STEP = UNIT + GAP

/** Deterministic pseudo-random (mulberry32) so the scatter doesn't reshuffle
 *  on every re-render/reload — same approach as WorldArchive's layout seed. */
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

/** Base grid position (fixed, never animated) + each tile's initial depth
 *  offset and tilt (animated to 0 as its own local scroll window completes).
 *  Depth directly drives the reveal window: tiles seeded further back
 *  (more negative z) get a later window, so the camera "reaches" shallow
 *  tiles first and deep ones last — the async, staggered pass-by. */
function useTileLayout() {
  return useMemo(() => {
    const rand = mulberry32(20260704)
    const deg = (d) => (d * Math.PI) / 180

    return Array.from({ length: COLS * ROWS }, (_, i) => {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const x = (col - (COLS - 1) / 2) * STEP
      const y = ((ROWS - 1) / 2 - row) * STEP

      const depth = 1 + rand() * 4 // 1..5 world units behind the flat grid plane
      const rotX = (rand() * 2 - 1) * deg(15)
      const rotY = (rand() * 2 - 1) * deg(15)
      const rotZ = (rand() * 2 - 1) * deg(5)

      const lateness = (depth - 1) / 4 // 0 (shallow) .. 1 (deepest)
      const start = lateness * 0.5
      const end = Math.min(1, start + 0.55)

      return { x, y, depth, rotX, rotY, rotZ, start, end }
    })
  }, [])
}

function Tile({ tile, texture, progressRef }) {
  const ref = useRef(null)

  useFrame(() => {
    const mesh = ref.current
    if (!mesh) return
    const p = progressRef.current
    const local = THREE.MathUtils.clamp((p - tile.start) / (tile.end - tile.start), 0, 1)
    const eased = local * local * (3 - 2 * local) // smoothstep — gentle ease, no overshoot

    mesh.position.z = -tile.depth * (1 - eased)
    mesh.rotation.x = tile.rotX * (1 - eased)
    mesh.rotation.y = tile.rotY * (1 - eased)
    mesh.rotation.z = tile.rotZ * (1 - eased)
    const scale = 0.82 + 0.18 * eased
    mesh.scale.setScalar(scale)
    if (mesh.material) mesh.material.opacity = 0.08 + 0.92 * eased
  })

  return (
    <mesh ref={ref} position={[tile.x, tile.y, -tile.depth]}>
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
function CameraRig({ trackRef, progressRef }) {
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

    const gridWidth = COLS * STEP
    const gridHeight = ROWS * STEP
    const aspect = size.width / size.height
    const vFov = (camera.fov * Math.PI) / 180
    const fitHeight = gridHeight / 2 / Math.tan(vFov / 2)
    const fitWidth = gridWidth / 2 / (Math.tan(vFov / 2) * aspect)
    const fitDistance = Math.max(fitHeight, fitWidth) * 1.15

    const startZ = fitDistance * 3.4
    camera.position.z = THREE.MathUtils.lerp(startZ, fitDistance, smoothed.current)
  })

  return null
}

function Scene({ trackRef }) {
  const tiles = useTileLayout()
  const progressRef = useRef(0)
  const urls = useMemo(
    () => tiles.map((_, i) => `/assets/scroll_gallery/scroll_gallery_${String(i + 1).padStart(2, '0')}.jpg`),
    [tiles],
  )
  const textures = useTexture(urls)

  return (
    <>
      <CameraRig trackRef={trackRef} progressRef={progressRef} />
      {tiles.map((tile, i) => (
        <Tile key={i} tile={tile} texture={textures[i]} progressRef={progressRef} />
      ))}
    </>
  )
}

export default function ScrollGalleryScene({ trackRef }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene trackRef={trackRef} />
    </Canvas>
  )
}

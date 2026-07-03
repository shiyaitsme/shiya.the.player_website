import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import useIsMobile from '../../hooks/useIsMobile'

/**
 * ButterflyEgg — a glass butterfly easter egg on the Works page.
 *
 * Behaviour (intentionally calm, easy to click):
 *   1. FLY IN  — drifts in from a random off-screen direction (no trail).
 *   2. DOCK    — eases to a quiet resting spot in an upper corner and stops.
 *   3. IDLE    — slow "breathing" wing-flap; the DOM hotspot behind it grows
 *                on dock so it stays an easy click target (no glow).
 *   4. CLICK   — fires onEnter (fall into the World Archive).
 *
 * The <Canvas> is pointer-events:none so it never blocks the page; clicking is
 * handled by a DOM hotspot that tracks the butterfly's projected position
 * (imperative — no per-frame React). Lazy-loaded + error-bounded by the caller.
 *
 * Sized to 1/3 on phone-width viewports (targetSize) — desktop is untouched.
 */

const MODEL_URL = encodeURI(
  '/assets/green glass butterfly 3d model/green+glass+butterfly+3d+model.fbx',
)
const TEXTURE_URL = encodeURI(
  '/assets/green glass butterfly 3d model/green+glass+butterfly+3d+model.fbm/green+glass+butterfly+3d+model_basecolor.jpg',
)
const FLY_IN = 2.2 // seconds to glide in and dock
const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3)

/** Soft IBL so the glass reflects like glass, not flat plastic. */
function GlassEnvironment() {
  const { gl, scene } = useThree()
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    return () => pmrem.dispose()
  }, [gl, scene])
  return null
}

function Butterfly({ hotspotRef, targetSize }) {
  const fbx = useLoader(FBXLoader, MODEL_URL)
  const baseColor = useLoader(THREE.TextureLoader, TEXTURE_URL)
  const { camera, size } = useThree()
  const groupRef = useRef()
  const modelRef = useRef()
  const tmp = useMemo(() => new THREE.Vector3(), [])

  // normalized GLASS model (exact MeshPhysicalMaterial requested by the user)
  const { model, longAxis, baseScale } = useMemo(() => {
    const root = fbx.clone(true)
    const box = new THREE.Box3().setFromObject(root)
    const sizeV = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(sizeV.x, sizeV.y, sizeV.z) || 1
    const s = targetSize / maxDim
    root.position.sub(center)
    root.scale.setScalar(s)

    baseColor.colorSpace = THREE.SRGBColorSpace
    baseColor.flipY = false

    const glass = new THREE.MeshPhysicalMaterial({
      map: baseColor,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.75,
      ior: 1.52,
      thickness: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      side: THREE.DoubleSide,
      transparent: true,
    })
    root.traverse((o) => {
      if (o.isMesh) {
        o.material = glass
        o.castShadow = false
        o.receiveShadow = false
      }
    })
    const longAxis = sizeV.x >= sizeV.y && sizeV.x >= sizeV.z ? 'x' : sizeV.y >= sizeV.z ? 'y' : 'z'
    return { model: root, longAxis, baseScale: s }
  }, [fbx, baseColor, targetSize])

  // pick a random off-screen entry and an upper-corner resting spot (once)
  const { start, rest } = useMemo(() => {
    const aspect = size.width / size.height
    const halfH = Math.tan((50 * Math.PI) / 180 / 2) * 9 // camera fov 50 @ z=9
    const halfW = halfH * aspect
    const cornerX = (Math.random() < 0.5 ? -1 : 1) * halfW * 0.62
    const restV = new THREE.Vector3(cornerX, halfH * 0.55, 0) // upper corner
    const ang = Math.random() * Math.PI * 2
    const startV = new THREE.Vector3(
      restV.x + Math.cos(ang) * (halfW + 6),
      restV.y + Math.sin(ang) * (halfH + 6),
      Math.random() * 2 - 1,
    )
    return { start: startV, rest: restV }
  }, [size.width, size.height])

  const born = useRef(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (born.current === null) born.current = t
    const g = groupRef.current
    if (!g) return

    const age = t - born.current
    const p = THREE.MathUtils.clamp(age / FLY_IN, 0, 1)
    const e = easeOutCubic(p)
    const docked = p >= 1

    // position: glide start → rest, with a gentle arc + idle bob once docked
    g.position.x = start.x + (rest.x - start.x) * e
    g.position.y =
      start.y + (rest.y - start.y) * e + (docked ? Math.sin(t * 1.1) * 0.12 : Math.sin(p * Math.PI) * 0.6)
    g.position.z = start.z + (rest.z - start.z) * e

    // face the camera; lean toward travel while flying, sway gently when docked
    g.quaternion.copy(camera.quaternion)
    if (docked) {
      g.rotateZ(Math.sin(t * 0.8) * 0.06)
      g.rotateX(Math.sin(t * 0.6) * 0.05)
    } else {
      g.rotateZ(THREE.MathUtils.clamp((rest.x - start.x) * 0.02, -0.4, 0.4))
    }

    // wing flap: fast while flying, slow "breathing" once docked
    const m = modelRef.current
    if (m) {
      const freq = docked ? 1.6 : 5.5
      const amp = docked ? 0.32 : 0.55
      const flap = 1 - amp + amp * Math.abs(Math.sin(t * freq))
      m.scale[longAxis] = baseScale * flap
    }

    // scale-in so it doesn't pop
    g.scale.setScalar(THREE.MathUtils.clamp(age / 0.4, 0, 1))

    // project to screen → move the DOM hotspot, toggle the glow when docked
    const hs = hotspotRef.current
    if (hs) {
      tmp.copy(g.position).project(camera)
      const x = (tmp.x * 0.5 + 0.5) * size.width
      const y = (-tmp.y * 0.5 + 0.5) * size.height
      hs.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`
      hs.style.opacity = THREE.MathUtils.clamp(age / 0.4, 0, 1).toFixed(2)
      if (docked && hs.dataset.docked !== '1') hs.dataset.docked = '1'
    }
  })

  return (
    <group ref={groupRef} scale={0.001}>
      <primitive ref={modelRef} object={model} />
    </group>
  )
}

export default function ButterflyEgg({ onEnter }) {
  const hotspotRef = useRef(null)
  const isMobile = useIsMobile()
  const targetSize = isMobile ? 0.8 : 2.4 // 1/3 size on phones; desktop untouched

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ pointerEvents: 'none', background: 'transparent' }}
        dpr={[1, 2]}
      >
        <GlassEnvironment />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.4} />
        <pointLight position={[-4, -2, 3]} intensity={0.9} color="#d8ffe0" />
        <Suspense fallback={null}>
          <Butterfly hotspotRef={hotspotRef} targetSize={targetSize} />
        </Suspense>
      </Canvas>

      {/* DOM click hotspot — tracks the butterfly; grows once docked so it
          stays an obvious, easy click target (no glow — see index.css). */}
      <button
        ref={hotspotRef}
        type="button"
        onClick={onEnter}
        aria-label="Catch the butterfly"
        title="catch me…"
        className="bfly-hotspot pointer-events-auto absolute left-0 top-0"
        style={{ opacity: 0 }}
      />
    </div>
  )
}

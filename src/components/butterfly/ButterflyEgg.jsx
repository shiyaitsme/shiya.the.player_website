import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

/**
 * ButterflyEgg — a random 3D "easter egg" on the Works page.
 *
 * A green-glass butterfly (FBX) wanders the screen along a smooth
 * THREE.CatmullRomCurve3 path, trailing a time-fading particle stream for a
 * sense of life. Clicking it fires `onEnter` (the "rabbit hole" into the
 * archive world — wired separately).
 *
 * Rendering notes:
 *   • The <Canvas> is pointer-events:none so it never blocks the page; the
 *     butterfly is made clickable by a tiny DOM hotspot that tracks its
 *     projected screen position (updated imperatively — no per-frame React).
 *   • Whole thing is lazy-loaded by the Works page so three.js stays out of the
 *     main map bundle.
 */

const MODEL_URL = encodeURI(
  '/assets/green glass butterfly 3d model/green+glass+butterfly+3d+model.fbx',
)
const TRAIL_COUNT = 150
const TRAIL_LIFE = 0.85 // seconds

// ---- particle trail -------------------------------------------------------
function useTrail() {
  return useMemo(() => {
    const positions = new Float32Array(TRAIL_COUNT * 3)
    const alphas = new Float32Array(TRAIL_COUNT)
    const sizes = new Float32Array(TRAIL_COUNT)
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1))
    geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color('#b6ff00') } },
      vertexShader: `
        attribute float aAlpha;
        attribute float aSize;
        varying float vAlpha;
        void main() {
          vAlpha = aAlpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (300.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying float vAlpha;
        uniform vec3 uColor;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d) * vAlpha;
          if (a < 0.01) discard;
          gl_FragColor = vec4(uColor, a);
        }`,
    })
    return { geom, material, positions, alphas, sizes, head: { i: 0 } }
  }, [])
}

// ---- the butterfly + its trail -------------------------------------------
function Butterfly({ hotspotRef }) {
  const fbx = useLoader(FBXLoader, MODEL_URL)
  const { camera, size } = useThree()
  const groupRef = useRef()
  const modelRef = useRef()
  const trail = useTrail()
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const prev = useMemo(() => new THREE.Vector3(), [])

  // prepare a normalized, green-glass clone of the model once
  const { model, longAxis } = useMemo(() => {
    const root = fbx.clone(true)
    const box = new THREE.Box3().setFromObject(root)
    const sizeV = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(sizeV.x, sizeV.y, sizeV.z) || 1
    const s = 2.6 / maxDim
    root.position.sub(center) // center at origin
    root.scale.setScalar(s)

    const glass = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#76d96a'),
      emissive: new THREE.Color('#3a7d12'),
      emissiveIntensity: 0.45,
      roughness: 0.18,
      metalness: 0.0,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
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
  }, [fbx])

  // a smooth, closed wandering path that stays in view
  const curve = useMemo(() => {
    const aspect = size.width / size.height
    const rx = 5.5 * Math.min(1.4, aspect)
    const ry = 3.2
    const pts = []
    const n = 7
    for (let k = 0; k < n; k++) {
      pts.push(
        new THREE.Vector3(
          (Math.random() * 2 - 1) * rx,
          (Math.random() * 2 - 1) * ry,
          (Math.random() * 2 - 1) * 1.6,
        ),
      )
    }
    const c = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5)
    return c
  }, [size.width, size.height])

  // gentle fade-in
  const born = useRef(0)
  useEffect(() => {
    born.current = performance.now() / 1000
  }, [])

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const t = state.clock.elapsedTime
    const g = groupRef.current
    if (!g) return

    // --- position along the curve (with a touch of speed variation) ---
    const u = ((t * 0.045 + 0.15 * Math.sin(t * 0.6)) % 1 + 1) % 1
    curve.getPointAt(u, tmp)
    g.position.lerp(tmp, 0.12)

    // billboard to camera, with a little velocity-based banking
    g.quaternion.copy(camera.quaternion)
    const vx = g.position.x - prev.x
    g.rotateZ(THREE.MathUtils.clamp(-vx * 2.2, -0.5, 0.5))
    g.rotateX(0.15 * Math.sin(t * 1.3))
    prev.copy(g.position)

    // --- wing flap: pulse the model's longest (wingspan) axis ---
    const m = modelRef.current
    if (m) {
      const flap = 0.45 + 0.55 * Math.abs(Math.sin(t * 9))
      m.scale[longAxis] = m.userData.base * flap
    }

    // fade in
    const age = t - (born.current || t)
    const appear = THREE.MathUtils.clamp(age / 0.9, 0, 1)
    g.scale.setScalar(appear)

    // --- particle trail update ---
    const { positions, alphas, sizes, head } = trail
    head.i = (head.i + 1) % TRAIL_COUNT
    const h = head.i
    positions[h * 3] = g.position.x + (Math.random() - 0.5) * 0.15
    positions[h * 3 + 1] = g.position.y + (Math.random() - 0.5) * 0.15
    positions[h * 3 + 2] = g.position.z
    alphas[h] = 0.9 * appear
    sizes[h] = 7 + Math.random() * 6
    const decay = dt / TRAIL_LIFE
    for (let i = 0; i < TRAIL_COUNT; i++) alphas[i] = Math.max(0, alphas[i] - decay)
    trail.geom.attributes.position.needsUpdate = true
    trail.geom.attributes.aAlpha.needsUpdate = true
    trail.geom.attributes.aSize.needsUpdate = true

    // --- project to screen → move the DOM click hotspot ---
    const hs = hotspotRef.current
    if (hs) {
      tmp.copy(g.position).project(camera)
      const x = (tmp.x * 0.5 + 0.5) * size.width
      const y = (-tmp.y * 0.5 + 0.5) * size.height
      hs.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`
      hs.style.opacity = appear.toFixed(2)
    }
  })

  // stash base scale for flap math
  useEffect(() => {
    if (modelRef.current) modelRef.current.userData.base = modelRef.current.scale.x
  }, [model])

  return (
    <group ref={groupRef} scale={0.001}>
      <primitive ref={modelRef} object={model} />
      <points geometry={trail.geom} material={trail.material} frustumCulled={false} />
    </group>
  )
}

export default function ButterflyEgg({ onEnter }) {
  const hotspotRef = useRef(null)

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ pointerEvents: 'none', background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} />
        <pointLight position={[-4, -2, 3]} intensity={0.8} color="#b6ff00" />
        <Suspense fallback={null}>
          <Butterfly hotspotRef={hotspotRef} />
        </Suspense>
      </Canvas>

      {/* DOM click hotspot that tracks the butterfly (keeps the page usable) */}
      <button
        ref={hotspotRef}
        type="button"
        onClick={onEnter}
        aria-label="Follow the butterfly"
        title="follow me…"
        className="pointer-events-auto absolute left-0 top-0 h-12 w-12 cursor-pointer rounded-full"
        style={{ opacity: 0 }}
      />
    </div>
  )
}

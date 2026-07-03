import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls, MeshTransmissionMaterial, MeshReflectorMaterial, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing'
import { motion } from 'framer-motion'
import * as THREE from 'three'

/**
 * WorldArchive — black/blue retro-futurist 3D scene the butterfly drops you
 * into. A procedural checkerboard floor (with a real blurred reflection),
 * a refractive glass sphere (MeshTransmissionMaterial) as the fixed depth
 * anchor, a starfield, and a cloud of uploaded archive pictures arranged on
 * a cylinder around the sphere — camera-facing, drag-to-orbit, lazily
 * textured — finished with Bloom/ChromaticAberration/Noise/Vignette.
 *
 * These 6 images (public/assets/world_archive_pictures/) are NOT yet real
 * `works` entries in projects.js — the user hasn't written copy for them.
 * Clicking one still calls onSelectWork() (same plumbing as the star
 * Gachapon / other floating works) so the wiring is correct once she adds
 * them properly; until then the detail page they land on is minimal.
 */

const PICTURES = [
  { id: 'obsidian', title: 'obsidian', file: 'obsidian.png' },
  { id: 'see-you-in-spring', title: 'see you in spring', file: 'See_you_in_spring .png' },
  { id: 'heart-of-empire', title: 'heart of empire', file: 'heart_of_empire.png' },
  { id: 'breathing-against-the-light', title: 'breathing against the light', file: 'Breathing_against_the_light.png' },
  { id: 'limited-night', title: 'limited night', file: 'limited_night.png' },
  { id: 'the-vanishing-tree', title: 'the vanishing tree', file: 'the_vanishing_tree.png' },
]

const archiveWorks = PICTURES.map((p, i) => ({
  id: p.id,
  number: (i % 9) + 1,
  title: p.title,
  emoji: '',
  image: encodeURI(`/assets/world_archive_pictures/${p.file}`),
  body: [],
}))

/** Deterministic pseudo-random (mulberry32) so the layout doesn't reshuffle on re-render. */
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

/** Procedural black/white checker pattern, tiled, fed into MeshReflectorMaterial as a color map. */
function useCheckerTexture() {
  return useMemo(() => {
    const size = 512
    const cells = 8
    const cvs = document.createElement('canvas')
    cvs.width = cvs.height = size
    const ctx = cvs.getContext('2d')
    const cell = size / cells
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#eef1fb' : '#04050d'
        ctx.fillRect(x * cell, y * cell, cell, cell)
      }
    }
    const tex = new THREE.CanvasTexture(cvs)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(18, 18)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

/** Infinite floor: checker pattern + a real (blurred) reflection of the scene. */
function CheckerFloor() {
  const checkerMap = useCheckerTexture()
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
      <planeGeometry args={[80, 80]} />
      <MeshReflectorMaterial
        map={checkerMap}
        mirror={0.3}
        blur={[160, 60]}
        mixBlur={6}
        mixStrength={1.1}
        resolution={256}
        depthScale={1}
        minDepthThreshold={0.8}
        maxDepthThreshold={1.4}
        roughness={0.9}
        metalness={0.15}
        color="#0a0e1e"
      />
    </mesh>
  )
}

/** The fixed central depth anchor — a real IOR-refractive glass sphere. */
function GlassSphere() {
  const ref = useRef(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.15
  })
  return (
    <mesh ref={ref} position={[0, 0.4, 0]}>
      <sphereGeometry args={[1.15, 48, 48]} />
      <MeshTransmissionMaterial
        thickness={1.4}
        roughness={0.02}
        ior={1.4}
        chromaticAberration={0.06}
        anisotropy={0.3}
        distortion={0.15}
        distortionScale={0.3}
        temporalDistortion={0.1}
        color="#dfe9ff"
        background={new THREE.Color('#000014')}
        resolution={256}
        samples={4}
      />
    </mesh>
  )
}

/** Catches a missing/unloadable picture so one bad asset can't crash the scene. */
class WorkPlaneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return <FallbackPlane {...this.props} />
    return this.props.children
  }
}

/** Untextured tinted placeholder — shown before a picture has scrolled into
 *  the camera frustum (lazy-load gate) and as the error fallback. */
function FallbackPlane({ work, position, onSelect, w = 1.7, h = 2.1 }) {
  const ref = useRef(null)
  useFrame(({ camera }) => {
    if (ref.current) ref.current.lookAt(camera.position)
  })
  return (
    <group position={position}>
      <mesh
        ref={ref}
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.(work)
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#0a0e2a" emissive="#294a8f" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

/** A floating, cool-tinted archive picture: lazy-textured, camera-billboarded,
 *  brightens on hover, flashes then navigates on click. */
function WorkPlane({ work, position, onSelect }) {
  const texture = useLoader(THREE.TextureLoader, work.image)
  const ref = useRef(null)
  const rimRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const seed = useMemo(() => Math.random() * Math.PI * 2, [])
  const prevQuat = useMemo(() => new THREE.Quaternion(), [])
  const targetQuat = useMemo(() => new THREE.Quaternion(), [])

  const aspect = texture.image ? texture.image.width / texture.image.height : 1
  const h = 1.9
  const w = h * aspect

  useFrame(({ clock, camera }, delta) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    const bobY = position[1] + Math.sin(t * 0.5 + seed) * 0.16
    ref.current.position.set(position[0], bobY, position[2])

    // slight camera-facing billboard: lookAt() on the object itself correctly
    // accounts for the rotating parent cloud group (unlike a detached dummy
    // object), so save/restore + slerp gets a smooth, parent-aware billboard
    // instead of a rigid snap or a facing that breaks once the group spins.
    prevQuat.copy(ref.current.quaternion)
    ref.current.lookAt(camera.position)
    targetQuat.copy(ref.current.quaternion)
    ref.current.quaternion.copy(prevQuat)
    ref.current.quaternion.slerp(targetQuat, Math.min(1, delta * 3.2))

    const targetScale = hovered ? 1.08 : 1
    ref.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.15)
  })

  return (
    <group ref={ref} position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.(work)
        }}
        onPointerOver={() => {
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = 'default'
        }}
      >
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          map={texture}
          color={hovered ? '#e3edff' : '#9fc2ff'}
          toneMapped={false}
          transparent
        />
      </mesh>
      {/* bloom-catching rim; brightens as a "selected" highlight on hover */}
      <mesh ref={rimRef} position={[0, 0, -0.01]}>
        <planeGeometry args={[w + 0.06, h + 0.06]} />
        <meshBasicMaterial
          color="#b6ff00"
          toneMapped={false}
          transparent
          opacity={hovered ? 0.75 : 0.32}
        />
      </mesh>
    </group>
  )
}

/** Mounts the real (network-fetching) WorkPlane only once its point enters
 *  the camera frustum — a lightweight lazy-load gate for the six full-res
 *  uploads, so nothing fetches until it could actually be seen. */
function LazyWorkPlane({ work, position, onSelect }) {
  const [visible, setVisible] = useState(false)
  const seenRef = useRef(false)
  const frustum = useMemo(() => new THREE.Frustum(), [])
  const projScreenMatrix = useMemo(() => new THREE.Matrix4(), [])
  const worldPos = useMemo(() => new THREE.Vector3(), [])
  const groupRef = useRef(null)

  useFrame(({ camera }) => {
    if (seenRef.current || !groupRef.current) return
    groupRef.current.getWorldPosition(worldPos)
    projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    frustum.setFromProjectionMatrix(projScreenMatrix)
    if (frustum.containsPoint(worldPos)) {
      seenRef.current = true
      setVisible(true)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {visible ? (
        <WorkPlaneBoundary work={work} position={[0, 0, 0]} onSelect={onSelect}>
          <Suspense fallback={<FallbackPlane work={work} position={[0, 0, 0]} onSelect={onSelect} />}>
            <WorkPlane work={work} position={[0, 0, 0]} onSelect={onSelect} />
          </Suspense>
        </WorkPlaneBoundary>
      ) : (
        <FallbackPlane work={work} position={[0, 0, 0]} onSelect={onSelect} />
      )}
    </group>
  )
}

/** The archive pictures, scattered on a loose cylinder around the sphere
 *  (radius + height jitter, like the reference "floating card cloud"),
 *  all living inside one rotating group so a drag spins the whole set. */
function ArchiveCloud({ groupRef, onSelect }) {
  const layout = useMemo(() => {
    const rand = mulberry32(20260703)
    const n = archiveWorks.length
    return archiveWorks.map((work, i) => {
      const angle = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.5
      const radius = 3.6 + rand() * 1.8
      const y = -0.4 + rand() * 2.6
      return {
        work,
        position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
      }
    })
  }, [])

  return (
    <group ref={groupRef}>
      {layout.map(({ work, position }) => (
        <LazyWorkPlane key={work.id} work={work} position={position} onSelect={onSelect} />
      ))}
    </group>
  )
}

/** Drag-to-rotate the archive cloud (not the camera) so the sphere/floor
 *  stay put as a fixed parallax anchor while the picture ring swirls around
 *  it. Includes a little inertia so a flick keeps spinning and decays. */
function useDragRotate(groupRef) {
  const { gl } = useThree()
  const dragging = useRef(false)
  const lastX = useRef(0)
  const velocity = useRef(0)

  useEffect(() => {
    const el = gl.domElement
    const onDown = (e) => {
      dragging.current = true
      lastX.current = e.clientX
      velocity.current = 0
    }
    const onMove = (e) => {
      if (!dragging.current) return
      const dx = e.clientX - lastX.current
      lastX.current = e.clientX
      const delta = dx * 0.004
      velocity.current = delta
      if (groupRef.current) groupRef.current.rotation.y += delta
    }
    const onUp = () => {
      dragging.current = false
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl])

  useFrame(() => {
    if (dragging.current || !groupRef.current) return
    if (Math.abs(velocity.current) > 0.0001) {
      groupRef.current.rotation.y += velocity.current
      velocity.current *= 0.94
    } else {
      // gentle idle drift so the cloud never feels static
      groupRef.current.rotation.y += 0.0009
    }
  })
}

function DragRotatedCloud({ onSelect }) {
  const groupRef = useRef(null)
  useDragRotate(groupRef)
  return <ArchiveCloud groupRef={groupRef} onSelect={onSelect} />
}

function Scene({ onSelect }) {
  return (
    <>
      <color attach="background" args={['#000014']} />
      <fog attach="fog" args={['#000014', 8, 30]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 4, 2]} intensity={2.2} color="#dfe9ff" />
      <pointLight position={[-4, 1, -3]} intensity={1.2} color="#4060ff" />
      <spotLight position={[0, 6, 0]} intensity={1.5} angle={0.6} penumbra={1} color="#ffffff" />

      <Stars radius={40} depth={30} count={1400} factor={2.4} saturation={0} fade speed={0.4} />

      <CheckerFloor />
      <GlassSphere />
      <DragRotatedCloud onSelect={onSelect} />

      {/* rotation now lives on the picture cloud (see useDragRotate); OrbitControls
          is kept only for scroll-to-dolly so the sphere stays a fixed depth anchor */}
      <OrbitControls enablePan={false} enableRotate={false} enableZoom minDistance={3.5} maxDistance={12} />

      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.15} luminanceSmoothing={0.4} mipmapBlur />
        <ChromaticAberration offset={[0.0008, 0.0012]} />
        <Noise opacity={0.045} />
        <Vignette eskil={false} offset={0.25} darkness={0.9} />
      </EffectComposer>
    </>
  )
}

/** Last-resort guard: a scene-level failure closes the shell, not the whole site. */
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

export default function WorldArchive({ onClose, onSelectWork }) {
  return (
    <motion.div
      className="fixed inset-0 z-[140] touch-none bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <SceneBoundary>
        <Canvas camera={{ position: [0, 1.2, 6.5], fov: 45 }} dpr={[1, 1.3]}>
          <Suspense fallback={null}>
            <Scene onSelect={onSelectWork} />
          </Suspense>
        </Canvas>
      </SceneBoundary>

      <div className="pointer-events-none absolute inset-0 flex items-start justify-between p-6 md:p-10">
        <span className="font-body text-xs uppercase tracking-[0.4em] text-white/80">
          world archive
        </span>
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto font-body text-xs uppercase tracking-[0.35em] text-white/70 transition-colors hover:text-white"
        >
          ↩ back
        </button>
      </div>
    </motion.div>
  )
}

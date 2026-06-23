import { Suspense, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { motion } from 'framer-motion'
import * as THREE from 'three'

/**
 * ArchiveWorld — the 3D "world archive" the butterfly drops you into.
 *
 * Layout references reference_world_archive.png: many image cards floating in a
 * pale mist, scattered front-to-back so the whole thing reads as a navigable
 * nebula of work. Built as:
 *   • RabbitHole  — a one-shot camera dolly that "falls" you in (accelerate →
 *                   settle), framer-motion handles the page-level flash.
 *   • Rig         — mouse-move parallax: the cloud orbits with the cursor.
 *   • Card        — a textured plane; hover smoothly scales it, click eases the
 *                   camera in to focus it (click background / Esc to release).
 *
 * Cards are plain MeshBasicMaterial planes (unlit photos) — cheap to draw, so a
 * few dozen float comfortably. (Swap to an InstancedMesh + texture atlas if the
 * card count ever grows into the hundreds.)
 */

// image pool for the floating cards (existing site art, reused + scattered)
const POOL = [
  '/assets/work_andromeda_freckles.png',
  '/assets/work_carousel_between_two_infinites_ig_cover.png',
  '/assets/works_tea_pot.png',
  '/assets/contact_roller_coaster.png',
  '/assets/about_cover.png',
  '/assets/tools_manifesto_cover.png',
]
const CARD_COUNT = 34
const rand = (a, b) => a + Math.random() * (b - a)

function Card({ tex, w, h, position, rotation, onFocus }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    const m = ref.current
    if (!m) return
    const target = hovered ? 1.22 : 1
    m.scale.x = THREE.MathUtils.lerp(m.scale.x, w * target, 0.12)
    m.scale.y = THREE.MathUtils.lerp(m.scale.y, h * target, 0.12)
  })

  return (
    <mesh
      ref={ref}
      position={position}
      rotation={rotation}
      scale={[w, h, 1]}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        e.stopPropagation()
        onFocus(position)
      }}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} toneMapped={false} transparent />
    </mesh>
  )
}

function CardCloud({ groupRef, onFocus }) {
  const textures = useLoader(THREE.TextureLoader, POOL)
  // configure colour space once
  useMemo(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 4
    })
  }, [textures])

  const cards = useMemo(() => {
    const arr = []
    for (let i = 0; i < CARD_COUNT; i++) {
      const tex = textures[i % textures.length]
      const aspect = (tex.image?.width || 16) / (tex.image?.height || 10)
      const h = rand(1.5, 3.8)
      arr.push({
        key: i,
        tex,
        w: h * aspect,
        h,
        position: [rand(-17, 17), rand(-9, 9), rand(-44, 5)],
        rotation: [rand(-0.05, 0.05), rand(-0.14, 0.14), rand(-0.06, 0.06)],
      })
    }
    return arr
  }, [textures])

  return (
    <group ref={groupRef}>
      {cards.map((c) => (
        <Card key={c.key} {...c} onFocus={onFocus} />
      ))}
    </group>
  )
}

/** mouse-move parallax + the camera focus/release behaviour */
function Rig({ focus }) {
  const { camera, pointer } = useThree()
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  useFrame(() => {
    // where the camera wants to be: parallax around origin, or in front of a
    // focused card
    if (focus.current) {
      target.set(focus.current[0], focus.current[1], focus.current[2] + 7)
    } else {
      target.set(pointer.x * 3.2, pointer.y * 2.2, 16)
    }
    camera.position.lerp(target, 0.06)
    camera.lookAt(focus.current ? new THREE.Vector3(...focus.current) : new THREE.Vector3(0, 0, -8))
  })
  return null
}

/** one-shot "rabbit hole" dolly: start far + wide, accelerate in, settle */
function RabbitHole() {
  const { camera } = useThree()
  const t0 = useRef(null)
  useFrame((state) => {
    if (t0.current === null) {
      t0.current = state.clock.elapsedTime
      camera.position.z = 46
      camera.fov = 95
      camera.updateProjectionMatrix()
    }
    const p = THREE.MathUtils.clamp((state.clock.elapsedTime - t0.current) / 1.7, 0, 1)
    if (p >= 1) return
    const e = 1 - Math.pow(1 - p, 3) // easeOutCubic (fast → slow)
    camera.position.z = THREE.MathUtils.lerp(46, 16, e)
    camera.fov = THREE.MathUtils.lerp(95, 60, e)
    camera.updateProjectionMatrix()
  })
  return null
}

export default function ArchiveWorld({ onExit }) {
  const groupRef = useRef()
  const focus = useRef(null) // [x,y,z] of focused card, or null

  return (
    <motion.div
      className="fixed inset-0 z-[140]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Canvas
        camera={{ position: [0, 0, 46], fov: 95, near: 0.1, far: 140 }}
        gl={{ antialias: true }}
        dpr={[1, 2]}
        onPointerMissed={() => {
          focus.current = null
        }}
      >
        <color attach="background" args={['#e9ebf1']} />
        <fog attach="fog" args={['#e9ebf1', 16, 62]} />
        <ambientLight intensity={1} />
        <Suspense fallback={null}>
          <CardCloud groupRef={groupRef} onFocus={(p) => (focus.current = p)} />
        </Suspense>
        <Rig focus={focus} />
        <RabbitHole />
      </Canvas>

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-10">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm uppercase tracking-[0.4em] text-ink/70">
            world archive
          </span>
          <button
            type="button"
            onClick={onExit}
            className="pointer-events-auto font-body text-xs uppercase tracking-[0.3em] text-ink/70 transition hover:text-ink"
          >
            ↩ back to works
          </button>
        </div>
        <span className="font-body text-[11px] uppercase tracking-[0.3em] text-ink/45">
          move the mouse to drift · click a piece to focus
        </span>
      </div>
    </motion.div>
  )
}

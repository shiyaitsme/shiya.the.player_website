import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, MeshTransmissionMaterial, MeshReflectorMaterial, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing'
import { motion } from 'framer-motion'
import * as THREE from 'three'

/**
 * WorldArchive — a "museum-grade" black/deep-blue retro-futurist scene the
 * butterfly drops you into. A midnight-blue sky dome (not a flat color) +
 * fog, a checkerboard floor with a real blurred reflection, a refractive
 * glass sphere as the fixed depth anchor, and the 6 uploaded archive
 * pictures repeated across a large cylindrical array (instanced — constant
 * draw-call count no matter how many copies) for a "vast data museum"
 * scale rather than 6 lonely cards.
 *
 * These pictures are NOT yet real `works` entries in projects.js — the user
 * hasn't written copy for them. Clicking one still calls onSelectWork()
 * (same plumbing as the star Gachapon) so the wiring is correct once she
 * adds them properly; until then the detail page they land on is minimal.
 * Page.jsx remembers the trip back to the archive (see ARCHIVE_RETURN_KEY
 * there) so "back" from that detail page returns here, not to the map.
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

/** Preloads every archive texture up front (Promise.all, with progress) so
 *  the scene reveals fully formed instead of popping cards in one by one.
 *  A failed image resolves to `null` and still counts toward progress —
 *  one bad file can't hang the whole entrance. */
function useArchiveTextures(urls) {
  const [state, setState] = useState({ textures: null, loaded: 0, total: urls.length })

  useEffect(() => {
    let live = true
    const loader = new THREE.TextureLoader()
    const results = new Array(urls.length).fill(null)
    let loaded = 0

    const bump = () => {
      loaded += 1
      if (live) setState((s) => ({ ...s, loaded }))
    }

    Promise.all(
      urls.map(
        (url, i) =>
          new Promise((resolve) => {
            loader.load(
              url,
              (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace
                results[i] = tex
                bump()
                resolve()
              },
              undefined,
              () => {
                bump()
                resolve()
              },
            )
          }),
      ),
    ).then(() => {
      if (live) setState({ textures: results, loaded: urls.length, total: urls.length })
    })

    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}

/** Deep-space sky: a large inverted dome with a vertical gradient (rich
 *  midnight blue at the very top AND bottom, fading to near-black at the
 *  horizon band) — replaces a flat background color so the space itself
 *  reads as a saturated retro-futurist void, not just "black". Ignores
 *  scene fog (it's the backdrop fog fades into, not a foreground object). */
function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          topColor: { value: new THREE.Color('#182f78') },
          bottomColor: { value: new THREE.Color('#14276b') },
          horizonColor: { value: new THREE.Color('#030410') },
        },
        vertexShader: `
          varying vec3 vDir;
          void main() {
            vDir = normalize((modelMatrix * vec4(position, 1.0)).xyz);
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vDir;
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform vec3 horizonColor;
          void main() {
            float h = vDir.y;
            vec3 vertical = mix(bottomColor, topColor, smoothstep(-1.0, 1.0, h));
            float band = 1.0 - smoothstep(0.0, 0.6, abs(h));
            vec3 color = mix(vertical, horizonColor, band * 0.85);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    [],
  )
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[60, 32, 32]} />
    </mesh>
  )
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
      <planeGeometry args={[100, 100]} />
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
        background={new THREE.Color('#0a1442')}
        resolution={256}
        samples={4}
      />
    </mesh>
  )
}

const SLOT_COUNT = 30 // repeated instances across the 6 pictures — "museum array" density

/** Slot positions for the whole array (cylindrical, seeded so it's stable
 *  across re-renders): evenly spaced bins around the circle with jitter on
 *  angle/radius/height, cycling through the 6 pictures for a rhythmic,
 *  gallery-rotunda repeat rather than a random scatter. */
function useArchiveLayout() {
  return useMemo(() => {
    const rand = mulberry32(20260703)
    return Array.from({ length: SLOT_COUNT }, (_, i) => {
      const pictureIndex = i % archiveWorks.length
      const angle = (i / SLOT_COUNT) * Math.PI * 2 + (rand() - 0.5) * 0.35
      const radius = 3.6 + rand() * 5.2
      const y = -2.2 + rand() * 7.2
      return { pictureIndex, position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius] }
    })
  }, [])
}

/** One picture's worth of the array, rendered as two InstancedMeshes (main
 *  photo + a cool-cyan "digital artifact" glow rim) — draw-call count stays
 *  constant (2 per unique picture) no matter how many repeated slots exist,
 *  which is what keeps this scalable/60fps instead of one draw call per card.
 *
 *  Billboarding is done by hand per instance: camera position is converted
 *  into the group's LOCAL space (worldToLocal), then a scratch Object3D
 *  computes lookAt/position/scale entirely in that local space and its
 *  matrix is written via setMatrixAt. This is the instanced equivalent of
 *  the parent-aware billboard trick used for single meshes — a naive
 *  world-space lookAt would ignore the rotating parent group entirely. */
function ArchiveInstancedGroup({ work, texture, slots, onSelect }) {
  const mainRef = useRef(null)
  const rimRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const localCam = useMemo(() => new THREE.Vector3(), [])
  const seeds = useMemo(() => slots.map(() => Math.random() * Math.PI * 2), [slots])

  const aspect = texture?.image ? texture.image.width / texture.image.height : 1
  const h = 1.9
  const w = h * aspect

  const rimGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(w + 0.08, h + 0.08)
    geo.translate(0, 0, -0.015) // avoid z-fighting with the main plane at the same instance transform
    return geo
  }, [w, h])

  useFrame(({ clock, camera }) => {
    const main = mainRef.current
    const rim = rimRef.current
    if (!main || !main.parent) return
    main.parent.updateWorldMatrix(true, false)
    localCam.copy(camera.position)
    main.parent.worldToLocal(localCam)

    const t = clock.getElapsedTime()
    const scale = hovered ? 1.08 : 1
    slots.forEach((slot, i) => {
      const bobY = slot.position[1] + Math.sin(t * 0.5 + seeds[i]) * 0.16
      dummy.position.set(slot.position[0], bobY, slot.position[2])
      dummy.lookAt(localCam)
      dummy.scale.set(scale, scale, scale)
      dummy.updateMatrix()
      main.setMatrixAt(i, dummy.matrix)
      if (rim) rim.setMatrixAt(i, dummy.matrix)
    })
    main.instanceMatrix.needsUpdate = true
    if (rim) rim.instanceMatrix.needsUpdate = true
  })

  const handleSelect = (e) => {
    e.stopPropagation()
    onSelect?.(work)
  }
  const handleOver = () => {
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }
  const handleOut = () => {
    setHovered(false)
    document.body.style.cursor = 'default'
  }

  return (
    <group>
      <instancedMesh
        ref={mainRef}
        args={[null, null, slots.length]}
        onClick={handleSelect}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      >
        <planeGeometry args={[w, h]} />
        {texture ? (
          <meshBasicMaterial map={texture} color={hovered ? '#e7f2ff' : '#9fc2ff'} toneMapped={false} transparent />
        ) : (
          <meshStandardMaterial color="#0a0e2a" emissive="#2a5fb0" emissiveIntensity={0.3} />
        )}
      </instancedMesh>
      {/* cool "digital artifact" glow rim — bloom picks this up */}
      <instancedMesh ref={rimRef} args={[rimGeometry, null, slots.length]} raycast={() => null}>
        <meshBasicMaterial color="#6fd8ff" toneMapped={false} transparent opacity={hovered ? 0.75 : 0.26} depthWrite={false} />
      </instancedMesh>
    </group>
  )
}

/** The whole repeated picture field, grouped by unique picture (one
 *  instanced pair per picture) so a hover/click naturally applies to every
 *  duplicate of that picture at once — they're all the same work. */
function ArchiveField({ textures, onSelect, groupRef }) {
  const layout = useArchiveLayout()
  const slotsByPicture = useMemo(() => {
    const buckets = archiveWorks.map(() => [])
    layout.forEach((slot) => buckets[slot.pictureIndex].push(slot))
    return buckets
  }, [layout])

  return (
    <group ref={groupRef}>
      {archiveWorks.map((work, i) =>
        slotsByPicture[i].length ? (
          <ArchiveInstancedGroup key={work.id} work={work} texture={textures[i]} slots={slotsByPicture[i]} onSelect={onSelect} />
        ) : null,
      )}
    </group>
  )
}

/** Drag-to-rotate the archive field (not the camera) so the sphere/floor
 *  stay put as a fixed parallax anchor while the picture array swirls
 *  around it. Includes a little inertia so a flick keeps spinning and
 *  decays, plus a slow idle drift when untouched. */
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
      groupRef.current.rotation.y += 0.0006
    }
  })
}

function DragRotatedField({ textures, onSelect }) {
  const groupRef = useRef(null)
  useDragRotate(groupRef)
  return <ArchiveField textures={textures} onSelect={onSelect} groupRef={groupRef} />
}

function Scene({ onSelect, textures }) {
  return (
    <>
      <fog attach="fog" args={['#020208', 10, 34]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 4, 2]} intensity={2.2} color="#dfe9ff" />
      <pointLight position={[-4, 1, -3]} intensity={1.2} color="#4060ff" />
      <spotLight position={[0, 6, 0]} intensity={1.5} angle={0.6} penumbra={1} color="#ffffff" />

      <SkyDome />
      <Stars radius={40} depth={30} count={1400} factor={2.4} saturation={0} fade speed={0.4} />

      <CheckerFloor />
      <GlassSphere />
      <DragRotatedField textures={textures} onSelect={onSelect} />

      {/* rotation lives on the picture field (see useDragRotate); OrbitControls
          is kept only for scroll-to-dolly so the sphere stays a fixed depth anchor */}
      <OrbitControls enablePan={false} enableRotate={false} enableZoom minDistance={3.5} maxDistance={14} />

      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.15} luminanceSmoothing={0.4} />
        <ChromaticAberration offset={[0.0008, 0.0012]} />
        <Noise opacity={0.045} />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
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
  const urls = useMemo(() => archiveWorks.map((w) => w.image), [])
  const { textures, loaded, total } = useArchiveTextures(urls)
  const ready = textures !== null

  return (
    <motion.div
      className="fixed inset-0 z-[140] touch-none bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {ready ? (
        <SceneBoundary>
          <Canvas camera={{ position: [0, 1.2, 7.5], fov: 45 }} dpr={[1, 1.3]}>
            <Suspense fallback={null}>
              <Scene onSelect={onSelectWork} textures={textures} />
            </Suspense>
          </Canvas>
        </SceneBoundary>
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <span className="font-body text-xs uppercase tracking-[0.4em] text-white/70">
              entering the archive…
            </span>
            <div className="h-[2px] w-48 overflow-hidden bg-white/15">
              <div
                className="h-full bg-lime-acid transition-[width] duration-200"
                style={{ width: `${total ? (loaded / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

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

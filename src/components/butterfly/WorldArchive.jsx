import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
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

/** Procedural black/white checker pattern, tiled, fed into MeshReflectorMaterial
 *  as a color map. Deliberately dim/desaturated (not stark white) so it reads
 *  as a shadowy suggestion of a floor floating in the void, not a bright
 *  boundary plane — the user explicitly asked to tone this down. */
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
        ctx.fillStyle = (x + y) % 2 === 0 ? '#1c2650' : '#050611'
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

/** FLOOR_Y is the single source of truth for the floor plane's height — the
 *  archive layout clamps every card comfortably above it (see CARD_MIN_Y in
 *  useArchiveLayout) so a card can never end up spatially behind/inside the
 *  floor. That overlap was a real bug: cards below the floor were occluded
 *  from the raycaster by the (closer, opaque) floor plane, which is why some
 *  pictures silently failed to open on click. Keep FLOOR_Y and CARD_MIN_Y in
 *  sync if either one changes. */
const FLOOR_Y = -1.4

/** Floor: dim checker pattern + a real (blurred) reflection of the scene,
 *  now double-sided since full free-orbit (no polar-angle clamp) lets the
 *  camera swing under it. */
function CheckerFloor() {
  const checkerMap = useCheckerTexture()
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]}>
      <planeGeometry args={[120, 120]} />
      <MeshReflectorMaterial
        map={checkerMap}
        mirror={0.18}
        blur={[160, 60]}
        mixBlur={6}
        mixStrength={0.7}
        resolution={256}
        depthScale={1}
        minDepthThreshold={0.8}
        maxDepthThreshold={1.4}
        roughness={0.95}
        metalness={0.1}
        color="#04060f"
        side={THREE.DoubleSide}
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
const SPHERE_RADIUS = 11 // base radius of the virtual gallery sphere
const RADIUS_JITTER = 4 // +/- radial jitter so it's a shell, not a perfect sphere shell
// Cards are up to ~3 units wide x 1.9 tall (widest aspect), so their own
// diagonal is ~3.6 — MIN_CARD_DISTANCE has to clear TWO card footprints
// meeting edge-on (~3.6 total) plus a real visible gap, not just be "some
// small number". 3.2 was smaller than a single card's diagonal, which is
// exactly why cards visibly interpenetrated ("穿模") despite "passing" the
// distance check — center-to-center distance was never checking against
// the cards' actual on-screen size.
const MIN_CARD_DISTANCE = 5.5
const CARD_MIN_Y = FLOOR_Y + 1.1 // clearance above the floor — see FLOOR_Y's comment
const MIN_CENTER_CLEARANCE = 3.5 // keeps cards clear of the glass sphere (radius 1.15)
// A full unit-sphere Y range (-1..1) times SPHERE_RADIUS/JITTER put some
// cards as high as y=+13 — WAY above the default camera's natural framing
// (camera sits at y=3). Those cards were only reachable by tilting the
// camera almost straight up, which nobody does instinctively; clicking them
// read as "this specific picture never responds" when really the user
// never orbited far enough to bring it into frame. Compressing Y before the
// radius scale turns the distribution into an oblate spheroid — full 360°
// horizontal spread (X/Z unaffected) but a much shorter, camera-reachable
// vertical range (~-0.3 to +6 instead of -0.3 to +13). Verified with the
// same standalone layout script: MIN_CARD_DISTANCE/MIN_CENTER_CLEARANCE
// still converge exactly at their targets with this compression applied.
const Y_COMPRESS = 0.45

/** Both constraints (floor clearance + sphere clearance) get re-applied
 *  after EVERY relaxation nudge, not just once at the end — clamping only
 *  once at the end was the actual bug in an earlier version: pushing a
 *  point up to the floor line (or out past the glass sphere) can put it
 *  right back on top of a different point with no further separation
 *  check, silently undoing the padding the relaxation pass just enforced
 *  for roughly half the array. Verified numerically (see git history) that
 *  clamp-every-step converges to the full MIN_CARD_DISTANCE; clamp-once-
 *  at-the-end got stuck around ~1.9 units apart, well under a card's own
 *  ~4-unit diagonal — that's why cards were visibly interpenetrating. */
function clampArchivePoint(p) {
  if (p.y < CARD_MIN_Y) p.y = CARD_MIN_Y
  const r = p.length()
  if (r < MIN_CENTER_CLEARANCE && r > 0.0001) {
    p.multiplyScalar(MIN_CENTER_CLEARANCE / r)
    if (p.y < CARD_MIN_Y) p.y = CARD_MIN_Y
  }
}

/** Even coverage of a sphere via the golden-angle (Fibonacci sphere)
 *  construction, then relaxation passes that push any pair of points closer
 *  than MIN_CARD_DISTANCE apart — this is the actual fix for "crowding": a
 *  naive Fibonacci sphere is even in *angle* but can still place two points
 *  close together in absolute 3D distance once radius jitter is added, so
 *  the padding has to be enforced explicitly, not just hoped for from the
 *  angular spacing. 60 iterations (not the original 6) because
 *  MIN_CARD_DISTANCE is now comparable to the sphere's own local point
 *  spacing, so it takes longer to fully converge. Only 30 points, done once
 *  via useMemo, so this is still trivial (under 100k ops). */
function useArchiveLayout() {
  return useMemo(() => {
    const rand = mulberry32(20260703)
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const points = Array.from({ length: SLOT_COUNT }, (_, i) => {
      const yUnit = 1 - (i / Math.max(SLOT_COUNT - 1, 1)) * 2 // 1 → -1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - yUnit * yUnit))
      const theta = goldenAngle * i
      const r = SPHERE_RADIUS + (rand() - 0.5) * 2 * RADIUS_JITTER
      const p = new THREE.Vector3(Math.cos(theta) * radiusAtY, yUnit * Y_COMPRESS, Math.sin(theta) * radiusAtY).multiplyScalar(r)
      clampArchivePoint(p)
      return p
    })

    for (let iter = 0; iter < 60; iter++) {
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const delta = points[i].clone().sub(points[j])
          const dist = delta.length()
          if (dist > 0.0001 && dist < MIN_CARD_DISTANCE) {
            const push = delta.multiplyScalar((MIN_CARD_DISTANCE - dist) / 2 / dist)
            points[i].add(push)
            points[j].sub(push)
            clampArchivePoint(points[i])
            clampArchivePoint(points[j])
          }
        }
      }
    }

    return points.map((p, i) => ({
      pictureIndex: i % archiveWorks.length,
      position: [p.x, p.y, p.z],
    }))
  }, [])
}

/** One picture's worth of the array, rendered as two InstancedMeshes (main
 *  photo + a cool-cyan "digital artifact" glow rim) — draw-call count stays
 *  constant (2 per unique picture) no matter how many repeated slots exist,
 *  which is what keeps this scalable/60fps instead of one draw call per card.
 *
 *  Billboarding: the array group itself never rotates any more (see the
 *  Scene-level comment — navigation is now real OrbitControls orbiting the
 *  camera, not a spun group), so each instance can look at the camera's
 *  world position directly with a scratch Object3D, no local-space
 *  conversion needed. */
function ArchiveInstancedGroup({ work, texture, slots, onSelect }) {
  const mainRef = useRef(null)
  const rimRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const dummy = useMemo(() => new THREE.Object3D(), [])
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
    if (!main) return

    const t = clock.getElapsedTime()
    const scale = hovered ? 1.08 : 1
    slots.forEach((slot, i) => {
      const bobY = slot.position[1] + Math.sin(t * 0.5 + seeds[i]) * 0.16
      dummy.position.set(slot.position[0], bobY, slot.position[2])
      dummy.lookAt(camera.position)
      dummy.scale.set(scale, scale, scale)
      dummy.updateMatrix()
      main.setMatrixAt(i, dummy.matrix)
      if (rim) rim.setMatrixAt(i, dummy.matrix)
    })
    main.instanceMatrix.needsUpdate = true
    if (rim) rim.instanceMatrix.needsUpdate = true
  })

  // Real pointer/click-detection, not the native `onClick` DOM event: on a
  // real mouse/trackpad (unlike a synthetic same-pixel test click), pressing
  // and releasing almost always has a few pixels of incidental movement —
  // and because OrbitControls is actively listening for that exact movement
  // to start orbiting, the browser can end up treating the gesture as a drag
  // and never fire a native 'click' at all, so R3F's onClick silently never
  // triggers. This is a known OrbitControls-vs-click-to-select interaction,
  // not something a raycasting fix can address. Instead: capture the
  // intended target on `onPointerDown` (still correctly raycast-resolved to
  // whichever instance was actually under the cursor at press-time), then
  // confirm it on a GLOBAL `pointerup` (not the mesh's own onPointerUp,
  // which could miss entirely if the camera rotated the target out from
  // under the cursor before release) only if total movement stayed small.
  const pendingRef = useRef(null)

  useEffect(() => {
    const onWindowPointerUp = (e) => {
      const start = pendingRef.current
      pendingRef.current = null
      if (!start) return
      const dist = Math.hypot(e.clientX - start.x, e.clientY - start.y)
      if (dist < 8) onSelect?.(work)
    }
    window.addEventListener('pointerup', onWindowPointerUp)
    return () => window.removeEventListener('pointerup', onWindowPointerUp)
  }, [work, onSelect])

  const handlePointerDown = (e) => {
    e.stopPropagation()
    pendingRef.current = { x: e.clientX, y: e.clientY }
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
        onPointerDown={handlePointerDown}
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

/** The whole repeated picture field — a `GalleryGroup` grouping every
 *  instanced-mesh pair so it's raycast (and drag-rotated, in the old scheme)
 *  as one coherent unit. Navigation itself is now real 3D OrbitControls (see
 *  Scene below), so this group has no rotation logic of its own any more. */
function GalleryGroup({ textures, onSelect }) {
  const layout = useArchiveLayout()
  const slotsByPicture = useMemo(() => {
    const buckets = archiveWorks.map(() => [])
    layout.forEach((slot) => buckets[slot.pictureIndex].push(slot))
    return buckets
  }, [layout])

  return (
    <group name="GalleryGroup">
      {archiveWorks.map((work, i) =>
        slotsByPicture[i].length ? (
          <ArchiveInstancedGroup key={work.id} work={work} texture={textures[i]} slots={slotsByPicture[i]} onSelect={onSelect} />
        ) : null,
      )}
    </group>
  )
}

function Scene({ onSelect, textures }) {
  return (
    <>
      {/* FogExp2 (exponential) rather than linear Fog — depth fades in
          smoothly with no hard near/far cutoff, so distant array cards melt
          into the background color instead of hitting a visible "wall". */}
      <fogExp2 attach="fog" args={['#040610', 0.032]} />
      {/* global blue ambient wash, per the "floating in a deep blue void" ask */}
      <ambientLight color="#3a5be0" intensity={0.35} />
      <pointLight position={[0, 4, 2]} intensity={2.2} color="#dfe9ff" />
      <pointLight position={[-4, 1, -3]} intensity={1.2} color="#4060ff" />
      <spotLight position={[0, 6, 0]} intensity={1.5} angle={0.6} penumbra={1} color="#ffffff" />

      <SkyDome />
      <Stars radius={40} depth={30} count={1400} factor={2.4} saturation={0} fade speed={0.4} />

      <CheckerFloor />
      <GlassSphere />
      <GalleryGroup textures={textures} onSelect={onSelect} />

      {/* Real 3D orbit, not a 2D drag-the-group hack: full spherical
          coordinates, free look in every direction (only just short of the
          poles, to dodge the OrbitControls gimbal singularity), plus zoom. */}
      <OrbitControls
        enablePan={false}
        enableRotate
        enableZoom
        minDistance={4}
        maxDistance={32}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI - 0.05}
        rotateSpeed={0.6}
      />

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
          <Canvas camera={{ position: [0, 3, 19], fov: 50 }} dpr={[1, 1.3]}>
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

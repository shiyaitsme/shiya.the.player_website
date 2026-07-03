import { Component, Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, MeshTransmissionMaterial, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { works } from '../../data/projects'

/**
 * WorldArchive — black/blue retro-futurist 3D scene the butterfly drops you
 * into (replaces the earlier pale "misty card cloud" ArchiveWorld). A
 * procedural checkerboard floor, a refractive glass sphere
 * (MeshTransmissionMaterial), a starfield, and the works rendered as
 * blue-tinted floating planes with a lime bloom rim, finished with
 * Bloom/ChromaticAberration/Noise/Vignette post-processing.
 */

/**
 * The infinite black/white perspective checkerboard the glass sphere floats
 * above — a procedural shader plane, no texture asset needed.
 */
function CheckerFloor() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uFog: { value: new THREE.Color('#000014') } },
        vertexShader: `
          varying vec2 vUv;
          varying float vDist;
          void main() {
            vUv = uv;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vDist = -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          varying float vDist;
          uniform vec3 uFog;
          void main() {
            vec2 c = floor(vUv * 64.0);
            float checker = mod(c.x + c.y, 2.0);
            vec3 base = mix(vec3(0.02, 0.02, 0.05), vec3(0.85, 0.88, 0.95), checker);
            float fog = smoothstep(6.0, 34.0, vDist);
            vec3 color = mix(base, uFog, fog);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      }),
    []
  )

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]} material={material}>
      <planeGeometry args={[80, 80, 1, 1]} />
    </mesh>
  )
}

function GlassSphere() {
  const ref = useRef(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.15
  })
  return (
    <mesh ref={ref} position={[0, 0.4, 0]}>
      <sphereGeometry args={[1.15, 64, 64]} />
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
      />
    </mesh>
  )
}

/** Catches a missing/unloadable work image so one bad asset can't crash the scene. */
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

/** Plain lit plane shown when a work's image hasn't been uploaded yet. */
function FallbackPlane({ work, position, rotation, onSelect }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect(work)
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <planeGeometry args={[1.4, 1.6]} />
        <meshStandardMaterial color="#0a0e2a" emissive="#7ed957" emissiveIntensity={0.25} />
      </mesh>
    </group>
  )
}

/** A floating, cool-tinted work thumbnail with a self-illuminated rim. */
function WorkPlane({ work, position, rotation, onSelect }) {
  const texture = useLoader(THREE.TextureLoader, work.image)
  const ref = useRef(null)
  const seed = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.position.y = position[1] + Math.sin(t * 0.5 + seed) * 0.18
    ref.current.rotation.z = Math.sin(t * 0.3 + seed) * 0.03
  })

  const aspect = texture.image ? texture.image.width / texture.image.height : 1
  const h = 1.6
  const w = h * aspect

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect(work)
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          map={texture}
          color="#9fc2ff"
          toneMapped={false}
          transparent
        />
      </mesh>
      {/* faint bloom-catching rim, no more skeuomorphic white border */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[w + 0.06, h + 0.06]} />
        <meshBasicMaterial color="#b6ff00" toneMapped={false} transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

function FloatingWorks({ onSelect }) {
  const layout = useMemo(() => {
    const radius = 3.6
    return works.map((work, i) => {
      const angle = (i / Math.max(works.length, 1)) * Math.PI * 2
      return {
        work,
        position: [Math.cos(angle) * radius, 0.6 + (i % 2) * 0.8, Math.sin(angle) * radius],
        rotation: [0, -angle + Math.PI / 2, 0],
      }
    })
  }, [])

  return (
    <>
      {layout.map(({ work, position, rotation }) => (
        <WorkPlaneBoundary key={work.id} work={work} position={position} rotation={rotation} onSelect={onSelect}>
          <Suspense fallback={null}>
            <WorkPlane work={work} position={position} rotation={rotation} onSelect={onSelect} />
          </Suspense>
        </WorkPlaneBoundary>
      ))}
    </>
  )
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

      <Stars radius={40} depth={30} count={2400} factor={2.4} saturation={0} fade speed={0.4} />

      <CheckerFloor />
      <GlassSphere />
      <FloatingWorks onSelect={onSelect} />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3.5}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.35}
        maxPolarAngle={Math.PI / 1.7}
      />

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
      className="fixed inset-0 z-[140] bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <SceneBoundary>
        <Canvas camera={{ position: [0, 1.2, 6.5], fov: 45 }} dpr={[1, 1.8]}>
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

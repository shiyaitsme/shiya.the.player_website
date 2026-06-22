import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import useMouseParallax from './hooks/useMouseParallax'
import Background from './components/Background'
import AcidGrid from './components/AcidGrid'
import Header from './components/Header'
import HeroCarousel from './components/HeroCarousel'
import StarField from './components/StarField'
import ShardGrid from './components/ShardGrid'
import ProjectReveal from './components/ProjectReveal'

/**
 * Shiya the Player — Digital Playground / Digital Utopia (桃花源).
 * An interactive treasure map that behaves like an immersive installation.
 *
 * Layer stack (z-index):
 *   0  macaron gradient base      (Background)
 *   1  halftone dot grid          (Background)
 *   2  grain                      (Background)
 *  10  acid fluid grid + particles(AcidGrid)
 *  20  transparent hero carousel  (HeroCarousel)
 *  30  star Gachapon nodes / shards
 *  40  header / brand
 *  70+ cinematic overlays         (burst / project reveal)
 */
export default function App() {
  useMouseParallax()
  const [project, setProject] = useState(null)

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* pure-code background field */}
      <Background />

      {/* teamLab-style fluid grid */}
      <AcidGrid />

      {/* brand */}
      <Header />

      {/* centered stage for the transparent carousel */}
      <div className="absolute inset-0 flex items-center justify-center">
        <HeroCarousel />
      </div>

      {/* Feature A — random project Gachapon */}
      <StarField onSelect={setProject} />

      {/* Feature B — FLIP shard array */}
      <ShardGrid />

      {/* cinematic destination page */}
      <AnimatePresence>
        {project && (
          <ProjectReveal project={project} onClose={() => setProject(null)} />
        )}
      </AnimatePresence>
    </main>
  )
}

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useMouseParallax from './hooks/useMouseParallax'
import useStageScale from './hooks/useStageScale'
import Background from './components/Background'
import MapLines from './components/MapLines'
import HeroCarousel from './components/HeroCarousel'
import StarField from './components/StarField'
import ShardGrid from './components/ShardGrid'
import ShardZoom from './components/ShardZoom'
import ProjectDetail from './components/ProjectDetail'
import { projectById } from './data/projects'

/**
 * Shiya the Player — Digital Playground / 桃花源.
 * Rebuilt to match the Figma demo: soft iridescent macaron field, a
 * 1440x900 art-directed map stage (carousel hub, green shards, lime nav,
 * black-asterisk Gachapon nodes) and an editorial Playfair detail page.
 */
export default function App() {
  useMouseParallax()
  const stageRef = useRef(null)
  useStageScale(stageRef)

  const [detail, setDetail] = useState(null) // the mounted detail page
  const [zoom, setZoom] = useState(null) // active shard clip-transition

  // shard click → run the zoom-in / hold / zoom-out clip transition
  const openProject = (id, shardId, rect) => {
    setZoom({ project: projectById(id), shardId, rect })
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* pure-code soft iridescent background (full viewport) */}
      <Background />

      {/* art-directed 1440x900 map stage, scaled to fit */}
      <div ref={stageRef} className="stage">
        <MapLines />
        <HeroCarousel />

        {/* brand spiral logo, top center */}
        <motion.img
          src="/assets/logo_s.svg"
          alt="Shiya the Player"
          className="absolute z-30 animate-floaty"
          style={{ left: 705, top: 58, width: 40, height: 55 }}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        />

        {/* Feature A — random work Gachapon */}
        <StarField onSelect={setDetail} />

        {/* Feature B — green shards + lime nav */}
        <ShardGrid onOpen={openProject} />
      </div>

      {/* Frame 2 — editorial work detail */}
      <AnimatePresence>
        {detail && (
          <ProjectDetail
            project={detail}
            onClose={() => {
              setDetail(null)
              setZoom(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* shard clip transition (zoom in → hold → zoom out into the detail) */}
      <AnimatePresence>
        {zoom && (
          <ShardZoom
            project={zoom.project}
            shardId={zoom.shardId}
            originRect={zoom.rect}
            onReveal={() => setDetail(zoom.project)}
            onComplete={() => setZoom(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

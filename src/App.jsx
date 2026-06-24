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
import Page from './components/Page'
import { sections } from './data/projects'

/**
 * Shiya the Player — Digital Playground / 桃花源.
 * Map stage (carousel hub, green shards, lime nav, black-asterisk Gachapon)
 * → cinematic shard zoom → editorial content pages.
 *
 * view: { type:'section', section } | { type:'work', work } | null
 */
export default function App() {
  useMouseParallax()
  const stageRef = useRef(null)
  useStageScale(stageRef)

  const [view, setView] = useState(null)
  const [zoom, setZoom] = useState(null) // active shard clip-transition

  // shard click → zoom transition → section page
  const openSection = (key, shardId, rect) => {
    setZoom({ section: sections[key], shardId, rect })
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <Background />

      <div ref={stageRef} className="stage">
        <MapLines />
        <HeroCarousel />

        <motion.img
          src="/assets/logo_s.svg"
          alt="Shiya the Player"
          className="absolute z-30 animate-floaty"
          style={{ left: 705, top: 115, width: 40, height: 55 }}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        />

        {/* Feature A — random work Gachapon */}
        <StarField onSelect={(work) => setView({ type: 'work', work })} />

        {/* Feature B — green shards + lime nav */}
        <ShardGrid onOpen={openSection} />
      </div>

      {/* content page (section or single work) */}
      <AnimatePresence>
        {view && (
          <Page
            view={view}
            onClose={() => {
              setView(null)
              setZoom(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* shard clip transition (zoom in → hold → zoom out into the page) */}
      <AnimatePresence>
        {zoom && (
          <ShardZoom
            coverSrc={zoom.section.cover}
            label={zoom.section.nav}
            shardId={zoom.shardId}
            originRect={zoom.rect}
            onReveal={() => setView({ type: 'section', section: zoom.section })}
            onComplete={() => setZoom(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

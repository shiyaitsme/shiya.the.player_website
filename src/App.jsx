import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import useMouseParallax from './hooks/useMouseParallax'
import useStageScale from './hooks/useStageScale'
import useIsMobile from './hooks/useIsMobile'
import Background from './components/Background'
import MapLines from './components/MapLines'
import HeroCarousel from './components/HeroCarousel'
import StarField from './components/StarField'
import ShardGrid from './components/ShardGrid'
import ShardZoom from './components/ShardZoom'
import MobileMap from './components/MobileMap'
import Page from './components/Page'
import { sections } from './data/projects'

/**
 * Shiya the Player — Digital Playground / 桃花源.
 * Map stage (carousel hub, green shards, lime nav, black-asterisk Gachapon)
 * → cinematic shard zoom → editorial content pages.
 *
 * Desktop keeps the pixel-1:1 1440x900 Figma stage untouched. Phone-width
 * viewports render MobileMap instead — a proportional, generative layout
 * (see the comment above `mobileHub` in data/projects.js) rather than a
 * scaled-down/panned copy of the desktop composition.
 *
 * view: { type:'section', section } | { type:'work', work } | null
 */
export default function App() {
  useMouseParallax()
  const stageRef = useRef(null)
  useStageScale(stageRef)
  const isMobile = useIsMobile()

  const [view, setView] = useState(null)
  const [zoom, setZoom] = useState(null) // active shard clip-transition

  // shard click → zoom transition → section page
  const openSection = (key, shardId, rect) => {
    setZoom({ section: sections[key], shardId, rect })
  }
  const openWork = (work) => setView({ type: 'work', work })

  return (
    <main className="relative h-dvh w-screen overflow-hidden">
      <Background />

      {isMobile ? (
        <div
          className="absolute inset-0 z-10"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <MobileMap onOpen={openSection} onSelectWork={openWork} />
        </div>
      ) : (
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
          <StarField onSelect={openWork} />

          {/* Feature B — green shards + lime nav */}
          <ShardGrid onOpen={openSection} />
        </div>
      )}

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
            originRect={zoom.rect}
            onReveal={() => setView({ type: 'section', section: zoom.section })}
            onComplete={() => setZoom(null)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

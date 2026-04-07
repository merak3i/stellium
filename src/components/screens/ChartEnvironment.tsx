'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Orb from '@/components/orb/Orb'
import HUD from '@/components/hud/HUD'
import CosmicOcean from '@/components/environment/CosmicOcean'
import Lifeline from '@/components/environment/Lifeline'
import VedicGateOverlay from '@/components/ui/VedicGateOverlay'
import ChinesePanel from '@/components/screens/ChinesePanel'
import Report from '@/components/report/Report'
import UnlockMechanics from '@/components/unlock/UnlockMechanics'
import type { BirthData, ViewMode } from '@/types'
import { useChartStore } from '@/lib/store/chartStore'

interface ChartEnvironmentProps {
  birthData: BirthData
}

export default function ChartEnvironment({ birthData }: ChartEnvironmentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('exterior')

  const chart        = useChartStore((s) => s.chart)
  const vedicChart   = useChartStore((s) => s.vedicChart)
  const activeSystem = useChartStore((s) => s.activeSystem)

  // Use the chart appropriate for the active system
  const displayChart = activeSystem === 'vedic' ? vedicChart : chart

  return (
    <div className="relative w-full h-full bg-black">
      {/* Side-effect orchestrator — no visual output */}
      <UnlockMechanics />

      {/* 3D canvas */}
      <Canvas
        className="absolute inset-0"
        camera={{ fov: 75, near: 0.1, far: 10000, position: [0, 0, viewMode === 'interior' ? 0 : 5] }}
        gl={{ antialias: true, alpha: false }}
      >
        <CosmicOcean />
        {displayChart && (
          <>
            <Orb chart={displayChart} viewMode={viewMode} />
            <Lifeline />
          </>
        )}
      </Canvas>

      {/* Chinese Four Pillars panel — overlays orb when activeSystem === 'chinese' */}
      <ChinesePanel />

      {/* Vedic gate prompt — appears after Rahu/Ketu unlock */}
      <VedicGateOverlay />

      {/* Synthesis report — triggers at 70% unlock (Western/Vedic) or on Chinese switch */}
      <Report />

      {/* HUD — fixed overlay */}
      <HUD
        viewMode={viewMode}
        onViewModeToggle={() =>
          setViewMode((v) => (v === 'exterior' ? 'interior' : 'exterior'))
        }
      />
    </div>
  )
}

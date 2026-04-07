'use client'

import { useUnlockStore } from '@/lib/store/unlockStore'
import { useChartStore } from '@/lib/store/chartStore'

export default function Sidebar() {
  const unlocked = useUnlockStore((s) => s.unlocked)
  const expanded = useUnlockStore((s) => s.expanded)
  const chart = useChartStore((s) => s.chart)

  const unlockedPlanets = chart?.planets.filter((p) => unlocked.has(p.id)) ?? []

  if (unlockedPlanets.length === 0) {
    return null // Sidebar is empty until first unlock
  }

  return (
    <div className="h-full flex flex-col justify-center pl-4 pr-2 py-8">
      <div className="hud-panel rounded-r-none rounded-l-none space-y-1 py-4 px-3 max-h-[70vh] overflow-y-auto">
        {unlockedPlanets.map((planet) => {
          const isExpanded = expanded.has(planet.id)
          return (
            <div
              key={planet.id}
              className="py-1 border-b border-stellar-dim/10 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-stellar-dim/60 text-xs w-4">{planet.glyph}</span>
                <span
                  className="font-hud text-stellar-white/80 text-xs tracking-widest"
                  style={{ fontVariant: 'small-caps', letterSpacing: '0.2em' }}
                >
                  {planet.name.toUpperCase()}
                </span>
              </div>
              {isExpanded && (
                <div
                  className="font-label text-stellar-dim/60 text-xs mt-0.5 pl-6"
                  style={{ letterSpacing: '0.05em' }}
                >
                  {planet.degrees.toFixed(1)}° {planet.sign} · H{planet.house}
                  {planet.retrograde && ' Rx'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

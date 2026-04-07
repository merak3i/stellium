'use client'

import { useChartStore } from '@/lib/store/chartStore'
import type { ChartSystem } from '@/types'

const SYSTEMS: { id: ChartSystem; label: string }[] = [
  { id: 'western', label: 'WESTERN' },
  { id: 'vedic', label: 'VEDIC' },
  { id: 'chinese', label: 'CHINESE' },
]

// Chart system toggle — only appears after all 3 systems are unlocked.
// Mutually exclusive: only 1 active at a time.
export default function SystemToggle() {
  const activeSystem = useChartStore((s) => s.activeSystem)
  const setActiveSystem = useChartStore((s) => s.setActiveSystem)

  return (
    <div className="hud-panel flex items-center" style={{ borderRadius: '2px' }}>
      {SYSTEMS.map((system, i) => (
        <button
          key={system.id}
          onClick={() => setActiveSystem(system.id)}
          className={`px-5 py-2 transition-colors duration-300 text-xs tracking-widest
            ${i > 0 ? 'border-l border-stellar-dim/10' : ''}
            ${activeSystem === system.id
              ? 'text-stellar-white/80'
              : 'text-stellar-dim/30 hover:text-stellar-dim/50'
            }`}
          style={{ fontVariant: 'small-caps', letterSpacing: '0.25em', fontFamily: 'Helvetica Neue, Helvetica, sans-serif' }}
        >
          {system.label}
        </button>
      ))}
    </div>
  )
}

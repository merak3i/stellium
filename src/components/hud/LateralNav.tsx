'use client'

import { useChartStore } from '@/lib/store/chartStore'
import { useUnlockStore } from '@/lib/store/unlockStore'
import type { BirthData, ChartSystem } from '@/types'

interface LateralNavProps {
  birthData?: BirthData
}

const MONO = "'Space Grotesk', 'JetBrains Mono', monospace"

const SYSTEMS: { id: ChartSystem; label: string; lockHint: string }[] = [
  { id: 'western', label: 'WESTERN',  lockHint: '' },
  { id: 'vedic',   label: 'VEDIC',    lockHint: 'unlock via Rahu/Ketu' },
  { id: 'chinese', label: 'CHINESE',  lockHint: 'unlock via Vedic' },
]

export default function LateralNav({ birthData }: LateralNavProps) {
  const activeSystem   = useChartStore(s => s.activeSystem)
  const setActiveSystem = useChartStore(s => s.setActiveSystem)
  const vedicUnlocked  = useUnlockStore(s => s.vedicUnlocked)
  const chineseUnlocked = useUnlockStore(s => s.chineseUnlocked)

  const isUnlocked = (id: ChartSystem) => {
    if (id === 'western')  return true
    if (id === 'vedic')    return vedicUnlocked
    if (id === 'chinese')  return chineseUnlocked
    return false
  }

  const lat = birthData?.latitude
  const lng = birthData?.longitude
  const coordStr = lat != null && lng != null
    ? `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}  ·  ${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? 'E' : 'W'}`
    : null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 60,
        left: 32,
        zIndex: 20,
        pointerEvents: 'none',
        animation: 'sfadeup 0.5s cubic-bezier(0.16,1,0.3,1) 0.7s both',
      }}
    >
      {/* System tabs */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'center', marginBottom: 10 }}>
        {SYSTEMS.map((sys, i) => {
          const unlocked = isUnlocked(sys.id)
          const active   = activeSystem === sys.id

          return (
            <div key={sys.id} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <span style={{ fontFamily: MONO, fontSize: '7px', color: 'rgba(255,255,255,0.14)', margin: '0 10px' }}>·</span>
              )}
              <button
                onClick={() => unlocked && setActiveSystem(sys.id)}
                title={!unlocked ? sys.lockHint : undefined}
                style={{
                  fontFamily: MONO, fontSize: '8px', fontWeight: 400,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: active
                    ? 'rgba(255,255,255,0.82)'
                    : unlocked
                      ? 'rgba(255,255,255,0.38)'
                      : 'rgba(255,255,255,0.16)',
                  background: 'transparent', border: 'none',
                  cursor: unlocked ? 'none' : 'default',
                  pointerEvents: 'auto',
                  padding: 0,
                  transition: 'color 0.25s ease',
                  textDecoration: active ? 'none' : 'none',
                }}
                onMouseEnter={e => { if (unlocked && !active) e.currentTarget.style.color = 'rgba(255,255,255,0.60)' }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = active
                    ? 'rgba(255,255,255,0.82)'
                    : unlocked ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.16)'
                }}
              >
                {sys.label}
                {!unlocked && (
                  <span style={{ marginLeft: 5, fontSize: '6px', color: 'rgba(255,255,255,0.12)', verticalAlign: 'middle' }}>⌒</span>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Coordinates */}
      {coordStr && (
        <div style={{ fontFamily: MONO, fontSize: '8px', fontWeight: 300, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.18)' }}>
          {coordStr}
        </div>
      )}

      <style>{`
        @keyframes sfadeup { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

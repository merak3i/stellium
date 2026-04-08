'use client'

// Sidebar → PlanetList
// Right-aligned planetary data panel. Dim rows for locked planets, full row on unlock.

import { useUnlockStore } from '@/lib/store/unlockStore'
import { useChartStore } from '@/lib/store/chartStore'
import type { PlanetId } from '@/types'

const MONO = "'Space Grotesk', 'JetBrains Mono', monospace"

const GLYPHS: Record<PlanetId, string> = {
  sun:          '☉',
  moon:         '☽',
  mercury:      '☿',
  venus:        '♀',
  mars:         '♂',
  jupiter:      '♃',
  saturn:       '♄',
  uranus:       '♅',
  neptune:      '♆',
  pluto:        '♇',
  'north-node': '☊',
  'south-node': '☋',
  ascendant:    'AC',
  descendant:   'DC',
  mc:           'MC',
  ic:           'IC',
  vertex:       'Vx',
  antivertex:   'Av',
  'part-of-fortune': '⊕',
  chiron:       '⚷',
}

const SIGN_ABR: Record<string, string> = {
  aries: 'AR', taurus: 'TA', gemini: 'GE', cancer: 'CA',
  leo: 'LE', virgo: 'VI', libra: 'LI', scorpio: 'SC',
  sagittarius: 'SG', capricorn: 'CP', aquarius: 'AQ', pisces: 'PI',
}

// Display order: main planets first, then nodes, then angles
const DISPLAY_ORDER: PlanetId[] = [
  'sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto',
  'north-node','south-node','chiron','part-of-fortune',
  'ascendant','descendant','mc','ic','vertex','antivertex',
]

function fmtDeg(deg: number) {
  const d = Math.floor(deg % 30)
  const m = Math.floor((deg % 30 - d) * 60)
  return `${String(d).padStart(2,'0')}°${String(m).padStart(2,'0')}'`
}

export default function Sidebar() {
  const unlocked = useUnlockStore(s => s.unlocked)
  const chart = useChartStore(s => s.chart)

  if (!chart) return null

  const planetMap = new Map(chart.planets.map(p => [p.id, p]))

  return (
    <div
      style={{
        position: 'fixed',
        right: 32,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        pointerEvents: 'none',
        maxHeight: '70vh',
        overflowY: 'auto',
      }}
    >
      {DISPLAY_ORDER.map((id, idx) => {
        const planet = planetMap.get(id)
        if (!planet) return null
        const isUnlocked = unlocked.has(id)
        const delay = `${0.3 + idx * 0.04}s`

        return (
          <div
            key={id}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'flex-end',
              gap: 6,
              marginBottom: 5,
              opacity: isUnlocked ? 1 : 0.18,
              transition: 'opacity 0.6s ease',
              animation: `sfadeup 0.4s cubic-bezier(0.16,1,0.3,1) ${delay} both`,
            }}
          >
            {isUnlocked ? (
              <>
                <span style={{ fontFamily: MONO, fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                  {planet.name.toUpperCase().slice(0, 3)}
                </span>
                <span style={{ fontFamily: MONO, fontSize: '10px', color: 'rgba(255,255,255,0.72)', letterSpacing: '0.04em', minWidth: 56, textAlign: 'right' }}>
                  {fmtDeg(planet.degrees)}
                </span>
                <span style={{ fontFamily: MONO, fontSize: '8px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.06em', minWidth: 18 }}>
                  {SIGN_ABR[planet.sign] || planet.sign.slice(0,2).toUpperCase()}
                </span>
                <span style={{ fontFamily: MONO, fontSize: '7px', color: 'rgba(255,255,255,0.24)', letterSpacing: '0.04em', minWidth: 22 }}>
                  H{planet.house}
                </span>
                {planet.retrograde && (
                  <span style={{ fontFamily: MONO, fontSize: '7px', color: 'rgba(255,255,255,0.20)' }}>℞</span>
                )}
              </>
            ) : (
              <>
                <span style={{ fontFamily: MONO, fontSize: '14px', color: 'rgba(255,255,255,0.28)', lineHeight: 1 }}>
                  {GLYPHS[id] || '·'}
                </span>
                <span style={{ fontFamily: MONO, fontSize: '8px', color: 'rgba(255,255,255,0.12)', letterSpacing: '0.10em' }}>
                  —° —
                </span>
              </>
            )}
          </div>
        )
      })}

      <style>{`
        @keyframes sfadeup { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

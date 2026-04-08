'use client'

import type { BirthData } from '@/types'

interface ArtifactHeaderProps {
  birthData: BirthData
  onBack: () => void
}

const MONO = "'Space Grotesk', 'JetBrains Mono', monospace"
const HUD  = "'Helvetica Neue', 'HelveticaNeue', 'Inter', Helvetica, Arial, sans-serif"

function dayOfYear(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const start = new Date(y, 0, 0)
  const date = new Date(y, m - 1, d)
  const diff = date.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const doy = Math.floor(diff / oneDay)
  return String(doy).padStart(3, '0')
}

function formatMeta(bd: BirthData): string {
  const parts: string[] = []
  if (bd.date) {
    const d = new Date(bd.date + 'T12:00:00')
    parts.push(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase())
  }
  if (bd.time) parts.push(bd.time)
  if (bd.place) parts.push(bd.place.split(',')[0].toUpperCase())
  return parts.join(' · ')
}

export default function ArtifactHeader({ birthData, onBack }: ArtifactHeaderProps) {
  const artifactId = birthData.date ? dayOfYear(birthData.date) : '—'
  const displayName = birthData.name?.toUpperCase() || '—'
  const meta = formatMeta(birthData)

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 72,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '28px 32px 0',
        zIndex: 20,
        pointerEvents: 'none',
        animation: 'sfadeup 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s both',
      }}
    >
      {/* Back nav */}
      <button
        onClick={onBack}
        style={{
          fontFamily: MONO, fontSize: '9px', fontWeight: 300, letterSpacing: '0.10em',
          color: 'rgba(255,255,255,0.28)', background: 'transparent', border: 'none',
          cursor: 'none', padding: 0, pointerEvents: 'auto', transition: 'color 0.25s ease',
          textTransform: 'uppercase',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.60)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
      >
        ← NEW CHART
      </button>

      {/* Center: Natal Seal + name + meta */}
      <div style={{ textAlign: 'center', transform: 'translateX(-0px)' }}>
        <div style={{ fontFamily: MONO, fontSize: '8px', letterSpacing: '0.28em', color: 'rgba(255,255,255,0.20)', marginBottom: 5, textTransform: 'uppercase' }}>
          · NATAL SEAL ·
        </div>
        <div style={{ fontFamily: HUD, fontSize: '12px', fontVariant: 'small-caps', fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.72)', textTransform: 'uppercase', marginBottom: 3 }}>
          {displayName}
        </div>
        <div style={{ fontFamily: MONO, fontSize: '8px', fontWeight: 300, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.26)' }}>
          {meta}
        </div>
      </div>

      {/* Artifact ID */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: MONO, fontSize: '22px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', lineHeight: 1 }}>
          {artifactId}
        </div>
        <div style={{ fontFamily: MONO, fontSize: '8px', fontWeight: 300, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.22)', marginTop: 2, textTransform: 'lowercase' }}>
          natal seal
        </div>
      </div>

      <style>{`
        @keyframes sfadeup { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

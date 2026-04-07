'use client'

import { useChartStore } from '@/lib/store/chartStore'
import type { Pillar } from '@/lib/astro/chinese'

const ELEMENT_COLOR: Record<string, string> = {
  wood:  'rgba(74, 144, 96, 0.65)',
  fire:  'rgba(192, 80, 48, 0.65)',
  earth: 'rgba(180, 148, 72, 0.65)',
  metal: 'rgba(200, 200, 210, 0.65)',
  water: 'rgba(72, 120, 180, 0.65)',
}

const PILLAR_LABELS = ['Year', 'Month', 'Day', 'Hour']

function PillarColumn({ label, pillar }: { label: string; pillar: Pillar }) {
  const elColor = ELEMENT_COLOR[pillar.element] ?? 'rgba(255,255,255,0.3)'

  return (
    <div style={{ textAlign: 'center', flex: 1, padding: '0 12px' }}>
      {/* Pillar label */}
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '8px',
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.20)',
        marginBottom: 20,
      }}>
        {label}
      </div>

      {/* Heavenly Stem */}
      <div style={{ marginBottom: 8 }}>
        <div style={{
          fontFamily: 'serif',
          fontSize: 'clamp(28px, 3.5vw, 44px)',
          color: 'rgba(255,255,255,0.75)',
          lineHeight: 1,
          marginBottom: 4,
        }}>
          {pillar.stemChar}
        </div>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '9px',
          letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.28)',
        }}>
          {pillar.heavenlyStem}
        </div>
      </div>

      {/* Divider */}
      <div style={{
        width: 1, height: 16,
        background: 'rgba(255,255,255,0.08)',
        margin: '10px auto',
      }} />

      {/* Earthly Branch */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontFamily: 'serif',
          fontSize: 'clamp(24px, 3vw, 38px)',
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1,
          marginBottom: 4,
        }}>
          {pillar.branchChar}
        </div>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '9px',
          letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.22)',
        }}>
          {pillar.earthlyBranch}
        </div>
      </div>

      {/* Element dot + name */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        marginTop: 12,
      }}>
        <div style={{
          width: 5, height: 5, borderRadius: '50%',
          background: elColor,
        }} />
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '8px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: elColor,
        }}>
          {pillar.element}
        </div>
      </div>

      {/* Animal */}
      <div style={{
        marginTop: 10,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '8px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.14)',
      }}>
        {pillar.animal}
      </div>
    </div>
  )
}

export default function ChinesePanel() {
  const chineseData  = useChartStore((s) => s.chineseData)
  const activeSystem = useChartStore((s) => s.activeSystem)

  if (activeSystem !== 'chinese' || !chineseData) return null

  const { fourPillars, animal, element, polarity } = chineseData
  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day, fourPillars.hour]

  return (
    <div
      className="fixed inset-0 z-30 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(2px)' }}
    >
      <div style={{ maxWidth: 560, width: '100%', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '8px',
            letterSpacing: '0.38em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.18)',
            marginBottom: 10,
          }}>
            八字 · Four Pillars
          </div>
          <div style={{
            fontFamily: 'serif',
            fontSize: 'clamp(13px, 1.5vw, 18px)',
            letterSpacing: '0.22em',
            color: 'rgba(255,255,255,0.50)',
          }}>
            {polarity === 'yang' ? '陽' : '陰'} · Year of the {animal.charAt(0).toUpperCase() + animal.slice(1)} · {element.charAt(0).toUpperCase() + element.slice(1)}
          </div>
        </div>

        {/* Four columns */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 32 }}>
          {pillars.map((pillar, i) => (
            <PillarColumn key={i} label={PILLAR_LABELS[i]} pillar={pillar} />
          ))}
        </div>

        {/* Footer note */}
        <div style={{
          textAlign: 'center',
          marginTop: 36,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '8px',
          letterSpacing: '0.20em',
          color: 'rgba(255,255,255,0.10)',
          textTransform: 'uppercase',
        }}>
          Solar calendar approximation · Hour pillar based on local time
        </div>
      </div>
    </div>
  )
}

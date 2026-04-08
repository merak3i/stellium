'use client'

import { useChartStore } from '@/lib/store/chartStore'

const MONO = "'Space Grotesk', 'JetBrains Mono', monospace"
const HUD  = "'Helvetica Neue', 'HelveticaNeue', 'Inter', Helvetica, Arial, sans-serif"

const SIGN_SHORT: Record<string, string> = {
  aries: 'ARIES', taurus: 'TAURUS', gemini: 'GEMINI', cancer: 'CANCER',
  leo: 'LEO', virgo: 'VIRGO', libra: 'LIBRA', scorpio: 'SCORPIO',
  sagittarius: 'SAGITTARIUS', capricorn: 'CAPRICORN', aquarius: 'AQUARIUS', pisces: 'PISCES',
}

function formatDeg(degrees: number): string {
  const d = Math.floor(degrees % 30)
  const mTotal = (degrees % 30 - d) * 60
  const m = Math.floor(mTotal)
  return `${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}'`
}

interface BigThreeItem {
  label: string
  sign: string
  deg: string
  delay: string
}

export default function BigThreePanel() {
  const chart = useChartStore(s => s.chart)

  if (!chart) return null

  const sun  = chart.planets.find(p => p.id === 'sun')
  const moon = chart.planets.find(p => p.id === 'moon')
  const asc  = chart.planets.find(p => p.id === 'ascendant')

  const items: BigThreeItem[] = [
    { label: 'SUN',    sign: sun  ? SIGN_SHORT[sun.sign]  || sun.sign.toUpperCase()  : '—', deg: sun  ? formatDeg(sun.degrees)  : '—', delay: '0.4s' },
    { label: 'MOON',   sign: moon ? SIGN_SHORT[moon.sign] || moon.sign.toUpperCase() : '—', deg: moon ? formatDeg(moon.degrees) : '—', delay: '0.52s' },
    { label: 'RISING', sign: asc  ? SIGN_SHORT[asc.sign]  || asc.sign.toUpperCase()  : '—', deg: asc  ? formatDeg(asc.degrees)  : '—', delay: '0.64s' },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        left: 32,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      {items.map(item => (
        <div
          key={item.label}
          style={{
            marginBottom: 32,
            animation: `sfadeup 0.5s cubic-bezier(0.16,1,0.3,1) ${item.delay} both`,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: '7px', fontWeight: 400, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: 3 }}>
            {item.label}
          </div>
          <div style={{ fontFamily: HUD, fontSize: '14px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', lineHeight: 1.1 }}>
            {item.sign}
          </div>
          <div style={{ fontFamily: MONO, fontSize: '9px', fontWeight: 300, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.32)', marginTop: 2 }}>
            {item.deg}
          </div>
        </div>
      ))}

      <style>{`
        @keyframes sfadeup { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

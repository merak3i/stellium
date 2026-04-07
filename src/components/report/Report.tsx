'use client'

import { useEffect, useState, useRef } from 'react'
import { useUnlockStore } from '@/lib/store/unlockStore'
import { useChartStore } from '@/lib/store/chartStore'
import { generateReport } from '@/lib/ai/report'

const UNLOCK_THRESHOLD = 0.7

export default function Report() {
  const [reportText, setReportText] = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [open,       setOpen]       = useState(false)

  // Track which systems have already triggered a report
  const triggered = useRef<Set<string>>(new Set())

  const unlocked     = useUnlockStore((s) => s.unlocked)
  const chart        = useChartStore((s) => s.chart)
  const vedicChart   = useChartStore((s) => s.vedicChart)
  const chineseData  = useChartStore((s) => s.chineseData)
  const activeSystem = useChartStore((s) => s.activeSystem)

  const displayChart = activeSystem === 'vedic' ? vedicChart : chart
  const unlockProgress = displayChart ? unlocked.size / displayChart.planets.length : 0

  const fire = (system: string) => {
    if (triggered.current.has(system)) return
    triggered.current.add(system)
    setReportText(null)
    setError(null)
    setLoading(true)
    setOpen(true)

    const effectiveChart = system === 'vedic' ? vedicChart : chart
    const chineseArg     = system === 'chinese' ? chineseData : null

    if (!effectiveChart) { setLoading(false); return }

    generateReport(effectiveChart, Array.from(unlocked), chineseArg)
      .then((text) => { setReportText(text); setLoading(false) })
      .catch((err) => {
        setError(
          err?.message?.includes('API')
            ? 'Could not reach the synthesis engine. Check your API key.'
            : 'Synthesis failed. The sky remains unwritten.'
        )
        setLoading(false)
      })
  }

  // Western / Vedic: trigger at 70% unlock threshold
  useEffect(() => {
    if ((activeSystem === 'western' || activeSystem === 'vedic')
        && unlockProgress >= UNLOCK_THRESHOLD
        && displayChart) {
      fire(activeSystem)
    }
  }, [unlockProgress, activeSystem, displayChart])

  // Chinese: trigger immediately on first switch to Chinese
  useEffect(() => {
    if (activeSystem === 'chinese' && chineseData) {
      fire('chinese')
    }
  }, [activeSystem, chineseData])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/92 z-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto py-16 px-8">

        {/* Header row */}
        <div className="mb-12 flex items-start justify-between">
          <div className="space-y-2">
            <p
              className="font-hud text-stellar-dim/60 text-xs tracking-widest"
              style={{ fontVariant: 'small-caps', letterSpacing: '0.4em' }}
            >
              {activeSystem.toUpperCase()} SYNTHESIS
            </p>
            <div className="w-8 h-px bg-stellar-dim/20" />
          </div>

          {(reportText || error) && (
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent', border: 'none',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '8px', letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.22)', cursor: 'none',
                padding: '4px 0', transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.22)' }}
            >
              Return to Chart
            </button>
          )}
        </div>

        {loading && (
          <div
            className="font-hud text-stellar-dim/30 text-xs tracking-widest animate-pulse"
            style={{ fontVariant: 'small-caps', letterSpacing: '0.3em' }}
          >
            COMPOSING
          </div>
        )}

        {error && (
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '12px', letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.35)', lineHeight: 1.8,
          }}>
            {error}
          </p>
        )}

        {reportText && (
          <div className="space-y-6">
            {reportText.split('\n\n').map((paragraph, i) => (
              <p
                key={i}
                className="font-label text-stellar-white/70 text-sm leading-loose"
                style={{ letterSpacing: '0.02em' }}
              >
                {paragraph}
              </p>
            ))}

            <div className="pt-12 flex justify-center">
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'transparent', border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.14)',
                  padding: '3px 0 6px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '8px', letterSpacing: '0.36em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.28)', cursor: 'none',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.28)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
                }}
              >
                Return to Chart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

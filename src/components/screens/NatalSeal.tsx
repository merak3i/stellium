'use client'

import { useEffect, useRef, useState } from 'react'
import type { BirthData } from '@/types'
import { useChartStore } from '@/lib/store/chartStore'

interface NatalSealProps {
  birthData: BirthData
  onComplete: () => void
}

const PHASES = [
  'LOCATING THE HORIZON',
  'MAPPING THE ECLIPTIC',
  'PLACING THE PLANETS',
  'DRAWING THE HOUSES',
  'CALCULATING ASPECTS',
  'SEALING YOUR CHART',
]

const PLANET_GLYPHS = ['☉','☽','☿','♀','♂','♃','♄','♅','♆','♇','☊']
const TWO_PI = Math.PI * 2

export default function NatalSeal({ birthData, onComplete }: NatalSealProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const rafRef      = useRef<number>(0)
  const tRef        = useRef(0)

  const [phaseIdx, setPhaseIdx] = useState(0)
  const [ready,    setReady]    = useState(false)   // chart calculated
  const [done,     setDone]     = useState(false)   // seal fully drawn

  const initChart = useChartStore((s) => s.initChart)

  // ── Calculate chart while animation runs ──
  useEffect(() => {
    initChart(birthData).then(() => setReady(true))
  }, [birthData, initChart])

  // ── Phase cycling ──
  useEffect(() => {
    const id = setInterval(() => {
      setPhaseIdx((i) => {
        if (i >= PHASES.length - 1) return i
        return i + 1
      })
    }, 820)
    return () => clearInterval(id)
  }, [])

  // ── Mark done once both chart ready AND phases complete ──
  useEffect(() => {
    if (ready && phaseIdx >= PHASES.length - 1) {
      const id = setTimeout(() => setDone(true), 600)
      return () => clearTimeout(id)
    }
  }, [ready, phaseIdx])

  // ── Auto-advance after done ──
  useEffect(() => {
    if (!done) return
    const id = setTimeout(onComplete, 1400)
    return () => clearTimeout(id)
  }, [done, onComplete])

  // ── Canvas seal animation ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const SIZE = Math.min(window.innerWidth, window.innerHeight) * 0.46
    canvas.width  = SIZE
    canvas.height = SIZE

    function draw(ts: number) {
      tRef.current = ts * 0.001
      const t = tRef.current
      const cx = SIZE / 2
      const cy = SIZE / 2
      const progress = Math.min(t / 4.5, 1) // 0→1 over 4.5 s

      ctx!.clearRect(0, 0, SIZE, SIZE)

      // ── Rings ──
      const rings = [
        { r: SIZE * 0.46, w: 0.4, a: 0.06 },
        { r: SIZE * 0.40, w: 0.6, a: 0.10 },
        { r: SIZE * 0.34, w: 0.4, a: 0.08 },
        { r: SIZE * 0.26, w: 0.5, a: 0.14 },
        { r: SIZE * 0.18, w: 0.35, a: 0.10 },
      ]
      for (const ring of rings) {
        const arc = progress * TWO_PI
        ctx!.beginPath()
        ctx!.arc(cx, cy, ring.r, -Math.PI / 2, -Math.PI / 2 + arc)
        ctx!.strokeStyle = `rgba(255,255,255,${ring.a})`
        ctx!.lineWidth = ring.w
        ctx!.stroke()
      }

      // ── Slow outer ring (zodiac positions) ──
      const outerR = SIZE * 0.43
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * TWO_PI - Math.PI / 2
        const tickLen = SIZE * 0.025
        const x1 = cx + Math.cos(angle) * (outerR - tickLen)
        const y1 = cy + Math.sin(angle) * (outerR - tickLen)
        const x2 = cx + Math.cos(angle) * outerR
        const y2 = cy + Math.sin(angle) * outerR
        ctx!.beginPath()
        ctx!.moveTo(x1, y1)
        ctx!.lineTo(x2, y2)
        ctx!.strokeStyle = `rgba(255,255,255,${0.10 * progress})`
        ctx!.lineWidth = 0.5
        ctx!.stroke()
      }

      // ── Rotating inner arms ──
      for (let i = 0; i < 8; i++) {
        const angle = t * 0.18 + (i / 8) * TWO_PI
        const r1 = SIZE * 0.04
        const r2 = SIZE * 0.22
        ctx!.beginPath()
        ctx!.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1)
        ctx!.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2)
        ctx!.strokeStyle = `rgba(255,255,255,${0.04 * progress})`
        ctx!.lineWidth = 0.4
        ctx!.stroke()
      }

      // ── Slower counter-rotating ring ──
      ctx!.beginPath()
      ctx!.arc(cx, cy, SIZE * 0.30, -Math.PI / 2 - t * 0.08, -Math.PI / 2 - t * 0.08 + TWO_PI * 0.82)
      ctx!.strokeStyle = `rgba(255,255,255,${0.07 * progress})`
      ctx!.lineWidth = 0.5
      ctx!.setLineDash([3, 6])
      ctx!.stroke()
      ctx!.setLineDash([])

      // ── Planet glyphs orbiting ──
      if (progress > 0.3) {
        const glyphA = (progress - 0.3) / 0.7
        ctx!.font = `${SIZE * 0.055}px serif`
        ctx!.textAlign = 'center'
        ctx!.textBaseline = 'middle'
        for (let i = 0; i < PLANET_GLYPHS.length; i++) {
          const angle = (i / PLANET_GLYPHS.length) * TWO_PI - Math.PI / 2 + t * 0.06
          const r = SIZE * 0.375
          const gx = cx + Math.cos(angle) * r
          const gy = cy + Math.sin(angle) * r
          ctx!.fillStyle = `rgba(255,255,255,${0.28 * glyphA})`
          ctx!.fillText(PLANET_GLYPHS[i], gx, gy)
        }
      }

      // ── Centre dot ──
      ctx!.beginPath()
      ctx!.arc(cx, cy, SIZE * 0.013, 0, TWO_PI)
      ctx!.fillStyle = `rgba(255,255,255,${0.35 * progress})`
      ctx!.fill()

      // ── Seal burst when done ──
      if (done) {
        const burstA = Math.min((t - tRef.current + 0.001) * 0.5, 1)
        ctx!.beginPath()
        ctx!.arc(cx, cy, SIZE * 0.46, 0, TWO_PI)
        ctx!.strokeStyle = `rgba(255,255,255,${0.28 * burstA})`
        ctx!.lineWidth = 1.2
        ctx!.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [done])

  const phase = PHASES[phaseIdx]
  const MONO = "'Space Grotesk', 'JetBrains Mono', monospace"
  const HUD  = "'Helvetica Neue', 'HelveticaNeue', 'Inter', Helvetica, Arial, sans-serif"
  const displayName = birthData.name ? birthData.name.toUpperCase() : null

  return (
    <div
      className="w-full h-full bg-black flex flex-col items-center justify-center gap-8"
      style={{ cursor: 'none' }}
    >
      {/* Seal label + name — visible from phase 1 onward */}
      {phaseIdx >= 1 && (
        <div style={{ textAlign: 'center', animation: 'sfadeup 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div style={{ fontFamily: MONO, fontSize: '8px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: 6 }}>
            · NATAL SEAL ·
          </div>
          {displayName && (
            <div style={{ fontFamily: HUD, fontSize: '12px', fontVariant: 'small-caps', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>
              {displayName}
            </div>
          )}
        </div>
      )}

      {/* Canvas seal */}
      <canvas
        ref={canvasRef}
        style={{
          opacity: done ? 1 : 0.85,
          transition: 'opacity 1s ease',
        }}
      />

      {/* Phase label */}
      <div style={{
        fontFamily: MONO,
        fontSize: '9px',
        letterSpacing: '0.32em',
        textTransform: 'uppercase',
        color: done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.28)',
        transition: 'color 0.8s ease',
        minHeight: 14,
        textAlign: 'center',
      }}>
        {done ? 'NATAL SEAL ASSEMBLED' : phase}
      </div>

      {/* Latin — visible from phase 2 */}
      {phaseIdx >= 2 && !done && (
        <div style={{ fontFamily: MONO, fontSize: '8px', fontStyle: 'italic', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.16)', textAlign: 'center', animation: 'sfadeup 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
          computare nativitatem...
        </div>
      )}

      {/* Breathing dot */}
      {!done && (
        <div style={{
          width: 4, height: 4, borderRadius: '50%',
          background: 'rgba(255,255,255,0.22)',
          animation: 'pulse 1.4s ease infinite',
        }} />
      )}

      <style>{`
        @keyframes sfadeup { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

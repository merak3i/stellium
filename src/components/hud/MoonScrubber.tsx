'use client'

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react'
import { useChartStore } from '@/lib/store/chartStore'
import { calcMoonPhase } from '@/lib/astro/western'

// ─── Moon phase canvas icon ──────────────────────────────────────────────────

function drawMoonPhase(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  phase: number   // 0–360 (0=new, 180=full)
) {
  const p  = phase / 360       // 0–1
  const tx = r * Math.cos(p * 2 * Math.PI)  // terminator x-radius (+crescent, -gibbous)
  const PI = Math.PI
  const TWO_PI = 2 * PI

  // Dark base disc
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, TWO_PI)
  ctx.fillStyle = 'rgba(12,12,12,0.95)'
  ctx.fill()

  if (p < 0.02 || p > 0.98) {
    // New moon — dark disc, subtle ring only
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 0.5
    ctx.stroke()
    return
  }

  // Clip to disc
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, TWO_PI)
  ctx.clip()

  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  const waxing = p <= 0.5

  if (waxing) {
    if (tx >= 0) {
      // Waxing crescent: thin sliver on right
      // Outer right arc (top→right→bottom CW), terminator right arc back (bottom→right narrow→top CCW)
      ctx.beginPath()
      ctx.arc(cx, cy, r, -PI / 2, PI / 2, false)
      ctx.ellipse(cx, cy, Math.max(tx, 0.5), r, 0, PI / 2, -PI / 2, true)
      ctx.closePath()
      ctx.fill()
    } else {
      // Waxing gibbous: right half + left bump
      ctx.beginPath()
      ctx.arc(cx, cy, r, -PI / 2, PI / 2, false)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(cx, cy, -tx, r, 0, -PI / 2, PI / 2, true)
      ctx.closePath()
      ctx.fill()
    }
  } else {
    if (tx <= 0) {
      // Waning gibbous: left half + right bump
      ctx.beginPath()
      ctx.arc(cx, cy, r, -PI / 2, PI / 2, true)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(cx, cy, -tx, r, 0, -PI / 2, PI / 2, false)
      ctx.closePath()
      ctx.fill()
    } else {
      // Waning crescent: thin sliver on left
      ctx.beginPath()
      ctx.arc(cx, cy, r, -PI / 2, PI / 2, true)
      ctx.ellipse(cx, cy, Math.max(tx, 0.5), r, 0, PI / 2, -PI / 2, false)
      ctx.closePath()
      ctx.fill()
    }
  }

  ctx.restore()

  // Outer ring
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, TWO_PI)
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 0.5
  ctx.stroke()
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MoonScrubber() {
  const currentTime    = useChartStore((s) => s.currentTime)
  const setCurrentTime = useChartStore((s) => s.setCurrentTime)
  const birthTime      = useChartStore((s) => s.birthTime)

  const [isDragging, setIsDragging] = useState(false)
  const trackRef   = useRef<HTMLDivElement>(null)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const draggingRef = useRef(false)   // stable ref for touch handlers

  // Time range: ±50 years from birth
  const RANGE_YEARS = 50
  const minTime = birthTime ? birthTime - RANGE_YEARS * 365.25 * 86400 * 1000 : 0
  const maxTime = birthTime ? birthTime + RANGE_YEARS * 365.25 * 86400 * 1000 : 0

  const getProgress = () => {
    if (!birthTime) return 0.5
    return (currentTime - minTime) / (maxTime - minTime)
  }

  const seekToX = useCallback((clientX: number) => {
    if (!trackRef.current || !birthTime) return
    const rect    = trackRef.current.getBoundingClientRect()
    const clamped = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setCurrentTime(minTime + clamped * (maxTime - minTime))
  }, [birthTime, minTime, maxTime, setCurrentTime])

  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    seekToX(e.clientX)
  }, [seekToX])

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    draggingRef.current = true
    setIsDragging(true)
    seekToX(e.touches[0].clientX)
  }, [seekToX])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    e.preventDefault()
    seekToX(e.touches[0].clientX)
  }, [seekToX])

  const handleTouchEnd = useCallback(() => {
    draggingRef.current = false
    setIsDragging(false)
  }, [])

  const displayDate = new Date(currentTime).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  // Draw moon phase on canvas whenever currentTime changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const SIZE = canvas.width
    ctx.clearRect(0, 0, SIZE, SIZE)
    const phase = calcMoonPhase(currentTime)
    drawMoonPhase(ctx, SIZE / 2, SIZE / 2, SIZE / 2 - 1, phase)
  }, [currentTime])

  return (
    <div className="w-full px-12 pb-6 pt-4">
      <div className="hud-panel rounded-full px-6 py-3 flex items-center gap-6">

        {/* Live moon phase icon */}
        <canvas
          ref={canvasRef}
          width={16}
          height={16}
          className="flex-shrink-0"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Scrubber track */}
        <div
          ref={trackRef}
          className="flex-1 h-px bg-stellar-dim/20 relative cursor-pointer"
          onClick={handleTrackClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          {/* Progress fill */}
          <div
            className="absolute left-0 top-0 h-full bg-stellar-dim/40 transition-all"
            style={{ width: `${getProgress() * 100}%` }}
          />

          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-stellar-white transition-all"
            style={{ left: `calc(${getProgress() * 100}% - 4px)` }}
          />

          {/* Birth marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-stellar-gold/60"
            style={{ left: '50%' }}
          />
        </div>

        {/* Current date readout */}
        <div
          className="font-label text-stellar-dim/60 text-xs flex-shrink-0"
          style={{ letterSpacing: '0.05em', minWidth: '7rem', textAlign: 'right' }}
        >
          {displayDate}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'

interface LandingProps {
  onEnter: () => void
}

const LETTERS = ['S', 'T', 'E', 'L', 'L', 'I', 'U', 'M']
const ALIEN_GLYPH = '*.·'

// Oval attractor — defines where full moons live (flat horizon band)
const OX = 0.44
const OY = 0.13
const SHARPNESS = 18.0

// Ambient text phrases that cycle slowly
const AMBIENT_PHRASES = ['AS ABOVE,', 'SO BELOW,', 'THE MIRACLE OF LIFE.']

interface Cell {
  cx: number
  cy: number
  r: number
  letter: string
  isAlien: boolean
  // Drift offsets — very subtle oscillation
  driftPhase: number
  driftSpeed: number
}

export default function Landing({ onEnter }: LandingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ mx: 0, my: 0, smx: 0, smy: 0 })
  const cellsRef = useRef<Cell[]>([])
  const rafRef = useRef<number>(0)
  const sizeRef = useRef({ W: 0, H: 0, CELL: 0 })
  const timeRef = useRef(0)

  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [cursorVisible, setCursorVisible] = useState(false)
  const [ambientIdx, setAmbientIdx] = useState(0)
  const [wordmarkHover, setWordmarkHover] = useState(false)

  // Cycle ambient text
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbientIdx((i) => (i + 1) % AMBIENT_PHRASES.length)
    }, 4200)
    return () => clearInterval(interval)
  }, [])

  function buildGrid(W: number, H: number) {
    let CELL = Math.round(W / 8.2)
    CELL = Math.max(78, Math.min(CELL, 148))
    sizeRef.current = { W, H, CELL }

    const cols = Math.ceil(W / CELL) + 1
    const rows = Math.ceil(H / CELL) + 1
    const cells: Cell[] = []
    let idx = 0

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({
          cx: c * CELL + CELL * 0.5,
          cy: r * CELL + CELL * 0.5,
          r: CELL * 0.38,
          letter: LETTERS[idx % LETTERS.length],
          isAlien: false,
          driftPhase: Math.random() * Math.PI * 2,
          driftSpeed: 0.15 + Math.random() * 0.12,
        })
        idx++
      }
    }

    // Alien glyph at ~75% x, ~62% y
    const tc = Math.round(cols * 0.75)
    const tr = Math.round(rows * 0.62)
    const alienIdx = Math.min(tr * cols + tc, cells.length - 1)
    if (alienIdx >= 0) cells[alienIdx].isAlien = true

    cellsRef.current = cells
  }

  function ovalPhase(cx: number, cy: number, W: number, H: number): number {
    const nx = (cx - W * 0.5) / (W * OX)
    const ny = (cy - H * 0.5) / (H * OY)
    const d = Math.sqrt(nx * nx + ny * ny)
    const distToSurface = Math.abs(d - 1.0)
    return 0.48 * Math.exp(-distToSurface * distToSurface * SHARPNESS)
  }

  function drawMoon(
    ctx: CanvasRenderingContext2D,
    cx: number, cy: number, r: number,
    phase: number, litAngle: number,
    label: string, isAlien: boolean
  ) {
    const illum = Math.sin(phase * Math.PI)
    ctx.save()
    ctx.translate(cx, cy)

    // Drop shadow
    const sdist = r * 0.20
    const sang = litAngle + Math.PI
    ctx.beginPath()
    ctx.arc(Math.cos(sang) * sdist, Math.sin(sang) * sdist, r * 0.97, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(0,0,0,${0.60 + illum * 0.28})`
    ctx.fill()

    // Outer ring
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.09)'
    ctx.lineWidth = 0.55
    ctx.stroke()

    // Dark base disc
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.97, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(10,10,10,0.96)'
    ctx.fill()

    // Illuminated region
    if (illum > 0.01) {
      ctx.save()
      ctx.rotate(litAngle + Math.PI)
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.97, 0, Math.PI * 2)
      ctx.clip()

      const tEx = r * Math.cos(phase * 2 * Math.PI)
      ctx.beginPath()
      if (phase <= 0.5) {
        ctx.arc(0, 0, r * 0.97, -Math.PI / 2, Math.PI / 2, false)
        if (Math.abs(tEx) < 1.5) {
          ctx.lineTo(0, -r * 0.97)
        } else {
          ctx.ellipse(0, 0, Math.abs(tEx) * 0.97, r * 0.97, 0, Math.PI / 2, -Math.PI / 2, tEx > 0)
        }
      } else {
        ctx.arc(0, 0, r * 0.97, Math.PI / 2, -Math.PI / 2, false)
        const tEx2 = -tEx
        if (Math.abs(tEx2) < 1.5) {
          ctx.lineTo(0, r * 0.97)
        } else {
          ctx.ellipse(0, 0, Math.abs(tEx2) * 0.97, r * 0.97, 0, -Math.PI / 2, Math.PI / 2, tEx2 > 0)
        }
      }
      ctx.closePath()
      ctx.fillStyle = `rgba(255,255,255,${0.08 + illum * 0.90})`
      ctx.fill()
      ctx.restore()
    }

    // Letter / alien glyph
    if (isAlien) {
      const sz = r * 0.48
      ctx.save()
      ctx.font = `900 ${sz}px 'Courier New', monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.lineJoin = 'round'
      ctx.lineWidth = sz * 0.32
      const fg = illum > 0.45
        ? `rgba(0,0,0,${0.55 + illum * 0.38})`
        : `rgba(255,255,255,${0.18 + illum * 0.35})`
      ctx.strokeStyle = fg
      ctx.strokeText(ALIEN_GLYPH, 0, sz * 0.04)
      ctx.fillStyle = fg
      ctx.fillText(ALIEN_GLYPH, 0, sz * 0.04)
      ctx.restore()
    } else {
      const sz = r * 0.75
      ctx.save()
      ctx.font = `400 ${sz}px 'Seanor', serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const wA = Math.max(0.04, 0.40 - illum * 0.36)
      const dA = illum * 0.80
      ctx.fillStyle = `rgba(255,255,255,${wA})`
      ctx.fillText(label, 0, sz * 0.04)
      if (dA > 0.04) {
        ctx.fillStyle = `rgba(0,0,0,${dA})`
        ctx.fillText(label, 0, sz * 0.04)
      }
      ctx.restore()
    }

    ctx.restore()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight
    mouseRef.current = { mx: W * 0.5, my: H * 0.5, smx: W * 0.5, smy: H * 0.5 }
    buildGrid(W, H)

    const onMove = (e: MouseEvent) => {
      mouseRef.current.mx = e.clientX
      mouseRef.current.my = e.clientY
      setCursorPos({ x: e.clientX, y: e.clientY })
      setCursorVisible(true)
    }
    const onLeave = () => setCursorVisible(false)
    const onEnterDoc = () => setCursorVisible(true)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnterDoc)

    const onResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      buildGrid(W, H)
    }
    window.addEventListener('resize', onResize)

    function render() {
      const m = mouseRef.current
      m.smx += (m.mx - m.smx) * 0.062
      m.smy += (m.my - m.smy) * 0.062
      timeRef.current += 0.016

      ctx!.clearRect(0, 0, W, H)

      for (const c of cellsRef.current) {
        // Subtle drift — moons silently shifting
        const driftX = Math.sin(timeRef.current * c.driftSpeed + c.driftPhase) * 0.35
        const driftY = Math.cos(timeRef.current * c.driftSpeed * 0.7 + c.driftPhase) * 0.25
        const drawX = c.cx + driftX
        const drawY = c.cy + driftY

        const dx = m.smx - drawX
        const dy = m.smy - drawY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const litAngle = Math.atan2(dy, dx)
        const maxD = Math.sqrt(W * W + H * H) * 0.45
        const boost = 0.10 * Math.exp(-Math.pow(dist / (maxD * 0.18), 2))
        const phase = Math.min(ovalPhase(drawX, drawY, W, H) + boost, 0.499)
        drawMoon(ctx!, drawX, drawY, c.r, phase, litAngle, c.letter, c.isAlien)
      }

      rafRef.current = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnterDoc)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-black overflow-hidden" style={{ cursor: 'none' }}>
      {/* Moon grid canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Polaris cursor */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          transform: 'translate(-50%, -50%)',
          opacity: cursorVisible ? 1 : 0,
          transition: 'opacity 0.2s',
          willChange: 'left, top',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <line x1="12" y1="0" x2="12" y2="7" stroke="white" strokeWidth="0.6" opacity="0.55" />
          <line x1="12" y1="17" x2="12" y2="24" stroke="white" strokeWidth="0.6" opacity="0.55" />
          <line x1="0" y1="12" x2="7" y2="12" stroke="white" strokeWidth="0.6" opacity="0.55" />
          <line x1="17" y1="12" x2="24" y2="12" stroke="white" strokeWidth="0.6" opacity="0.55" />
          <line x1="12" y1="8" x2="12" y2="16" stroke="white" strokeWidth="1.1" opacity="0.92" />
          <line x1="8" y1="12" x2="16" y2="12" stroke="white" strokeWidth="1.1" opacity="0.92" />
          <line x1="9.5" y1="9.5" x2="14.5" y2="14.5" stroke="white" strokeWidth="0.55" opacity="0.48" />
          <line x1="14.5" y1="9.5" x2="9.5" y2="14.5" stroke="white" strokeWidth="0.55" opacity="0.48" />
          <line x1="11" y1="8.8" x2="13" y2="15.2" stroke="white" strokeWidth="0.38" opacity="0.28" />
          <line x1="13" y1="8.8" x2="11" y2="15.2" stroke="white" strokeWidth="0.38" opacity="0.28" />
          <line x1="8.8" y1="11" x2="15.2" y2="13" stroke="white" strokeWidth="0.38" opacity="0.28" />
          <line x1="8.8" y1="13" x2="15.2" y2="11" stroke="white" strokeWidth="0.38" opacity="0.28" />
          <circle cx="12" cy="12" r="1" fill="white" opacity="0.92" />
        </svg>
      </div>

      {/* STELLIUM wordmark — top left — ENTRY POINT (spec: click wordmark to enter) */}
      <button
        onClick={onEnter}
        onMouseEnter={() => setWordmarkHover(true)}
        onMouseLeave={() => setWordmarkHover(false)}
        className="fixed top-[clamp(22px,3vh,38px)] left-[clamp(22px,2.5vw,40px)] z-20
                   bg-transparent border-none p-0 select-none"
        style={{
          fontFamily: "'Seanor', serif",
          fontSize: 'clamp(20px,2.4vw,38px)',
          color: wordmarkHover ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.58)',
          letterSpacing: '0.10em',
          cursor: 'none',
          transition: 'color 0.4s ease',
        }}
      >
        STELLIUM
      </button>

      {/* Ambient cycling text — left edge, bleeding off screen */}
      <div
        className="fixed z-20 pointer-events-none select-none"
        style={{
          left: 'clamp(22px,2.5vw,40px)',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        {AMBIENT_PHRASES.map((phrase, i) => (
          <div
            key={phrase}
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: "var(--font-hud)",
              fontSize: '8px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              fontVariant: 'small-caps',
              color: 'rgba(255,255,255,0.18)',
              whiteSpace: 'nowrap',
              opacity: i === ambientIdx ? 1 : 0,
              transition: 'opacity 1.2s ease',
            }}
          >
            {phrase}
          </div>
        ))}
      </div>

      {/* STELLIUM — bottom right (dim echo) */}
      <div
        className="fixed z-20 pointer-events-none select-none"
        style={{
          bottom: 'clamp(22px,3vh,38px)',
          right: 'clamp(100px,10vw,160px)',
          fontFamily: "'Seanor', serif",
          fontSize: 'clamp(20px,2.4vw,38px)',
          color: 'rgba(255,255,255,0.22)',
          letterSpacing: '0.10em',
        }}
      >
        STELLIUM
      </div>

      {/* Procession of the equinox — right edge, rotated */}
      <div
        className="fixed z-20 pointer-events-none select-none"
        style={{
          top: '50%',
          right: 'clamp(18px,2vw,34px)',
          transform: 'translateY(-50%) rotate(90deg)',
          transformOrigin: 'center center',
          fontFamily: "'Seanor', serif",
          fontSize: 'clamp(7px,0.68vw,10px)',
          color: 'rgba(255,255,255,0.16)',
          letterSpacing: '0.30em',
          whiteSpace: 'nowrap',
        }}
      >
        PROCESSION OF THE EQUINOX
      </div>

      {/* Polaris signature — bottom right */}
      <div
        className="fixed bottom-[clamp(16px,2.2vh,28px)] right-[clamp(20px,2.5vw,36px)]
                   z-20 pointer-events-none flex items-end gap-1"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.32 }}>
          <line x1="8" y1="0" x2="8" y2="5" stroke="white" strokeWidth="0.55" />
          <line x1="8" y1="11" x2="8" y2="16" stroke="white" strokeWidth="0.55" />
          <line x1="0" y1="8" x2="5" y2="8" stroke="white" strokeWidth="0.55" />
          <line x1="11" y1="8" x2="16" y2="8" stroke="white" strokeWidth="0.55" />
          <line x1="8" y1="5.5" x2="8" y2="10.5" stroke="white" strokeWidth="0.95" />
          <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="white" strokeWidth="0.95" />
          <line x1="5.8" y1="5.8" x2="10.2" y2="10.2" stroke="white" strokeWidth="0.45" />
          <line x1="10.2" y1="5.8" x2="5.8" y2="10.2" stroke="white" strokeWidth="0.45" />
          <circle cx="8" cy="8" r="0.85" fill="white" />
        </svg>
        <div className="flex flex-col items-center gap-[3px]">
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.38)' }} />
          <div style={{ width: 4, height: 4, border: '1px solid rgba(255,255,255,.24)' }} />
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'

interface PolarisCursorProps {
  /** Positions the cursor at an explicit x/y. If omitted, tracks mouse automatically. */
  x?: number
  y?: number
}

export default function PolarisCursor({ x: xProp, y: yProp }: PolarisCursorProps = {}) {
  const [pos, setPos]         = useState({ x: -200, y: -200 })
  const [visible, setVisible] = useState(false)
  const smoothRef             = useRef({ x: -200, y: -200, tx: -200, ty: -200, raf: 0 })

  useEffect(() => {
    if (xProp !== undefined && yProp !== undefined) {
      setPos({ x: xProp, y: yProp })
      return
    }

    const s = smoothRef.current

    const onMove = (e: MouseEvent) => {
      s.tx = e.clientX
      s.ty = e.clientY
      setVisible(true)
    }
    const onLeave  = () => setVisible(false)
    const onEnter  = () => setVisible(true)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    function tick() {
      s.x += (s.tx - s.x) * 0.14
      s.y += (s.ty - s.y) * 0.14
      setPos({ x: s.x, y: s.y })
      s.raf = requestAnimationFrame(tick)
    }
    s.raf = requestAnimationFrame(tick)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      cancelAnimationFrame(s.raf)
    }
  }, [xProp, yProp])

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -50%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.18s',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Outer compass arms */}
        <line x1="12" y1="0"  x2="12" y2="7"  stroke="white" strokeWidth="0.55" opacity="0.50"/>
        <line x1="12" y1="17" x2="12" y2="24" stroke="white" strokeWidth="0.55" opacity="0.50"/>
        <line x1="0"  y1="12" x2="7"  y2="12" stroke="white" strokeWidth="0.55" opacity="0.50"/>
        <line x1="17" y1="12" x2="24" y2="12" stroke="white" strokeWidth="0.55" opacity="0.50"/>
        {/* Inner cross */}
        <line x1="12" y1="7.5"  x2="12" y2="16.5" stroke="white" strokeWidth="1.0"  opacity="0.90"/>
        <line x1="7.5" y1="12"  x2="16.5" y2="12" stroke="white" strokeWidth="1.0"  opacity="0.90"/>
        {/* Diagonal X */}
        <line x1="9.5"  y1="9.5"  x2="14.5" y2="14.5" stroke="white" strokeWidth="0.50" opacity="0.45"/>
        <line x1="14.5" y1="9.5"  x2="9.5"  y2="14.5" stroke="white" strokeWidth="0.50" opacity="0.45"/>
        {/* Inner diagonals */}
        <line x1="11"   y1="8.8"  x2="13"   y2="15.2" stroke="white" strokeWidth="0.35" opacity="0.25"/>
        <line x1="13"   y1="8.8"  x2="11"   y2="15.2" stroke="white" strokeWidth="0.35" opacity="0.25"/>
        <line x1="8.8"  y1="11"   x2="15.2" y2="13"   stroke="white" strokeWidth="0.35" opacity="0.25"/>
        <line x1="8.8"  y1="13"   x2="15.2" y2="11"   stroke="white" strokeWidth="0.35" opacity="0.25"/>
        {/* Centre star */}
        <circle cx="12" cy="12" r="1.1" fill="white" opacity="0.90"/>
      </svg>
    </div>
  )
}

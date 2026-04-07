'use client'

import { useState, useEffect } from 'react'

interface EthicalGateProps {
  onContinue: () => void
}

export default function EthicalGate({ onContinue }: EthicalGateProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="relative w-full h-full bg-black flex items-center justify-center select-none"
      style={{
        cursor: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
      onClick={onContinue}
    >
      <div style={{ maxWidth: 320, padding: '0 32px', textAlign: 'center' }}>

        {/* Lock icon — minimal */}
        <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'center' }}>
          <svg width="18" height="22" viewBox="0 0 18 22" fill="none" opacity={0.28}>
            <rect x="1" y="10" width="16" height="11" rx="1.5" stroke="white" strokeWidth="0.8" />
            <path d="M5 10V6.5C5 4.015 7 2 9 2s4 2.015 4 4.5V10" stroke="white" strokeWidth="0.8" strokeLinecap="round" />
            <circle cx="9" cy="15.5" r="1.2" fill="white" />
          </svg>
        </div>

        {/* Primary statement */}
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: '13px',
          letterSpacing: '0.08em',
          color: 'var(--t1)',
          lineHeight: 1.9,
          marginBottom: 32,
        }}>
          Your birth details are a combination lock to your life.
        </p>

        {/* Divider */}
        <div style={{
          width: 1, height: 32, background: 'var(--line)',
          margin: '0 auto 32px',
        }} />

        {/* Privacy lines */}
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: '10px',
          letterSpacing: '0.22em',
          color: 'var(--t3)',
          lineHeight: 2.4,
          textTransform: 'uppercase',
          marginBottom: 40,
        }}>
          <div>This data is not stored.</div>
          <div>This data is not shared.</div>
          <div>It exists only to map your sky.</div>
        </div>

        {/* Divider */}
        <div style={{
          width: 1, height: 32, background: 'var(--line)',
          margin: '0 auto 36px',
        }} />

        {/* Tap-anywhere cue */}
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: '8px',
          letterSpacing: '0.34em',
          color: 'rgba(255,255,255,0.16)',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 4, height: 4, borderRadius: '50%',
            background: 'rgba(255,255,255,0.22)',
            animation: 'pulse 1.6s ease infinite',
          }} />
          Continue
          <div style={{
            width: 4, height: 4, borderRadius: '50%',
            background: 'rgba(255,255,255,0.22)',
            animation: 'pulse 1.6s ease 0.8s infinite',
          }} />
        </div>

      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useUnlockStore } from '@/lib/store/unlockStore'

export default function VedicGateOverlay() {
  const specialEvents  = useUnlockStore((s) => s.specialEvents)
  const vedicUnlocked  = useUnlockStore((s) => s.vedicUnlocked)
  const unlockVedic    = useUnlockStore((s) => s.unlockVedic)

  const [visible,   setVisible]   = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [fading,    setFading]    = useState(false)

  // Appear when Rahu/Ketu fires, disappear once Vedic is unlocked
  useEffect(() => {
    if (specialEvents.has('rahu-ketu-transform') && !vedicUnlocked && !dismissed) {
      // Small delay so the planet unlock animation settles first
      const id = setTimeout(() => setVisible(true), 1800)
      return () => clearTimeout(id)
    }
  }, [specialEvents, vedicUnlocked, dismissed])

  const handleEnter = () => {
    setFading(true)
    setTimeout(() => {
      unlockVedic()
      setDismissed(true)
      setVisible(false)
      setFading(false)
    }, 700)
  }

  const handleDismiss = () => {
    setFading(true)
    setTimeout(() => {
      setDismissed(true)
      setVisible(false)
      setFading(false)
    }, 700)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
      style={{
        background: 'rgba(0,0,0,0.72)',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.7s ease',
      }}
    >
      <div
        style={{
          maxWidth: 300,
          padding: '0 32px',
          textAlign: 'center',
        }}
      >
        {/* Symbol */}
        <div style={{
          fontFamily: 'serif',
          fontSize: 28,
          color: 'rgba(255,255,255,0.30)',
          marginBottom: 28,
          letterSpacing: '0.3em',
        }}>
          ☊ ☋
        </div>

        {/* Header */}
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '9px',
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.22)',
          marginBottom: 20,
        }}>
          The Nodal Axis
        </div>

        {/* Body */}
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '13px',
          letterSpacing: '0.06em',
          color: 'rgba(255,255,255,0.72)',
          lineHeight: 1.9,
          marginBottom: 36,
        }}>
          Rahu and Ketu have been revealed. The karmic axis is visible.
          A second layer of sky awaits — older, and further east.
        </p>

        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.10)', margin: '0 auto 32px' }} />

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <button
            onClick={handleEnter}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.20)',
              padding: '3px 0 6px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '9px',
              letterSpacing: '0.36em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.65)',
              cursor: 'none',
              transition: 'color 0.25s, border-color 0.25s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.95)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.50)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.65)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)'
            }}
          >
            Enter the Vedic Layer
          </button>

          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '2px 0',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '8px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.18)',
              cursor: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.40)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.18)' }}
          >
            Remain in Western
          </button>
        </div>
      </div>
    </div>
  )
}

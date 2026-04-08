'use client'

import { useState, useEffect } from 'react'
import ArtifactHeader from './ArtifactHeader'
import BigThreePanel from './BigThreePanel'
import LateralNav from './LateralNav'
import Sidebar from './Sidebar'
import MoonScrubber from './MoonScrubber'
import ViewToggle from './ViewToggle'
import type { ViewMode, BirthData } from '@/types'
import { useUnlockStore } from '@/lib/store/unlockStore'

const MONO = "'Space Grotesk', 'JetBrains Mono', monospace"

interface HUDProps {
  viewMode: ViewMode
  onViewModeToggle: () => void
  onBack: () => void
  birthData: BirthData
}

export default function HUD({ viewMode, onViewModeToggle, onBack, birthData }: HUDProps) {
  const unlocked = useUnlockStore(s => s.unlocked)

  // Unlock affordance hint — shown for 5s, dismissed on first unlock
  const [showHint, setShowHint] = useState(true)
  const [hintVisible, setHintVisible] = useState(false)

  useEffect(() => {
    // Fade in after 1s
    const fadeIn = setTimeout(() => setHintVisible(true), 1000)
    // Fade out after 5s
    const fadeOut = setTimeout(() => setHintVisible(false), 5000)
    // Hide completely after fade-out finishes
    const hide = setTimeout(() => setShowHint(false), 5600)
    return () => { clearTimeout(fadeIn); clearTimeout(fadeOut); clearTimeout(hide) }
  }, [])

  // Dismiss on first unlock
  useEffect(() => {
    if (unlocked.size > 0) {
      setHintVisible(false)
      setTimeout(() => setShowHint(false), 400)
    }
  }, [unlocked.size])

  return (
    <div className="fixed inset-0 pointer-events-none z-10">

      {/* ── Top bar: Artifact Header ── */}
      <div className="pointer-events-auto">
        <ArtifactHeader birthData={birthData} onBack={onBack} />
      </div>

      {/* ── Left center: Big Three (Sun, Moon, Rising — always visible) ── */}
      <BigThreePanel />

      {/* ── Right center: Planet list (dim → reveals as unlocked) ── */}
      <Sidebar />

      {/* ── Bottom lateral: System nav + coords + scrubber ── */}
      <div className="pointer-events-auto">
        <LateralNav birthData={birthData} />
      </div>

      {/* ── Bottom: Moon Scrubber ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
        <MoonScrubber />
      </div>

      {/* ── Top right: View Toggle ── */}
      <div className="absolute top-6 right-6 pointer-events-auto">
        <ViewToggle viewMode={viewMode} onToggle={onViewModeToggle} />
      </div>

      {/* ── Infinity mark — bottom right ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 28,
          right: 32,
          fontFamily: MONO,
          fontSize: '15px',
          fontWeight: 300,
          color: 'rgba(255,255,255,0.14)',
          pointerEvents: 'none',
          userSelect: 'none',
          animation: 'sfadeup 0.5s cubic-bezier(0.16,1,0.3,1) 0.8s both',
        }}
      >
        ∞
      </div>

      {/* ── Unlock affordance hint ── */}
      {showHint && (
        <div
          style={{
            position: 'fixed',
            bottom: 72,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: MONO,
            fontSize: '8px',
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)',
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: hintVisible ? 1 : 0,
            transition: 'opacity 0.5s ease',
            whiteSpace: 'nowrap',
          }}
        >
          tap any glyph to begin
        </div>
      )}

      <style>{`
        @keyframes sfadeup { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

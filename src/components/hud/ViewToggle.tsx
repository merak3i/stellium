'use client'

import type { ViewMode } from '@/types'

interface ViewToggleProps {
  viewMode: ViewMode
  onToggle: () => void
}

export default function ViewToggle({ viewMode, onToggle }: ViewToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="hud-panel px-4 py-2 flex items-center gap-3
                 hover:border-stellar-dim/20 transition-all duration-300"
      style={{ borderRadius: '2px' }}
    >
      <span className="text-stellar-dim/40 text-xs" style={{ fontSize: '0.5rem' }}>
        {viewMode === 'exterior' ? '◎' : '⊙'}
      </span>
      <span
        className="font-hud text-stellar-dim/60 text-xs tracking-widest"
        style={{ fontVariant: 'small-caps', letterSpacing: '0.25em' }}
      >
        {viewMode === 'exterior' ? 'ENTER' : 'EXIT'}
      </span>
    </button>
  )
}

'use client'

import Sidebar from './Sidebar'
import MoonScrubber from './MoonScrubber'
import ViewToggle from './ViewToggle'
import SystemToggle from './SystemToggle'
import type { ViewMode } from '@/types'
import { useUnlockStore } from '@/lib/store/unlockStore'

interface HUDProps {
  viewMode: ViewMode
  onViewModeToggle: () => void
}

export default function HUD({ viewMode, onViewModeToggle }: HUDProps) {
  const allSystemsUnlocked = useUnlockStore((s) => s.allSystemsUnlocked)

  return (
    // Fixed to screen — does not move with 3D navigation
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Left sidebar — populates as planets unlock */}
      <div className="absolute left-0 top-0 bottom-0 pointer-events-auto">
        <Sidebar />
      </div>

      {/* Top right — view mode toggle */}
      <div className="absolute top-6 right-6 pointer-events-auto">
        <ViewToggle viewMode={viewMode} onToggle={onViewModeToggle} />
      </div>

      {/* Bottom — moon scrubber */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
        <MoonScrubber />
      </div>

      {/* System toggle — appears only after all 3 systems unlocked */}
      {allSystemsUnlocked && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto">
          <SystemToggle />
        </div>
      )}
    </div>
  )
}

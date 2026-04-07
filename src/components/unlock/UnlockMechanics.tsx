'use client'

// UnlockMechanics — documents the unlock dependency graph and special sequences.
// Actual unlock/expand logic lives in unlockStore.ts.
// Special animations are triggered here via store events.

import { useEffect } from 'react'
import { useUnlockStore } from '@/lib/store/unlockStore'

export default function UnlockMechanics() {
  const unlocked = useUnlockStore((s) => s.unlocked)
  const onSpecialUnlock = useUnlockStore((s) => s.onSpecialUnlock)

  useEffect(() => {
    // North/South Node → Rahu/Ketu transformation
    if (unlocked.has('north-node') && unlocked.has('south-node')) {
      onSpecialUnlock('rahu-ketu-transform')
    }
  }, [unlocked, onSpecialUnlock])

  useEffect(() => {
    // Ascendant/Descendant → axis line + camera shift
    if (unlocked.has('ascendant')) {
      onSpecialUnlock('asc-desc-axis')
    }
  }, [unlocked, onSpecialUnlock])

  useEffect(() => {
    // MC/IC → vertical axis + camera tilt
    if (unlocked.has('mc')) {
      onSpecialUnlock('mc-ic-axis')
    }
  }, [unlocked, onSpecialUnlock])

  useEffect(() => {
    // Vertex/Antivertex → sacred geometry shimmer
    if (unlocked.has('vertex')) {
      onSpecialUnlock('vertex-esoteric')
    }
  }, [unlocked, onSpecialUnlock])

  // This component has no visual output — it's a side-effect orchestrator
  return null
}

// ─── Unlock Dependency Rules ────────────────────────────────────────────────
//
// Ascendant must be unlocked before aspects to it are visible.
// Rahu/Ketu sequence requires both North Node AND South Node unlocked.
// Zodiac rim reveal triggers at critical mass (~8 of 10 main planets unlocked).
// Chart system Layer 2 (Vedic) gates on Rahu/Ketu transform completion.
// Chart system Layer 3 (Chinese) gates on Vedic completion.
//
// Easter Eggs:
// · Ophiuchus — clicking cusp area between 0° Sagittarius and late Scorpio
// · Part of Fortune — Arabian/Islamic geometric aesthetic on unlock
// · Moon — live animation of current phase shadow on click

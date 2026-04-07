import { create } from 'zustand'
import type { PlanetId } from '@/types'

// Unlock dependency rules — certain unlocks require prerequisites
const DEPENDENCIES: Partial<Record<PlanetId, PlanetId[]>> = {
  descendant: ['ascendant'],
  ic: ['mc'],
  'south-node': ['north-node'],
  antivertex: ['vertex'],
}

type SpecialEvent =
  | 'rahu-ketu-transform'
  | 'asc-desc-axis'
  | 'mc-ic-axis'
  | 'vertex-esoteric'
  | 'zodiac-rim-reveal'

interface UnlockState {
  unlocked: Set<PlanetId>
  expanded: Set<PlanetId>
  specialEvents: Set<SpecialEvent>

  // Layer progression
  westernComplete: boolean
  vedicUnlocked: boolean
  vedicComplete: boolean
  chineseUnlocked: boolean
  allSystemsUnlocked: boolean

  // Actions
  unlock: (id: PlanetId) => void
  expand: (id: PlanetId) => void
  onSpecialUnlock: (event: SpecialEvent) => void
  unlockVedic: () => void
  unlockChinese: () => void
}

const CRITICAL_MASS = 8  // planets for zodiac rim reveal
const MAIN_10 = new Set<PlanetId>([
  'sun','moon','mercury','venus','mars',
  'jupiter','saturn','uranus','neptune','pluto',
])

export const useUnlockStore = create<UnlockState>((set, get) => ({
  unlocked: new Set(),
  expanded: new Set(),
  specialEvents: new Set(),
  westernComplete: false,
  vedicUnlocked: false,
  vedicComplete: false,
  chineseUnlocked: false,
  allSystemsUnlocked: false,

  unlock: (id) => {
    const { unlocked } = get()
    if (unlocked.has(id)) return

    // Check prerequisites
    const deps = DEPENDENCIES[id]
    if (deps && !deps.every((dep) => unlocked.has(dep))) return

    const next = new Set(unlocked)
    next.add(id)

    // Check zodiac rim reveal threshold
    const triggerRim = next.size >= CRITICAL_MASS && !unlocked.has(id)

    set((state) => ({
      unlocked: next,
      specialEvents: triggerRim
        ? new Set([...state.specialEvents, 'zodiac-rim-reveal'])
        : state.specialEvents,
    }))

    // westernComplete when all 10 main planets are unlocked
    if (!get().westernComplete && MAIN_10.has(id) && [...next].filter((p) => MAIN_10.has(p)).length === 10) {
      set({ westernComplete: true })
    }
  },

  expand: (id) => {
    const { unlocked, expanded } = get()
    if (!unlocked.has(id)) return
    const next = new Set(expanded)
    if (expanded.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    set({ expanded: next })
  },

  onSpecialUnlock: (event) => {
    set((state) => ({
      specialEvents: new Set([...state.specialEvents, event]),
    }))

    // Rahu/Ketu transform → gates Vedic unlock prompt
    // VedicGateOverlay in ChartEnvironment watches specialEvents and calls unlockVedic()
    // when the user confirms — nothing needed here.
  },

  unlockVedic: () => {
    // Mark Vedic complete and simultaneously open Chinese — all three layers available at once
    set({
      vedicUnlocked:      true,
      vedicComplete:      true,
      chineseUnlocked:    true,
      allSystemsUnlocked: true,
    })
  },

  unlockChinese: () => {
    set({ chineseUnlocked: true })
    if (get().vedicComplete) set({ allSystemsUnlocked: true })
  },
}))

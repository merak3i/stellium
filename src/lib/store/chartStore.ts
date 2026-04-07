import { create } from 'zustand'
import type { NatalChart, BirthData, ChartSystem } from '@/types'
import { calculateWesternChart } from '@/lib/astro/western'
import { applyVedicShift } from '@/lib/astro/vedic'
import { calculateChineseChart, type ChineseChart } from '@/lib/astro/chinese'

interface ChartState {
  // Chart data
  chart:       NatalChart | null    // Western (tropical)
  vedicChart:  NatalChart | null    // Vedic (sidereal, Whole Sign)
  chineseData: ChineseChart | null  // Four Pillars
  activeSystem: ChartSystem
  birthData:   BirthData | null

  // Time navigation
  birthTime:      number | null
  currentTime:    number
  isScrubbing:    boolean
  scrubDirection: number            // -1 backward, 0 idle, +1 forward

  // Actions
  initChart:       (data: BirthData) => Promise<void>
  setActiveSystem: (system: ChartSystem) => void
  setCurrentTime:  (time: number) => void
  setScrubbing:    (scrubbing: boolean, direction?: number) => void
}

export const useChartStore = create<ChartState>((set, get) => ({
  chart:        null,
  vedicChart:   null,
  chineseData:  null,
  activeSystem: 'western',
  birthData:    null,
  birthTime:    null,
  currentTime:  Date.now(),
  isScrubbing:  false,
  scrubDirection: 0,

  initChart: async (data: BirthData) => {
    const westernChart = await calculateWesternChart(data)
    const vedicChart   = applyVedicShift(westernChart, data)
    const chineseData  = await calculateChineseChart(data)
    const birthTime    = new Date(`${data.date}T${data.time}`).getTime()
    set({
      chart: westernChart,
      vedicChart,
      chineseData,
      birthData: data,
      birthTime,
      currentTime: birthTime,
    })
  },

  setActiveSystem: (system) => set({ activeSystem: system }),

  setCurrentTime: (time) => {
    const prev = get().currentTime
    set({
      currentTime:    time,
      scrubDirection: time > prev ? 1 : time < prev ? -1 : 0,
      isScrubbing:    true,
    })
    setTimeout(() => {
      if (get().currentTime === time) {
        set({ isScrubbing: false, scrubDirection: 0 })
      }
    }, 300)
  },

  setScrubbing: (scrubbing, direction = 0) =>
    set({ isScrubbing: scrubbing, scrubDirection: direction }),
}))

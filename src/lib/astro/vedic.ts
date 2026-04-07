// Vedic (Sidereal) natal chart — Lahiri ayanamsa, Whole Sign houses.
// Unlocked via the Rahu/Ketu transformation sequence.

import type { BirthData, NatalChart, House, ZodiacSign } from './types'
import { calculateWesternChart, normDeg, signFromDeg, julianDay } from './western'

const SIGNS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
]

// Lahiri ayanamsa — J2000.0 reference value + precession
// Accurate to ±0.05° for 1900–2100
function lahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0   // Julian centuries from J2000
  return 23.85472 + (50.27880 / 3600) * T * 36525
}

// ─── Pure synchronous transform ──────────────────────────────────────────────
// Accepts an already-calculated tropical NatalChart and shifts it to sidereal
// with Whole Sign houses. No double calculation.

export function applyVedicShift(tropical: NatalChart, data: BirthData): NatalChart {
  const [y, m, d] = data.date.split('-').map(Number)
  const [h, min]  = data.time.split(':').map(Number)
  const jd        = julianDay(y, m, d, h + min / 60)
  const ayanamsa  = lahiriAyanamsa(jd)

  // Shift every planet's ecliptic longitude to sidereal + recalculate sign
  const siderealPlanets = tropical.planets.map((p) => {
    const deg  = normDeg(p.degrees - ayanamsa)
    const info = signFromDeg(deg)
    return { ...p, degrees: deg, sign: info.sign }
  })

  // Whole Sign houses: the Ascendant's sidereal sign = House 1,
  // each subsequent sign = the next house. Every planet in that sign is in that house.
  const ascDeg     = siderealPlanets.find((p) => p.id === 'ascendant')!.degrees
  const ascSignIdx = Math.floor(ascDeg / 30)

  const planets = siderealPlanets.map((p) => {
    const signIdx = Math.floor(p.degrees / 30)
    const house   = ((signIdx - ascSignIdx + 12) % 12) + 1
    return { ...p, house }
  })

  // 12 house cusps at sign boundaries starting from Ascendant sign
  const houses: House[] = Array.from({ length: 12 }, (_, i) => {
    const signIdx = (ascSignIdx + i) % 12
    return { number: i + 1, cusp: signIdx * 30, sign: SIGNS[signIdx] }
  })

  return { ...tropical, system: 'vedic', planets, houses }
}

// Async entry point (used if calculating fresh, without a prior Western chart)
export async function calculateVedicChart(data: BirthData): Promise<NatalChart> {
  const tropical = await calculateWesternChart(data)
  return applyVedicShift(tropical, data)
}

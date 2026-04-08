// ─── Screen Flow ────────────────────────────────────────────────────────────

export type Screen =
  | 'landing'
  | 'ethical-gate'
  | 'birth-data'
  | 'natal-seal'
  | 'chart'

// ─── Birth Data ──────────────────────────────────────────────────────────────

export interface BirthData {
  name?: string       // As the user is known
  date: string        // ISO date string: YYYY-MM-DD
  time: string        // HH:MM (24h)
  place: string       // City name or coordinates
  latitude?: number
  longitude?: number
  timezone?: string   // IANA timezone string
}

// ─── Astrological Systems ────────────────────────────────────────────────────

export type ChartSystem = 'western' | 'vedic' | 'chinese'

// ─── Planets & Points ────────────────────────────────────────────────────────

export type PlanetId =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'north-node'
  | 'south-node'
  | 'ascendant'
  | 'descendant'
  | 'mc'
  | 'ic'
  | 'vertex'
  | 'antivertex'
  | 'part-of-fortune'
  | 'chiron'

export interface Planet {
  id: PlanetId
  name: string
  glyph: string           // Unicode or SVG path reference
  degrees: number         // 0–360 ecliptic longitude
  sign: ZodiacSign
  house: number           // 1–12
  retrograde: boolean
  /** 3D position on the celestial sphere (normalized) */
  position: [number, number, number]
}

// ─── Zodiac ──────────────────────────────────────────────────────────────────

export type ZodiacSign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces'

// ─── Aspects ─────────────────────────────────────────────────────────────────

export type AspectType =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'
  | 'quincunx'
  | 'semi-sextile'
  | 'semi-square'
  | 'sesquiquadrate'

export interface Aspect {
  planetA: PlanetId
  planetB: PlanetId
  type: AspectType
  orb: number             // degrees of orb
  applying: boolean       // true = applying, false = separating
}

// ─── Houses ──────────────────────────────────────────────────────────────────

export interface House {
  number: number          // 1–12
  cusp: number            // ecliptic degree of house cusp
  sign: ZodiacSign
}

// ─── Chart ───────────────────────────────────────────────────────────────────

export interface NatalChart {
  system: ChartSystem
  birthData: BirthData
  planets: Planet[]
  houses: House[]
  aspects: Aspect[]
  generatedAt: Date
}

// ─── Unlock State ────────────────────────────────────────────────────────────

export interface UnlockState {
  unlocked: Set<PlanetId>
  expanded: Set<PlanetId>   // unlocked AND expanded to show degrees/sign/house
}

// ─── View Modes ──────────────────────────────────────────────────────────────

export type ViewMode = 'exterior' | 'interior'

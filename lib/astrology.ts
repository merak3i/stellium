// ─────────────────────────────────────────────────────────────
// Nackshatra AI — Vedic + Western Astrology Engine
// Pure TypeScript. No native deps. Vercel-safe.
// Accuracy: ~0.5–1° (sufficient — nakshatras are 13.3° wide)
// ─────────────────────────────────────────────────────────────

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer'
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio'
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces'

export type VedicRashi =
  | 'Mesh' | 'Vrishabh' | 'Mithun' | 'Kark'
  | 'Simha' | 'Kanya' | 'Tula' | 'Vrishchik'
  | 'Dhanu' | 'Makar' | 'Kumbh' | 'Meen'

export interface CosmicContext {
  date: string
  sunSign: ZodiacSign
  moonSign: ZodiacSign
  moonRashi: VedicRashi
  moonNakshatra: string
  moonNakshatraPada: number
  moonNakshatraLord: string
  moonDegreeInRashi: number
  tithi: string
  yoga: string
  isWaxing: boolean
}

export interface NakshatraInfo {
  name: string
  englishName: string
  lord: string
  deity: string
  symbol: string
  pada: number
  index: number
  quality: string
  element: string
  guna: string
  motivation: string
  bodyPart: string
}

export interface BirthChart {
  sunSign: ZodiacSign
  moonSign: ZodiacSign | null
  vedic: {
    rashi: VedicRashi
    moonRashi: VedicRashi | null
    nakshatra: NakshatraInfo | null
    lagna: VedicRashi | null
  }
  sunLongitude: number
  moonLongitude: number | null
  birthData: {
    date: Date
    hasTime: boolean
    hasPlace: boolean
    lat?: number
    lng?: number
  }
}

// ─── Math helpers ────────────────────────────────────────────

const toRad = (d: number) => d * (Math.PI / 180)
const toDeg = (r: number) => r * (180 / Math.PI)
const norm = (a: number) => ((a % 360) + 360) % 360

// ─── Julian Date ─────────────────────────────────────────────

export function getJulianDate(date: Date): number {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate()
    + date.getUTCHours() / 24
    + date.getUTCMinutes() / 1440
    + date.getUTCSeconds() / 86400

  let Y = y, M = m
  if (M <= 2) { Y--; M += 12 }

  const A = Math.floor(Y / 100)
  const B = 2 - A + Math.floor(A / 4)

  return Math.floor(365.25 * (Y + 4716))
       + Math.floor(30.6001 * (M + 1))
       + d + B - 1524.5
}

// ─── Sun longitude (tropical) ────────────────────────────────
// Jean Meeus "Astronomical Algorithms" Ch.25 (low precision)

export function getSunLongitude(date: Date): number {
  const JD = getJulianDate(date)
  const T = (JD - 2451545.0) / 36525

  const L0 = norm(280.46646 + 36000.76983 * T + 0.0003032 * T * T)
  const M  = norm(357.52911 + 35999.05029 * T - 0.0001537 * T * T)
  const Mr = toRad(M)

  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
          + 0.000289 * Math.sin(3 * Mr)

  const sunLong = norm(L0 + C)
  return sunLong
}

// ─── Moon longitude (tropical) ───────────────────────────────
// Jean Meeus Ch.47, 15-term simplified (±0.1° accuracy)

export function getMoonLongitude(date: Date): number {
  const JD = getJulianDate(date)
  const T  = (JD - 2451545.0) / 36525

  const D  = norm(297.85036 + 445267.111480 * T - 0.0019142 * T * T)
  const M  = norm(357.52772 + 35999.050340 * T - 0.0001603 * T * T)
  const Mp = norm(134.96298 + 477198.867398 * T + 0.0086972 * T * T)
  const F  = norm(93.27191  + 483202.017538 * T - 0.0036825 * T * T)

  const L = norm(218.3165 + 481267.8813 * T)

  const dL = (
      6288774 * Math.sin(toRad(Mp))
    + 1274027 * Math.sin(toRad(2*D - Mp))
    +  658314 * Math.sin(toRad(2*D))
    +  213618 * Math.sin(toRad(2*Mp))
    -  185116 * Math.sin(toRad(M))
    -  114332 * Math.sin(toRad(2*F))
    +   58793 * Math.sin(toRad(2*D - 2*Mp))
    +   57066 * Math.sin(toRad(2*D - M - Mp))
    +   53322 * Math.sin(toRad(2*D + Mp))
    +   45758 * Math.sin(toRad(2*D - M))
    -   40923 * Math.sin(toRad(M - Mp))
    -   34720 * Math.sin(toRad(D))
    -   30383 * Math.sin(toRad(M + Mp))
    +   15327 * Math.sin(toRad(2*D - 2*F))
    -   12528 * Math.sin(toRad(Mp + 2*F))
  )

  return norm(L + dL / 1e6)
}

// ─── Lahiri Ayanamsa (Chitrapaksha) ──────────────────────────

export function getLahiriAyanamsa(date: Date): number {
  const JD = getJulianDate(date)
  // At J2000.0 (JD 2451545.0) Lahiri ayanamsa ≈ 23.8579°
  // Precession rate ≈ 50.3"/year = 0.013972°/year
  return 23.8579 + 0.013972 * ((JD - 2451545.0) / 365.25)
}

// ─── Zodiac sign from tropical longitude ─────────────────────

const TROPICAL_SIGNS: ZodiacSign[] = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
]

export function getZodiacSign(longitude: number): ZodiacSign {
  return TROPICAL_SIGNS[Math.floor(norm(longitude) / 30)]
}

// ─── Sun sign from DOB (simple, no ephemeris needed) ─────────
// This handles the common edge cases around sign cusps

export function getSunSignFromDOB(month: number, day: number): ZodiacSign {
  const md = month * 100 + day
  if (md >= 321 && md <= 419) return 'Aries'
  if (md >= 420 && md <= 520) return 'Taurus'
  if (md >= 521 && md <= 620) return 'Gemini'
  if (md >= 621 && md <= 722) return 'Cancer'
  if (md >= 723 && md <= 822) return 'Leo'
  if (md >= 823 && md <= 922) return 'Virgo'
  if (md >= 923 && md <= 1022) return 'Libra'
  if (md >= 1023 && md <= 1121) return 'Scorpio'
  if (md >= 1122 && md <= 1221) return 'Sagittarius'
  if (md >= 1222 || md <= 119) return 'Capricorn'
  if (md >= 120 && md <= 218) return 'Aquarius'
  return 'Pisces'
}

// ─── Vedic rashi from sidereal longitude ─────────────────────

const VEDIC_RASHIS: VedicRashi[] = [
  'Mesh','Vrishabh','Mithun','Kark',
  'Simha','Kanya','Tula','Vrishchik',
  'Dhanu','Makar','Kumbh','Meen'
]

export function getVedicRashi(tropicalLongitude: number, ayanamsa: number): VedicRashi {
  const sidereal = norm(tropicalLongitude - ayanamsa)
  return VEDIC_RASHIS[Math.floor(sidereal / 30)]
}

// Western sign → Vedic rashi mapping (approximate for display)
export const SIGN_TO_RASHI: Record<ZodiacSign, VedicRashi> = {
  Aries: 'Mesh', Taurus: 'Vrishabh', Gemini: 'Mithun', Cancer: 'Kark',
  Leo: 'Simha', Virgo: 'Kanya', Libra: 'Tula', Scorpio: 'Vrishchik',
  Sagittarius: 'Dhanu', Capricorn: 'Makar', Aquarius: 'Kumbh', Pisces: 'Meen'
}

// ─── 27 Nakshatras ────────────────────────────────────────────

export const NAKSHATRAS: NakshatraInfo[] = [
  { index: 0, name: 'Ashwini', englishName: 'Horse Head', lord: 'Ketu', deity: 'Ashwins', symbol: '🐴', pada: 1, quality: 'Swift', element: 'Fire', guna: 'Rajas', motivation: 'Dharma', bodyPart: 'Knees' },
  { index: 1, name: 'Bharani', englishName: 'Bearer', lord: 'Venus', deity: 'Yama', symbol: '🔺', pada: 1, quality: 'Fierce', element: 'Earth', guna: 'Rajas', motivation: 'Artha', bodyPart: 'Head' },
  { index: 2, name: 'Krittika', englishName: 'Pleiades', lord: 'Sun', deity: 'Agni', symbol: '🔪', pada: 1, quality: 'Mixed', element: 'Fire', guna: 'Rajas', motivation: 'Kama', bodyPart: 'Hips' },
  { index: 3, name: 'Rohini', englishName: 'Red One', lord: 'Moon', deity: 'Brahma', symbol: '🛒', pada: 1, quality: 'Fixed', element: 'Earth', guna: 'Rajas', motivation: 'Moksha', bodyPart: 'Forehead' },
  { index: 4, name: 'Mrigashira', englishName: 'Deer Head', lord: 'Mars', deity: 'Soma', symbol: '🦌', pada: 1, quality: 'Soft', element: 'Earth', guna: 'Tamas', motivation: 'Moksha', bodyPart: 'Eyes' },
  { index: 5, name: 'Ardra', englishName: 'Moist One', lord: 'Rahu', deity: 'Rudra', symbol: '💎', pada: 1, quality: 'Sharp', element: 'Water', guna: 'Tamas', motivation: 'Kama', bodyPart: 'Head' },
  { index: 6, name: 'Punarvasu', englishName: 'Return of Light', lord: 'Jupiter', deity: 'Aditi', symbol: '🏹', pada: 1, quality: 'Movable', element: 'Water', guna: 'Sattva', motivation: 'Artha', bodyPart: 'Nose' },
  { index: 7, name: 'Pushya', englishName: 'Nourisher', lord: 'Saturn', deity: 'Brihaspati', symbol: '🌸', pada: 1, quality: 'Light', element: 'Water', guna: 'Tamas', motivation: 'Dharma', bodyPart: 'Mouth' },
  { index: 8, name: 'Ashlesha', englishName: 'Embracer', lord: 'Mercury', deity: 'Nagas', symbol: '🐍', pada: 1, quality: 'Sharp', element: 'Water', guna: 'Sattva', motivation: 'Dharma', bodyPart: 'Ears' },
  { index: 9, name: 'Magha', englishName: 'Mighty One', lord: 'Ketu', deity: 'Pitrs', symbol: '👑', pada: 1, quality: 'Fierce', element: 'Fire', guna: 'Tamas', motivation: 'Artha', bodyPart: 'Lips' },
  { index: 10, name: 'Purva Phalguni', englishName: 'First Reddish One', lord: 'Venus', deity: 'Bhaga', symbol: '🛏️', pada: 1, quality: 'Fierce', element: 'Fire', guna: 'Rajas', motivation: 'Kama', bodyPart: 'Right hand' },
  { index: 11, name: 'Uttara Phalguni', englishName: 'Second Reddish One', lord: 'Sun', deity: 'Aryaman', symbol: '🛏️', pada: 1, quality: 'Fixed', element: 'Fire', guna: 'Rajas', motivation: 'Moksha', bodyPart: 'Left hand' },
  { index: 12, name: 'Hasta', englishName: 'Hand', lord: 'Moon', deity: 'Savitar', symbol: '✋', pada: 1, quality: 'Light', element: 'Earth', guna: 'Rajas', motivation: 'Moksha', bodyPart: 'Hands' },
  { index: 13, name: 'Chitra', englishName: 'Bright One', lord: 'Mars', deity: 'Vishwakarma', symbol: '💎', pada: 1, quality: 'Soft', element: 'Fire', guna: 'Tamas', motivation: 'Kama', bodyPart: 'Forehead' },
  { index: 14, name: 'Swati', englishName: 'Independent', lord: 'Rahu', deity: 'Vayu', symbol: '🌱', pada: 1, quality: 'Movable', element: 'Air', guna: 'Tamas', motivation: 'Artha', bodyPart: 'Chest' },
  { index: 15, name: 'Vishakha', englishName: 'Forked', lord: 'Jupiter', deity: 'Indra-Agni', symbol: '🌿', pada: 1, quality: 'Mixed', element: 'Fire', guna: 'Rajas', motivation: 'Dharma', bodyPart: 'Breasts' },
  { index: 16, name: 'Anuradha', englishName: 'Following Radha', lord: 'Saturn', deity: 'Mitra', symbol: '🌸', pada: 1, quality: 'Soft', element: 'Fire', guna: 'Tamas', motivation: 'Dharma', bodyPart: 'Heart' },
  { index: 17, name: 'Jyeshtha', englishName: 'Eldest', lord: 'Mercury', deity: 'Indra', symbol: '🪬', pada: 1, quality: 'Sharp', element: 'Water', guna: 'Rajas', motivation: 'Artha', bodyPart: 'Neck' },
  { index: 18, name: 'Mula', englishName: 'Root', lord: 'Ketu', deity: 'Nirriti', symbol: '🌿', pada: 1, quality: 'Sharp', element: 'Fire', guna: 'Tamas', motivation: 'Kama', bodyPart: 'Feet' },
  { index: 19, name: 'Purva Ashadha', englishName: 'First Invincible', lord: 'Venus', deity: 'Apas', symbol: '🐘', pada: 1, quality: 'Fierce', element: 'Fire', guna: 'Rajas', motivation: 'Moksha', bodyPart: 'Thighs' },
  { index: 20, name: 'Uttara Ashadha', englishName: 'Second Invincible', lord: 'Sun', deity: 'Vishvedevas', symbol: '🐘', pada: 1, quality: 'Fixed', element: 'Earth', guna: 'Rajas', motivation: 'Moksha', bodyPart: 'Thighs' },
  { index: 21, name: 'Shravana', englishName: 'Hearing', lord: 'Moon', deity: 'Vishnu', symbol: '👂', pada: 1, quality: 'Movable', element: 'Air', guna: 'Rajas', motivation: 'Artha', bodyPart: 'Ears' },
  { index: 22, name: 'Dhanishtha', englishName: 'Wealthy', lord: 'Mars', deity: 'Ashta Vasus', symbol: '🥁', pada: 1, quality: 'Movable', element: 'Ether', guna: 'Tamas', motivation: 'Dharma', bodyPart: 'Back' },
  { index: 23, name: 'Shatabhisha', englishName: 'Hundred Healers', lord: 'Rahu', deity: 'Varuna', symbol: '⭕', pada: 1, quality: 'Movable', element: 'Ether', guna: 'Tamas', motivation: 'Dharma', bodyPart: 'Right thigh' },
  { index: 24, name: 'Purva Bhadrapada', englishName: 'First Blessed Feet', lord: 'Jupiter', deity: 'Aja Ekapada', symbol: '⚔️', pada: 1, quality: 'Fierce', element: 'Ether', guna: 'Rajas', motivation: 'Artha', bodyPart: 'Sides' },
  { index: 25, name: 'Uttara Bhadrapada', englishName: 'Second Blessed Feet', lord: 'Saturn', deity: 'Ahirbudhnya', symbol: '🐍', pada: 1, quality: 'Fixed', element: 'Ether', guna: 'Tamas', motivation: 'Kama', bodyPart: 'Sides' },
  { index: 26, name: 'Revati', englishName: 'Wealthy', lord: 'Mercury', deity: 'Pushan', symbol: '🐠', pada: 1, quality: 'Soft', element: 'Ether', guna: 'Sattva', motivation: 'Moksha', bodyPart: 'Ankles' },
]

// ─── Nakshatra from sidereal Moon longitude ───────────────────

export function getNakshatra(moonLongitude: number, ayanamsa: number): NakshatraInfo {
  const sidereal = norm(moonLongitude - ayanamsa)
  const span = 360 / 27  // 13.333...°
  const idx  = Math.floor(sidereal / span)
  const pada = Math.floor((sidereal % span) / (span / 4)) + 1

  const base = NAKSHATRAS[Math.min(idx, 26)]
  return { ...base, pada }
}

// ─── Vimshottari Dasha lord from nakshatra ────────────────────

const DASHA_SEQUENCE = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury']
const DASHA_YEARS    = [7, 20, 6, 10, 7, 18, 16, 19, 17]
const NAKSHATRA_LORDS = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
                          'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury',
                          'Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury']

export interface DashaPeriod {
  lord: string
  startDate: Date
  endDate: Date
  yearsRemaining: number
  percentComplete: number
}

export function getCurrentDasha(birthDate: Date, moonLongitude: number, ayanamsa: number): DashaPeriod | null {
  try {
    const nakshatra = getNakshatra(moonLongitude, ayanamsa)
    const nakshatraIdx = nakshatra.index
    const lord = NAKSHATRA_LORDS[nakshatraIdx]

    // Calculate how far into the nakshatra the Moon is
    const sidereal = norm(moonLongitude - ayanamsa)
    const span = 360 / 27
    const positionInNakshatra = (sidereal % span) / span // 0 to 1

    const dashaPlanetIdx = DASHA_SEQUENCE.indexOf(lord)
    const totalYearsForCurrentDasha = DASHA_YEARS[dashaPlanetIdx]

    // Remaining years in current dasha at birth
    const remainingAtBirth = totalYearsForCurrentDasha * (1 - positionInNakshatra)
    const msPerYear = 365.25 * 24 * 60 * 60 * 1000

    let currentDate = new Date()
    let dashStart = new Date(birthDate)
    let dashEnd = new Date(birthDate.getTime() + remainingAtBirth * msPerYear)

    // First dasha (partial)
    if (currentDate < dashEnd) {
      const totalMs = dashEnd.getTime() - dashStart.getTime()
      const elapsedMs = currentDate.getTime() - dashStart.getTime()
      return {
        lord,
        startDate: dashStart,
        endDate: dashEnd,
        yearsRemaining: (dashEnd.getTime() - currentDate.getTime()) / msPerYear,
        percentComplete: (elapsedMs / totalMs) * 100,
      }
    }

    // Cycle through subsequent dashas
    let cursor = dashEnd
    let idx = (dashaPlanetIdx + 1) % 9

    for (let i = 0; i < 9; i++) {
      const years = DASHA_YEARS[idx]
      const nextCursor = new Date(cursor.getTime() + years * msPerYear)

      if (currentDate >= cursor && currentDate < nextCursor) {
        const totalMs = nextCursor.getTime() - cursor.getTime()
        const elapsedMs = currentDate.getTime() - cursor.getTime()
        return {
          lord: DASHA_SEQUENCE[idx],
          startDate: cursor,
          endDate: nextCursor,
          yearsRemaining: (nextCursor.getTime() - currentDate.getTime()) / msPerYear,
          percentComplete: (elapsedMs / totalMs) * 100,
        }
      }
      cursor = nextCursor
      idx = (idx + 1) % 9
    }

    return null
  } catch {
    return null
  }
}

// ─── Build full birth chart ───────────────────────────────────

export function buildBirthChart(
  dateStr: string,
  timeStr?: string,
  lat?: number,
  lng?: number
): BirthChart {
  const [year, month, day] = dateStr.split('-').map(Number)
  const hasTime = !!timeStr
  const hasPlace = lat != null && lng != null

  // Build UTC date (use local noon if no time given)
  let utcHour = 12, utcMin = 0
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number)
    // Rough IST→UTC correction if no coords
    const offsetHours = lng ? -(lng / 15) : -5.5
    utcHour = h + offsetHours
    utcMin = m
  }

  const date = new Date(Date.UTC(year, month - 1, day, Math.floor(utcHour), utcMin))

  const sunLong = getSunLongitude(date)
  const ayanamsa = getLahiriAyanamsa(date)

  let moonLong: number | null = null
  let nakshatra: NakshatraInfo | null = null
  let moonRashi: VedicRashi | null = null
  let moonSign: ZodiacSign | null = null

  if (hasTime) {
    moonLong = getMoonLongitude(date)
    nakshatra = getNakshatra(moonLong, ayanamsa)
    moonRashi = getVedicRashi(moonLong, ayanamsa)
    moonSign = getZodiacSign(moonLong)
  }

  const sunSign = getSunSignFromDOB(month, day)
  const rashi = getVedicRashi(sunLong, ayanamsa)

  return {
    sunSign,
    moonSign,
    vedic: {
      rashi,
      moonRashi,
      nakshatra,
      lagna: null, // requires rising time calculation
    },
    sunLongitude: sunLong,
    moonLongitude: moonLong,
    birthData: { date, hasTime, hasPlace, lat, lng },
  }
}

// ─── Today's cosmic context (for prompts) ────────────────────

export function getTodayCosmicContext(date: Date = new Date()): CosmicContext {
  const sunLong = getSunLongitude(date)
  const moonLong = getMoonLongitude(date)
  const ayanamsa = getLahiriAyanamsa(date)

  const sunSign = getZodiacSign(sunLong)
  const moonSign = getZodiacSign(moonLong)
  const moonRashi = getVedicRashi(moonLong, ayanamsa)
  const moonNakshatra = getNakshatra(moonLong, ayanamsa)
  const siderealMoon = norm(moonLong - ayanamsa)
  const moonDegreeInRashi = siderealMoon % 30

  // Tithi (lunar day)
  const elongation = norm(moonLong - sunLong)
  const tithi = Math.floor(elongation / 12) + 1

  // Yoga (sum of sun + moon sidereal longitudes / 13.333°)
  const yoga = Math.floor(norm((siderealMoon + norm(sunLong - ayanamsa)) / (360/27)))

  const TITHI_NAMES = ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
    'Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi',
    'Trayodashi','Chaturdashi','Amavasya/Purnima']
  const YOGA_NAMES = ['Vishkambha','Priti','Ayushman','Saubhagya','Shobhana',
    'Atiganda','Sukarma','Dhriti','Shula','Ganda','Vriddhi','Dhruva','Vyaghata',
    'Harshana','Vajra','Siddhi','Vyatipata','Variyan','Parigha','Shiva',
    'Siddha','Sadhya','Shubha','Shukla','Brahma','Indra','Vaidhriti']

  return {
    date: date.toISOString().split('T')[0],
    sunSign,
    moonSign,
    moonRashi,
    moonNakshatra: moonNakshatra.name,
    moonNakshatraPada: moonNakshatra.pada,
    moonNakshatraLord: moonNakshatra.lord,
    moonDegreeInRashi: Math.round(moonDegreeInRashi * 10) / 10,
    tithi: TITHI_NAMES[Math.min(tithi - 1, 14)] || 'Purnima',
    yoga: YOGA_NAMES[yoga] || 'Shubha',
    isWaxing: elongation < 180,
  }
}

// ─── Sign info for UI ─────────────────────────────────────────

export const SIGN_INFO: Record<ZodiacSign, {
  emoji: string; vedic: string; element: string; ruling: string; glyph: string; dates: string
}> = {
  Aries:       { emoji: '♈', vedic: 'Mesh',      element: 'Fire',  ruling: 'Mars',    glyph: '♈', dates: 'Mar 21–Apr 19' },
  Taurus:      { emoji: '♉', vedic: 'Vrishabh',  element: 'Earth', ruling: 'Venus',   glyph: '♉', dates: 'Apr 20–May 20' },
  Gemini:      { emoji: '♊', vedic: 'Mithun',    element: 'Air',   ruling: 'Mercury', glyph: '♊', dates: 'May 21–Jun 20' },
  Cancer:      { emoji: '♋', vedic: 'Kark',      element: 'Water', ruling: 'Moon',    glyph: '♋', dates: 'Jun 21–Jul 22' },
  Leo:         { emoji: '♌', vedic: 'Simha',     element: 'Fire',  ruling: 'Sun',     glyph: '♌', dates: 'Jul 23–Aug 22' },
  Virgo:       { emoji: '♍', vedic: 'Kanya',     element: 'Earth', ruling: 'Mercury', glyph: '♍', dates: 'Aug 23–Sep 22' },
  Libra:       { emoji: '♎', vedic: 'Tula',      element: 'Air',   ruling: 'Venus',   glyph: '♎', dates: 'Sep 23–Oct 22' },
  Scorpio:     { emoji: '♏', vedic: 'Vrishchik', element: 'Water', ruling: 'Mars',    glyph: '♏', dates: 'Oct 23–Nov 21' },
  Sagittarius: { emoji: '♐', vedic: 'Dhanu',     element: 'Fire',  ruling: 'Jupiter', glyph: '♐', dates: 'Nov 22–Dec 21' },
  Capricorn:   { emoji: '♑', vedic: 'Makar',     element: 'Earth', ruling: 'Saturn',  glyph: '♑', dates: 'Dec 22–Jan 19' },
  Aquarius:    { emoji: '♒', vedic: 'Kumbh',     element: 'Air',   ruling: 'Saturn',  glyph: '♒', dates: 'Jan 20–Feb 18' },
  Pisces:      { emoji: '♓', vedic: 'Meen',      element: 'Water', ruling: 'Jupiter', glyph: '♓', dates: 'Feb 19–Mar 20' },
}

// ─── Meeus Ephemeris Engine ────────────────────────────────────────────────
// Based on Jean Meeus "Astronomical Algorithms" 2nd Ed.
// Accuracy: ~1° for planets — sufficient for natal chart work.
// Ported from the original Stellium vanilla JS implementation.

import type { BirthData, NatalChart, Planet, House, Aspect, PlanetId, ZodiacSign } from './types'

const DEG = Math.PI / 180
const RAD = 180 / Math.PI

const SIGNS: ZodiacSign[] = [
  'aries','taurus','gemini','cancer','leo','virgo',
  'libra','scorpio','sagittarius','capricorn','aquarius','pisces',
]
const SIGN_ABBR = ['ARI','TAU','GEM','CAN','LEO','VIR','LIB','SCO','SAG','CAP','AQU','PIS']

// ─── Utilities ───────────────────────────────────────────────────────────────

export function normDeg(d: number): number {
  return ((d % 360) + 360) % 360
}

export function signFromDeg(deg: number) {
  const d = normDeg(deg)
  const idx = Math.floor(d / 30)
  return {
    sign: SIGNS[idx],
    abbr: SIGN_ABBR[idx],
    degree: d % 30,
    totalDeg: d,
  }
}

export function formatDeg(deg: number): string {
  const info = signFromDeg(deg)
  return `${String(Math.floor(info.degree)).padStart(2, '0')}° ${info.abbr}`
}

// ─── Julian Day ──────────────────────────────────────────────────────────────

export function julianDay(year: number, month: number, day: number, hour: number): number {
  let y = year, m = month
  if (m <= 2) { y -= 1; m += 12 }
  const A = Math.floor(y / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hour / 24.0 + B - 1524.5
}

// Julian centuries from J2000.0
function jT(jd: number): number {
  return (jd - 2451545.0) / 36525.0
}

// Obliquity of the ecliptic
function obliquity(t: number): number {
  return 23.4392911 - 0.0130042 * t - 0.00000164 * t * t + 0.000000503 * t * t * t
}

// ─── Sun (Meeus Ch. 25) ──────────────────────────────────────────────────────

function calcSun(jd: number): number {
  const t = jT(jd)
  const L0 = normDeg(280.46646 + 36000.76983 * t + 0.0003032 * t * t)
  const M  = normDeg(357.52911 + 35999.05029 * t - 0.0001537 * t * t)
  const Mr = M * DEG
  const C  = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(Mr)
           + (0.019993 - 0.000101 * t) * Math.sin(2 * Mr)
           + 0.000289 * Math.sin(3 * Mr)
  const sunLong = normDeg(L0 + C)
  const omega   = 125.04 - 1934.136 * t
  return normDeg(sunLong - 0.00569 - 0.00478 * Math.sin(omega * DEG))
}

// ─── Moon (Meeus Ch. 47 truncated) ───────────────────────────────────────────

function calcMoon(jd: number): number {
  const t  = jT(jd)
  const Lp = normDeg(218.3164477 + 481267.88123421 * t - 0.0015786 * t * t + t * t * t / 538841.0)
  const D  = normDeg(297.8501921 + 445267.1114034  * t - 0.0018819 * t * t + t * t * t / 545868.0)
  const M  = normDeg(357.5291092 + 35999.0502909   * t - 0.0001536 * t * t)
  const Mp = normDeg(134.9633964 + 477198.8675055  * t + 0.0087414 * t * t + t * t * t / 69699.0)
  const F  = normDeg(93.2720950  + 483202.0175233  * t - 0.0036539 * t * t)

  const Dr = D * DEG, Mr2 = M * DEG, Mpr = Mp * DEG, Fr = F * DEG

  let sumL = 0
  sumL += 6288774  * Math.sin(Mpr)
  sumL += 1274027  * Math.sin(2 * Dr - Mpr)
  sumL += 658314   * Math.sin(2 * Dr)
  sumL += 213618   * Math.sin(2 * Mpr)
  sumL += -185116  * Math.sin(Mr2)
  sumL += -114332  * Math.sin(2 * Fr)
  sumL += 58793    * Math.sin(2 * Dr - 2 * Mpr)
  sumL += 57066    * Math.sin(2 * Dr - Mr2 - Mpr)
  sumL += 53322    * Math.sin(2 * Dr + Mpr)
  sumL += 45758    * Math.sin(2 * Dr - Mr2)
  sumL += -40923   * Math.sin(Mr2 - Mpr)
  sumL += -34720   * Math.sin(Dr)
  sumL += -30383   * Math.sin(Mr2 + Mpr)
  sumL += 15327    * Math.sin(2 * Dr - 2 * Fr)
  sumL += -12528   * Math.sin(Mpr + 2 * Fr)
  sumL += 10980    * Math.sin(Mpr - 2 * Fr)
  sumL += 10675    * Math.sin(4 * Dr - Mpr)
  sumL += 10034    * Math.sin(3 * Mpr)
  sumL += 8548     * Math.sin(4 * Dr - 2 * Mpr)
  sumL += -7888    * Math.sin(2 * Dr + Mr2 - Mpr)
  sumL += -6766    * Math.sin(2 * Dr + Mr2)
  sumL += -5163    * Math.sin(Dr - Mpr)
  sumL += 4987     * Math.sin(Dr + Mr2)
  sumL += 4036     * Math.sin(2 * Dr - Mr2 + Mpr)
  sumL += 3994     * Math.sin(2 * Dr + 2 * Mpr)
  sumL += 3861     * Math.sin(4 * Dr)
  sumL += 3665     * Math.sin(2 * Dr - 3 * Mpr)
  sumL += -2689    * Math.sin(Mr2 - 2 * Mpr)
  sumL += -2602    * Math.sin(2 * Dr - Mpr + 2 * Fr)
  sumL += 2390     * Math.sin(2 * Dr - Mr2 - 2 * Mpr)
  sumL += -2348    * Math.sin(Dr + Mpr)
  sumL += -2120    * Math.sin(Mr2 + 2 * Mpr)
  sumL += -2069    * Math.sin(2 * Mr2)

  return normDeg(Lp + sumL / 1000000.0)
}

// ─── Planets ─────────────────────────────────────────────────────────────────

function solveKepler(M: number, e: number): number {
  let E = M * DEG
  for (let j = 0; j < 10; j++) {
    E = M * DEG + e * Math.sin(E)
  }
  return E
}

function trueAnomaly(E: number, e: number): number {
  return 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  ) * RAD
}

function outerPlanetGeo(helioLon: number, r: number, sunLon: number): number {
  const earthR = 1.00014
  const dx = r * Math.cos(helioLon * DEG) - earthR * Math.cos(sunLon * DEG)
  const dy = r * Math.sin(helioLon * DEG) - earthR * Math.sin(sunLon * DEG)
  return normDeg(Math.atan2(dy, dx) * RAD)
}

function innerPlanetGeo(helioLon: number, r: number, sunLon: number): number {
  const earthR = 1.00014
  const elongation = helioLon - sunLon
  const beta = Math.asin(earthR / r * Math.sin(elongation * DEG)) * RAD
  return normDeg(helioLon + beta)
}

function calcMercury(jd: number): number {
  const t = jT(jd)
  const L = normDeg(252.2509 + 149474.0722 * t)
  const e = 0.205634 + 0.000020 * t
  const omega = 77.4561 + 1.5564 * t
  const M = normDeg(L - omega)
  const E = solveKepler(M, e)
  const v = trueAnomaly(E, e)
  const helioLon = normDeg(v + omega)
  const r = 0.387098 * (1 - e * Math.cos(E))
  return innerPlanetGeo(helioLon, r, calcSun(jd))
}

function calcVenus(jd: number): number {
  const t = jT(jd)
  const L = normDeg(181.9798 + 58519.2130 * t)
  const e = 0.006773 - 0.000048 * t
  const omega = 131.5637 + 1.4023 * t
  const M = normDeg(L - omega)
  const E = solveKepler(M, e)
  const v = trueAnomaly(E, e)
  const helioLon = normDeg(v + omega)
  const r = 0.723330 * (1 - e * Math.cos(E))
  return innerPlanetGeo(helioLon, r, calcSun(jd))
}

function calcMars(jd: number): number {
  const t = jT(jd)
  const L = normDeg(355.4330 + 19141.6964 * t)
  const e = 0.093405 + 0.000090 * t
  const omega = 336.0602 + 1.8410 * t
  const M = normDeg(L - omega)
  const E = solveKepler(M, e)
  const v = trueAnomaly(E, e)
  const helioLon = normDeg(v + omega)
  const r = 1.523688 * (1 - e * Math.cos(E))
  return outerPlanetGeo(helioLon, r, calcSun(jd))
}

function calcJupiter(jd: number): number {
  const t = jT(jd)
  const L = normDeg(34.3515 + 3036.3027 * t)
  const e = 0.048498 + 0.000163 * t
  const omega = 14.3312 + 1.6126 * t
  const M = normDeg(L - omega)
  const E = solveKepler(M, e)
  const v = trueAnomaly(E, e)
  const helioLon = normDeg(v + omega)
  const r = 5.202560 * (1 - e * Math.cos(E))
  return outerPlanetGeo(helioLon, r, calcSun(jd))
}

function calcSaturn(jd: number): number {
  const t = jT(jd)
  const L = normDeg(50.0774 + 1223.5110 * t)
  const e = 0.055546 - 0.000346 * t
  const omega = 93.0572 + 1.9584 * t
  const M = normDeg(L - omega)
  const E = solveKepler(M, e)
  const v = trueAnomaly(E, e)
  const helioLon = normDeg(v + omega)
  const r = 9.554747 * (1 - e * Math.cos(E))
  return outerPlanetGeo(helioLon, r, calcSun(jd))
}

function calcUranus(jd: number): number {
  const t = jT(jd)
  const L = normDeg(314.0550 + 429.8640 * t)
  const e = 0.047168 + 0.000019 * t
  const omega = 173.0053 + 1.4863 * t
  const M = normDeg(L - omega)
  const E = solveKepler(M, e)
  const v = trueAnomaly(E, e)
  const helioLon = normDeg(v + omega)
  const r = 19.21814 * (1 - e * Math.cos(E))
  return outerPlanetGeo(helioLon, r, calcSun(jd))
}

function calcNeptune(jd: number): number {
  const t = jT(jd)
  const L = normDeg(304.8003 + 219.8850 * t)
  const e = 0.008606 + 0.000002 * t
  const omega = 48.1227 + 1.4262 * t
  const M = normDeg(L - omega)
  const E = solveKepler(M, e)
  const v = trueAnomaly(E, e)
  const helioLon = normDeg(v + omega)
  const r = 30.10957 * (1 - e * Math.cos(E))
  return outerPlanetGeo(helioLon, r, calcSun(jd))
}

function calcPluto(jd: number): number {
  const t = jT(jd)
  const J = jd - 2451545.0
  const S = 50.03  + 0.033459652 * J
  const P = 238.96 + 0.003968789 * J
  const Sr = S * DEG, Pr = P * DEG

  const helioLon = normDeg(
    238.958116 + 144.9600 * t
    + 6.6865 * Math.sin(Pr) + 6.8951 * Math.cos(Pr)
    - 1.8453 * Math.sin(2 * Pr) + 0.7706 * Math.cos(2 * Pr)
    + 0.0231 * Math.sin(3 * Pr) - 0.0295 * Math.cos(3 * Pr)
    + 0.0230 * Math.sin(Sr)    + 0.0417 * Math.cos(Sr)
    - 0.0098 * Math.sin(Sr + Pr) - 0.0078 * Math.cos(Sr + Pr)
  )
  return outerPlanetGeo(helioLon, 40.7, calcSun(jd))
}

function calcNorthNode(jd: number): number {
  const t = jT(jd)
  return normDeg(125.0446 - 1934.1363 * t + 0.0020754 * t * t)
}

// ─── Chiron (Keplerian approximation) ────────────────────────────────────────
// Orbital elements from JPL horizons near J2000.0
// Period ~50.4 yr; last perihelion Feb 1996 (JD ~2450128)

function calcChiron(jd: number): number {
  const t     = jT(jd)
  // Mean longitude at J2000 derived from M₀=27.72° + Π=188.66°
  const L     = normDeg(216.38 + 714.15 * t)
  const e     = 0.37942
  const omega = 188.66  // longitude of perihelion (Π = ω + Ω) at J2000
  const M     = normDeg(L - omega)
  const E     = solveKepler(M, e)
  const v     = trueAnomaly(E, e)
  const helioLon = normDeg(v + omega)
  const r     = 13.695 * (1 - e * Math.cos(E))
  return outerPlanetGeo(helioLon, r, calcSun(jd))
}

// ─── Ascendant + Midheaven ────────────────────────────────────────────────────

function calcLST(jd: number, lng: number): number {
  const t = jT(jd)
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
           + 0.000387933 * t * t - t * t * t / 38710000.0
  return normDeg(GMST + lng)
}

export function calcAscendant(jd: number, lat: number, lng: number): number {
  const t = jT(jd)
  const LST  = calcLST(jd, lng)
  const eps  = obliquity(t) * DEG
  const RAMC = LST * DEG
  const latR = lat * DEG

  const asc = Math.atan2(
    Math.cos(RAMC),
    -(Math.sin(RAMC) * Math.cos(eps) + Math.tan(latR) * Math.sin(eps))
  )
  return normDeg(asc * RAD)
}

export function calcMidheaven(jd: number, lng: number): number {
  const t   = jT(jd)
  const LST = calcLST(jd, lng)
  const eps = obliquity(t) * DEG
  const RAMC = LST * DEG

  const mc = Math.atan2(Math.sin(RAMC), Math.cos(RAMC) * Math.cos(eps))
  return normDeg(mc * RAD)
}

// ─── Retrograde detection ─────────────────────────────────────────────────────

function isRetrograde(calcFn: (jd: number) => number, jd: number): boolean {
  const before = calcFn(jd - 0.5)
  const after  = calcFn(jd + 0.5)
  let diff = after - before
  if (diff > 180)  diff -= 360
  if (diff < -180) diff += 360
  return diff < 0
}

// Map of planet IDs to their calculation functions (retrograde-capable bodies only)
const CALC_FN: Partial<Record<string, (jd: number) => number>> = {
  mercury: calcMercury,
  venus:   calcVenus,
  mars:    calcMars,
  jupiter: calcJupiter,
  saturn:  calcSaturn,
  uranus:  calcUranus,
  neptune: calcNeptune,
  pluto:   calcPluto,
  chiron:  calcChiron,
}

// ─── Moon phase helper (public) ──────────────────────────────────────────────

/** Returns the Moon–Sun elongation (0–360°). 0=new, 180=full. */
export function calcMoonPhase(ms: number): number {
  const d = new Date(ms)
  const jd = julianDay(
    d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(),
    d.getUTCHours() + d.getUTCMinutes() / 60
  )
  return normDeg(calcMoon(jd) - calcSun(jd))
}

// ─── Aspects ─────────────────────────────────────────────────────────────────

const ASPECT_DEFS = [
  { type: 'conjunction' as const, angle: 0,   orb: 8 },
  { type: 'opposition'  as const, angle: 180, orb: 8 },
  { type: 'trine'       as const, angle: 120, orb: 8 },
  { type: 'square'      as const, angle: 90,  orb: 8 },
  { type: 'sextile'     as const, angle: 60,  orb: 6 },
  { type: 'quincunx'    as const, angle: 150, orb: 3 },
]

function calcAspects(positions: Record<string, number>): Aspect[] {
  const bodies = Object.keys(positions) as PlanetId[]
  const aspects: Aspect[] = []

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const b1 = bodies[i], b2 = bodies[j]
      let diff = Math.abs(positions[b1] - positions[b2])
      if (diff > 180) diff = 360 - diff

      for (const def of ASPECT_DEFS) {
        const orb = Math.abs(diff - def.angle)
        if (orb <= def.orb) {
          aspects.push({
            planetA: b1,
            planetB: b2,
            type: def.type,
            orb,
            applying: positions[b1] < positions[b2],
          })
          break
        }
      }
    }
  }
  return aspects
}

// ─── Stellium detection ───────────────────────────────────────────────────────

export function detectStelliums(positions: Record<string, number>): Array<{ sign: string; planets: string[] }> {
  const signCounts: Record<string, string[]> = {}
  const MAIN_PLANETS = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto']

  for (const [body, deg] of Object.entries(positions)) {
    if (!MAIN_PLANETS.includes(body)) continue
    const info = signFromDeg(deg)
    if (!signCounts[info.sign]) signCounts[info.sign] = []
    signCounts[info.sign].push(body.toUpperCase())
  }

  return Object.entries(signCounts)
    .filter(([, planets]) => planets.length >= 3)
    .map(([sign, planets]) => ({ sign: sign.toUpperCase(), planets }))
}

// ─── UTC offset estimation ───────────────────────────────────────────────────

export function estimateUTCOffset(lat: number, lng: number, place: string): number {
  const p = place.toLowerCase()
  if (
    p.includes('india') || p.includes('kerala') || p.includes('mumbai') ||
    p.includes('delhi') || p.includes('chennai') || p.includes('mavelikara') ||
    p.includes('kolkata') || p.includes('bangalore') || p.includes('hyderabad') ||
    (lng >= 68 && lng <= 97 && lat >= 6 && lat <= 37)
  ) return 5.5
  return Math.round(lng / 15 * 2) / 2
}

// ─── eclipticToSphere ─────────────────────────────────────────────────────────

export function eclipticToSphere(degrees: number): [number, number, number] {
  const ECLIPTIC_TILT = 23.5 * DEG
  const lambda = degrees * DEG
  const x =  Math.cos(lambda)
  const y =  Math.sin(lambda) * Math.cos(ECLIPTIC_TILT)
  const z =  Math.sin(lambda) * Math.sin(ECLIPTIC_TILT)
  const len = Math.sqrt(x * x + y * y + z * z)
  return [x / len, y / len, z / len]
}

// ─── Main chart calculation ───────────────────────────────────────────────────

export async function calculateWesternChart(data: BirthData): Promise<NatalChart> {
  const [bYear, bMonth, bDay] = data.date.split('-').map(Number)
  const [bHour, bMinute]      = data.time.split(':').map(Number)

  const lat = data.latitude  ?? 0
  const lng = data.longitude ?? 0
  const utcOffset = estimateUTCOffset(lat, lng, data.place)

  // Adjust to UTC
  let utcH = bHour + bMinute / 60.0 - utcOffset
  let d = bDay, m = bMonth, y = bYear
  if (utcH < 0)  { utcH += 24; d -= 1 }
  if (utcH >= 24) { utcH -= 24; d += 1 }

  const jd = julianDay(y, m, d, utcH)

  const rawPositions: Record<PlanetId, number> = {
    sun:          calcSun(jd),
    moon:         calcMoon(jd),
    mercury:      calcMercury(jd),
    venus:        calcVenus(jd),
    mars:         calcMars(jd),
    jupiter:      calcJupiter(jd),
    saturn:       calcSaturn(jd),
    uranus:       calcUranus(jd),
    neptune:      calcNeptune(jd),
    pluto:        calcPluto(jd),
    'north-node': calcNorthNode(jd),
    'south-node': normDeg(calcNorthNode(jd) + 180),
    ascendant:    calcAscendant(jd, lat, lng),
    descendant:   normDeg(calcAscendant(jd, lat, lng) + 180),
    mc:           calcMidheaven(jd, lng),
    ic:           normDeg(calcMidheaven(jd, lng) + 180),
    vertex:       normDeg(calcAscendant(jd, lat, lng) + 150),   // approx
    antivertex:   normDeg(calcAscendant(jd, lat, lng) - 30),    // approx
    'part-of-fortune': normDeg(
      calcAscendant(jd, lat, lng) + calcMoon(jd) - calcSun(jd)
    ),
    chiron: calcChiron(jd),
  }

  const PLANET_META: Record<PlanetId, { name: string; glyph: string }> = {
    sun:           { name: 'Sun',           glyph: '☉' },
    moon:          { name: 'Moon',          glyph: '☽' },
    mercury:       { name: 'Mercury',       glyph: '☿' },
    venus:         { name: 'Venus',         glyph: '♀' },
    mars:          { name: 'Mars',          glyph: '♂' },
    jupiter:       { name: 'Jupiter',       glyph: '♃' },
    saturn:        { name: 'Saturn',        glyph: '♄' },
    uranus:        { name: 'Uranus',        glyph: '♅' },
    neptune:       { name: 'Neptune',       glyph: '♆' },
    pluto:         { name: 'Pluto',         glyph: '♇' },
    'north-node':  { name: 'North Node',    glyph: '☊' },
    'south-node':  { name: 'South Node',    glyph: '☋' },
    ascendant:     { name: 'Ascendant',     glyph: 'AC' },
    descendant:    { name: 'Descendant',    glyph: 'DC' },
    mc:            { name: 'Midheaven',     glyph: 'MC' },
    ic:            { name: 'Imum Coeli',    glyph: 'IC' },
    vertex:        { name: 'Vertex',        glyph: 'Vx' },
    antivertex:    { name: 'Antivertex',    glyph: 'Ax' },
    'part-of-fortune': { name: 'Part of Fortune', glyph: '⊕' },
    chiron:        { name: 'Chiron',        glyph: '⚷' },
  }

  // Assign houses (equal house system from Ascendant)
  const ascDeg = rawPositions['ascendant']
  function getHouse(planetDeg: number): number {
    const offset = normDeg(planetDeg - ascDeg)
    return Math.floor(offset / 30) + 1
  }

  const planets: Planet[] = (Object.keys(rawPositions) as PlanetId[]).map((id) => {
    const deg   = rawPositions[id]
    const info  = signFromDeg(deg)
    const meta  = PLANET_META[id]
    return {
      id,
      name: meta.name,
      glyph: meta.glyph,
      degrees: deg,
      sign: info.sign,
      house: getHouse(deg),
      retrograde: CALC_FN[id] ? isRetrograde(CALC_FN[id]!, jd) : false,
      position: eclipticToSphere(deg),
    }
  })

  // Aspects (exclude angles for cleaner lines)
  const aspectPositions: Record<string, number> = {}
  for (const p of planets) {
    if (!['ascendant','descendant','mc','ic','vertex','antivertex'].includes(p.id)) {
      aspectPositions[p.id] = p.degrees
    }
  }
  const aspects = calcAspects(aspectPositions)

  // Houses (equal)
  const houses: House[] = Array.from({ length: 12 }, (_, i) => {
    const cuspDeg = normDeg(ascDeg + i * 30)
    return {
      number: i + 1,
      cusp: cuspDeg,
      sign: signFromDeg(cuspDeg).sign,
    }
  })

  return {
    system: 'western',
    birthData: data,
    planets,
    houses,
    aspects,
    generatedAt: new Date(),
  }
}

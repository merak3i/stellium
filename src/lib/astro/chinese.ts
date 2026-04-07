// Chinese Astrology — Layer 3.
// Full Four Pillars (Ba Zi / 八字) calculation.
// Unlocked after Vedic completion.

import type { BirthData } from './types'
import { julianDay } from './western'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChineseChart {
  year:        number
  animal:      ChineseAnimal
  element:     ChineseElement
  polarity:    'yin' | 'yang'
  month:       number
  day:         number
  hour:        ChineseHour
  fourPillars: FourPillars
}

export type ChineseAnimal =
  | 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake'
  | 'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig'

export type ChineseElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

export type ChineseHour =
  | 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake'
  | 'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig'

export interface FourPillars {
  year:  Pillar
  month: Pillar
  day:   Pillar
  hour:  Pillar
}

export interface Pillar {
  heavenlyStem:   string    // pinyin romanisation
  earthlyBranch:  string    // pinyin romanisation
  stemChar:       string    // Chinese character
  branchChar:     string    // Chinese character
  element:        ChineseElement
  animal:         ChineseAnimal
  polarity:       'yin' | 'yang'
}

// ─── Lookup tables ────────────────────────────────────────────────────────────

const STEMS_PINYIN  = ['jiǎ','yǐ','bǐng','dīng','wù','jǐ','gēng','xīn','rén','guǐ']
const STEMS_CHAR    = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const BRANCHES_PINYIN = ['zǐ','chǒu','yín','mǎo','chén','sì','wǔ','wèi','shēn','yǒu','xū','hài']
const BRANCHES_CHAR   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

const ANIMALS: ChineseAnimal[] = [
  'rat','ox','tiger','rabbit','dragon','snake',
  'horse','goat','monkey','rooster','dog','pig',
]

// Each stem maps to an element (two consecutive stems share one element)
const STEM_ELEMENTS: ChineseElement[] = [
  'wood','wood','fire','fire','earth','earth','metal','metal','water','water',
]

// Month branches, indexed by Gregorian month (0 = Jan)
// Jan=chǒu(1), Feb=yín(2), Mar=mǎo(3), ... Dec=zǐ(0)
const MONTH_BRANCH = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makePillar(stemIdx: number, branchIdx: number): Pillar {
  const si = ((stemIdx % 10) + 10) % 10
  const bi = ((branchIdx % 12) + 12) % 12
  return {
    heavenlyStem:  STEMS_PINYIN[si],
    earthlyBranch: BRANCHES_PINYIN[bi],
    stemChar:      STEMS_CHAR[si],
    branchChar:    BRANCHES_CHAR[bi],
    element:       STEM_ELEMENTS[si],
    animal:        ANIMALS[bi],
    polarity:      si % 2 === 0 ? 'yang' : 'yin',
  }
}

// ─── Main calculation ─────────────────────────────────────────────────────────

export async function calculateChineseChart(data: BirthData): Promise<ChineseChart> {
  const [y, m, d] = data.date.split('-').map(Number)
  const [h]       = data.time.split(':').map(Number)

  // ── Year Pillar ──
  // Chinese year begins at Lìchūn (Start of Spring) ≈ Feb 4.
  // If before Feb 4, use the previous year's stem/branch.
  let chiYear = y
  if (m < 2 || (m === 2 && d < 4)) chiYear = y - 1

  // Reference: year 4 CE was a jiǎ-zǐ year (sexagenary index 0)
  const yearSexIdx = (((chiYear - 4) % 60) + 60) % 60
  const yearStemIdx   = yearSexIdx % 10
  const yearBranchIdx = yearSexIdx % 12
  const yearPillar    = makePillar(yearStemIdx, yearBranchIdx)

  // ── Month Pillar ──
  // Branch is fixed by solar month (approximated from Gregorian month).
  const monthBranchIdx = MONTH_BRANCH[m - 1]

  // Stem depends on year stem:
  // first_month_stem (for yín/Feb) = ((yearStemIdx % 5) * 2 + 2) % 10
  const firstMonthStem  = ((yearStemIdx % 5) * 2 + 2) % 10
  const monthFromYin    = ((monthBranchIdx - 2) + 12) % 12
  const monthStemIdx    = (firstMonthStem + monthFromYin) % 10
  const monthPillar     = makePillar(monthStemIdx, monthBranchIdx)

  // ── Day Pillar ──
  // Reference point: JD 2415021 (Jan 1 1900) = jiǎ-xū, sexagenary index 10.
  // Formula: (floor(JD) + 49) % 60 gives sexagenary index with stem=jiǎ(0) at JD mod result.
  const jd         = julianDay(y, m, d, 12)  // noon, avoids timezone edge cases
  const daySexIdx  = ((Math.floor(jd) + 49) % 60 + 60) % 60
  const dayPillar  = makePillar(daySexIdx % 10, daySexIdx % 12)

  // ── Hour Pillar ──
  // 12 two-hour periods: zǐ = 23:00–01:00, chǒu = 01:00–03:00, etc.
  const hourBranchIdx = Math.floor((h + 1) / 2) % 12
  // Stem depends on day stem: first_hour_stem = (dayStemIdx % 5) * 2
  const dayStemIdx    = daySexIdx % 10
  const firstHourStem = (dayStemIdx % 5) * 2
  const hourStemIdx   = (firstHourStem + hourBranchIdx) % 10
  const hourPillar    = makePillar(hourStemIdx, hourBranchIdx)

  return {
    year:     y,
    animal:   yearPillar.animal,
    element:  yearPillar.element,
    polarity: yearPillar.polarity,
    month:    m,
    day:      d,
    hour:     yearPillar.animal,   // hour animal = branch animal (same lookup)
    fourPillars: {
      year:  yearPillar,
      month: monthPillar,
      day:   dayPillar,
      hour:  hourPillar,
    },
  }
}

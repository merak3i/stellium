import { NextRequest, NextResponse } from 'next/server'
import { generateReading, dailyCacheKey, weeklyCacheKey, monthlyCacheKey, yearlyCacheKey } from '@/lib/ai'
import { getTodayCosmicContext, getSunSignFromDOB, getVedicRashi, getLahiriAyanamsa, getSunLongitude } from '@/lib/astrology'
import {
  buildDailyPrompt,
  buildWeeklyPrompt,
  buildMonthlyPrompt,
  buildYearlyPrompt,
  type Vertical,
  type Timeframe,
} from '@/lib/prompts'

export const runtime = 'nodejs'
export const maxDuration = 30

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { dob, gender, age, vertical, timeframe } = body as {
      dob: string         // 'YYYY-MM-DD'
      gender?: string
      age?: number
      vertical: Vertical
      timeframe: Timeframe
    }

    if (!dob || !vertical || !timeframe) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const [year, month, day] = dob.split('-').map(Number)
    const today = new Date()
    const sunSign = getSunSignFromDOB(month, day)

    // Get vedic rashi for the user's birth sun sign
    const birthDate = new Date(Date.UTC(year, month - 1, day, 12, 0))
    const ayanamsa = getLahiriAyanamsa(birthDate)
    const sunLong = getSunLongitude(birthDate)
    const vedicRashi = getVedicRashi(sunLong, ayanamsa)

    const cosmicCtx = getTodayCosmicContext(today)

    let userPrompt: string
    let cacheId: string
    let maxTokens = 600

    const dateStr = today.toISOString().split('T')[0]

    switch (timeframe) {
      case 'today':
      case 'yesterday': {
        const targetDate = timeframe === 'yesterday'
          ? new Date(today.getTime() - 86400000)
          : today
        const ctx = getTodayCosmicContext(targetDate)
        userPrompt = buildDailyPrompt({ sunSign, vedicRashi, vertical, timeframe, age, gender, cosmicContext: ctx })
        cacheId = dailyCacheKey(sunSign, vertical, timeframe, targetDate.toISOString().split('T')[0])
        maxTokens = 550
        break
      }
      case 'week': {
        // Cache weekly by Monday of current week
        const monday = new Date(today)
        monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
        const weekStart = monday.toISOString().split('T')[0]
        userPrompt = buildWeeklyPrompt({ sunSign, vedicRashi, vertical, age, gender, cosmicContext: cosmicCtx })
        cacheId = weeklyCacheKey(sunSign, vertical, weekStart)
        maxTokens = 750
        break
      }
      case 'month': {
        const yearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
        userPrompt = buildMonthlyPrompt({
          sunSign, vedicRashi, vertical, age, gender, cosmicContext: cosmicCtx,
          monthName: MONTH_NAMES[today.getMonth()]
        })
        cacheId = monthlyCacheKey(sunSign, vertical, yearMonth)
        maxTokens = 900
        break
      }
      case 'year': {
        userPrompt = buildYearlyPrompt({ sunSign, vedicRashi, vertical, age, gender })
        cacheId = yearlyCacheKey(sunSign, vertical, today.getFullYear())
        maxTokens = 1200
        break
      }
      default:
        return NextResponse.json({ error: 'Invalid timeframe' }, { status: 400 })
    }

    const content = await generateReading(userPrompt, cacheId, maxTokens)

    return NextResponse.json({
      content,
      sunSign,
      vedicRashi,
      cosmicContext: cosmicCtx,
      cached: false,
    })

  } catch (err) {
    console.error('[/api/reading]', err)
    return NextResponse.json({ error: 'Failed to generate reading' }, { status: 500 })
  }
}

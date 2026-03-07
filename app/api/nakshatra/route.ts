import { NextRequest, NextResponse } from 'next/server'
import {
  buildBirthChart,
  getTodayCosmicContext,
  getCurrentDasha,
} from '@/lib/astrology'
import { generateReadingStream, generateReading } from '@/lib/ai'
import { buildDeepNakshatraPrompt } from '@/lib/prompts'

export const runtime = 'nodejs'
export const maxDuration = 60

// GET — return nakshatra info from birth data (free preview)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dob  = searchParams.get('dob')       // YYYY-MM-DD
  const time = searchParams.get('time')      // HH:MM (optional)
  const lat  = searchParams.get('lat')
  const lng  = searchParams.get('lng')

  if (!dob) return NextResponse.json({ error: 'dob required' }, { status: 400 })

  try {
    const chart = buildBirthChart(
      dob,
      time || undefined,
      lat ? parseFloat(lat) : undefined,
      lng ? parseFloat(lng) : undefined,
    )

    const dasha = chart.moonLongitude != null
      ? getCurrentDasha(
          chart.birthData.date,
          chart.moonLongitude,
          18 // approximate ayanamsa for dasha calc
        )
      : null

    return NextResponse.json({
      sunSign: chart.sunSign,
      vedicRashi: chart.vedic.rashi,
      moonSign: chart.moonSign,
      moonRashi: chart.vedic.moonRashi,
      nakshatra: chart.vedic.nakshatra,
      hasNakshatra: !!chart.vedic.nakshatra,
      dasha: dasha ? {
        lord: dasha.lord,
        yearsRemaining: Math.round(dasha.yearsRemaining * 10) / 10,
        percentComplete: Math.round(dasha.percentComplete),
      } : null,
      cosmicContext: getTodayCosmicContext(),
    })
  } catch (err) {
    console.error('[/api/nakshatra GET]', err)
    return NextResponse.json({ error: 'Calculation error' }, { status: 500 })
  }
}

// POST — generate the paid ₹100 deep nakshatra reading
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { dob, time, lat, lng, gender, age, stream: useStream } = body

    if (!dob || !time) {
      return NextResponse.json({ error: 'Birth date and time required for deep reading' }, { status: 400 })
    }

    const chart = buildBirthChart(dob, time, lat, lng)

    if (!chart.vedic.nakshatra || !chart.moonSign || !chart.vedic.moonRashi) {
      return NextResponse.json({ error: 'Need birth time for Nakshatra calculation' }, { status: 400 })
    }

    const dasha = getCurrentDasha(chart.birthData.date, chart.moonLongitude!, 18)

    const prompt = buildDeepNakshatraPrompt({
      sunSign: chart.sunSign,
      vedicRashi: chart.vedic.rashi,
      moonSign: chart.moonSign,
      moonRashi: chart.vedic.moonRashi,
      nakshatra: chart.vedic.nakshatra.name,
      nakshatraPada: chart.vedic.nakshatra.pada,
      nakshatraLord: chart.vedic.nakshatra.lord,
      nakshatraSymbol: chart.vedic.nakshatra.symbol,
      nakshatraQuality: chart.vedic.nakshatra.quality,
      dashaPlanet: dasha?.lord,
      age,
      gender,
    })

    if (useStream) {
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of generateReadingStream(prompt, 1800)) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: chunk })}\n\n`))
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          } finally {
            controller.close()
          }
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    const content = await generateReading(prompt, `nakshatra:${dob}:${time}`, 1800)

    return NextResponse.json({
      content,
      chart: {
        sunSign: chart.sunSign,
        vedicRashi: chart.vedic.rashi,
        moonSign: chart.moonSign,
        moonRashi: chart.vedic.moonRashi,
        nakshatra: chart.vedic.nakshatra,
        dasha: dasha ? {
          lord: dasha.lord,
          yearsRemaining: Math.round(dasha.yearsRemaining * 10) / 10,
        } : null,
      },
    })
  } catch (err) {
    console.error('[/api/nakshatra POST]', err)
    return NextResponse.json({ error: 'Deep reading failed' }, { status: 500 })
  }
}

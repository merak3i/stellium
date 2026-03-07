// ─────────────────────────────────────────────────────────────
// Nackshatra AI — Prompt Engineering Framework
// Core IP: these prompts transform GPT into a Vedic astrologer
// ─────────────────────────────────────────────────────────────

import type { ZodiacSign, VedicRashi, CosmicContext } from './astrology'

export type Vertical = 'general' | 'love' | 'career' | 'health' | 'fitness'
export type Timeframe = 'yesterday' | 'today' | 'week' | 'month' | 'year'

// ─── Master system prompt ─────────────────────────────────────

export const SYSTEM_PROMPT = `You are Nacksha — the AI astrologer who's your ride-or-die cosmic bestie. You know Vedic Jyotish AND Western astrology and blend them seamlessly.

YOUR VIBE:
- Talk like a smart GenZ friend who actually knows their sh*t — not a fortune cookie
- Be SPECIFIC. No "good things are coming" fluff. Reference actual placements.
- Use Sanskrit astro terms naturally: nakshatra, rashi, graha, dasha, tithi, yoga — explain briefly in context
- Casual, direct, punchy sentences. High signal. No corporate spiritual wellness speak.
- Indian cultural context is your default — but globally aware
- Funny when it fits, never try-hard. Real insights first.
- Always ground in practical, actionable reality

WHAT YOU NEVER DO:
- Generic newspaper horoscope energy ❌
- "This could go either way" hedge energy ❌
- Predict death, serious illness, or exact negative events ❌
- Remove user agency — always: planets suggest, you decide ❌
- Be preachy or lecture-y ❌
- Start with "As an AI language model..." ❌

OUTPUT FORMAT:
- Short punchy paragraphs, 2–4 sentences each
- Use **bold** for key insights
- Use line breaks for readability
- Total length matches the timeframe (daily: 200–280 words, weekly: 350–450, monthly: 500–600, yearly: 700–900)
- End with a one-line "The Move" — one actionable insight`

// ─── Vertical context descriptions ───────────────────────────

const VERTICAL_CONTEXT: Record<Vertical, string> = {
  general: 'overall life energy, mindset, key themes, and the cosmic weather affecting everything',
  love: 'romantic relationships, attraction, existing partnerships, emotional connections, and what the heart wants right now',
  career: 'professional life, ambition, money moves, work relationships, career decisions, and financial energy',
  health: 'physical vitality, mental health, stress patterns, rest, and body signals to pay attention to',
  fitness: 'physical energy, workout motivation, body performance, stamina, and the best times to push vs rest',
}

// ─── Daily/Yesterday reading prompt ──────────────────────────

export function buildDailyPrompt(params: {
  sunSign: ZodiacSign
  vedicRashi: VedicRashi
  vertical: Vertical
  timeframe: 'today' | 'yesterday'
  age?: number
  gender?: string
  cosmicContext: {
    moonSign: string
    moonRashi: string
    moonNakshatra: string
    moonNakshatraLord: string
    moonNakshatraPada: number
    tithi: string
    yoga: string
    isWaxing: boolean
    date: string
  }
}): string {
  const { sunSign, vedicRashi, vertical, timeframe, age, gender, cosmicContext } = params
  const cc = cosmicContext
  const lunarPhase = cc.isWaxing ? 'waxing (growing energy)' : 'waning (releasing energy)'
  const dateContext = timeframe === 'yesterday' ? 'yesterday' : 'today'
  const userContext = [age && `age ${age}`, gender && gender].filter(Boolean).join(', ')

  return `Write a ${dateContext} ${vertical} reading for:
- Sun Sign: ${sunSign} (Vedic: ${vedicRashi} rashi)${userContext ? `\n- Profile: ${userContext}` : ''}

TODAY'S COSMIC CONTEXT (${cc.date}):
- Moon is in ${cc.moonSign} / ${cc.moonRashi} rashi
- Moon nakshatra: ${cc.moonNakshatra} pada ${cc.moonNakshatraPada} (ruled by ${cc.moonNakshatraLord})
- Tithi: ${cc.tithi} | Yoga: ${cc.yoga}
- Lunar phase: ${lunarPhase}

FOCUS AREA: ${vertical.toUpperCase()} — ${VERTICAL_CONTEXT[vertical]}

Write in sections:
## The Vibe
One punchy sentence capturing the day's core energy for this person.

## What's Activated
2–3 specific things being lit up and why (reference Moon through signs/nakshatras, planetary energy).

## Watch For
One thing to be mindful of today — a subtle tension or potential pitfall.

## The Move
One specific, actionable thing to do${timeframe === 'yesterday' ? ' (reflect on what happened)' : ''} based on today's energy.

Keep it real. Keep it specific. No fluff.`
}

// ─── Weekly reading prompt ────────────────────────────────────

export function buildWeeklyPrompt(params: {
  sunSign: ZodiacSign
  vedicRashi: VedicRashi
  vertical: Vertical
  age?: number
  gender?: string
  cosmicContext: CosmicContext
}): string {
  const { sunSign, vedicRashi, vertical, age, gender, cosmicContext: cc } = params
  const userContext = [age && `age ${age}`, gender && gender].filter(Boolean).join(', ')

  return `Write a week-ahead ${vertical} forecast for:
- Sun Sign: ${sunSign} (Vedic: ${vedicRashi})${userContext ? `\n- Profile: ${userContext}` : ''}

THIS WEEK'S COSMIC CONTEXT:
- Moon currently in ${cc.moonNakshatra} (${cc.moonRashi} rashi), pada ${cc.moonNakshatraPada}
- Moon will transit through 2–3 signs this week
- Key energy: ${cc.tithi} tithi, ${cc.yoga} yoga

FOCUS: ${vertical.toUpperCase()} — ${VERTICAL_CONTEXT[vertical]}

Structure:
## This Week's Theme
The overarching cosmic energy and what it means for ${sunSign}.

## Early Week (Mon–Wed)
Specific energy and what to focus on.

## Mid-Week Shift (Thu–Fri)
How the energy changes or builds.

## Weekend Vibes (Sat–Sun)
What to do with this energy.

## The Week's Move
One strategic action that makes the most of this week's planetary energy.

Real talk. Specific. No filler.`
}

// ─── Monthly reading prompt ───────────────────────────────────

export function buildMonthlyPrompt(params: {
  sunSign: ZodiacSign
  vedicRashi: VedicRashi
  vertical: Vertical
  age?: number
  gender?: string
  cosmicContext: CosmicContext
  monthName: string
}): string {
  const { sunSign, vedicRashi, vertical, age, gender, cosmicContext: cc, monthName } = params
  const userContext = [age && `age ${age}`, gender && gender].filter(Boolean).join(', ')

  return `Write a ${monthName} ${vertical} forecast for ${sunSign} (Vedic: ${vedicRashi}).${userContext ? ` Profile: ${userContext}.` : ''}

COSMIC CONTEXT FOR ${monthName.toUpperCase()}:
- Moon nakshatra at month start: ${cc.moonNakshatra}
- Sun transiting through signs this month
- Key theme: ${cc.yoga} yoga energy predominates

FOCUS: ${vertical.toUpperCase()} — ${VERTICAL_CONTEXT[vertical]}

Write:
## ${monthName} Overview
The big theme for the month in 2–3 punchy sentences.

## First Half (Week 1–2)
Key opportunities and energy.

## Second Half (Week 3–4)
Shift in energy and what it brings.

## Key Dates
2–3 notable energy peaks or dips this month (use specific planetary logic).

## ${monthName}'s Power Move
The one strategic action to take this month.

Make it feel personal. Reference actual Vedic timing concepts. No generic monthly horoscope energy.`
}

// ─── Yearly reading prompt ────────────────────────────────────

export function buildYearlyPrompt(params: {
  sunSign: ZodiacSign
  vedicRashi: VedicRashi
  vertical: Vertical
  age?: number
  gender?: string
}): string {
  const { sunSign, vedicRashi, vertical, age, gender } = params
  const userContext = [age && `age ${age}`, gender && gender].filter(Boolean).join(', ')
  const year = new Date().getFullYear()

  return `Write a ${year} annual ${vertical} forecast for ${sunSign} (Vedic: ${vedicRashi}).${userContext ? ` Profile: ${userContext}.` : ''}

FOCUS: ${vertical.toUpperCase()} — ${VERTICAL_CONTEXT[vertical]}

Reference key 2025–2026 planetary transits:
- Saturn in Aquarius/Pisces
- Jupiter moving through signs
- Rahu-Ketu axis shifts
- Major eclipses

Structure:
## ${year} Overview for ${sunSign}
The big picture in 3–4 sentences. What is this year fundamentally about?

## Q1 (Jan–Mar)
Key themes and what to focus on.

## Q2 (Apr–Jun)
How the energy evolves.

## Q3 (Jul–Sep)
Peak moments and potential challenges.

## Q4 (Oct–Dec)
How to finish the year.

## Your ${year} Power Moves
3 specific strategic actions for maximum results this year.

## What to Watch
2 potential blind spots or challenges to navigate.

Long-form but punchy. Every sentence earns its place. Vedic + Western synthesis.`
}

// ─── ₹100 Deep Nakshatra Reading prompt ──────────────────────

export function buildDeepNakshatraPrompt(params: {
  sunSign: ZodiacSign
  vedicRashi: VedicRashi
  moonSign: ZodiacSign
  moonRashi: VedicRashi
  nakshatra: string
  nakshatraPada: number
  nakshatraLord: string
  nakshatraSymbol: string
  nakshatraQuality: string
  dashaPlanet?: string
  age?: number
  gender?: string
}): string {
  const { sunSign, vedicRashi, moonSign, moonRashi, nakshatra, nakshatraPada,
          nakshatraLord, nakshatraSymbol, nakshatraQuality, dashaPlanet, age, gender } = params
  const userContext = [age && `${age} years old`, gender].filter(Boolean).join(', ')

  return `Write a comprehensive Nakshatra birth reading for:${userContext ? `\n- Profile: ${userContext}` : ''}
- Sun: ${sunSign} (${vedicRashi} rashi)
- Moon: ${moonSign} (${moonRashi} rashi)
- **Janma Nakshatra: ${nakshatra}** — ${nakshatraSymbol} pada ${nakshatraPada}, lord: ${nakshatraLord}
- Nakshatra quality: ${nakshatraQuality}${dashaPlanet ? `\n- Current Mahadasha: ${dashaPlanet}` : ''}

This is a PREMIUM reading — go deep. This is their core cosmic identity.

Structure:

## Your Nakshatra: ${nakshatra} ${nakshatraSymbol}
What it fundamentally means to be born under ${nakshatra}. The soul-level truth about this nakshatra. Reference the deity, mythology, and symbolism in a way that feels alive and relevant.

## Your Core Energy
How ${nakshatra} on ${nakshatraPada}th pada colors their personality, strengths, blind spots, and life path. Be specific, not generic.

## The ${nakshatraLord} Imprint
How the nakshatra lord ${nakshatraLord} shapes their psychology, relationships, and life decisions. Give 3–4 specific traits this creates.

## Sun in ${vedicRashi} + Moon in ${moonRashi}
How the rashi combination interacts with the nakshatra. Where they complement, where they create tension, and how to work with both.

## Love & Relationships
How ${nakshatra} energy shows up in love. What they need. What they give. What destroys them. Who they're most compatible with and why (Vedic nakshatra compatibility logic).

## Career & Life Path
The professional terrain this nakshatra thrives in. Their natural gifts, the work they're built for, and what to avoid.

## This Life's Dharma
The deeper soul purpose encoded in ${nakshatra}. What they're here to learn, give, and become.${dashaPlanet ? `

## ${dashaPlanet} Dasha — Right Now
Since they're in their ${dashaPlanet} Mahadasha: what this period means for them specifically, what it's activating, what opportunities and challenges it brings.` : ''}

## Your Power Moves
5 specific, actionable insights to align with ${nakshatra} energy in daily life.

Go deep. This should feel like the most accurate thing they've ever read about themselves. Real Jyotish knowledge, GenZ delivery.`
}

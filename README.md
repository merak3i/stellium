# Nackshatra AI

AI-powered Vedic + Western astrology web app. Personalized horoscope readings that blend traditional Indian Jyotish (nakshatras, rashis, dashas, tithis) with Western zodiac signs.

**Live**: [nackshatra.ai](https://nackshatra.ai)

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS 3.4
- OpenAI GPT-4o-mini
- Google AdSense
- Vercel (Mumbai region, `bom1`)

## How it works

Users enter their date of birth (no account needed, data stays in localStorage). The app calculates:
- Sun sign (Western)
- Vedic rashi and nakshatra
- Moon sign
- Current Vimshottari Dasha period

Then generates AI readings across 5 verticals (Vibes, Love, Career, Health, Fitness) and 5 timeframes (Yesterday, Today, Week, Month, Year).

## Features

- **Pure TypeScript astrology engine** (`lib/astrology.ts`): Jean Meeus algorithms for sun/moon longitude, Lahiri Ayanamsa, nakshatra determination, Vimshottari Dasha cycles. Zero native dependencies.
- **25 reading combinations**: 5 verticals x 5 timeframes, each AI-generated with astrology-specific prompts
- **Deep nakshatra reading**: Premium feature (INR 100). Covers nakshatra identity, core energy, lord imprint, rashi combination, love, career, dharma, current dasha, and power moves. Streamed via SSE.
- **12 zodiac sign pages**: Statically generated (`generateStaticParams`), revalidated every 12 hours
- **In-memory caching**: 23-hour TTL on AI responses to reduce API costs
- **Cosmic context**: Live display of current Moon nakshatra, tithi, and lunar phase

## Pages

| Route | Description |
|---|---|
| `/` | Landing -- DOB input, sign preview, feature grid |
| `/dashboard` | Readings tab (25 combos) + Nakshatra tab (birth chart details) |
| `/sign/[sign]` | SSG pages for all 12 zodiac signs with daily reading |

## API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/reading` | POST | Generate reading by vertical + timeframe |
| `/api/nakshatra` | GET | Birth chart calculation |
| `/api/nakshatra` | POST | Deep nakshatra reading (premium, streamed) |

## Setup

```bash
cp .env.example .env    # Add OPENAI_API_KEY
npm install
npm run dev
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | Yes | GPT-4o-mini for readings |
| `NEXT_PUBLIC_ADSENSE_PID` | No | Google AdSense publisher ID |
| `NEXT_PUBLIC_SITE_URL` | No | Production URL (https://nackshatra.ai) |

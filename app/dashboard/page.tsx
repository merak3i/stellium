'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SIGN_INFO, getTodayCosmicContext } from '@/lib/astrology'
import type { ZodiacSign, VedicRashi } from '@/lib/astrology'
import { ReadingCard } from '@/components/ReadingCard'
import { NakshatraCard } from '@/components/NakshatraCard'
import { AdBanner } from '@/components/AdBanner'

type Vertical = 'general' | 'love' | 'career' | 'health' | 'fitness'
type Timeframe = 'yesterday' | 'today' | 'week' | 'month' | 'year'

interface UserData {
  dob: string
  gender?: string
  age?: number
  sunSign: ZodiacSign
}

interface NakshatraInfo {
  name: string
  symbol: string
  pada: number
  lord: string
  quality: string
  element: string
  deity: string
  motivation: string
}

const VERTICALS: { id: Vertical; label: string; emoji: string }[] = [
  { id: 'general', label: 'Vibes', emoji: '✦' },
  { id: 'love',    label: 'Love',  emoji: '💕' },
  { id: 'career',  label: 'Career',emoji: '💼' },
  { id: 'health',  label: 'Health',emoji: '🌿' },
  { id: 'fitness', label: 'Fit',   emoji: '⚡' },
]

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'today',     label: 'Today' },
  { id: 'week',      label: 'Week' },
  { id: 'month',     label: 'Month' },
  { id: 'year',      label: 'Year' },
]

// Simple reading cache: key → content
const readingCache = new Map<string, string>()

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [vertical, setVertical] = useState<Vertical>('general')
  const [timeframe, setTimeframe] = useState<Timeframe>('today')
  const [reading, setReading] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'reading' | 'nakshatra'>('reading')
  const [nakshatraData, setNakshatraData] = useState<{
    nakshatra: NakshatraInfo | null
    vedicRashi: VedicRashi | null
    moonSign: ZodiacSign | null
    moonRashi: VedicRashi | null
    dasha: { lord: string; yearsRemaining: number } | null
  } | null>(null)
  const [cosmicCtx, setCosmicCtx] = useState<ReturnType<typeof getTodayCosmicContext> | null>(null)

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('nackshatra_user')
    if (!stored) { router.push('/'); return }
    try {
      setUser(JSON.parse(stored))
    } catch {
      router.push('/')
    }

    // Get today's cosmic context (client-side)
    setCosmicCtx(getTodayCosmicContext())
  }, [router])

  // Fetch nakshatra data
  useEffect(() => {
    if (!user) return
    fetch(`/api/nakshatra?dob=${user.dob}`)
      .then(r => r.json())
      .then(data => setNakshatraData({
        nakshatra: data.nakshatra || null,
        vedicRashi: data.vedicRashi || null,
        moonSign: data.moonSign || null,
        moonRashi: data.moonRashi || null,
        dasha: data.dasha || null,
      }))
      .catch(() => {})
  }, [user])

  const fetchReading = useCallback(async (v: Vertical, t: Timeframe) => {
    if (!user) return

    const cacheKey = `${user.sunSign}:${v}:${t}:${new Date().toISOString().split('T')[0]}`
    const cached = readingCache.get(cacheKey)
    if (cached) { setReading(cached); return }

    setIsLoading(true)
    setReading('')

    try {
      const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dob: user.dob,
          gender: user.gender,
          age: user.age,
          vertical: v,
          timeframe: t,
        }),
      })
      const data = await res.json()
      if (data.content) {
        readingCache.set(cacheKey, data.content)
        setReading(data.content)
      }
    } catch (err) {
      setReading('The cosmos is buffering rn ✨ — try again in a sec.')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Auto-fetch on vertical/timeframe change
  useEffect(() => {
    if (user && activeTab === 'reading') {
      fetchReading(vertical, timeframe)
    }
  }, [vertical, timeframe, user, activeTab, fetchReading])

  if (!user) return null

  const signInfo = SIGN_INFO[user.sunSign]
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <main className="min-h-screen flex flex-col max-w-md mx-auto px-4">

      {/* Top Ad */}
      <AdBanner slot="dashboard-top" className="w-full mt-2 mb-3" height={60} />

      {/* Header */}
      <header className="pt-4 pb-3">
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => router.push('/')} className="text-white/30 hover:text-white/60 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <p className="text-white/30 text-xs">{dateStr}</p>
          <span className="text-xl">{signInfo.emoji}</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-celestial flex items-center gap-2">
          {user.sunSign}
          <span className="text-white/30 font-normal text-base">/ {nakshatraData?.vedicRashi || signInfo.vedic}</span>
        </h1>
        {cosmicCtx && (
          <p className="text-white/40 text-xs mt-0.5">
            🌙 Moon in {cosmicCtx.moonNakshatra} · {cosmicCtx.tithi}
          </p>
        )}
      </header>

      {/* Main tabs: Reading / Nakshatra */}
      <div className="flex gap-2 mb-4">
        {(['reading', 'nakshatra'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-display font-semibold border transition-all
              ${activeTab === tab
                ? 'bg-gold/15 border-gold/40 text-gold'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70'
              }`}
          >
            {tab === 'reading' ? '✦ Readings' : '🌙 Nakshatra'}
          </button>
        ))}
      </div>

      {activeTab === 'reading' && (
        <>
          {/* Vertical tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
            {VERTICALS.map(v => (
              <button
                key={v.id}
                onClick={() => setVertical(v.id)}
                className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-display font-semibold border transition-all whitespace-nowrap
                  ${vertical === v.id
                    ? 'tab-active'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70'
                  }`}
              >
                <span>{v.emoji}</span>
                {v.label}
              </button>
            ))}
          </div>

          {/* Timeframe tabs */}
          <div className="flex gap-1.5 mb-4">
            {TIMEFRAMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all
                  ${timeframe === t.id
                    ? 'bg-teal/10 border-teal/40 text-teal-400'
                    : 'bg-white/5 border-white/5 text-white/40 hover:text-white/60'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Mid Ad */}
          {timeframe === 'today' && (
            <AdBanner slot="dashboard-mid" className="w-full mb-4" height={60} />
          )}

          {/* Reading */}
          <ReadingCard
            content={reading}
            isLoading={isLoading}
            sunSign={user.sunSign}
            vertical={vertical}
            timeframe={timeframe}
          />

          {/* Quick cosmic context pill */}
          {cosmicCtx && !isLoading && reading && (
            <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/5">
              <span className="text-base">🌙</span>
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-xs truncate">
                  Moon: <span className="text-teal-400">{cosmicCtx.moonNakshatra}</span> pada {cosmicCtx.moonNakshatraPada}
                  &nbsp;·&nbsp; Tithi: <span className="text-gold">{cosmicCtx.tithi}</span>
                  &nbsp;·&nbsp; {cosmicCtx.isWaxing ? '🌒 Waxing' : '🌘 Waning'}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'nakshatra' && user && (
        <NakshatraCard
          nakshatra={nakshatraData?.nakshatra || null}
          sunSign={user.sunSign}
          vedicRashi={nakshatraData?.vedicRashi || SIGN_INFO[user.sunSign].vedic as VedicRashi}
          moonSign={nakshatraData?.moonSign}
          moonRashi={nakshatraData?.moonRashi}
          dasha={nakshatraData?.dasha}
          dob={user.dob}
          age={user.age}
          gender={user.gender}
          hasTime={false}
        />
      )}

      {/* Bottom Ad */}
      <AdBanner slot="dashboard-bottom" className="w-full mt-4 mb-6" height={90} />

      {/* Footer */}
      <p className="text-center text-white/20 text-xs mb-8">
        Nackshatra AI · Planets suggest, you decide ✦
      </p>
    </main>
  )
}

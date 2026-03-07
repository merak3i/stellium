'use client'

import { useState } from 'react'
import type { ZodiacSign, VedicRashi } from '@/lib/astrology'

interface NakshatraData {
  name: string
  symbol: string
  pada: number
  lord: string
  quality: string
  element: string
  deity: string
  motivation: string
}

interface DeepReadingState {
  status: 'idle' | 'loading' | 'done' | 'error'
  content: string
}

interface NakshatraCardProps {
  nakshatra: NakshatraData | null
  sunSign: ZodiacSign
  vedicRashi: VedicRashi
  moonSign?: ZodiacSign | null
  moonRashi?: VedicRashi | null
  dasha?: { lord: string; yearsRemaining: number } | null
  dob: string
  age?: number
  gender?: string
  hasTime?: boolean
}

export function NakshatraCard({
  nakshatra, sunSign, vedicRashi, moonSign, moonRashi, dasha, dob, age, gender, hasTime
}: NakshatraCardProps) {
  const [deepReading, setDeepReading] = useState<DeepReadingState>({ status: 'idle', content: '' })
  const [birthTime, setBirthTime] = useState('')
  const [showPaywall, setShowPaywall] = useState(false)

  async function handleDeepReading() {
    if (!birthTime && !hasTime) {
      setShowPaywall(true)
      return
    }
    setDeepReading({ status: 'loading', content: '' })

    try {
      const res = await fetch('/api/nakshatra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dob, time: birthTime, gender, age }),
      })
      const data = await res.json()
      if (data.content) {
        setDeepReading({ status: 'done', content: data.content })
      } else {
        setDeepReading({ status: 'error', content: '' })
      }
    } catch {
      setDeepReading({ status: 'error', content: '' })
    }
  }

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Your Janma Nakshatra</p>
          {nakshatra ? (
            <h3 className="font-display text-xl font-bold text-celestial flex items-center gap-2">
              {nakshatra.symbol} {nakshatra.name}
              <span className="text-gold text-sm font-normal">pada {nakshatra.pada}</span>
            </h3>
          ) : (
            <h3 className="font-display text-lg font-bold text-white/40">Add birth time to unlock</h3>
          )}
        </div>
        {nakshatra && (
          <div className="text-right">
            <p className="text-xs text-white/40">Lord</p>
            <p className="text-gold font-semibold text-sm">{nakshatra.lord}</p>
          </div>
        )}
      </div>

      {/* Chart summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/40 text-xs mb-1">Sun Sign</p>
          <p className="font-display font-semibold text-sm text-celestial">{sunSign}</p>
          <p className="text-white/40 text-xs">{vedicRashi} rashi</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/40 text-xs mb-1">Moon Sign</p>
          {moonSign ? (
            <>
              <p className="font-display font-semibold text-sm text-celestial">{moonSign}</p>
              <p className="text-white/40 text-xs">{moonRashi} rashi</p>
            </>
          ) : (
            <p className="text-white/25 text-xs">Add birth time ↓</p>
          )}
        </div>
        {dasha && (
          <div className="col-span-2 bg-purple-cosmic/20 border border-purple-glow/20 rounded-xl p-3">
            <p className="text-white/40 text-xs mb-1">Current Mahadasha</p>
            <p className="font-display font-semibold text-sm text-celestial">{dasha.lord} Dasha</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-white/10 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-purple-cosmic to-purple-glow"
                  style={{ width: `${Math.max(5, 100 - (dasha.yearsRemaining / 20) * 100)}%` }}
                />
              </div>
              <p className="text-white/40 text-xs">{dasha.yearsRemaining.toFixed(1)}y left</p>
            </div>
          </div>
        )}
      </div>

      {/* Nakshatra traits */}
      {nakshatra && (
        <div className="flex flex-wrap gap-2 mb-5">
          {[nakshatra.quality, nakshatra.element, nakshatra.motivation].map(trait => (
            <span
              key={trait}
              className="px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-medium"
            >
              {trait}
            </span>
          ))}
          <span className="px-2.5 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal-400 text-xs font-medium">
            {nakshatra.deity}
          </span>
        </div>
      )}

      {/* Birth time input (if no nakshatra yet) */}
      {!nakshatra && (
        <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/60 text-sm mb-3">
            Add your birth time for Nakshatra + Moon sign
          </p>
          <input
            type="time"
            value={birthTime}
            onChange={e => setBirthTime(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-celestial text-sm focus:outline-none focus:border-gold/50 transition-all"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      )}

      {/* Deep reading CTA — ₹100 */}
      {deepReading.status === 'idle' && (
        <button
          onClick={handleDeepReading}
          className="w-full py-3.5 rounded-xl font-display font-semibold text-sm bg-gradient-to-r from-purple-cosmic to-purple-glow text-white hover:shadow-glow-purple hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          ✦ Get your deep Nakshatra reading
          <span className="ml-2 text-xs font-normal opacity-70">₹100</span>
        </button>
      )}

      {/* Loading */}
      {deepReading.status === 'loading' && (
        <div className="flex items-center justify-center gap-3 py-4">
          <div className="w-5 h-5 border-2 border-purple-glow/30 border-t-purple-glow rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Channeling your nakshatra...</p>
        </div>
      )}

      {/* Deep reading content */}
      {deepReading.status === 'done' && deepReading.content && (
        <div className="mt-4 border-t border-purple-glow/20 pt-4">
          <div className="reading-content">
            {deepReading.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i} className="font-display font-semibold text-purple-glow text-sm uppercase tracking-wide mt-5 mb-2 first:mt-0">{line.replace('## ', '')}</h2>
              } else if (line.trim()) {
                return <p key={i} className="text-white/80 text-sm leading-relaxed mb-2">{line}</p>
              }
              return null
            })}
          </div>
        </div>
      )}

      {/* Paywall for users without birth time */}
      {showPaywall && (
        <div className="mt-4 p-4 rounded-xl bg-purple-cosmic/20 border border-purple-glow/30">
          <p className="text-celestial text-sm font-semibold mb-2">Need your birth time</p>
          <p className="text-white/60 text-xs mb-3">
            Nakshatra changes every ~hour. Add your birth time above for an accurate reading.
          </p>
          <input
            type="time"
            value={birthTime}
            onChange={e => setBirthTime(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-celestial text-sm focus:outline-none focus:border-purple-glow/50 transition-all mb-3"
            style={{ colorScheme: 'dark' }}
          />
          <button
            onClick={() => { setShowPaywall(false); handleDeepReading() }}
            disabled={!birthTime}
            className="w-full py-2.5 rounded-xl font-display font-semibold text-sm bg-purple-glow/20 border border-purple-glow/40 text-purple-glow hover:bg-purple-glow/30 transition-all disabled:opacity-40"
          >
            Continue to reading ₹100
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSunSignFromDOB, SIGN_INFO } from '@/lib/astrology'
import type { ZodiacSign } from '@/lib/astrology'
import { AdBanner } from '@/components/AdBanner'

const GENDERS = ['Not specified', 'Female', 'Male', 'Non-binary', 'Prefer not to say']

function calcAge(dob: string): number {
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--
  return Math.max(0, age)
}

export default function Home() {
  const router = useRouter()
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('Not specified')
  const [preview, setPreview] = useState<{ sign: ZodiacSign; age: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Show sign preview as user types DOB
  useEffect(() => {
    if (dob && dob.length === 10) {
      try {
        const [year, month, day] = dob.split('-').map(Number)
        const sign = getSunSignFromDOB(month, day)
        const age = calcAge(dob)
        if (age > 0 && age < 120) setPreview({ sign, age })
        else setPreview(null)
      } catch {
        setPreview(null)
      }
    } else {
      setPreview(null)
    }
  }, [dob])

  function handleStart() {
    if (!dob || !preview) return
    setIsLoading(true)

    // Store in localStorage — no account needed
    const userData = {
      dob,
      gender,
      age: preview.age,
      sunSign: preview.sign,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem('nackshatra_user', JSON.stringify(userData))
    router.push('/dashboard')
  }

  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 13)
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - 100)

  return (
    <main className="min-h-screen flex flex-col">

      {/* Top Ad Banner */}
      <AdBanner slot="top-banner" className="w-full" height={90} />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-10 pb-6">

        {/* Logo */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl animate-float">✦</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight shimmer-text mb-3">
            NACKSHATRA
          </h1>
          <p className="text-sm font-medium tracking-[0.3em] text-white/40 uppercase">
            AI × Vedic × Western
          </p>
        </div>

        {/* Tagline */}
        <p className="text-center text-white/70 text-base sm:text-lg max-w-sm mx-auto mb-10 leading-relaxed animate-slide-up">
          Your nakshatra knows what your horoscope app doesn&apos;t.
          <br />
          <span className="text-teal-400">No account. No BS. Just your chart.</span>
        </p>

        {/* Onboarding card */}
        <div className="glass-card w-full max-w-sm mx-auto p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-display text-lg font-semibold text-celestial mb-5 text-center">
            Enter your birth date
          </h2>

          {/* DOB Input */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={e => setDob(e.target.value)}
              max={maxDate.toISOString().split('T')[0]}
              min={minDate.toISOString().split('T')[0]}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-celestial text-base focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Gender */}
          <div className="mb-5">
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
              Gender <span className="text-white/30">(optional)</span>
            </label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-celestial text-base focus:outline-none focus:border-gold/50 transition-all"
              style={{ colorScheme: 'dark' }}
            >
              {GENDERS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Sign preview */}
          {preview && (
            <div className="mb-5 p-3 rounded-xl bg-gold/10 border border-gold/20 flex items-center gap-3 animate-fade-in">
              <span className="text-2xl">{SIGN_INFO[preview.sign].emoji}</span>
              <div>
                <p className="font-display font-semibold text-gold text-sm">{preview.sign}</p>
                <p className="text-white/50 text-xs">{SIGN_INFO[preview.sign].vedic} rashi · age {preview.age}</p>
              </div>
              <span className="ml-auto text-teal-400 text-xs font-medium">✓</span>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleStart}
            disabled={!preview || isLoading}
            className={`w-full py-3.5 rounded-xl font-display font-semibold text-base transition-all duration-200
              ${preview && !isLoading
                ? 'bg-gradient-to-r from-gold to-gold-light text-cosmic-deeper hover:shadow-glow-gold hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-cosmic-deeper/30 border-t-cosmic-deeper rounded-full animate-spin" />
                Calculating your chart...
              </span>
            ) : (
              'Read my stars ✦'
            )}
          </button>

          <p className="text-center text-white/30 text-xs mt-3">
            No account needed. Data stays on your device.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mx-auto mt-8">
          {[
            { icon: '🌙', title: 'Nakshatra', desc: 'Your Vedic star identity' },
            { icon: '💕', title: 'Love reads', desc: 'Cosmic compatibility' },
            { icon: '💼', title: 'Career', desc: 'Money & hustle energy' },
            { icon: '⚡', title: 'Daily vibes', desc: 'Cosmic weather, daily' },
          ].map(f => (
            <div key={f.title} className="glass-card-dark p-4 rounded-xl">
              <span className="text-xl block mb-1">{f.icon}</span>
              <p className="font-display font-semibold text-white text-sm">{f.title}</p>
              <p className="text-white/40 text-xs mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Sign picker — SEO links */}
        <div className="w-full max-w-sm mx-auto mt-8">
          <p className="text-center text-white/40 text-xs uppercase tracking-wider mb-3">
            Jump to your sign
          </p>
          <div className="grid grid-cols-6 gap-2">
            {(Object.keys(SIGN_INFO) as ZodiacSign[]).map(sign => (
              <a
                key={sign}
                href={`/sign/${sign.toLowerCase()}`}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-gold/10 border border-white/5 hover:border-gold/20 transition-all group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {SIGN_INFO[sign].emoji}
                </span>
                <span className="text-white/40 text-[9px] truncate w-full text-center">
                  {sign.slice(0, 3)}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/20 text-xs text-center mt-10 mb-4">
          Nackshatra AI · Ancient Wisdom. Modern Intelligence.
          <br />
          <span className="text-white/15">For entertainment purposes. Planets suggest, you decide.</span>
        </p>

      </section>

      {/* Bottom Ad */}
      <AdBanner slot="bottom-banner" className="w-full" height={90} />
    </main>
  )
}

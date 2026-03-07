import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTodayCosmicContext, SIGN_INFO } from '@/lib/astrology'
import type { ZodiacSign } from '@/lib/astrology'
import { buildDailyPrompt } from '@/lib/prompts'
import { generateReading, dailyCacheKey } from '@/lib/ai'
import { AdBanner } from '@/components/AdBanner'

// Revalidate every 12 hours — readings refresh twice daily
export const revalidate = 43200

const VALID_SIGNS = [
  'aries','taurus','gemini','cancer','leo','virgo',
  'libra','scorpio','sagittarius','capricorn','aquarius','pisces'
] as const
type SignSlug = typeof VALID_SIGNS[number]

const SLUG_TO_SIGN: Record<SignSlug, ZodiacSign> = {
  aries:'Aries', taurus:'Taurus', gemini:'Gemini', cancer:'Cancer',
  leo:'Leo', virgo:'Virgo', libra:'Libra', scorpio:'Scorpio',
  sagittarius:'Sagittarius', capricorn:'Capricorn', aquarius:'Aquarius', pisces:'Pisces',
}

function isValidSlug(s: string): s is SignSlug {
  return (VALID_SIGNS as readonly string[]).includes(s)
}

export async function generateStaticParams() {
  return VALID_SIGNS.map(sign => ({ sign }))
}

export const viewport: Viewport = { themeColor: '#1A1A2E' }

export async function generateMetadata({ params }: { params: { sign: string } }): Promise<Metadata> {
  if (!isValidSlug(params.sign)) return {}
  const sign = SLUG_TO_SIGN[params.sign]
  const info = SIGN_INFO[sign]
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return {
    title: `${sign} Horoscope Today — ${today} | Nackshatra AI`,
    description: `${sign} (${info.vedic} rashi) daily horoscope for ${today}. Vedic + Western astrology reading powered by AI. Free, updated daily.`,
    keywords: `${sign.toLowerCase()} horoscope today, ${info.vedic} rashi today, ${sign.toLowerCase()} daily horoscope, vedic ${sign.toLowerCase()}, ${sign.toLowerCase()} astrology`,
    openGraph: {
      title: `${sign} Horoscope — ${today}`,
      description: `Today's ${sign} reading: Vedic + Western synthesis. Know your rashi, nakshatra and cosmic weather.`,
      type: 'article',
    },
  }
}

async function getDailyReading(sign: ZodiacSign, vertical: 'general'): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0]
  const cosmicCtx = getTodayCosmicContext(today)
  const info = SIGN_INFO[sign]

  const prompt = buildDailyPrompt({
    sunSign: sign,
    vedicRashi: info.vedic as import('@/lib/astrology').VedicRashi,
    vertical,
    timeframe: 'today',
    cosmicContext: cosmicCtx,
  })

  const cacheId = dailyCacheKey(sign, vertical, 'today', dateStr)
  return generateReading(prompt, cacheId, 500)
}

// Format markdown-ish reading into HTML
function formatReading(raw: string): string {
  return raw
    .replace(/## (.+)/g, '<h3 class="text-gold font-display font-semibold text-sm uppercase tracking-wide mt-5 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-celestial font-semibold">$1</strong>')
    .replace(/\n\n/g, '</p><p class="text-white/80 text-sm leading-relaxed mb-2">')
    .replace(/\n/g, '<br/>')
}

export default async function SignPage({ params }: { params: { sign: string } }) {
  if (!isValidSlug(params.sign)) notFound()
  const sign = SLUG_TO_SIGN[params.sign]
  const info = SIGN_INFO[sign]
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const cosmicCtx = getTodayCosmicContext(today)

  // Fetch daily general reading (server-side, cached)
  const reading = await getDailyReading(sign, 'general')

  const allSigns = Object.keys(SIGN_INFO) as ZodiacSign[]

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-6">

      {/* Top Ad */}
      <AdBanner slot="sign-top" className="w-full mb-4" height={90} />

      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        All signs
      </Link>

      {/* Sign hero */}
      <div className="glass-card p-6 mb-4">
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(0,201,167,0.1))' }}
          >
            {info.emoji}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-celestial">{sign}</h1>
            <p className="text-gold text-sm font-medium">{info.vedic} Rashi</p>
            <p className="text-white/40 text-xs mt-0.5">
              {info.dates} · {info.element} · {info.ruling}
            </p>
          </div>
        </div>

        {/* Cosmic context */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Moon', value: `${cosmicCtx.moonNakshatra} nakshatra` },
            { label: 'Tithi', value: cosmicCtx.tithi },
            { label: 'Yoga', value: cosmicCtx.yoga },
            { label: 'Phase', value: cosmicCtx.isWaxing ? '🌒 Waxing' : '🌘 Waning' },
          ].map(({ label, value }) => (
            <div key={label} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
              <p className="text-white/30 text-[10px] uppercase tracking-wider">{label}</p>
              <p className="text-white/70 text-xs font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Date badge */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px flex-1 bg-white/5" />
        <p className="text-white/30 text-xs uppercase tracking-wider">{dateStr}</p>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {/* Daily reading */}
      <div className="glass-card p-5 mb-4">
        <h2 className="font-display font-semibold text-sm text-gold uppercase tracking-wide mb-4 flex items-center gap-2">
          <span>✦</span> Today&apos;s Reading
        </h2>
        <div
          className="reading-content"
          dangerouslySetInnerHTML={{
            __html: `<p class="text-white/80 text-sm leading-relaxed mb-2">${formatReading(reading)}</p>`
          }}
        />
      </div>

      {/* Ad mid */}
      <AdBanner slot="sign-mid" className="w-full mb-4" height={60} />

      {/* Get personalized CTA */}
      <div
        className="rounded-2xl p-5 mb-6 border border-gold/20"
        style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(123,47,190,0.1))' }}
      >
        <p className="font-display font-semibold text-celestial mb-1">
          This is your sun sign reading.
        </p>
        <p className="text-white/50 text-sm mb-4">
          Add your birth date for a personalized reading — love, career, fitness, and your exact nakshatra.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold to-gold-light text-cosmic-deeper font-display font-semibold text-sm hover:shadow-glow-gold transition-all"
        >
          Get my personalized reading ✦
        </Link>
      </div>

      {/* All signs grid */}
      <div className="mb-6">
        <p className="text-white/30 text-xs uppercase tracking-wider mb-3 text-center">Other signs</p>
        <div className="grid grid-cols-6 gap-2">
          {allSigns.map(s => (
            <Link
              key={s}
              href={`/sign/${s.toLowerCase()}`}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all
                ${s === sign
                  ? 'bg-gold/15 border-gold/30'
                  : 'bg-white/5 border-white/5 hover:bg-gold/10 hover:border-gold/20'
                }`}
            >
              <span className="text-lg">{SIGN_INFO[s].emoji}</span>
              <span className="text-white/40 text-[9px]">{s.slice(0, 3)}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Ad */}
      <AdBanner slot="sign-bottom" className="w-full mb-4" height={90} />

      <p className="text-center text-white/20 text-xs mb-6">
        Nackshatra AI · {sign} horoscope updated daily at midnight IST
      </p>
    </main>
  )
}

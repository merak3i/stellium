import type { Metadata, Viewport } from 'next'
import './globals.css'
import { StarField } from '@/components/StarField'

export const metadata: Metadata = {
  title: 'Nackshatra AI — Ancient Wisdom, Modern Intelligence',
  description: 'Your personal AI Jyotishi. Vedic + Western astrology readings for your sun sign, nakshatra, love, career & more. Free daily readings.',
  keywords: 'astrology, vedic astrology, nakshatra, jyotish, daily horoscope, rashi, kundali, zodiac, Indian astrology',
  openGraph: {
    title: 'Nackshatra AI',
    description: 'AI-powered Vedic + Western astrology. Know your nakshatra. Know your vibe.',
    type: 'website',
    siteName: 'Nackshatra AI',
  },
}

export const viewport: Viewport = {
  themeColor: '#1A1A2E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsensePid = process.env.NEXT_PUBLIC_ADSENSE_PID

  return (
    <html lang="en">
      <head>
        {adsensePid && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePid}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="relative min-h-screen bg-cosmic-deeper text-celestial antialiased">
        {/* Stars */}
        <StarField />

        {/* Cosmic glow bg */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 20% 10%, rgba(123,47,190,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(0,201,167,0.06) 0%, transparent 60%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}

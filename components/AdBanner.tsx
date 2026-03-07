'use client'

import { useEffect, useRef } from 'react'

interface AdBannerProps {
  slot: string
  className?: string
  height?: number
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle'
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export function AdBanner({ slot, className = '', height = 90, format = 'auto' }: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null)
  const adsensePid = process.env.NEXT_PUBLIC_ADSENSE_PID

  useEffect(() => {
    if (!adsensePid) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense not loaded yet
    }
  }, [adsensePid])

  if (!adsensePid) {
    // Dev placeholder
    return (
      <div
        className={`ad-slot ${className}`}
        style={{ height, minHeight: height }}
      >
        Ad · {height}px
      </div>
    )
  }

  return (
    <div className={className} style={{ minHeight: height, overflow: 'hidden' }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: height }}
        data-ad-client={adsensePid}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}

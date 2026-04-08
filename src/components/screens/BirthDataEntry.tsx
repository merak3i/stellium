'use client'

import { useState, useRef, useCallback } from 'react'
import type { BirthData } from '@/types'

interface BirthDataEntryProps {
  onSubmit: (data: BirthData) => void
}

interface PlaceResult {
  display: string
  lat: number
  lng: number
}

const HUD = "'Helvetica Neue', 'HelveticaNeue', 'Inter', Helvetica, Arial, sans-serif"
const MONO = "'Space Grotesk', 'JetBrains Mono', monospace"

export default function BirthDataEntry({ onSubmit }: BirthDataEntryProps) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [place, setPlace] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [results, setResults] = useState<PlaceResult[]>([])
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [loading, setLoading] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const canSubmit = date.length > 0 && time.length > 0 && place.length > 0 && lat !== null && lng !== null

  const fetchPlaces = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    setLoading(true)
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1&accept-language=en`
      const res = await fetch(url, { signal: abortRef.current.signal, headers: { 'User-Agent': 'STELLIUM/1.0' } })
      const data = await res.json()
      type NomItem = { address: Record<string, string>; display_name: string; lat: string; lon: string }
      const mapped: PlaceResult[] = (data as NomItem[]).map(item => {
        const a = item.address || {}
        const city = a.city || a.town || a.village || a.municipality || a.county || ''
        const state = a.state || a.region || ''
        const country = a.country || ''
        const parts = [city, state, country].filter(Boolean).filter((p, i, arr) => i === 0 || p !== arr[i - 1])
        return { display: parts.join(', ') || item.display_name.split(',').slice(0, 3).join(',').trim(), lat: parseFloat(item.lat), lng: parseFloat(item.lon) }
      }).filter((r, i, arr) => arr.findIndex(x => x.display === r.display) === i)
      setResults(mapped)
      setOpen(mapped.length > 0)
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePlaceChange = (v: string) => {
    setPlace(v); setLat(null); setLng(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (v.length < 2) { setOpen(false); return }
    debounceRef.current = setTimeout(() => fetchPlaces(v), 380)
  }

  const pick = (r: PlaceResult) => {
    setPlace(r.display); setLat(r.lat); setLng(r.lng); setOpen(false); setResults([])
  }

  const handleKD = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); pick(results[activeIdx]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({ name: name.trim() || undefined, date, time, place, latitude: lat ?? undefined, longitude: lng ?? undefined })
  }

  const inputBase: React.CSSProperties = {
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.12)', borderRadius: 0,
    color: 'rgba(255,255,255,0.82)', fontFamily: HUD, fontSize: '13px',
    fontVariant: 'small-caps', letterSpacing: '0.08em', padding: '8px 0',
    outline: 'none', transition: 'border-color 0.25s ease',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none', overflow: 'auto', padding: '40px 0' }}>

      {/* Noise */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.016, zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: '256px 256px',
      }}/>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420, padding: '0 28px', position: 'relative', zIndex: 2 }} autoComplete="off">

        {/* ── Header ── */}
        <div className="s-anim-d1" style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ fontFamily: HUD, fontSize: '16px', letterSpacing: '0.32em', color: 'rgba(255,255,255,0.20)', marginBottom: 14, userSelect: 'none' }}>◐ ○ ◑</div>
          <div style={{ fontFamily: HUD, fontSize: '9px', fontVariant: 'small-caps', fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 7 }}>Natal Entry</div>
          <div style={{ fontFamily: MONO, fontSize: '8px', fontStyle: 'italic', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.22)' }}>porta nativitatis — &quot;gate of birth&quot;</div>
        </div>

        {/* ── Name ── */}
        <div className="s-anim-d2" style={{ marginBottom: 30 }}>
          <div style={{ fontFamily: MONO, fontSize: '7px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 7 }}>Name</div>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="as you are known" style={inputBase}
            onFocus={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.42)')}
            onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.12)')} />
          <div style={{ fontFamily: MONO, fontSize: '7px', fontStyle: 'italic', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.18)', marginTop: 5 }}>nomen — &quot;that by which one is called&quot;</div>
        </div>

        {/* Divider */}
        <div className="s-anim-d2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 0 30px' }} />

        {/* ── Date ── */}
        <div className="s-anim-d3" style={{ marginBottom: 30 }}>
          <div style={{ fontFamily: MONO, fontSize: '7px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 7 }}>Date of Birth</div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ ...inputBase, colorScheme: 'dark' as never }}
            onFocus={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.42)')}
            onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.12)')} />
          <div style={{ fontFamily: MONO, fontSize: '7px', fontStyle: 'italic', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.18)', marginTop: 5 }}>dies natalis — &quot;the day of one&apos;s birth&quot;</div>
        </div>

        {/* ── Time ── */}
        <div className="s-anim-d4" style={{ marginBottom: 30 }}>
          <div style={{ fontFamily: MONO, fontSize: '7px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 7 }}>Time of Birth</div>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} required style={{ ...inputBase, colorScheme: 'dark' as never }}
            onFocus={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.42)')}
            onBlur={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.12)')} />
          <div style={{ fontFamily: MONO, fontSize: '7px', fontStyle: 'italic', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.18)', marginTop: 5 }}>hora nativitatis — &quot;the hour of nativity&quot;</div>
        </div>

        {/* ── Place ── */}
        <div className="s-anim-d5" style={{ marginBottom: 38, position: 'relative' }}>
          <div style={{ fontFamily: MONO, fontSize: '7px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: 7 }}>Place of Birth</div>
          <div style={{ position: 'relative' }}>
            <input type="text" value={place} onChange={e => handlePlaceChange(e.target.value)} onKeyDown={handleKD}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              placeholder="begin typing a city..." required autoComplete="off" style={inputBase}
              onFocus={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.42)')}
              onBlurCapture={e => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.12)')} />
            {loading && <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 9, height: 9, border: '1px solid rgba(255,255,255,0.14)', borderTopColor: 'rgba(255,255,255,0.50)', borderRadius: '50%', animation: 'sspin 0.7s linear infinite' }} />}
          </div>
          {open && results.length > 0 && (
            <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#060606', border: '1px solid rgba(255,255,255,0.09)', margin: 0, padding: 0, listStyle: 'none', zIndex: 50, maxHeight: 200, overflowY: 'auto' }}>
              {results.map((r, i) => {
                const city = r.display.split(',')[0]
                const rest = r.display.slice(city.length).replace(/^,\s*/, '')
                return (
                  <li key={i} onMouseDown={() => pick(r)} style={{ padding: '9px 14px', cursor: 'pointer', background: i === activeIdx ? 'rgba(255,255,255,0.04)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontFamily: MONO, fontSize: '11px', color: 'rgba(255,255,255,0.70)', letterSpacing: '0.06em' }}>{city}</span>
                    {rest && <span style={{ fontFamily: MONO, fontSize: '9px', color: 'rgba(255,255,255,0.28)', marginLeft: 7 }}>{rest}</span>}
                    <span style={{ float: 'right', fontFamily: MONO, fontSize: '7px', color: 'rgba(255,255,255,0.18)' }}>{r.lat.toFixed(2)}°{r.lat >= 0 ? 'N' : 'S'} {r.lng.toFixed(2)}°{r.lng >= 0 ? 'E' : 'W'}</span>
                  </li>
                )
              })}
            </ul>
          )}
          <div style={{ fontFamily: MONO, fontSize: '7px', fontStyle: 'italic', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.18)', marginTop: 5 }}>locus originis — &quot;place of origin&quot;</div>
        </div>

        {/* ── Ornament ── */}
        <div className="s-anim-d5" style={{ textAlign: 'center', marginBottom: 28, color: 'rgba(255,255,255,0.12)', fontSize: '11px', letterSpacing: '0.32em' }}>✧</div>

        {/* ── Submit ── */}
        <div className="s-anim-d6" style={{ textAlign: 'center', marginBottom: 22 }}>
          <button type="submit" disabled={!canSubmit}
            style={{ background: 'transparent', border: `1px solid ${canSubmit ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)'}`, color: canSubmit ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.20)', fontFamily: HUD, fontVariant: 'small-caps', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', padding: '11px 36px', cursor: canSubmit ? 'none' : 'default', transition: 'border-color 0.25s, color 0.25s', borderRadius: 0, outline: 'none' }}
            onMouseEnter={e => { if (canSubmit) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.50)'; e.currentTarget.style.color = 'rgba(255,255,255,0.95)' } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = canSubmit ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = canSubmit ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.20)' }}>
            Cast the Chart
          </button>
        </div>

        {/* ── Privacy ── */}
        <div className="s-anim-d6" style={{ textAlign: 'center', fontFamily: MONO, fontSize: '7px', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.12)', textTransform: 'uppercase' }}>
          Not stored · Not shared
        </div>

      </form>

      <style>{`
        @keyframes sspin { to { transform: translateY(-50%) rotate(360deg); } }
        .s-anim-d1 { opacity: 0; animation: sfadeup 0.5s cubic-bezier(0.16,1,0.3,1) 0.08s both; }
        .s-anim-d2 { opacity: 0; animation: sfadeup 0.5s cubic-bezier(0.16,1,0.3,1) 0.22s both; }
        .s-anim-d3 { opacity: 0; animation: sfadeup 0.5s cubic-bezier(0.16,1,0.3,1) 0.34s both; }
        .s-anim-d4 { opacity: 0; animation: sfadeup 0.5s cubic-bezier(0.16,1,0.3,1) 0.46s both; }
        .s-anim-d5 { opacity: 0; animation: sfadeup 0.5s cubic-bezier(0.16,1,0.3,1) 0.58s both; }
        .s-anim-d6 { opacity: 0; animation: sfadeup 0.5s cubic-bezier(0.16,1,0.3,1) 0.72s both; }
        @keyframes sfadeup { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: translateY(0); } }
        input::placeholder { color: rgba(255,255,255,0.18); font-style: italic; }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.38); cursor: pointer; }
      `}</style>
    </div>
  )
}

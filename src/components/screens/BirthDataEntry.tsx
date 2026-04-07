'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { BirthData } from '@/types'

interface BirthDataEntryProps {
  onSubmit: (data: BirthData) => void
}

interface PlaceResult {
  display_name: string
  lat: string
  lon: string
  name: string
  address?: {
    city?: string
    town?: string
    village?: string
    country?: string
  }
}

function shortLabel(r: PlaceResult): string {
  const parts: string[] = []
  const city = r.address?.city ?? r.address?.town ?? r.address?.village
  if (city) parts.push(city)
  if (r.address?.country) parts.push(r.address.country)
  return parts.length ? parts.join(', ') : r.display_name.split(',').slice(0, 2).join(',').trim()
}

const LABEL = {
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: '9px',
  letterSpacing: '0.28em',
  color: 'rgba(255,255,255,0.28)',
  textTransform: 'uppercase' as const,
  marginBottom: '6px',
  display: 'block',
}

const FIELD = {
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.10)',
  outline: 'none',
  width: '100%',
  color: 'rgba(255,255,255,0.85)',
  fontFamily: "'Space Grotesk', sans-serif",
  fontSize: '13px',
  letterSpacing: '0.12em',
  padding: '8px 0 10px',
  caretColor: 'rgba(255,255,255,0.5)',
  colorScheme: 'dark' as const,
}

export default function BirthDataEntry({ onSubmit }: BirthDataEntryProps) {
  const [date,    setDate]    = useState('')
  const [time,    setTime]    = useState('')
  const [place,   setPlace]   = useState('')
  const [lat,     setLat]     = useState<number | null>(null)
  const [lng,     setLng]     = useState<number | null>(null)

  const [results,  setResults]  = useState<PlaceResult[]>([])
  const [loading,  setLoading]  = useState(false)
  const [dropOpen,  setDropOpen]  = useState(false)
  const [geoError,  setGeoError]  = useState(false)
  const [highlight, setHighlight] = useState(0)

  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const placeRef     = useRef<HTMLInputElement>(null)

  // Nominatim search
  const searchPlace = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setDropOpen(false); setGeoError(false); return }
    setLoading(true)
    setGeoError(false)
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5&featuretype=city`
      const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } })
      const data: PlaceResult[] = await res.json()
      setResults(data)
      setDropOpen(data.length > 0)
      setHighlight(0)
      if (data.length === 0 && q.length >= 3) setGeoError(true)
    } catch {
      setResults([])
      setGeoError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePlaceChange = (v: string) => {
    setPlace(v)
    setLat(null)
    setLng(null)
    setGeoError(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchPlace(v), 380)
  }

  const selectResult = (r: PlaceResult) => {
    setPlace(shortLabel(r))
    setLat(parseFloat(r.lat))
    setLng(parseFloat(r.lon))
    setDropOpen(false)
    setResults([])
    setGeoError(false)
  }

  // Keyboard nav on place field
  const handlePlaceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropOpen || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      selectResult(results[highlight])
    } else if (e.key === 'Escape') {
      setDropOpen(false)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isComplete = date && time && place && lat !== null && lng !== null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isComplete) return
    onSubmit({ date, time, place, latitude: lat!, longitude: lng! })
  }

  return (
    <div
      className="w-full h-full bg-black flex items-center justify-center"
      style={{ cursor: 'none' }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full px-8"
        style={{ maxWidth: 320 }}
      >
        {/* Header */}
        <div className="mb-12 text-center">
          <div style={{
            fontFamily: "'Seanor', serif",
            fontSize: 'clamp(18px, 2.2vw, 30px)',
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.55)',
          }}>
            STELLIUM
          </div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '8px',
            letterSpacing: '0.32em',
            color: 'rgba(255,255,255,0.18)',
            marginTop: 6,
            textTransform: 'uppercase',
          }}>
            Enter your birth details
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Date */}
          <div>
            <span style={LABEL}>Date of Birth</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={FIELD}
              required
            />
          </div>

          {/* Time */}
          <div>
            <span style={LABEL}>Time of Birth</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={FIELD}
              required
            />
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '8px',
              letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.16)',
              marginTop: 5,
            }}>
              24H — approximate is fine
            </div>
          </div>

          {/* Place — with autocomplete */}
          <div ref={containerRef} style={{ position: 'relative' }}>
            <span style={LABEL}>Place of Birth</span>
            <div style={{ position: 'relative' }}>
              <input
                ref={placeRef}
                type="text"
                value={place}
                onChange={(e) => handlePlaceChange(e.target.value)}
                onFocus={() => results.length > 0 && setDropOpen(true)}
                onKeyDown={handlePlaceKeyDown}
                style={FIELD}
                placeholder="City, Country"
                autoComplete="off"
                spellCheck={false}
                required
              />
              {/* Loading dot */}
              {loading && (
                <span style={{
                  position: 'absolute', right: 0, top: '50%',
                  transform: 'translateY(-50%)',
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.30)',
                  animation: 'pulse 1s ease infinite',
                }} />
              )}
            </div>

            {/* Dropdown */}
            {dropOpen && results.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 4,
                background: '#0C0C0C',
                border: '1px solid rgba(255,255,255,0.08)',
                zIndex: 100,
                maxHeight: 200,
                overflowY: 'auto',
              }}>
                {results.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectResult(r)}
                    onMouseEnter={() => setHighlight(i)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 12px',
                      background: i === highlight ? 'rgba(255,255,255,0.06)' : 'transparent',
                      border: 'none',
                      borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      color: 'rgba(255,255,255,0.70)',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      cursor: 'none',
                    }}
                  >
                    {shortLabel(r)}
                    <span style={{ display: 'block', fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: 2, letterSpacing: '0.12em' }}>
                      {r.lat.slice(0, 7)}, {r.lon.slice(0, 7)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Lat/lng confirmed */}
            {lat !== null && (
              <div style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '8px',
                letterSpacing: '0.22em',
                color: 'rgba(255,255,255,0.16)',
                marginTop: 5,
              }}>
                {lat.toFixed(4)}° {lng! >= 0 ? 'N' : 'S'} · {Math.abs(lng!).toFixed(4)}° {lng! >= 0 ? 'E' : 'W'}
              </div>
            )}

            {geoError && !loading && (
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '8px',
                letterSpacing: '0.18em',
                color: 'rgba(255,100,80,0.55)',
                marginTop: 6,
              }}>
                No location found — try a different spelling
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <button
            type="submit"
            disabled={!isComplete}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${isComplete ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)'}`,
              padding: '4px 0 6px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '9px',
              letterSpacing: '0.38em',
              textTransform: 'uppercase',
              color: isComplete ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)',
              cursor: isComplete ? 'none' : 'default',
              transition: 'color 0.3s, border-color 0.3s',
            }}
            onMouseEnter={(e) => {
              if (!isComplete) return
              e.currentTarget.style.color = 'rgba(255,255,255,0.95)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.50)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isComplete ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)'
              e.currentTarget.style.borderColor = isComplete ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)'
            }}
          >
            Cast Chart
          </button>
        </div>

        {/* Privacy note */}
        <div style={{
          marginTop: 28,
          textAlign: 'center',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '8px',
          letterSpacing: '0.20em',
          color: 'rgba(255,255,255,0.12)',
          textTransform: 'uppercase',
        }}>
          Not stored · Not shared
        </div>
      </form>
    </div>
  )
}

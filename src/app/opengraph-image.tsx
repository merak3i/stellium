import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'STELLIUM — the first app for astrology where you don\'t get any answers.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#000',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 88px',
          fontFamily: 'Helvetica, sans-serif',
          position: 'relative',
        }}
      >
        {/* Ambient marks — ASCII to keep the pure monochrome register */}
        <div
          style={{
            position: 'absolute',
            top: 82,
            right: 112,
            fontSize: 44,
            color: 'rgba(255,255,255,0.22)',
            fontWeight: 300,
            letterSpacing: '0.1em',
          }}
        >
          *
        </div>
        <div
          style={{
            position: 'absolute',
            top: 170,
            right: 178,
            fontSize: 22,
            color: 'rgba(255,255,255,0.14)',
            fontWeight: 300,
          }}
        >
          +
        </div>
        <div
          style={{
            position: 'absolute',
            top: 118,
            left: 140,
            fontSize: 16,
            color: 'rgba(255,255,255,0.18)',
            fontWeight: 300,
          }}
        >
          ·
        </div>

        {/* Top label */}
        <div
          style={{
            fontSize: 16,
            letterSpacing: '0.34em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.42)',
            display: 'flex',
          }}
        >
          Simulacra · Astro / Esoteric
        </div>

        {/* Wordmark */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 34,
          }}
        >
          <div
            style={{
              fontSize: 132,
              fontWeight: 300,
              letterSpacing: '0.36em',
              color: 'rgba(255,255,255,0.92)',
              lineHeight: 1,
            }}
          >
            STELLIUM
          </div>
          <div
            style={{
              fontSize: 28,
              letterSpacing: '0.04em',
              color: 'rgba(255,255,255,0.52)',
              maxWidth: 940,
              lineHeight: 1.35,
              fontStyle: 'italic',
            }}
          >
            The first app for astrology where you don&apos;t get any answers.
          </div>
        </div>

        {/* Bottom marks */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 13,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.34)',
          }}
        >
          <div style={{ display: 'flex' }}>As Above · So Below</div>
          <div style={{ display: 'flex', letterSpacing: '0.4em' }}>* + *</div>
        </div>
      </div>
    ),
    { ...size }
  )
}

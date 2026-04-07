'use client'

import { useRef } from 'react'
import { Text, Billboard } from '@react-three/drei'
import type { Planet } from '@/types'
import { useUnlockStore } from '@/lib/store/unlockStore'

interface GlyphProps {
  planet: Planet
  radius: number
  interior?: boolean
}

// Offset factor — glyphs sit just outside planet positions
const GLYPH_OFFSET = 1.04

export default function Glyph({ planet, radius, interior = false }: GlyphProps) {
  const isUnlocked = useUnlockStore((s) => s.unlocked.has(planet.id))
  const isExpanded = useUnlockStore((s) => s.expanded.has(planet.id))
  const unlock = useUnlockStore((s) => s.unlock)
  const expand = useUnlockStore((s) => s.expand)

  const [px, py, pz] = planet.position.map((v) => v * radius * GLYPH_OFFSET)

  const handleClick = () => {
    if (!isUnlocked) {
      unlock(planet.id)
    } else {
      expand(planet.id)
    }
  }

  return (
    <Billboard position={[px, py, pz]} follow lockX={false} lockY={false} lockZ={false}>
      {/* Glyph symbol — always visible (locked = dim) */}
      <Text
        fontSize={interior ? 1.5 : 0.3}
        color={isUnlocked ? '#f0ede8' : '#f0ede850'}
        anchorX="center"
        anchorY="middle"
        onClick={handleClick}
        font="/fonts/helvetica-neue.woff"
      >
        {planet.glyph}
      </Text>

      {/* Planet name — revealed on unlock */}
      {isUnlocked && (
        <Text
          position={[0, interior ? -2.2 : -0.45, 0]}
          fontSize={interior ? 0.9 : 0.18}
          color="#f0ede8"
          anchorX="center"
          anchorY="middle"
          onClick={() => expand(planet.id)}
          font="/fonts/helvetica-neue.woff"
          letterSpacing={0.15}
        >
          {planet.name.toUpperCase()}
        </Text>
      )}

      {/* Expanded detail — degrees, sign, house */}
      {isExpanded && (
        <Text
          position={[0, interior ? -3.8 : -0.72, 0]}
          fontSize={interior ? 0.7 : 0.13}
          color="#8a8680"
          anchorX="center"
          anchorY="middle"
          font="/fonts/space-grotesk.woff"
          letterSpacing={0.1}
        >
          {`${planet.degrees.toFixed(1)}° ${planet.sign.toUpperCase()}  •  H${planet.house}`}
        </Text>
      )}
    </Billboard>
  )
}

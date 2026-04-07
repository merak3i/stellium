'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useUnlockStore } from '@/lib/store/unlockStore'
import type { Aspect, Planet } from '@/types'

const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#c9a84c',
  opposition: '#c04030',
  trine: '#4a9060',
  square: '#c04030',
  sextile: '#4a6fa5',
  quincunx: '#806880',
  'semi-sextile': '#6a8060',
  'semi-square': '#a06030',
  sesquiquadrate: '#a06030',
}

interface AspectLinesProps {
  aspects: Aspect[]
  planets: Planet[]
  radius: number
}

// Aspect lines — only visible when BOTH endpoint planets are unlocked.
// Labeled only if both endpoints are unlocked.
export function AspectLines({ aspects, planets, radius }: AspectLinesProps) {
  const unlocked = useUnlockStore((s) => s.unlocked)

  const visibleAspects = aspects.filter(
    (a) => unlocked.has(a.planetA) && unlocked.has(a.planetB)
  )

  const planetMap = useMemo(
    () => new Map(planets.map((p) => [p.id, p])),
    [planets]
  )

  return (
    <>
      {visibleAspects.map((aspect, i) => {
        const pA = planetMap.get(aspect.planetA)
        const pB = planetMap.get(aspect.planetB)
        if (!pA || !pB) return null

        const posA = new THREE.Vector3(...pA.position.map((v) => v * radius) as [number, number, number])
        const posB = new THREE.Vector3(...pB.position.map((v) => v * radius) as [number, number, number])

        return (
          <AspectLine
            key={i}
            posA={posA}
            posB={posB}
            type={aspect.type}
          />
        )
      })}
    </>
  )
}

interface AspectLineProps {
  posA: THREE.Vector3
  posB: THREE.Vector3
  type: string
}

function AspectLine({ posA, posB, type }: AspectLineProps) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([posA, posB])
    return geo
  }, [posA, posB])

  const color = ASPECT_COLORS[type] ?? '#f0ede8'

  return (
    <line>
      <bufferGeometry attach="geometry" {...geometry} />
      <lineBasicMaterial
        attach="material"
        color={color}
        transparent
        opacity={0.15}
      />
    </line>
  )
}

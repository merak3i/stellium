'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Planet as PlanetType, ViewMode } from '@/types'
import { useUnlockStore } from '@/lib/store/unlockStore'

interface PlanetProps {
  planet: PlanetType
  viewMode: ViewMode
  radius: number
}

export default function Planet({ planet, viewMode, radius }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const isUnlocked = useUnlockStore((s) => s.unlocked.has(planet.id))
  const unlock = useUnlockStore((s) => s.unlock)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    if (meshRef.current && planet.id === 'moon') {
      // Moon rotates to show current phase
      meshRef.current.rotation.y += delta * 0.1
    }
  })

  const [px, py, pz] = planet.position.map((v) => v * radius)

  const planetSize = viewMode === 'exterior'
    ? 0.08  // very small distant dot
    : getPlanetInteriorSize(planet.id)

  const color = getPlanetColor(planet.id)

  return (
    <mesh
      ref={meshRef}
      position={[px, py, pz]}
      onClick={() => unlock(planet.id)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <sphereGeometry args={[planetSize, viewMode === 'interior' ? 32 : 8, viewMode === 'interior' ? 32 : 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.4 : isUnlocked ? 0.15 : 0.05}
        roughness={viewMode === 'interior' ? 0.7 : 0.5}
        metalness={0.1}
        transparent
        opacity={isUnlocked ? 1 : 0.6}
      />
    </mesh>
  )
}

function getPlanetInteriorSize(id: string): number {
  const sizes: Record<string, number> = {
    sun: 3.5,
    moon: 1.2,
    jupiter: 2.8,
    saturn: 2.4,
    uranus: 1.8,
    neptune: 1.7,
    mars: 1.0,
    venus: 0.95,
    earth: 1.0,
    mercury: 0.6,
    pluto: 0.4,
  }
  return sizes[id] ?? 0.8
}

function getPlanetColor(id: string): string {
  const colors: Record<string, string> = {
    sun: '#ffd060',
    moon: '#c8c0b0',
    mercury: '#b8a898',
    venus: '#d4a87c',
    mars: '#c04030',
    jupiter: '#c8a870',
    saturn: '#d4bc80',
    uranus: '#80c0c0',
    neptune: '#4060c0',
    pluto: '#806880',
    'north-node': '#c9a84c',
    'south-node': '#8a6030',
    ascendant: '#e0d8c8',
    descendant: '#e0d8c8',
    mc: '#a0b8d0',
    ic: '#a0b8d0',
    chiron: '#90a880',
    'part-of-fortune': '#d4a840',
  }
  return colors[id] ?? '#a0a0a0'
}

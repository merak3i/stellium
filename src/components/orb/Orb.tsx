'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import OrbExterior from './OrbExterior'
import OrbInterior from './OrbInterior'
import Singularity from './Singularity'
import type { NatalChart, ViewMode } from '@/types'

interface OrbProps {
  chart: NatalChart
  viewMode: ViewMode
}

// The Orb IS the space. Radius is intentionally massive.
const ORB_RADIUS = 100

export default function Orb({ chart, viewMode }: OrbProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Slow ambient rotation in exterior view
  useFrame((_, delta) => {
    if (viewMode === 'exterior' && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      {viewMode === 'exterior' ? (
        <OrbExterior chart={chart} radius={ORB_RADIUS} />
      ) : (
        <OrbInterior chart={chart} radius={ORB_RADIUS} />
      )}
      <Singularity />
    </group>
  )
}

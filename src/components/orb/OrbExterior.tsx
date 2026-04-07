'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'
import Planet from './Planet'
import Glyph from './Glyph'
import { AspectLines } from '@/components/unlock/AspectLines'
import AxisLines from './AxisLines'
import ZodiacRim from './ZodiacRim'
import VertexShimmer from './VertexShimmer'
import type { NatalChart } from '@/types'

interface OrbExteriorProps {
  chart: NatalChart
  radius: number
}

export default function OrbExterior({ chart, radius }: OrbExteriorProps) {
  return (
    <>
      {/* OrbitControls — constrained to exterior sphere boundary */}
      <OrbitControls
        enablePan={false}
        minDistance={radius * 1.05}
        maxDistance={radius * 3}
        dampingFactor={0.05}
        enableDamping
      />

      {/* The glass orb shell — refractive impression */}
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshPhysicalMaterial
          color="#0a0a12"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          roughness={0}
          metalness={0}
          transmission={0.95}
          thickness={2}
          ior={1.3}
          depthWrite={false}
        />
      </mesh>

      {/* Faint wireframe constellation web */}
      <mesh>
        <sphereGeometry args={[radius * 0.99, 24, 24]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.02}
        />
      </mesh>

      {/* Ambient light */}
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#c9a84c" />

      {/* Planets and glyphs */}
      {chart.planets.map((planet) => (
        <group key={planet.id}>
          <Planet planet={planet} viewMode="exterior" radius={radius} />
          <Glyph planet={planet} radius={radius} />
        </group>
      ))}

      {/* Aspect lines — only between unlocked planets */}
      <AspectLines aspects={chart.aspects} planets={chart.planets} radius={radius} />

      {/* Axis lines — appear after Asc/Desc and MC/IC special unlocks */}
      <AxisLines chart={chart} radius={radius} />

      {/* Zodiac rim — appears at 8-planet critical mass */}
      <ZodiacRim radius={radius} />

      {/* Vertex shimmer — sacred geometry halo after Vertex unlock */}
      <VertexShimmer chart={chart} radius={radius} />
    </>
  )
}

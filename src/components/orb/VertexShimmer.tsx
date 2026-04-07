'use client'

// VertexShimmer — sacred geometry particle halo that appears when the Vertex
// is unlocked (vertex-esoteric special event). Renders a golden shimmer of
// points clustered around the Vertex and Antivertex poles on the orb surface.

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useUnlockStore } from '@/lib/store/unlockStore'
import type { NatalChart } from '@/types'

interface Props {
  chart: NatalChart
  radius: number
}

const PARTICLE_COUNT = 28  // per pole
const GOLD = new THREE.Color('#c9a84c')

export default function VertexShimmer({ chart, radius }: Props) {
  const specialEvents = useUnlockStore((s) => s.specialEvents)
  const pointsRef = useRef<THREE.Points>(null)

  const vertex     = chart.planets.find((p) => p.id === 'vertex')
  const antivertex = chart.planets.find((p) => p.id === 'antivertex')

  // Build initial positions scattered around each pole
  const { positions, phases } = useMemo(() => {
    const total = PARTICLE_COUNT * 2
    const pos   = new Float32Array(total * 3)
    const ph    = new Float32Array(total)

    const poles = [vertex, antivertex]
    poles.forEach((anchor, ai) => {
      if (!anchor) return
      const [ax, ay, az] = anchor.position
      const up = new THREE.Vector3(ax, ay, az).normalize()

      // Build an orthonormal basis around the pole
      const ref = Math.abs(up.x) < 0.9
        ? new THREE.Vector3(1, 0, 0)
        : new THREE.Vector3(0, 1, 0)
      const side  = new THREE.Vector3().crossVectors(up, ref).normalize()
      const side2 = new THREE.Vector3().crossVectors(up, side).normalize()

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const spread  = 0.18 + Math.random() * 0.32   // radians from pole
        const theta   = Math.random() * Math.PI * 2
        const r_off   = radius * 1.005 + Math.random() * radius * 0.018

        const dir = new THREE.Vector3()
          .addScaledVector(up,    Math.cos(spread))
          .addScaledVector(side,  Math.sin(spread) * Math.cos(theta))
          .addScaledVector(side2, Math.sin(spread) * Math.sin(theta))
          .normalize()
          .multiplyScalar(r_off)

        const idx = (ai * PARTICLE_COUNT + i) * 3
        pos[idx]     = dir.x
        pos[idx + 1] = dir.y
        pos[idx + 2] = dir.z
        ph[ai * PARTICLE_COUNT + i] = Math.random() * Math.PI * 2
      }
    })

    return { positions: pos, phases: ph }
  }, [vertex, antivertex, radius])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const mat = pointsRef.current.material as THREE.PointsMaterial
    const t   = clock.getElapsedTime()
    // Slow, organic pulse — two overlapping sine waves
    mat.opacity = 0.22 + 0.18 * Math.sin(t * 0.9) + 0.08 * Math.sin(t * 2.3)
  })

  if (!specialEvents.has('vertex-esoteric')) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={GOLD}
        size={0.009}
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useUnlockStore } from '@/lib/store/unlockStore'

interface ZodiacRimProps {
  radius: number
}

const ECLIPTIC_TILT = 23.5 * (Math.PI / 180)
const TWO_PI = 2 * Math.PI

export default function ZodiacRim({ radius }: ZodiacRimProps) {
  const specialEvents = useUnlockStore((s) => s.specialEvents)
  const visible = specialEvents.has('zodiac-rim-reveal')
  const groupRef = useRef<THREE.Group>(null)

  // Very slow drift
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * 0.012
  })

  const { rimGeo, tickGeos } = useMemo(() => {
    const rimR = radius * 1.10

    // Torus ring along the ecliptic plane
    const rimGeo = new THREE.TorusGeometry(rimR, 0.004, 4, 128)

    // 12 division ticks (sign boundaries)
    const tickGeos: THREE.BufferGeometry[] = []
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * TWO_PI
      const inner = rimR - radius * 0.04
      const outer = rimR + radius * 0.04
      const pts = [
        new THREE.Vector3(Math.cos(angle) * inner, Math.sin(angle) * inner, 0),
        new THREE.Vector3(Math.cos(angle) * outer, Math.sin(angle) * outer, 0),
      ]
      tickGeos.push(new THREE.BufferGeometry().setFromPoints(pts))
    }

    // 36 minor ticks (10° each)
    for (let i = 0; i < 36; i++) {
      if (i % 3 === 0) continue // skip major-tick positions
      const angle = (i / 36) * TWO_PI
      const inner = rimR - radius * 0.018
      const outer = rimR + radius * 0.018
      const pts = [
        new THREE.Vector3(Math.cos(angle) * inner, Math.sin(angle) * inner, 0),
        new THREE.Vector3(Math.cos(angle) * outer, Math.sin(angle) * outer, 0),
      ]
      tickGeos.push(new THREE.BufferGeometry().setFromPoints(pts))
    }

    return { rimGeo, tickGeos }
  }, [radius])

  if (!visible) return null

  return (
    // Rotate the whole group to lie on the ecliptic plane (tilted 23.5° from equatorial)
    <group ref={groupRef} rotation={[ECLIPTIC_TILT, 0, 0]}>
      {/* The ring itself */}
      <mesh geometry={rimGeo}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </mesh>

      {/* Tick marks */}
      {tickGeos.map((geo, i) => (
        <line key={i}>
          <bufferGeometry attach="geometry" {...geo} />
          <lineBasicMaterial
            attach="material"
            color="#ffffff"
            transparent
            opacity={i < 12 ? 0.22 : 0.08}
          />
        </line>
      ))}
    </group>
  )
}

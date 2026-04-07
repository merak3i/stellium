'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// The Singularity — north star, center axis of the orb.
// Present at [0, 0, 0]. Not a primary interactive element in v1,
// but retained so all future updates remain oriented to it.
export default function Singularity() {
  const meshRef = useRef<THREE.Mesh>(null)
  const axisRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
      meshRef.current.rotation.z += delta * 0.3
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Central point of light */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.05, 0]} />
        <meshBasicMaterial color="#c9a84c" transparent opacity={0.6} />
      </mesh>

      {/* North-south axis line */}
      <mesh ref={axisRef}>
        <cylinderGeometry args={[0.002, 0.002, 200, 4]} />
        <meshBasicMaterial color="#f0ede8" transparent opacity={0.04} />
      </mesh>

      {/* Point light at center — illuminates planet interiors */}
      <pointLight intensity={0.5} distance={200} color="#f0ede8" />
    </group>
  )
}

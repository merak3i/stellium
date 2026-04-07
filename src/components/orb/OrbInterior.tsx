'use client'

import Planet from './Planet'
import Glyph from './Glyph'
import { AspectLines } from '@/components/unlock/AspectLines'
import type { NatalChart } from '@/types'

interface OrbInteriorProps {
  chart: NatalChart
  radius: number
}

// Interior / first-person view.
// Camera is placed at the Singularity (0,0,0).
// Planets appear photorealistic — rendered on the inner surface of the sphere.
// Glyphs are projected onto the sphere interior surface.
export default function OrbInterior({ chart, radius }: OrbInteriorProps) {
  return (
    <>
      {/* Inner sphere surface — the sky around you */}
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial
          color="#000005"
          side={1} /* THREE.BackSide */
        />
      </mesh>

      {/* Star field — faint points on inner surface */}
      <StarField radius={radius * 0.98} />

      {/* Subtle ambient */}
      <ambientLight intensity={0.05} />

      {/* Planets — photorealistic, feel mass and distance */}
      {chart.planets.map((planet) => (
        <group key={planet.id}>
          <Planet planet={planet} viewMode="interior" radius={radius} />
          <Glyph planet={planet} radius={radius} interior />
        </group>
      ))}

      {/* Aspect lines */}
      <AspectLines aspects={chart.aspects} planets={chart.planets} radius={radius} />
    </>
  )
}

function StarField({ radius }: { radius: number }) {
  const count = 2000
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    // Random points on sphere surface
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#f0ede8"
        size={0.15}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  )
}

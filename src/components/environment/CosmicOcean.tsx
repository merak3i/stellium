'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// The Cosmic Ocean — persistent ambient environment throughout the chart.
// A horizon line bisects the void.
// Below: a reflection of the celestial sphere — subtle, not literal.
// Gentle, occasional distortion. Ripples extend outward and settle.
// Feel: stillness punctuated by breath.
export default function CosmicOcean() {
  const reflectionRef = useRef<THREE.Mesh>(null)
  const rippleTime = useRef(0)
  const nextRipple = useRef(Math.random() * 8 + 4)

  // Reflection plane shader material
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uRippleStrength: { value: 0 },
      uRippleOrigin: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uRippleStrength;
      uniform vec2 uRippleOrigin;
      varying vec2 vUv;
      varying float vRipple;

      void main() {
        vUv = uv;
        vec2 delta = uv - uRippleOrigin;
        float dist = length(delta);
        float ripple = sin(dist * 20.0 - uTime * 3.0) * uRippleStrength
                       * exp(-dist * 4.0)
                       * exp(-uTime * 0.5);
        vRipple = ripple;
        vec3 pos = position;
        pos.z += ripple * 0.3;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uRippleStrength;
      varying vec2 vUv;
      varying float vRipple;

      void main() {
        // Dark reflection — subtle, not literal
        float fade = 1.0 - vUv.y; // fades toward horizon
        float reflection = 0.03 + vRipple * 0.02;
        vec3 color = vec3(0.02, 0.02, 0.04) * fade;
        float alpha = fade * 0.6 + vRipple * 0.1;
        gl_FragColor = vec4(color, alpha * reflection * 8.0);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  useFrame((_, delta) => {
    rippleTime.current += delta
    material.uniforms.uTime.value = rippleTime.current

    // Trigger occasional ripple
    if (rippleTime.current > nextRipple.current) {
      material.uniforms.uRippleStrength.value = 1.0
      material.uniforms.uRippleOrigin.value.set(
        Math.random() * 0.6 + 0.2,
        Math.random() * 0.4
      )
      rippleTime.current = 0
      nextRipple.current = Math.random() * 8 + 4
    }

    // Fade ripple out
    material.uniforms.uRippleStrength.value *= 0.98
  })

  return (
    <group>
      {/* Horizon line */}
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[500, 0.01]} />
        <meshBasicMaterial color="#f0ede8" transparent opacity={0.04} />
      </mesh>

      {/* Reflection plane — below horizon */}
      <mesh
        ref={reflectionRef}
        position={[0, -1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={material}
      >
        <planeGeometry args={[500, 200, 64, 64]} />
      </mesh>
    </group>
  )
}

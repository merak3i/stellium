'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useChartStore } from '@/lib/store/chartStore'

// The Lifeline — a large arc/fragment of orbital trajectory.
// Philosophical: you are traveling through your life.
// Scrubbing: brightens, animates, pulses, moves directionally.
// Idle: quiet, minimal, unobtrusive.
export default function Lifeline() {
  const lineRef = useRef<THREE.Line | null>(null)
  const isScrubbing = useChartStore((s) => s.isScrubbing)
  const scrubDirection = useChartStore((s) => s.scrubDirection)

  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0, 0,          // center
      120, 80,       // x/y radius — vast arc
      -Math.PI * 0.3,
      Math.PI * 0.3,
      false,
      Math.PI * 0.1
    )
    return curve.getPoints(80).map((p) => new THREE.Vector3(p.x, -8, p.y))
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [points])

  const material = useMemo(() => new THREE.LineBasicMaterial({
    color: '#f0ede8',
    transparent: true,
    opacity: 0.04,
  }), [])

  useFrame((_, delta) => {
    if (!lineRef.current) return

    const targetOpacity = isScrubbing ? 0.18 : 0.04
    material.opacity += (targetOpacity - material.opacity) * 0.08

    // Directional pulse during scrub
    if (isScrubbing && lineRef.current.position) {
      lineRef.current.position.x += scrubDirection * delta * 2
      lineRef.current.position.x *= 0.95 // drift back
    }
  })

  const line = useMemo(() => new THREE.Line(geometry, material), [geometry, material])

  return (
    <primitive object={line} ref={lineRef} />
  )
}

'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useUnlockStore } from '@/lib/store/unlockStore'
import type { NatalChart } from '@/types'

interface AxisLinesProps {
  chart: NatalChart
  radius: number
}

interface SingleAxisProps {
  posA: THREE.Vector3
  posB: THREE.Vector3
  color: string
  opacity: number
}

function SingleAxis({ posA, posB, color, opacity }: SingleAxisProps) {
  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints([posA, posB]),
    [posA, posB]
  )
  return (
    <line>
      <bufferGeometry attach="geometry" {...geometry} />
      <lineBasicMaterial attach="material" color={color} transparent opacity={opacity} />
    </line>
  )
}

export default function AxisLines({ chart, radius }: AxisLinesProps) {
  const specialEvents = useUnlockStore((s) => s.specialEvents)

  const showAscDesc = specialEvents.has('asc-desc-axis')
  const showMcIc    = specialEvents.has('mc-ic-axis')

  const planetMap = useMemo(
    () => new Map(chart.planets.map((p) => [p.id, p])),
    [chart.planets]
  )

  const ascDescPair = useMemo(() => {
    if (!showAscDesc) return null
    const asc  = planetMap.get('ascendant')
    const desc = planetMap.get('descendant')
    if (!asc || !desc) return null
    return {
      a: new THREE.Vector3(...asc.position).multiplyScalar(radius * 1.02),
      b: new THREE.Vector3(...desc.position).multiplyScalar(radius * 1.02),
    }
  }, [showAscDesc, planetMap, radius])

  const mcIcPair = useMemo(() => {
    if (!showMcIc) return null
    const mc = planetMap.get('mc')
    const ic = planetMap.get('ic')
    if (!mc || !ic) return null
    return {
      a: new THREE.Vector3(...mc.position).multiplyScalar(radius * 1.02),
      b: new THREE.Vector3(...ic.position).multiplyScalar(radius * 1.02),
    }
  }, [showMcIc, planetMap, radius])

  return (
    <>
      {ascDescPair && (
        <SingleAxis
          posA={ascDescPair.a}
          posB={ascDescPair.b}
          color="#f0ede8"
          opacity={0.30}
        />
      )}
      {mcIcPair && (
        <SingleAxis
          posA={mcIcPair.a}
          posB={mcIcPair.b}
          color="#c9a84c"
          opacity={0.24}
        />
      )}
    </>
  )
}

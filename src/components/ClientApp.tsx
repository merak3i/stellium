'use client'

import { useState } from 'react'
import Landing from '@/components/screens/Landing'
import EthicalGate from '@/components/screens/EthicalGate'
import BirthDataEntry from '@/components/screens/BirthDataEntry'
import NatalSeal from '@/components/screens/NatalSeal'
import ChartEnvironment from '@/components/screens/ChartEnvironment'
import PolarisCursor from '@/components/ui/PolarisCursor'
import type { BirthData, Screen } from '@/types'

export default function ClientApp() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [birthData, setBirthData] = useState<BirthData | null>(null)

  const handleLandingEnter = () => setScreen('ethical-gate')
  const handleEthicalGateContinue = () => setScreen('birth-data')
  const handleBirthDataSubmit = (data: BirthData) => {
    setBirthData(data)
    setScreen('natal-seal')
  }
  const handleNatalSealComplete = () => setScreen('chart')

  return (
    <main className="w-screen h-screen overflow-hidden bg-black" style={{ cursor: 'none' }}>
      {/* Global Polaris cursor — hidden on Landing (which manages its own) */}
      {screen !== 'landing' && <PolarisCursor />}
      {screen === 'landing' && <Landing onEnter={handleLandingEnter} />}
      {screen === 'ethical-gate' && <EthicalGate onContinue={handleEthicalGateContinue} />}
      {screen === 'birth-data' && <BirthDataEntry onSubmit={handleBirthDataSubmit} />}
      {screen === 'natal-seal' && birthData && (
        <NatalSeal birthData={birthData} onComplete={handleNatalSealComplete} />
      )}
      {screen === 'chart' && birthData && <ChartEnvironment birthData={birthData} />}
    </main>
  )
}

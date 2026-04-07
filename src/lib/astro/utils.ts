// Utility: convert ecliptic longitude (0–360°) to a normalized 3D sphere position.
// The ecliptic is tilted ~23.5° to the equator.
export function eclipticToSphere(degrees: number): [number, number, number] {
  const ECLIPTIC_TILT = 23.5 * (Math.PI / 180)
  const lambda = degrees * (Math.PI / 180)

  // Ecliptic coordinates → equatorial
  const x = Math.cos(lambda)
  const y = Math.sin(lambda) * Math.cos(ECLIPTIC_TILT)
  const z = Math.sin(lambda) * Math.sin(ECLIPTIC_TILT)

  // Normalize to unit sphere
  const len = Math.sqrt(x * x + y * y + z * z)
  return [x / len, y / len, z / len]
}

// Convert degrees to radians
export function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Normalize angle to 0–360
export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360
}

// Get zodiac sign from ecliptic longitude
export function getSign(degrees: number): string {
  const SIGNS = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
  ]
  return SIGNS[Math.floor(normalizeAngle(degrees) / 30)]
}

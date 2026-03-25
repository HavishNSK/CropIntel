const STORAGE_KEY = 'cropintel_farmer_profile'

export type StoredFarmerProfile = {
  name: string
  email?: string
  lat: number
  lng: number
  crops: string[]
  usdaFarmCode?: string
  verifiedFarmer: boolean
}

/** Mock USDA validation: non-empty, plausible length and characters */
export function mockValidateUsdaFarmCode(code: string): boolean {
  const t = code.trim()
  return t.length >= 5 && t.length <= 12 && /^[A-Za-z0-9-]+$/.test(t)
}

export function loadFarmerProfile(): StoredFarmerProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as StoredFarmerProfile
    if (
      typeof p.lat !== 'number' ||
      typeof p.lng !== 'number' ||
      !Array.isArray(p.crops) ||
      typeof p.name !== 'string'
    ) {
      return null
    }
    return p
  } catch {
    return null
  }
}

export function saveFarmerProfile(profile: StoredFarmerProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

import { getDiseaseInfo } from '@/lib/diseaseInfo'

export type HealthTrend = 'improving' | 'worsening' | 'no_change'

/** Higher score = healthier estimated condition */
export function healthScore(disease: string, crop: string, isHealthy: boolean): number {
  if (isHealthy || disease.toLowerCase() === 'healthy') return 100
  const info = getDiseaseInfo(disease, crop)
  const sev = info?.severity
  if (sev === 'high') return 22
  if (sev === 'medium') return 52
  if (sev === 'low') return 78
  return 48
}

export function compareHealthTrend(
  past: { disease: string; crop: string; is_healthy: boolean },
  current: { disease: string; crop: string; is_healthy: boolean }
): HealthTrend {
  const a = healthScore(past.disease, past.crop, past.is_healthy)
  const b = healthScore(current.disease, current.crop, current.is_healthy)
  const delta = b - a
  if (delta > 10) return 'improving'
  if (delta < -10) return 'worsening'
  return 'no_change'
}

export function trendLabel(t: HealthTrend): string {
  switch (t) {
    case 'improving':
      return 'Improving'
    case 'worsening':
      return 'Worsening'
    case 'no_change':
      return 'No change'
  }
}

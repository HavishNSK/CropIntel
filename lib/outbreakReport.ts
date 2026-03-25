export interface OutbreakReport {
  id: string
  lat: number
  lng: number
  crop: string
  disease: string
  severity: 'low' | 'medium' | 'high'
  date: string
  description: string
  /** Set when user submits a map report; drives verified / unverified labeling */
  reporterVerified?: boolean
}

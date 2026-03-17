// Agrio API Service for weather and disease risk alerts

export interface WeatherData {
  temperature: number
  humidity: number
  precipitationProbability: number
  gdd?: number // Growing Degree Days
  timestamp: string
}

export interface DiseaseAlert {
  disease: string
  riskLevel: 'low' | 'moderate' | 'high'
  status: string
  detectionCount?: number
  nearbyDetections?: number
  preventionSteps: string[]
  ipmAdvisory?: string
}

export interface AgrioResponse {
  weather: WeatherData
  alerts: DiseaseAlert[]
  location?: {
    lat: number
    lng: number
  }
}

const AGRIO_API_BASE = 'https://agrio-api-gateway-6it0wqn1.uc.gateway.dev/v1'

/**
 * Fetch weather and disease risk data from Agrio API
 * 
 * SECURITY UPDATE: Now uses server-side proxy to prevent API key exposure.
 * API keys are never exposed to the client-side code.
 * 
 * OWASP Compliance:
 * - A01:2021 (Broken Access Control) - API key protection
 * - Prevents API key leakage to client-side code
 */
export async function fetchAgrioData(
  crop: string,
  location?: { lat: number; lng: number }
): Promise<AgrioResponse> {
  try {
    // Build query parameters for server-side proxy
    const params = new URLSearchParams({ crop })
    if (location) {
      params.append('lat', location.lat.toString())
      params.append('lng', location.lng.toString())
    }

    // Call server-side proxy endpoint instead of external API directly
    // This ensures API keys are never exposed to client
    const response = await fetch(`/api/agrio?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      // If proxy fails, fall back to mock data
      console.warn('Agrio API proxy failed, using mock data')
      return getMockAgrioData(crop)
    }

    const data = await response.json()
    return data as AgrioResponse
  } catch (error: any) {
    console.error('Error fetching Agrio data:', error)
    // Always return mock data as fallback
    return getMockAgrioData(crop)
  }
}

/**
 * Transform Agrio API response to our internal format
 * Adjust this based on actual API response structure
 */
function transformAgrioResponse(apiData: any, crop: string): AgrioResponse {
  // If the API returns data in our expected format
  if (apiData.weather && apiData.alerts) {
    return apiData as AgrioResponse
  }
  
  // If format is different, transform it here
  // Example transformation (adjust based on actual API structure):
  if (apiData.temperature !== undefined || apiData.humidity !== undefined) {
    return {
      weather: {
        temperature: apiData.temperature || 25,
        humidity: apiData.humidity || 70,
        precipitationProbability: apiData.precipitation || apiData.precipitationProbability || 0,
        gdd: apiData.gdd || apiData.growingDegreeDays,
        timestamp: apiData.timestamp || new Date().toISOString()
      },
      alerts: apiData.alerts || apiData.diseaseAlerts || []
    }
  }
  
  // If we can't transform, use mock data
  console.warn('Unable to transform Agrio API response, using mock data')
  return getMockAgrioData(crop)
}

/**
 * Mock data generator for development/testing
 * Replace with actual API calls when API is available
 */
function getMockAgrioData(crop: string): AgrioResponse {
  const cropDiseases: Record<string, DiseaseAlert[]> = {
    corn: [
      {
        disease: 'Common Rust',
        riskLevel: 'moderate',
        status: 'Nearby Detections',
        nearbyDetections: 3,
        preventionSteps: [
          'Apply fungicides early in the season',
          'Use resistant hybrid varieties',
          'Monitor fields weekly'
        ],
        ipmAdvisory: 'Rust spores detected within 5km. Consider preventive fungicide application.'
      },
      {
        disease: 'Gray Leaf Spot',
        riskLevel: 'low',
        status: 'Clear',
        preventionSteps: [
          'Plant resistant hybrids',
          'Practice crop rotation',
          'Avoid continuous corn planting'
        ]
      }
    ],
    rice: [
      {
        disease: 'Rice Blast',
        riskLevel: 'high',
        status: 'Immediate Action Required',
        detectionCount: 12,
        preventionSteps: [
          'Apply fungicides immediately',
          'Use resistant varieties',
          'Proper water management',
          'Avoid excessive nitrogen'
        ],
        ipmAdvisory: 'High risk conditions detected. Multiple blast cases reported in your area.'
      },
      {
        disease: 'Bacterial Leaf Blight',
        riskLevel: 'moderate',
        status: 'Nearby Detections',
        nearbyDetections: 2,
        preventionSteps: [
          'Apply copper-based bactericides',
          'Use disease-free seeds',
          'Avoid overhead irrigation'
        ]
      }
    ],
    soybean: [
      {
        disease: 'Powdery Mildew',
        riskLevel: 'moderate',
        status: 'Nearby Detections',
        nearbyDetections: 5,
        preventionSteps: [
          'Apply fungicides like tebuconazole',
          'Improve air circulation',
          'Plant resistant varieties'
        ],
        ipmAdvisory: 'Favorable conditions for powdery mildew development.'
      },
      {
        disease: 'Bacterial Blight',
        riskLevel: 'low',
        status: 'Clear',
        preventionSteps: [
          'Use disease-free seeds',
          'Practice crop rotation',
          'Avoid working in wet fields'
        ]
      }
    ],
    wheat: [
      {
        disease: 'Leaf Rust',
        riskLevel: 'high',
        status: 'Immediate Action Required',
        detectionCount: 8,
        preventionSteps: [
          'Apply fungicides early in the season',
          'Use resistant varieties',
          'Proper timing of applications'
        ],
        ipmAdvisory: 'Rust spores spreading rapidly. Immediate fungicide application recommended.'
      },
      {
        disease: 'Powdery Mildew',
        riskLevel: 'moderate',
        status: 'Nearby Detections',
        nearbyDetections: 4,
        preventionSteps: [
          'Apply fungicides containing tebuconazole',
          'Improve air circulation',
          'Avoid dense planting'
        ]
      }
    ]
  }

  // Generate random weather data
  const weather: WeatherData = {
    temperature: Math.round(20 + Math.random() * 15), // 20-35°C
    humidity: Math.round(50 + Math.random() * 40), // 50-90%
    precipitationProbability: Math.round(Math.random() * 100),
    gdd: Math.round(100 + Math.random() * 200),
    timestamp: new Date().toISOString()
  }

  return {
    weather,
    alerts: cropDiseases[crop.toLowerCase()] || [],
  }
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { Cloud, Shield, Bug, Thermometer, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'
import { fetchAgrioData, AgrioResponse, DiseaseAlert } from '@/lib/agrioApi'

interface RiskDashboardProps {
  crop: string
}

export default function RiskDashboard({ crop }: RiskDashboardProps) {
  const [data, setData] = useState<AgrioResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAgrioData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // fetchAgrioData always returns data (either from API or mock)
      const agrioData = await fetchAgrioData(crop)
      setData(agrioData)
      
      // Check if we're using mock data (API unavailable)
      // This is handled gracefully - mock data is always returned
    } catch (err: any) {
      console.error('Unexpected error loading Agrio data:', err)
      // Even on error, try to get mock data
      const mockData = await fetchAgrioData(crop)
      setData(mockData)
      setError('Using demo data - API unavailable. Configure API key for live data.')
    } finally {
      setLoading(false)
    }
  }, [crop])

  useEffect(() => {
    loadAgrioData()
  }, [loadAgrioData])

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-500'
      case 'moderate':
        return 'bg-orange-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRiskBgColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-50 border-red-300'
      case 'moderate':
        return 'bg-orange-50 border-orange-300'
      case 'low':
        return 'bg-green-50 border-green-300'
      default:
        return 'bg-gray-50 border-gray-300'
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle className="w-6 h-6 text-red-600" />
      case 'moderate':
        return <AlertCircle className="w-6 h-6 text-orange-600" />
      case 'low':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      default:
        return <Shield className="w-6 h-6 text-gray-600" />
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-2xl border-2 border-red-300 p-6 shadow-xl">
        <div className="flex items-center gap-3 text-red-800">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-lg">Error Loading Risk Data</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Show info banner if using demo/mock data
  // Note: In Next.js, env vars are only available at build time for client components
  // We'll show the banner if there's an error message indicating demo mode
  const isDemoMode = error?.includes('demo data') || error?.includes('API unavailable')

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="bg-yellow-50 rounded-2xl border-2 border-yellow-300 p-4 shadow-xl">
          <div className="flex items-center gap-3 text-yellow-900">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Demo Mode: Showing sample data</p>
              <p className="text-xs">Configure NEXT_PUBLIC_AGRIO_API_KEY in .env.local for live Agrio API data</p>
            </div>
          </div>
        </div>
      )}

      {/* Weather Grid */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
          <Cloud className="w-7 h-7 text-blue-600" />
          Weather Conditions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WeatherCard
            icon={<Thermometer className="w-8 h-8 text-red-500" />}
            label="Temperature"
            value={`${data.weather.temperature}°C`}
            color="text-red-600"
          />
          <WeatherCard
            icon={<Cloud className="w-8 h-8 text-blue-500" />}
            label="Humidity"
            value={`${data.weather.humidity}%`}
            color="text-blue-600"
          />
          <WeatherCard
            icon={<Cloud className="w-8 h-8 text-indigo-500" />}
            label="Precipitation"
            value={`${data.weather.precipitationProbability}%`}
            color="text-indigo-600"
          />
        </div>
        {data.weather.gdd && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Growing Degree Days (GDD):</strong> {data.weather.gdd}
            </p>
          </div>
        )}
      </div>

      {/* Disease Risk Alerts */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary-600" />
          Disease Risk Alerts
        </h2>
        <div className="space-y-4">
          {data.alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold">All Clear! No disease risks detected.</p>
            </div>
          ) : (
            data.alerts.map((alert, index) => (
              <DiseaseCard key={index} alert={alert} getRiskBgColor={getRiskBgColor} getRiskIcon={getRiskIcon} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function WeatherCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white/80 rounded-xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        {icon}
        <span className={`text-3xl font-extrabold ${color}`}>{value}</span>
      </div>
      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{label}</p>
    </div>
  )
}

function DiseaseCard({ alert, getRiskBgColor, getRiskIcon }: { alert: DiseaseAlert; getRiskBgColor: (level: string) => string; getRiskIcon: (level: string) => React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`rounded-xl border-2 p-5 shadow-lg transition-all duration-300 ${getRiskBgColor(alert.riskLevel)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="mt-1">{getRiskIcon(alert.riskLevel)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{alert.disease}</h3>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold text-white uppercase ${alert.riskLevel === 'high' ? 'bg-red-600' : alert.riskLevel === 'moderate' ? 'bg-orange-600' : 'bg-green-600'}`}>
                {alert.riskLevel} Risk
              </span>
            </div>
            <p className="text-gray-700 font-semibold mb-2">{alert.status}</p>
            {alert.detectionCount && (
              <p className="text-sm text-gray-600 mb-1">
                <Bug className="w-4 h-4 inline mr-1" />
                {alert.detectionCount} detections in your area
              </p>
            )}
            {alert.nearbyDetections && (
              <p className="text-sm text-gray-600">
                <Bug className="w-4 h-4 inline mr-1" />
                {alert.nearbyDetections} nearby detections
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-4 p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t-2 border-gray-300 space-y-4">
          {alert.ipmAdvisory && (
            <div className="bg-white/60 rounded-lg p-4 border border-gray-300">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                IPM Advisory
              </h4>
              <p className="text-sm text-gray-700">{alert.ipmAdvisory}</p>
            </div>
          )}
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Prevention Steps:</h4>
            <ul className="space-y-2">
              {alert.preventionSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-primary-600 mt-1">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl">
        <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl p-6 h-24"></div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl">
        <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl p-6 h-32"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

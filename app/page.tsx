'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import CropSelector from '@/components/CropSelector'
import PredictionResults from '@/components/PredictionResults'
import DiseaseInfo from '@/components/DiseaseInfo'
import PredictionHistory from '@/components/PredictionHistory'
import ExportResults from '@/components/ExportResults'
import TipsAndGuidelines from '@/components/TipsAndGuidelines'
import Diagnosis from '@/components/Diagnosis'
import USOutbreakMap from '@/components/USOutbreakMap'
import NotificationSystem from '@/components/NotificationSystem'
import FarmerRegistration from '@/components/FarmerRegistration'
import { savePredictionToHistory } from '@/components/PredictionHistory'
import { CROPS } from '@/lib/crops'

interface OutbreakReport {
  id: string
  lat: number
  lng: number
  crop: string
  disease: string
  severity: 'low' | 'medium' | 'high'
  date: string
  description: string
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedCrop, setSelectedCrop] = useState<string>('corn')
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  // Initialize with a sample outbreak in Russellville, Arkansas
  const [outbreakReports, setOutbreakReports] = useState<OutbreakReport[]>([
    {
      id: 'russellville-outbreak-1',
      lat: 35.2784,
      lng: -93.1338,
      crop: 'corn',
      disease: 'Common Rust',
      severity: 'high',
      date: new Date().toISOString(),
      description: 'Severe rust outbreak detected in corn fields. Multiple farms affected in the area.',
    },
    {
      id: 'high-severity-130-miles',
      lat: 33.6234, // Exactly 130 miles south of farmer-1 (35.5, -93.2)
      lng: -93.2,
      crop: 'corn',
      disease: 'Southern Corn Leaf Blight',
      severity: 'high',
      date: new Date().toISOString(),
      description: 'CRITICAL: Severe southern corn leaf blight outbreak detected. Immediate action required. Multiple farms at risk within 150-mile radius.',
    },
    {
      id: 'california-outbreak-1',
      lat: 36.7783,
      lng: -119.4179,
      crop: 'wheat',
      disease: 'Leaf Rust',
      severity: 'high',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Widespread leaf rust detected in wheat fields across Central Valley.',
    },
    {
      id: 'texas-outbreak-1',
      lat: 31.9686,
      lng: -99.9018,
      crop: 'corn',
      disease: 'Gray Leaf Spot',
      severity: 'medium',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Gray leaf spot spreading in corn crops. Farmers advised to monitor closely.',
    },
    {
      id: 'iowa-outbreak-1',
      lat: 41.8780,
      lng: -93.0977,
      crop: 'soybean',
      disease: 'Powdery Mildew',
      severity: 'medium',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Powdery mildew detected in soybean fields. Early treatment recommended.',
    },
    {
      id: 'illinois-outbreak-1',
      lat: 40.3495,
      lng: -88.9861,
      crop: 'corn',
      disease: 'Common Rust',
      severity: 'low',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Minor rust outbreak in isolated corn fields. Monitoring in progress.',
    },
    {
      id: 'kansas-outbreak-1',
      lat: 38.5729,
      lng: -98.3833,
      crop: 'wheat',
      disease: 'Stripe Rust',
      severity: 'high',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Severe stripe rust outbreak affecting wheat crops. Immediate action required.',
    },
    {
      id: 'nebraska-outbreak-1',
      lat: 41.4925,
      lng: -99.9018,
      crop: 'corn',
      disease: 'Northern Corn Leaf Blight',
      severity: 'medium',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Northern corn leaf blight detected. Fungicide application recommended.',
    },
    {
      id: 'minnesota-outbreak-1',
      lat: 46.7296,
      lng: -94.6859,
      crop: 'soybean',
      disease: 'Bacterial Blight',
      severity: 'low',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Bacterial blight found in soybean fields. Isolated cases reported.',
    },
    {
      id: 'north-carolina-outbreak-1',
      lat: 35.2271,
      lng: -80.8431,
      crop: 'corn',
      disease: 'Southern Corn Leaf Blight',
      severity: 'high',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Severe southern corn leaf blight outbreak. Multiple counties affected.',
    },
    {
      id: 'missouri-outbreak-1',
      lat: 38.5729,
      lng: -92.1893,
      crop: 'soybean',
      disease: 'Sudden Death Syndrome',
      severity: 'medium',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Sudden death syndrome detected in soybean crops. Root health monitoring advised.',
    },
    {
      id: 'indiana-outbreak-1',
      lat: 39.7684,
      lng: -86.1581,
      crop: 'corn',
      disease: 'Common Rust',
      severity: 'low',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Minor rust spots detected. Early stage monitoring.',
    },
    {
      id: 'ohio-outbreak-1',
      lat: 40.3888,
      lng: -82.7649,
      crop: 'corn',
      disease: 'Gray Leaf Spot',
      severity: 'medium',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Gray leaf spot spreading in corn fields. Weather conditions favorable for spread.',
    },
  ])
  const [farmerLocation, setFarmerLocation] = useState<{ lat: number; lng: number; crops: string[] } | null>(null)

  const handlePredict = async () => {
    if (!selectedImage) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError(null)
    setPrediction(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('crop', selectedCrop)

      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Prediction failed')
      }

      const data = await response.json()
      setPrediction(data)
      
      // Save to history
      if (imageUrl) {
        // Confidence comes as decimal (0.95) or percentage (95), normalize to percentage
        const confidencePercent = typeof data.confidence === 'number' && data.confidence <= 1 
          ? data.confidence * 100 
          : data.confidence
        savePredictionToHistory(
          selectedCrop,
          data.disease,
          confidencePercent,
          imageUrl
        )
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setSelectedImage(null)
    setPrediction(null)
    setError(null)
    setImageUrl(null)
  }

  const handleImageSelect = (file: File | null) => {
    setSelectedImage(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setImageUrl(url)
    } else {
      setImageUrl(null)
    }
  }

  const handleHistorySelect = (record: any) => {
    // Load image from history
    setImageUrl(record.imageUrl)
    setSelectedCrop(record.crop)
    // Note: We can't reload the File object from URL, but we can show the prediction
    // In a real app, you might want to store more data in history
  }

  const handleOutbreakReport = (report: OutbreakReport) => {
    setOutbreakReports([...outbreakReports, report])
  }

  const handleFarmerRegister = (location: { lat: number; lng: number; crops: string[]; name: string }) => {
    setFarmerLocation({
      lat: location.lat,
      lng: location.lng,
      crops: location.crops,
    })
    // In a real app, this would be saved to a database
    alert(`Farm "${location.name}" registered! You'll now receive alerts for outbreaks within 250 miles.`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-8 px-4 relative overflow-x-hidden">
      <div className="container mx-auto max-w-7xl relative z-0">
        {/* Header */}
        <header className="text-center mb-12 relative">
          {/* Navigation Bar */}
          <nav className="mb-8 flex justify-center items-center gap-4 flex-wrap">
            <a
              href="/"
              className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-slate-700 font-semibold hover:text-blue-600"
            >
              Home
            </a>
            <a
              href="/tierlist"
              className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-slate-700 font-semibold hover:text-blue-600"
            >
              Tier List
            </a>
            <a
              href="/outbreaks"
              className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-slate-700 font-semibold hover:text-blue-600"
            >
              Outbreaks
            </a>
          </nav>

          {/* Notification System and Registration - Top Right */}
          <div className="absolute top-0 right-0 flex items-center gap-3 z-10">
            <FarmerRegistration
              onRegister={handleFarmerRegister}
              crops={Object.keys(CROPS)}
            />
            <NotificationSystem
              outbreaks={outbreakReports}
              currentFarmerLocation={farmerLocation || undefined}
            />
          </div>
          
          <div className="inline-block p-6 bg-white rounded-2xl shadow-lg border-2 border-slate-200 mb-6">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary-600 via-blue-600 to-primary-600 bg-clip-text text-transparent mb-3">
              🌾 CropIntel
            </h1>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            AI-Powered Crop Disease Classification
          </p>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Detect and diagnose crop diseases with advanced machine learning technology
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Tips and Guidelines - Sidebar */}
          <div className="lg:col-span-1">
            <TipsAndGuidelines />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8 space-y-6">
          {/* Image Upload */}
          <ImageUpload
            selectedImage={selectedImage}
            onImageSelect={handleImageSelect}
            onClear={handleClear}
          />

          {/* Crop Selector */}
          <CropSelector
            crops={Object.keys(CROPS)}
            selectedCrop={selectedCrop}
            onCropChange={setSelectedCrop}
          />

          {/* Predict Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handlePredict}
              disabled={!selectedImage || loading}
              className="group relative px-12 py-4 bg-gradient-to-r from-blue-600 to-primary-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
              <span className="relative flex items-center gap-3">
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Analyze Disease
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-900 px-6 py-4 rounded-xl shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-bold">Error:</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Prediction Results */}
          {prediction && (
            <>
              <PredictionResults prediction={prediction} />
              <Diagnosis 
                disease={prediction.disease} 
                crop={selectedCrop} 
                confidence={typeof prediction.confidence === 'number' && prediction.confidence <= 1 
                  ? prediction.confidence * 100 
                  : prediction.confidence}
                isHealthy={prediction.is_healthy}
              />
              <DiseaseInfo diseaseName={prediction.disease} crop={selectedCrop} />
              <ExportResults prediction={prediction} crop={selectedCrop} imageUrl={imageUrl} />
            </>
          )}
          </div>
        </div>

        {/* Prediction History */}
        <div className="mt-8">
          <PredictionHistory onSelectHistory={handleHistorySelect} />
        </div>

        {/* Outbreak Reporting Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              Outbreak Reporting Map
            </h2>
            <p className="text-gray-700 text-lg">
              Report potential crop disease outbreaks by clicking on the map. Help track and monitor disease spread across the United States.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-inner border border-slate-200">
            <USOutbreakMap reports={outbreakReports} onReportSubmit={handleOutbreakReport} />
          </div>
          
          {/* Outbreak Reports List */}
          {outbreakReports.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                  {outbreakReports.length}
                </span>
                Reported Outbreaks
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {outbreakReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-gradient-to-r from-white to-slate-50 border-2 border-slate-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="text-lg font-bold text-gray-900">
                            {report.crop} - {report.disease}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              report.severity === 'high'
                                ? 'bg-red-100 text-red-800 border-2 border-red-300'
                                : report.severity === 'medium'
                                ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                                : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                            }`}
                          >
                            {report.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1 font-mono">
                          📍 {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                        </p>
                        {report.description && (
                          <p className="text-sm text-gray-700 mt-2">{report.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-3 font-medium">
                          🕒 {new Date(report.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-slate-600">
          <p className="text-sm font-medium">Powered by EfficientNet & TensorFlow Lite</p>
          <p className="text-xs text-slate-500 mt-2">© 2024 CropIntel - AI-Powered Agriculture</p>
        </footer>
      </div>
    </main>
  )
}

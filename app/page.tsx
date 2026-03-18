'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Bell, MapPin, Sparkles, History as HistoryIcon, ArrowRight, Loader2 } from 'lucide-react'
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
  const [activeView, setActiveView] = useState<'diagnose' | 'history' | 'outbreaks'>('diagnose')
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
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Top bar */}
        <header className="sticky top-0 z-40 -mx-4 px-4 py-3 backdrop-blur bg-white/70 border-b border-slate-200/60">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center shadow-sm overflow-hidden">
                <Image
                  src="/brand/wheat-mark-transparent.png"
                  alt="CropIntel"
                  width={22}
                  height={44}
                  className="opacity-95 object-contain drop-shadow-[0_1px_0_rgba(0,0,0,0.08)]"
                  priority
                />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-slate-900">CropIntel</div>
                <div className="text-xs text-slate-500">Crop health insights</div>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <a
                href="/"
                className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Diagnose
              </a>
              <a
                href="/outbreaks"
                className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Outbreaks
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <FarmerRegistration onRegister={handleFarmerRegister} crops={Object.keys(CROPS)} />
              </div>
              <div className="relative">
                <NotificationSystem outbreaks={outbreakReports} currentFarmerLocation={farmerLocation || undefined} />
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mt-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                Diagnose crop issues from a photo
              </h1>
              <p className="mt-2 text-slate-600">
                Upload a leaf image, pick the crop, and get a ranked set of labels with confidence.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-700 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary-700" />
                Outbreak alerts
              </div>
            </div>
          </div>
        </section>

        {/* Views */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {(
            [
              { id: 'diagnose', label: 'Diagnose', icon: Sparkles },
              { id: 'history', label: 'History', icon: HistoryIcon },
              { id: 'outbreaks', label: 'Outbreaks', icon: MapPin },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 ${
                activeView === id
                  ? 'bg-primary-700 text-white border-primary-700'
                  : 'bg-white/70 text-slate-700 border-slate-200 hover:bg-white hover:border-primary-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeView === 'diagnose' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="surface rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Photo analysis</h2>
                    <p className="text-sm text-slate-600 mt-1">Best results with a sharp, well-lit close-up.</p>
                  </div>
                  <div className="text-xs text-slate-500">
                    Step <span className="font-semibold text-slate-700">1</span> of 3
                  </div>
                </div>

                <div className="mt-5 space-y-5">
                  <ImageUpload selectedImage={selectedImage} onImageSelect={handleImageSelect} onClear={handleClear} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CropSelector crops={Object.keys(CROPS)} selectedCrop={selectedCrop} onCropChange={setSelectedCrop} />
                    <div className="flex items-end">
                      <button
                        onClick={handlePredict}
                        disabled={!selectedImage || loading}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-700 text-white font-semibold shadow-sm hover:bg-primary-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        {loading ? 'Analyzing…' : 'Run analysis'}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-900">
                      <div className="text-sm font-semibold">Something went wrong</div>
                      <div className="text-sm mt-1">{error}</div>
                    </div>
                  )}

                  {prediction && (
                    <>
                      <PredictionResults prediction={prediction} />
                      <Diagnosis
                        disease={prediction.disease}
                        crop={selectedCrop}
                        confidence={
                          typeof prediction.confidence === 'number' && prediction.confidence <= 1
                            ? prediction.confidence * 100
                            : prediction.confidence
                        }
                        isHealthy={prediction.is_healthy}
                      />
                      <DiseaseInfo diseaseName={prediction.disease} crop={selectedCrop} />
                      <ExportResults prediction={prediction} crop={selectedCrop} imageUrl={imageUrl} />
                    </>
                  )}
                </div>
              </section>
            </div>

            <aside className="lg:col-span-1 space-y-6">
              <TipsAndGuidelines />

              <div className="surface rounded-2xl p-6">
                <h3 className="text-base font-semibold text-slate-900">Alerts</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Register a farm location to receive outbreak notifications within 250 miles.
                </p>
                <div className="mt-4 sm:hidden">
                  <FarmerRegistration onRegister={handleFarmerRegister} crops={Object.keys(CROPS)} />
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeView === 'history' && (
          <section className="surface rounded-2xl p-6">
            <PredictionHistory onSelectHistory={handleHistorySelect} />
          </section>
        )}

        {activeView === 'outbreaks' && (
          <section className="surface rounded-2xl p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900">Outbreak map</h2>
              <p className="text-sm text-slate-600 mt-1">
                Click to report a potential outbreak and help track disease spread.
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <USOutbreakMap reports={outbreakReports} onReportSubmit={handleOutbreakReport} />
            </div>
          </section>
        )}

        <footer className="text-center mt-10 mb-6 text-slate-500">
          <p className="text-xs">Models: EfficientNet / TensorFlow Lite</p>
        </footer>
      </div>
    </main>
  )
}

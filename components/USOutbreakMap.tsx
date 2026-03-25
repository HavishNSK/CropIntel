'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, AlertTriangle, X, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { OutbreakReport } from '@/lib/outbreakReport'

// Dynamically import Google Maps component to avoid SSR issues
const GoogleMapComponent = dynamic(() => import('./GoogleMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white rounded-xl border-2 border-slate-300" style={{ aspectRatio: '3/2', minHeight: '500px' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-600 font-semibold">Loading Google Maps...</p>
      </div>
    </div>
  )
})

interface USOutbreakMapProps {
  reports?: OutbreakReport[]
  onReportSubmit?: (report: OutbreakReport) => void
  /** Reporter status for new submissions from this browser */
  reporterVerified: boolean
}

export default function USOutbreakMap({ reports = [], onReportSubmit, reporterVerified }: USOutbreakMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showReportForm, setShowReportForm] = useState(false)
  
  // Ensure modal closes on mount/unmount to prevent stuck overlays
  useEffect(() => {
    return () => {
      setShowReportForm(false)
      setSelectedLocation(null)
    }
  }, [])

  const [formData, setFormData] = useState({
    crop: '',
    disease: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    description: '',
  })

  const handleMapClick = (lat: number, lng: number) => {
    // Restrict to US bounds
    const clampedLat = Math.max(24.39, Math.min(49.38, lat))
    const clampedLng = Math.max(-125, Math.min(-66.93, lng))
    
    setSelectedLocation({ lat: clampedLat, lng: clampedLng })
    setShowReportForm(true)
  }

  const handleSubmitReport = () => {
    if (!selectedLocation || !formData.crop || !formData.disease) {
      alert('Please fill in all required fields')
      return
    }

    const newReport: OutbreakReport = {
      id: Date.now().toString(),
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      crop: formData.crop,
      disease: formData.disease,
      severity: formData.severity,
      date: new Date().toISOString(),
      description: formData.description,
      reporterVerified,
    }

    if (onReportSubmit) {
      onReportSubmit(newReport)
    }

    setShowReportForm(false)
    setSelectedLocation(null)
    setFormData({
      crop: '',
      disease: '',
      severity: 'medium',
      description: '',
    })
  }

  return (
    <div className="w-full relative">
      {/* Google Maps Container */}
      <div className="w-full relative bg-white rounded-xl border-2 border-slate-300 overflow-hidden shadow-lg" style={{ aspectRatio: '3/2', minHeight: '500px' }}>
        <GoogleMapComponent
          reports={reports}
          onMapClick={handleMapClick}
          center={{ lat: 39.8283, lng: -98.5795 }}
          zoom={4}
        />

        {/* Click instruction overlay */}
        <div className="absolute bottom-6 left-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-lg shadow-xl z-[1000] border border-blue-800 pointer-events-none">
          <p className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Click anywhere on the map to report an outbreak
          </p>
        </div>

        {selectedLocation && !showReportForm && (
          <div className="absolute top-6 right-6 bg-white rounded-lg shadow-xl p-4 border-2 border-blue-200 z-[1000] pointer-events-none">
            <p className="text-sm font-bold text-slate-900 mb-1">📍 Selected Location</p>
            <p className="text-xs text-slate-600 font-mono">
              {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      {/* Report Form Modal */}
      <AnimatePresence>
        {showReportForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4"
            onClick={() => {
              setShowReportForm(false)
              setSelectedLocation(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                  Report Outbreak
                </h2>
                <button
                  onClick={() => {
                    setShowReportForm(false)
                    setSelectedLocation(null)
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedLocation && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 font-semibold mb-1">Location</p>
                  <p className="text-sm text-blue-900 font-mono">
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Crop Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                    placeholder="e.g., Corn, Wheat, Rice"
                    className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Disease Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.disease}
                    onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                    placeholder="e.g., Rust, Blight, Mosaic"
                    className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Severity <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        severity: e.target.value as 'low' | 'medium' | 'high',
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  >
                    <option value="low">🟡 Low</option>
                    <option value="medium">🟠 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional details about the outbreak..."
                    rows={3}
                    className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmitReport}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <Save className="w-5 h-5" />
                  Submit Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

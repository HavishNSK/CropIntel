'use client'

import { useState } from 'react'
import { MapPin, Save, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FarmerRegistrationProps {
  onRegister: (location: { lat: number; lng: number; crops: string[]; name: string }) => void
  crops: string[]
}

export default function FarmerRegistration({ onRegister, crops }: FarmerRegistrationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    lat: '',
    lng: '',
    selectedCrops: [] as string[],
  })

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
          })
        },
        (error) => {
          alert('Unable to get your location. Please enter it manually.')
          console.error('Geolocation error:', error)
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  const handleCropToggle = (crop: string) => {
    setFormData({
      ...formData,
      selectedCrops: formData.selectedCrops.includes(crop)
        ? formData.selectedCrops.filter((c) => c !== crop)
        : [...formData.selectedCrops, crop],
    })
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.lat || !formData.lng || formData.selectedCrops.length === 0) {
      alert('Please fill in all required fields')
      return
    }

    onRegister({
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      crops: formData.selectedCrops,
      name: formData.name,
    })

    setIsOpen(false)
    setFormData({
      name: '',
      email: '',
      lat: '',
      lng: '',
      selectedCrops: [],
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-sm"
      >
        <MapPin className="w-4 h-4" />
        Register Your Farm
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
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
                  <MapPin className="w-6 h-6 text-blue-600" />
                  Register Your Farm Location
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Farm Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Smith Family Farm"
                    className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="farmer@example.com"
                    className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                      placeholder="Latitude"
                      className="flex-1 px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-600 transition-all"
                    />
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                      placeholder="Longitude"
                      className="flex-1 px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-600 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleGetLocation}
                    className="w-full px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-800 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Use My Current Location
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Crops You Grow <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {crops.map((crop) => (
                      <button
                        key={crop}
                        onClick={() => handleCropToggle(crop)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all border-2 ${
                          formData.selectedCrops.includes(crop)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:border-blue-400'
                        }`}
                      >
                        {crop.charAt(0).toUpperCase() + crop.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-xs text-primary-800">
                    <strong>Note:</strong> You&apos;ll receive alerts for disease outbreaks within 250 miles of your registered location for the crops you select.
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                >
                  <Save className="w-5 h-5" />
                  Register Farm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

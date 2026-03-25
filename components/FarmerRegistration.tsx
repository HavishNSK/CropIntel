'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, Save, X } from 'lucide-react'
import { mockValidateUsdaFarmCode } from '@/lib/farmerProfile'
import { motion, AnimatePresence } from 'framer-motion'

interface FarmerRegistrationProps {
  onRegister: (location: {
    lat: number
    lng: number
    crops: string[]
    name: string
    email?: string
    usdaFarmCode?: string
    verifiedFarmer: boolean
  }) => void
  crops: string[]
}

export default function FarmerRegistration({ onRegister, crops }: FarmerRegistrationProps) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    lat: '',
    lng: '',
    usdaFarmCode: '',
    selectedCrops: [] as string[],
  })

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
          }))
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
    setFormData((prev) => ({
      ...prev,
      selectedCrops: prev.selectedCrops.includes(crop)
        ? prev.selectedCrops.filter((c) => c !== crop)
        : [...prev.selectedCrops, crop],
    }))
  }

  const handleSubmit = () => {
    const missing: string[] = []
    if (!formData.name.trim()) missing.push('Farm name (green section at top of form)')
    const latOk = formData.lat.trim() !== '' && !Number.isNaN(parseFloat(formData.lat))
    const lngOk = formData.lng.trim() !== '' && !Number.isNaN(parseFloat(formData.lng))
    if (!latOk) missing.push('Latitude')
    if (!lngOk) missing.push('Longitude')
    if (formData.selectedCrops.length === 0) missing.push('At least one crop')

    if (missing.length > 0) {
      alert(`Please complete the following:\n\n• ${missing.join('\n• ')}`)
      return
    }

    const code = formData.usdaFarmCode.trim()
    const verifiedFarmer = code.length > 0 ? mockValidateUsdaFarmCode(code) : false

    onRegister({
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      crops: formData.selectedCrops,
      name: formData.name,
      email: formData.email.trim() || undefined,
      usdaFarmCode: code || undefined,
      verifiedFarmer,
    })

    setIsOpen(false)
    setFormData({
      name: '',
      email: '',
      lat: '',
      lng: '',
      usdaFarmCode: '',
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

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="farm-registration-fullpage"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[9999] flex h-[100dvh] w-screen flex-col bg-white overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="farm-registration-title"
          >
            <div className="flex items-center justify-between gap-4 px-5 sm:px-10 lg:px-16 py-4 sm:py-6 border-b border-slate-200 flex-shrink-0 bg-white">
              <h2
                id="farm-registration-title"
                className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3 min-w-0"
              >
                <MapPin className="w-7 h-7 text-primary-600 shrink-0" />
                <span>Register your farm</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-900 transition-colors p-3 hover:bg-slate-100 rounded-xl shrink-0 border border-slate-200"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-5 sm:px-10 lg:px-16 py-5 sm:py-6 bg-primary-50/90 border-b border-primary-100 flex-shrink-0">
              <label className="block text-base font-bold text-slate-800 mb-2" htmlFor="farm-registration-name">
                Farm name <span className="text-red-600">*</span>
              </label>
              <input
                id="farm-registration-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Smith Family Farm"
                autoComplete="organization"
                className="w-full max-w-3xl px-5 py-4 border-2 border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-600 bg-white text-lg"
              />
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-10 lg:px-16 py-6 sm:py-8 space-y-6 sm:space-y-8 min-h-0">
              <div>
                <label className="block text-base font-semibold text-slate-700 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="farmer@example.com"
                  className="w-full max-w-3xl px-5 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-600 transition-all text-lg"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-slate-700 mb-2">
                  USDA farm / tract code (optional)
                </label>
                <input
                  type="text"
                  value={formData.usdaFarmCode}
                  onChange={(e) => setFormData((prev) => ({ ...prev, usdaFarmCode: e.target.value }))}
                  placeholder="e.g., 12345-67890"
                  className="w-full max-w-3xl px-5 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-600 transition-all font-mono text-lg"
                />
                <p className="text-sm text-slate-600 mt-2 max-w-3xl">
                  If provided and format looks valid, you&apos;ll be marked as a <strong>Verified farmer</strong>{' '}
                  (demo validation only).
                </p>
              </div>

              <div>
                <label className="block text-base font-semibold text-slate-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 mb-3 max-w-3xl">
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lat: e.target.value }))}
                    placeholder="Latitude"
                    className="flex-1 min-w-0 px-5 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-600 transition-all text-lg"
                  />
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lng: e.target.value }))}
                    placeholder="Longitude"
                    className="flex-1 min-w-0 px-5 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-600 transition-all text-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full max-w-3xl px-5 py-4 bg-primary-100 hover:bg-primary-200 text-primary-900 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-lg"
                >
                  <MapPin className="w-5 h-5" />
                  Use My Current Location
                </button>
              </div>

              <div>
                <label className="block text-base font-semibold text-slate-700 mb-3">
                  Crops you grow <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl">
                  {crops.map((crop) => (
                    <button
                      type="button"
                      key={crop}
                      onClick={() => handleCropToggle(crop)}
                      className={`px-4 py-5 sm:py-6 rounded-xl font-bold transition-all border-2 text-lg ${
                        formData.selectedCrops.includes(crop)
                          ? 'bg-primary-700 text-white border-primary-700 shadow-md'
                          : 'bg-slate-100 text-slate-800 border-slate-300 hover:border-primary-400'
                      }`}
                    >
                      {crop.charAt(0).toUpperCase() + crop.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5 max-w-3xl">
                <p className="text-sm sm:text-base text-primary-900">
                  <strong>Note:</strong> You&apos;ll receive alerts for disease outbreaks within 250 miles of your registered location for the crops you select.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 border-t border-slate-200 px-5 sm:px-10 lg:px-16 py-5 sm:py-6 bg-slate-50">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full max-w-3xl mx-auto bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white font-bold py-4 sm:py-5 px-8 rounded-xl transition-all flex items-center justify-center gap-3 shadow-md text-lg"
              >
                <Save className="w-6 h-6" />
                Register Farm
              </button>
            </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}

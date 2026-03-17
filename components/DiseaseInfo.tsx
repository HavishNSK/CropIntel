'use client'

import { getDiseaseInfo } from '@/lib/diseaseInfo'

interface DiseaseInfoProps {
  diseaseName: string
  crop: string
}

export default function DiseaseInfo({ diseaseName, crop }: DiseaseInfoProps) {
  const info = getDiseaseInfo(diseaseName, crop)

  if (!info) return null

  const severityColors = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-red-100 text-red-800 border-red-300'
  }

  return (
    <div className="mt-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200/50 p-8 shadow-xl">
      <h3 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Disease Information
      </h3>
      
      {/* Description */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Description</h4>
        <p className="text-gray-600">{info.description}</p>
      </div>

      {/* Severity Badge */}
      {!info.name.toLowerCase().includes('healthy') && (
        <div className="mb-6">
          <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-bold text-sm shadow-md ${severityColors[info.severity]}`}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Severity: {info.severity.toUpperCase()}
          </span>
        </div>
      )}

      {/* Symptoms */}
      {info.symptoms.length > 0 && (
        <div className="mb-6 bg-white/60 rounded-xl p-5 border border-gray-200">
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Symptoms
          </h4>
          <ul className="space-y-3 text-gray-700">
            {info.symptoms.map((symptom, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-red-500 mt-1">•</span>
                <span>{symptom}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Treatment */}
      {info.treatment.length > 0 && (
        <div className="mb-6 bg-white/60 rounded-xl p-5 border border-gray-200">
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Treatment
          </h4>
          <ul className="space-y-3 text-gray-700">
            {info.treatment.map((treatment, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">•</span>
                <span>{treatment}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prevention */}
      {info.prevention.length > 0 && (
        <div className="mb-6 bg-white/60 rounded-xl p-5 border border-gray-200">
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Prevention
          </h4>
          <ul className="space-y-3 text-gray-700">
            {info.prevention.map((prevention, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-green-500 mt-1">•</span>
                <span>{prevention}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-md">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-900 font-medium">
            <strong>Note:</strong> This information is for reference only. Always consult with agricultural experts or extension services for specific treatment recommendations for your region.
          </p>
        </div>
      </div>
    </div>
  )
}

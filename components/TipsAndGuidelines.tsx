'use client'

import { useState } from 'react'

export default function TipsAndGuidelines() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left group"
      >
        <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-3">
          <span className="text-3xl">📸</span>
          <span>Tips for Best Results</span>
        </h3>
        <svg
          className={`w-7 h-7 text-gray-700 transition-transform duration-300 group-hover:text-primary-600 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-6 space-y-5 text-gray-700 animate-fadeIn">
          <div className="bg-white/60 rounded-xl p-5 border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
              <span className="text-2xl">📷</span>
              Image Quality
            </h4>
            <ul className="space-y-2">
              {['Use clear, well-lit photos', 'Ensure the leaf/disease area is in focus', 'Avoid blurry or dark images', 'Take photos in natural daylight when possible'].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/60 rounded-xl p-5 border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
              <span className="text-2xl">🎯</span>
              What to Capture
            </h4>
            <ul className="space-y-2">
              {['Focus on the affected area of the plant', 'Include enough context (entire leaf or affected region)', 'Capture both sides of leaves if symptoms are visible', 'Avoid including too much background'].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/60 rounded-xl p-5 border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
              <span className="text-2xl">⚡</span>
              Best Practices
            </h4>
            <ul className="space-y-2">
              {['Take multiple photos from different angles', 'Include healthy parts for comparison if possible', 'Note the crop type and growth stage', 'Check predictions match visual symptoms'].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl shadow-md">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-yellow-900 font-medium">
                <strong>Remember:</strong> AI predictions are a tool to assist diagnosis. Always verify results with agricultural experts, especially for treatment decisions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

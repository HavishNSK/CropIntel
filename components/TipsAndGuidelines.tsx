'use client'

import { useState } from 'react'
import { Camera, ChevronDown, CheckCircle2, TriangleAlert } from 'lucide-react'

export default function TipsAndGuidelines() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left group gap-4"
      >
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <span className="p-2 rounded-xl bg-primary-50 border border-primary-100">
            <Camera className="w-4 h-4 text-primary-700" />
          </span>
          <span>Capture tips</span>
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-slate-600 transition-transform duration-200 group-hover:text-primary-700 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="mt-5 space-y-4 text-slate-700">
          <div className="rounded-xl p-4 border border-slate-200 bg-slate-50/60">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary-700" />
              Image quality
            </h4>
            <ul className="space-y-2">
              {['Use clear, well-lit photos', 'Ensure the leaf/disease area is in focus', 'Avoid blurry or dark images', 'Take photos in natural daylight when possible'].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-700 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl p-4 border border-slate-200 bg-slate-50/60">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700">
                2
              </span>
              What to capture
            </h4>
            <ul className="space-y-2">
              {['Focus on the affected area of the plant', 'Include enough context (entire leaf or affected region)', 'Capture both sides of leaves if symptoms are visible', 'Avoid including too much background'].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-700 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl p-4 border border-slate-200 bg-slate-50/60">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700">
                3
              </span>
              Best practices
            </h4>
            <ul className="space-y-2">
              {['Take multiple photos from different angles', 'Include healthy parts for comparison if possible', 'Note the crop type and growth stage', 'Check predictions match visual symptoms'].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-700 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <TriangleAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                <span className="font-semibold">Reminder:</span> Predictions support field decisions—confirm with local agronomists or extension services before treatment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

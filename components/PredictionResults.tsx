'use client'

import { AlertTriangle, CheckCircle2 } from 'lucide-react'

interface Prediction {
  disease: string
  confidence: number
  is_healthy: boolean
  meets_threshold: boolean
  all_predictions: Array<{
    disease: string
    confidence: number
  }>
}

interface PredictionResultsProps {
  prediction: Prediction
  /** Shown when regional disease filter was applied */
  regionNote?: string
}

/** Model may send 0–1 or 0–100; UI always shows percent to one decimal. */
function toConfidencePercent(value: number): number {
  if (value > 0 && value <= 1) return value * 100
  return value
}

export default function PredictionResults({
  prediction,
  regionNote,
}: PredictionResultsProps) {
  const getStatusColor = () => {
    if (prediction.is_healthy) {
      return 'bg-emerald-50 text-emerald-900 border-emerald-200'
    }
    if (prediction.meets_threshold) {
      return 'bg-rose-50 text-rose-900 border-rose-200'
    }
    return 'bg-amber-50 text-amber-900 border-amber-200'
  }

  const getStatusText = () => {
    if (prediction.is_healthy) {
      return 'Healthy'
    }
    if (prediction.meets_threshold) {
      return 'Disease detected'
    }
    return 'Low confidence'
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Results
      </h2>
      {regionNote && (
        <p className="text-xs text-slate-600 mb-4 -mt-2 px-1 py-2 rounded-lg bg-sky-50 border border-sky-100">
          {regionNote}
        </p>
      )}

      {/* Main Result */}
      <div className="rounded-xl p-5 mb-6 border border-slate-200 bg-slate-50/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Top label
            </h3>
            <p className="text-2xl font-semibold text-slate-900 mt-1">
              {prediction.disease}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Confidence
            </h3>
            <p className="text-2xl font-semibold text-primary-700 mt-1 tabular-nums">
              {Math.min(100, Math.max(0, toConfidencePercent(prediction.confidence))).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-semibold text-sm ${getStatusColor()}`}
        >
          {prediction.is_healthy ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {getStatusText()}
        </div>
      </div>

      {/* All Predictions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Other labels
        </h3>
        <div className="space-y-3">
          {prediction.all_predictions.map((pred, index) => {
            const pctRaw = toConfidencePercent(pred.confidence)
            const pctClamped = Math.min(100, Math.max(0, pctRaw))
            const pctOneDecimal = pctClamped.toFixed(1)
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-4 flex items-center justify-between transition-all duration-200 border border-slate-200 hover:border-primary-300 hover:bg-slate-50/50"
              >
                <span className="text-slate-900 font-medium">{pred.disease}</span>
                <div className="flex items-center gap-5">
                  <div className="w-40 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pctOneDecimal}%` }}
                    />
                  </div>
                  <span className="text-slate-700 font-semibold w-16 text-right tabular-nums">
                    {pctOneDecimal}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

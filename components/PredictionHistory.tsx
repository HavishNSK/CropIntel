'use client'

import { useState, useEffect } from 'react'

interface PredictionRecord {
  id: string
  timestamp: string
  crop: string
  disease: string
  confidence: number
  imageUrl: string
}

interface PredictionHistoryProps {
  onSelectHistory: (record: PredictionRecord) => void
}

export default function PredictionHistory({ onSelectHistory }: PredictionHistoryProps) {
  const [history, setHistory] = useState<PredictionRecord[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load history from localStorage (only in browser)
    if (typeof window === 'undefined') return
    
    try {
      const saved = localStorage.getItem('cropintel_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Validate it's an array
        if (Array.isArray(parsed)) {
          setHistory(parsed)
        }
      }
    } catch (e) {
      console.error('Failed to load history:', e)
      // Clear corrupted data
      localStorage.removeItem('cropintel_history')
    }
  }, [])

  const clearHistory = () => {
    if (typeof window === 'undefined') return
    if (confirm('Are you sure you want to clear all prediction history?')) {
      localStorage.removeItem('cropintel_history')
      setHistory([])
    }
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Prediction History
          </h3>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-primary-600 hover:text-primary-700 font-semibold px-3 py-1 rounded-lg hover:bg-primary-50 transition-colors"
          >
            {isOpen ? 'Hide' : 'Show'}
          </button>
        </div>
        {isOpen && (
          <p className="text-gray-600 text-center py-4">No predictions yet. Your prediction history will appear here.</p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Prediction History ({history.length})
        </h3>
        <div className="flex gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-primary-600 hover:text-primary-700 font-semibold px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors"
          >
            {isOpen ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={clearHistory}
            className="text-red-600 hover:text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.map((record) => (
            <div
              key={record.id}
              onClick={() => onSelectHistory(record)}
              className="p-5 bg-white/80 rounded-xl border-2 border-gray-200 hover:border-primary-400 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={record.imageUrl}
                    alt="History"
                    className="w-20 h-20 object-cover rounded-xl border-2 border-gray-300 shadow-md"
                    style={{ display: 'block' }}
                    onError={(e) => {
                      console.error('Image failed to load:', record.imageUrl)
                    }}
                  />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-600 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{Math.round(record.confidence)}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 text-lg">{record.disease}</span>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-700 capitalize bg-gray-100 px-3 py-1 rounded-lg">
                      {record.crop}
                    </span>
                    <span className="text-sm font-bold text-primary-600">
                      {record.confidence.toFixed(1)}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function savePredictionToHistory(
  crop: string,
  disease: string,
  confidence: number,
  imageUrl: string
) {
  // Only run in browser
  if (typeof window === 'undefined') return

  try {
    const record: PredictionRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      crop,
      disease,
      confidence,
      imageUrl
    }

    const saved = localStorage.getItem('cropintel_history')
    let history: PredictionRecord[] = []
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Validate it's an array
        if (Array.isArray(parsed)) {
          history = parsed
        } else {
          // If corrupted, start fresh
          history = []
        }
      } catch (e) {
        console.error('Failed to parse history:', e)
        // Clear corrupted data and start fresh
        localStorage.removeItem('cropintel_history')
        history = []
      }
    }

    // Add new record at the beginning
    history.unshift(record)
    
    // Keep only last 50 records
    if (history.length > 50) {
      history = history.slice(0, 50)
    }

    localStorage.setItem('cropintel_history', JSON.stringify(history))
  } catch (e) {
    console.error('Failed to save prediction to history:', e)
  }
}

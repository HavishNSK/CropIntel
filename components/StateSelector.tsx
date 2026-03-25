'use client'

import { MapPinned } from 'lucide-react'
import { US_STATES } from '@/lib/stateDiseaseMap'

interface StateSelectorProps {
  selectedState: string
  onStateChange: (code: string) => void
}

export default function StateSelector({ selectedState, onStateChange }: StateSelectorProps) {
  return (
    <div>
      <label
        htmlFor="state-select"
        className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"
      >
        <MapPinned className="w-4 h-4 text-primary-700" />
        State
      </label>
      <select
        id="state-select"
        value={selectedState}
        onChange={(e) => onStateChange(e.target.value)}
        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-200/60 focus:border-primary-400 text-base font-semibold bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        {US_STATES.map(({ code, name }) => (
          <option key={code} value={code}>
            {name} ({code})
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-500 mt-1.5">
        Regional filter applies when we have a disease list for this crop and state; otherwise all labels are shown.
      </p>
    </div>
  )
}

'use client'

import { Leaf } from 'lucide-react'

interface CropSelectorProps {
  crops: string[]
  selectedCrop: string
  onCropChange: (crop: string) => void
}

export default function CropSelector({
  crops,
  selectedCrop,
  onCropChange,
}: CropSelectorProps) {
  return (
    <div>
      <label
        htmlFor="crop-select"
        className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"
      >
        <Leaf className="w-4 h-4 text-primary-700" />
        Crop
      </label>
      <select
        id="crop-select"
        value={selectedCrop}
        onChange={(e) => onCropChange(e.target.value)}
        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-200/60 focus:border-primary-400 text-base font-semibold bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      >
        {crops.map((crop) => (
          <option key={crop} value={crop}>
            {crop.charAt(0).toUpperCase() + crop.slice(1)}
          </option>
        ))}
      </select>
    </div>
  )
}

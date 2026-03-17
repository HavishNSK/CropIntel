'use client'

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
  const cropIcons: Record<string, string> = {
    corn: '🌽',
    rice: '🌾',
    soybean: '🫘',
    wheat: '🌾'
  }

  return (
    <div>
      <label
        htmlFor="crop-select"
        className="block text-base font-bold text-gray-800 mb-3 flex items-center gap-2"
      >
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Select Crop Type
      </label>
      <select
        id="crop-select"
        value={selectedCrop}
        onChange={(e) => onCropChange(e.target.value)}
        className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-lg font-semibold bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        {crops.map((crop) => (
          <option key={crop} value={crop}>
            {cropIcons[crop] || '🌱'} {crop.charAt(0).toUpperCase() + crop.slice(1)}
          </option>
        ))}
      </select>
    </div>
  )
}

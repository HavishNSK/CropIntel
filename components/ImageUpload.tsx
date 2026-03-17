'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
  selectedImage: File | null
  onImageSelect: (file: File | null) => void
  onClear: () => void
}

export default function ImageUpload({
  selectedImage,
  onImageSelect,
  onClear,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      onImageSelect(file)
    }
  }

  const imageUrl = selectedImage ? URL.createObjectURL(selectedImage) : null

  return (
    <div>
      {!imageUrl ? (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 bg-slate-50 ${
            dragActive
              ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg'
              : 'border-slate-300 hover:border-blue-400 hover:bg-white'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-12 w-12 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mb-2">
            Upload Crop Image
          </p>
          <p className="text-sm text-slate-600 mb-6">
            Drag and drop an image here, or click the button below
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-primary-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-primary-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            Choose File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative group bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-lg">
          <div className="relative w-full h-auto max-h-[500px] flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden">
            <img
              src={imageUrl}
              alt="Crop image preview"
              className="w-full h-auto max-h-[500px] object-contain rounded-lg"
              style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
              onError={(e) => {
                console.error('Image failed to load:', imageUrl)
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <button
            onClick={onClear}
            className="absolute top-6 right-6 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

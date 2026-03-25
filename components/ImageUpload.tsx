'use client'

import { useState, useRef } from 'react'
import { Image as ImageIcon, Upload, X } from 'lucide-react'

interface ImageUploadProps {
  selectedImage: File | null
  onImageSelect: (file: File | null) => void
  onClear: () => void
  /** Override default upload prompt (e.g. "Past photo") */
  title?: string
  hint?: string
}

export default function ImageUpload({
  selectedImage,
  onImageSelect,
  onClear,
  title = 'Upload a leaf photo',
  hint = 'Drag & drop, or choose a file.',
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
          className={`border border-dashed rounded-2xl p-10 text-center transition-all duration-200 bg-slate-50/60 ${
            dragActive
              ? 'border-primary-500 bg-white shadow-md'
              : 'border-slate-300 hover:border-slate-400 hover:bg-white'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mx-auto w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4">
            <ImageIcon className="w-6 h-6 text-primary-700" />
          </div>
          <p className="text-base font-semibold text-slate-900 mb-1">{title}</p>
          <p className="text-sm text-slate-600 mb-5">{hint}</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Choose file
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
        <div className="relative group bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="relative w-full h-auto max-h-[520px] flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
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
            className="absolute top-6 right-6 px-3 py-2 bg-white/90 hover:bg-white text-slate-900 rounded-xl transition-colors shadow-sm border border-slate-200 flex items-center gap-2 font-semibold text-sm"
          >
            <X className="w-4 h-4" />
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useLoadScript, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { MapPin } from 'lucide-react'
import type { OutbreakReport } from '@/lib/outbreakReport'

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = ['places']

interface GoogleMapProps {
  reports?: OutbreakReport[]
  onMapClick?: (lat: number, lng: number) => void
  center?: { lat: number; lng: number }
  zoom?: number
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
}

const defaultCenter = {
  lat: 39.8283, // Center of US
  lng: -98.5795,
}

const defaultZoom = 4

export default function GoogleMapComponent({
  reports = [],
  onMapClick,
  center = defaultCenter,
  zoom = defaultZoom,
}: GoogleMapProps) {
  const [selectedReport, setSelectedReport] = useState<OutbreakReport | null>(null)
  const [mapCenter, setMapCenter] = useState(center)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  })

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (!isLoaded && !loadError && apiKey) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true)
      }, 8000) // 8 second timeout
      return () => clearTimeout(timer)
    } else {
      setLoadingTimeout(false)
    }
  }, [isLoaded, loadError, apiKey])

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng && onMapClick) {
        onMapClick(e.latLng.lat(), e.latLng.lng())
      }
    },
    [onMapClick]
  )

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#ef4444'
      case 'medium':
        return '#f97316'
      case 'low':
        return '#eab308'
      default:
        return '#64748b'
    }
  }

  // Create marker icons - only create when map is loaded
  const createMarkerIcon = useCallback((color: string) => {
    if (!isLoaded || typeof google === 'undefined' || !google.maps) {
      return undefined
    }
    
    // Create a canvas-based circle icon - most reliable method
    const canvas = document.createElement('canvas')
    canvas.width = 24
    canvas.height = 24
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
    
    // Draw filled circle
    ctx.beginPath()
    ctx.arc(12, 12, 10, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
    
    // Draw white border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.stroke()
    
    const dataUrl = canvas.toDataURL()
    
    return {
      url: dataUrl,
      scaledSize: new google.maps.Size(24, 24),
      anchor: new google.maps.Point(12, 12),
    }
  }, [isLoaded])

  if (loadError || loadingTimeout) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl border-2 border-slate-200 min-h-[500px]">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-700 font-semibold mb-2 text-lg">Map Unavailable</p>
          <p className="text-slate-500 text-sm mb-1">
            {apiKey 
              ? 'Google Maps API key may be invalid or restricted'
              : 'Google Maps API key not configured'}
          </p>
          <p className="text-slate-400 text-xs mt-4">Outbreak reporting will work once the map loads</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-blue-50 rounded-xl border-2 border-blue-200 min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-semibold">Loading Google Maps...</p>
          {!apiKey && (
            <p className="text-blue-500 text-xs mt-2">No API key configured</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Hide Google Maps watermark and "For development purposes only" text */
          .gm-style-cc,
          .gm-style-cc div,
          .gm-style-cc a,
          a[href^="https://developers.google.com/maps"],
          .gm-bundled-control .gm-style-cc,
          div[title*="For development purposes only"],
          div[aria-label*="For development purposes only"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
          }
          /* Hide ALL POI icons - very aggressive */
          .gm-style img[src*="poi"],
          .gm-style img[src*="place"],
          .gm-style img[src*="marker"][src*="default"],
          .gm-style img[alt*="marker"],
          .gm-style img[alt*="POI"],
          .gm-style img[alt*="place"],
          img[src*="marker"][src*="default"],
          img[src*="place"],
          img[src*="poi"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            pointer-events: none !important;
          }
          /* Hide POI containers */
          .gm-style div[style*="poi"],
          .gm-style div[style*="place"],
          .gm-style div[style*="marker"][style*="default"],
          .gm-style-iw,
          .gm-style-iw-c,
          .gm-style-iw-d {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
        `
      }} />
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          clickableIcons: false, // Disable clickable POI icons
          restriction: {
            latLngBounds: {
              north: 49.38,
              south: 24.40,
              west: -125.0,
              east: -66.93,
            },
            strictBounds: false,
          },
          styles: [
            {
              featureType: 'poi',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi',
              elementType: 'geometry',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.business',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.attraction',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.place_of_worship',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.school',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.sports_complex',
              elementType: 'all',
              stylers: [{ visibility: 'off' }],
            },
          ],
        }}
      >
        {reports.map((report) => {
          const color = getSeverityColor(report.severity)
          
          // Create icon directly here to ensure it's created when map is ready
          if (!isLoaded || typeof google === 'undefined' || !google.maps) {
            return null
          }
          
          // Create canvas icon on the fly
          const canvas = document.createElement('canvas')
          canvas.width = 24
          canvas.height = 24
          const ctx = canvas.getContext('2d')
          if (!ctx) return null
          
          // Draw colored circle
          ctx.beginPath()
          ctx.arc(12, 12, 10, 0, 2 * Math.PI)
          ctx.fillStyle = color
          ctx.fill()
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 3
          ctx.stroke()
          
          const iconUrl = canvas.toDataURL()
          
          return (
            <Marker
              key={report.id}
              position={{ lat: report.lat, lng: report.lng }}
              icon={{
                url: iconUrl,
                scaledSize: new google.maps.Size(24, 24),
                anchor: new google.maps.Point(12, 12),
              }}
              clickable={true}
              cursor="pointer"
              title={`${report.crop} - ${report.disease} (${report.severity} severity)`}
              onClick={() => {
                setSelectedReport(report)
              }}
              animation={google.maps.Animation.DROP}
            />
          )
        })}

        {selectedReport && (
          <InfoWindow
            position={{ lat: selectedReport.lat, lng: selectedReport.lng }}
            onCloseClick={() => setSelectedReport(null)}
            options={{
              pixelOffset: new google.maps.Size(0, -10),
            }}
          >
            <div className="p-3 min-w-[250px] max-w-[300px]">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900">
                  {selectedReport.crop.charAt(0).toUpperCase() + selectedReport.crop.slice(1)} - {selectedReport.disease}
                </h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-3">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    selectedReport.severity === 'high'
                      ? 'bg-red-100 text-red-800 border-2 border-red-300'
                      : selectedReport.severity === 'medium'
                      ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                      : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                  }`}
                >
                  {selectedReport.severity.toUpperCase()} SEVERITY
                </span>
              </div>
              
              {selectedReport.description && (
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {selectedReport.description}
                </p>
              )}
              
              {selectedReport.reporterVerified !== undefined && (
                <div className="mb-3">
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${
                      selectedReport.reporterVerified
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {selectedReport.reporterVerified ? 'Verified farmer report' : 'Unverified farmer report'}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-2 mt-2">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold">Location:</span> {selectedReport.lat.toFixed(4)}, {selectedReport.lng.toFixed(4)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-semibold">Reported:</span> {new Date(selectedReport.date).toLocaleString()}
                </p>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Click instruction overlay */}
      <div className="absolute bottom-6 left-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-lg shadow-xl z-10 border border-blue-800">
        <p className="text-sm font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Click anywhere on the map to report an outbreak
        </p>
      </div>
    </div>
  )
}

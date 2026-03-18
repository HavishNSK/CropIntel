'use client'

import { useState, useEffect } from 'react'
import { Bell, X, AlertTriangle, MapPin, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  findAffectedFarmers,
  createNotifications,
  type OutbreakLocation,
  type FarmerLocation,
  type Notification,
} from '@/lib/notifications'

interface OutbreakReport {
  id: string
  lat: number
  lng: number
  crop: string
  disease: string
  severity: 'low' | 'medium' | 'high'
  date: string
  description: string
}

interface NotificationSystemProps {
  outbreaks: OutbreakReport[]
  currentFarmerLocation?: { lat: number; lng: number; crops: string[] }
}

export default function NotificationSystem({
  outbreaks,
  currentFarmerLocation,
}: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Simulate farmer locations across the US (in a real app, this would come from a database)
  const [farmers] = useState<FarmerLocation[]>([
    // Arkansas area farmers
    {
      id: 'farmer-1',
      name: 'John Smith',
      email: 'john@example.com',
      lat: 35.5, // Near Russellville, AR (~20 miles)
      lng: -93.2,
      crops: ['corn', 'wheat', 'soybean'],
      radius: 250,
    },
    {
      id: 'farmer-2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      lat: 35.1, // Within 250 miles of Russellville (~30 miles)
      lng: -92.8,
      crops: ['corn', 'rice'],
      radius: 250,
    },
    {
      id: 'farmer-3',
      name: 'Mike Davis',
      email: 'mike@example.com',
      lat: 36.0, // Within 250 miles of Russellville (~50 miles)
      lng: -93.5,
      crops: ['corn', 'wheat', 'soybean'],
      radius: 250,
    },
    {
      id: 'farmer-4',
      name: 'Arkansas Farm Co.',
      email: 'info@arkfarm.com',
      lat: 34.7, // Little Rock area - within 250 miles (~80 miles)
      lng: -92.3,
      crops: ['corn', 'soybean'],
      radius: 250,
    },
    // California farmers
    {
      id: 'farmer-5',
      name: 'Central Valley Farms',
      email: 'contact@cvfarms.com',
      lat: 36.5, // Near Fresno, CA
      lng: -119.5,
      crops: ['wheat', 'corn'],
      radius: 250,
    },
    {
      id: 'farmer-6',
      name: 'Golden State Agriculture',
      email: 'info@gsag.com',
      lat: 37.0, // Near Modesto, CA
      lng: -120.5,
      crops: ['wheat', 'corn', 'soybean'],
      radius: 250,
    },
    // Texas farmers
    {
      id: 'farmer-7',
      name: 'Lone Star Crops',
      email: 'hello@lonestarcrops.com',
      lat: 32.0, // Near Abilene, TX
      lng: -99.5,
      crops: ['corn', 'wheat'],
      radius: 250,
    },
    {
      id: 'farmer-8',
      name: 'Texas Grain Co.',
      email: 'info@texasgrain.com',
      lat: 31.5, // Near San Angelo, TX
      lng: -100.0,
      crops: ['corn', 'soybean'],
      radius: 250,
    },
    // Iowa farmers
    {
      id: 'farmer-9',
      name: 'Iowa Corn Growers',
      email: 'contact@iowacorn.com',
      lat: 41.5, // Near Des Moines, IA
      lng: -93.0,
      crops: ['corn', 'soybean'],
      radius: 250,
    },
    {
      id: 'farmer-10',
      name: 'Midwest Agriculture',
      email: 'info@midwestag.com',
      lat: 42.0, // Near Cedar Rapids, IA
      lng: -91.5,
      crops: ['corn', 'soybean', 'wheat'],
      radius: 250,
    },
    // Illinois farmers
    {
      id: 'farmer-11',
      name: 'Prairie Farms',
      email: 'hello@prairiefarms.com',
      lat: 40.0, // Near Champaign, IL
      lng: -88.5,
      crops: ['corn', 'soybean'],
      radius: 250,
    },
    // Kansas farmers
    {
      id: 'farmer-12',
      name: 'Kansas Wheat Growers',
      email: 'info@kswheat.com',
      lat: 38.5, // Near Wichita, KS
      lng: -98.0,
      crops: ['wheat', 'corn'],
      radius: 250,
    },
    {
      id: 'farmer-13',
      name: 'Sunflower State Farms',
      email: 'contact@sunflowerfarms.com',
      lat: 39.0, // Near Topeka, KS
      lng: -95.5,
      crops: ['wheat', 'corn', 'soybean'],
      radius: 250,
    },
    // Nebraska farmers
    {
      id: 'farmer-14',
      name: 'Cornhusker Agriculture',
      email: 'info@cornhuskerag.com',
      lat: 41.0, // Near Lincoln, NE
      lng: -96.5,
      crops: ['corn', 'soybean'],
      radius: 250,
    },
    // North Carolina farmers
    {
      id: 'farmer-15',
      name: 'Carolina Crops',
      email: 'hello@carolinacrops.com',
      lat: 35.5, // Near Charlotte, NC
      lng: -80.5,
      crops: ['corn', 'soybean'],
      radius: 250,
    },
    // Ohio farmers
    {
      id: 'farmer-16',
      name: 'Buckeye Farms',
      email: 'info@buckeyefarms.com',
      lat: 40.0, // Near Columbus, OH
      lng: -83.0,
      crops: ['corn', 'soybean', 'wheat'],
      radius: 250,
    },
    // Add current user if location is available
    ...(currentFarmerLocation
      ? [
          {
            id: 'current-user',
            name: 'You',
            lat: currentFarmerLocation.lat,
            lng: currentFarmerLocation.lng,
            crops: currentFarmerLocation.crops,
            radius: 250,
          } as FarmerLocation,
        ]
      : []),
  ])

  // Track if we've created the initial notification
  const [hasCreatedNotification, setHasCreatedNotification] = useState(false)

  // Create only ONE notification for the 130-mile high-severity outbreak
  useEffect(() => {
    if (hasCreatedNotification) return
    if (outbreaks.length === 0) return

    // Find the specific outbreak that's 130 miles away (high-severity-130-miles)
    const targetOutbreak = outbreaks.find((o) => o.id === 'high-severity-130-miles')
    
    if (!targetOutbreak) return

    // Convert OutbreakReport to OutbreakLocation format
    const outbreakLocation: OutbreakLocation = {
      id: targetOutbreak.id,
      lat: targetOutbreak.lat,
      lng: targetOutbreak.lng,
      crop: targetOutbreak.crop,
      disease: targetOutbreak.disease,
      severity: targetOutbreak.severity,
      date: targetOutbreak.date,
      description: targetOutbreak.description,
    }
    
    // Find affected farmers - should be farmer-1 (John Smith) at 130 miles
    const affectedFarmers = findAffectedFarmers(outbreakLocation, farmers)
    
    if (affectedFarmers.length > 0) {
      // Create notification for the closest farmer only
      const closestFarmer = affectedFarmers[0] // Already sorted by distance
      const notification: Notification = {
        id: `${outbreakLocation.id}-${closestFarmer.farmer.id}-${Date.now()}`,
        farmerId: closestFarmer.farmer.id,
        outbreakId: outbreakLocation.id,
        distance: closestFarmer.distance,
        message: `🔴 HIGH ALERT: ${outbreakLocation.disease} detected in ${outbreakLocation.crop} ${closestFarmer.distance.toFixed(1)} miles away`,
        severity: outbreakLocation.severity,
        read: false,
        createdAt: new Date().toISOString(),
      }

      setNotifications([notification])
      setUnreadCount(1)
      setHasCreatedNotification(true)
      
      // Show browser notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Crop Disease Alert', {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        })
      }
    }
  }, [outbreaks, farmers, hasCreatedNotification])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = (notificationId: string) => {
    const notification = notifications.find((n) => n.id === notificationId)
    if (notification && !notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const unreadNotifications = notifications.filter((n) => !n.read)

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white rounded-xl border-2 border-slate-200 hover:border-primary-400 shadow-sm hover:shadow-md transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-slate-700" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-16 right-0 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border-2 border-slate-200 z-50 max-h-[600px] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-700" />
                Disease Alerts
                {unreadCount > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-700 hover:text-primary-800 font-semibold px-2 py-1 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1 p-2">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-semibold">No alerts yet</p>
                  <p className="text-sm mt-1">
                    You&apos;ll be notified when outbreaks occur within 250 miles
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    const outbreak = outbreaks.find((o) => o.id === notification.outbreakId) as OutbreakReport | undefined
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          notification.read
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-red-50 border-red-200 shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle
                                className={`w-5 h-5 ${
                                  notification.severity === 'high'
                                    ? 'text-red-600'
                                    : notification.severity === 'medium'
                                    ? 'text-orange-600'
                                    : 'text-yellow-600'
                                }`}
                              />
                              <p className="font-bold text-slate-900 text-sm">
                                {notification.message}
                              </p>
                            </div>
                            {outbreak && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs text-slate-600 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {notification.distance.toFixed(1)} miles away
                                </p>
                                <p className="text-xs text-slate-500">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-start gap-1">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 hover:bg-white rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 hover:bg-white rounded-lg transition-colors"
                              title="Delete"
                            >
                              <X className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t-2 border-slate-200 bg-slate-50 rounded-b-2xl">
                <p className="text-xs text-slate-600 text-center">
                  Alerts for outbreaks within 250 miles of registered farms
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

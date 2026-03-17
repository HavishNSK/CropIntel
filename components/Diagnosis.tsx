'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, Lightbulb, Shield, Calendar, Droplet } from 'lucide-react'
import { getDiseaseInfo } from '@/lib/diseaseInfo'

interface DiagnosisProps {
  disease: string
  crop: string
  confidence: number
  isHealthy: boolean
}

export default function Diagnosis({ disease, crop, confidence, isHealthy }: DiagnosisProps) {
  const [activeTab, setActiveTab] = useState<'assessment' | 'treatment' | 'prevention'>('assessment')
  
  const diseaseInfo = getDiseaseInfo(disease, crop)

  if (isHealthy) {
    return (
      <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-300 p-8 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-extrabold text-green-900 mb-3">Diagnosis: Healthy Plant</h3>
            <p className="text-green-800 mb-4">
              Great news! Your {crop} plant appears to be healthy with no signs of disease detected.
            </p>
            <div className="bg-white/60 rounded-xl p-5 border border-green-200">
              <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Maintenance Recommendations
              </h4>
              <ul className="space-y-2 text-green-800">
                {diseaseInfo?.prevention.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getSeverityLevel = () => {
    if (diseaseInfo?.severity === 'high') return 'Critical'
    if (diseaseInfo?.severity === 'medium') return 'Moderate'
    return 'Mild'
  }

  const getSeverityColor = () => {
    if (diseaseInfo?.severity === 'high') return 'text-red-600 bg-red-100 border-red-300'
    if (diseaseInfo?.severity === 'medium') return 'text-orange-600 bg-orange-100 border-orange-300'
    return 'text-yellow-600 bg-yellow-100 border-yellow-300'
  }

  const getConfidenceLevel = () => {
    if (confidence >= 90) return { level: 'Very High', color: 'text-green-600' }
    if (confidence >= 75) return { level: 'High', color: 'text-blue-600' }
    if (confidence >= 60) return { level: 'Moderate', color: 'text-yellow-600' }
    return { level: 'Low', color: 'text-orange-600' }
  }

  const confidenceInfo = getConfidenceLevel()

  return (
    <div className="mt-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200/50 p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-primary-600" />
          Detailed Diagnosis
        </h3>
        <div className={`px-4 py-2 rounded-xl border-2 font-bold text-sm ${getSeverityColor()}`}>
          {getSeverityLevel()} Severity
        </div>
      </div>

      {/* Confidence & Assessment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600 uppercase">Confidence Level</span>
            <span className={`text-lg font-bold ${confidenceInfo.color}`}>
              {confidenceInfo.level}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                confidence >= 90 ? 'bg-green-500' :
                confidence >= 75 ? 'bg-blue-500' :
                confidence >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            AI confidence: {confidence.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-semibold text-gray-600 uppercase">Recommended Action</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {diseaseInfo?.severity === 'high' ? 'Immediate Treatment Required' :
             diseaseInfo?.severity === 'medium' ? 'Monitor & Treat Soon' :
             'Preventive Measures Recommended'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b-2 border-gray-200 mb-6">
        <div className="flex gap-2">
          {[
            { id: 'assessment', label: 'Assessment', icon: AlertCircle },
            { id: 'treatment', label: 'Treatment', icon: Droplet },
            { id: 'prevention', label: 'Prevention', icon: Shield }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`px-6 py-3 font-semibold rounded-t-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'assessment' && (
          <div className="space-y-6">
            <div className="bg-white/80 rounded-xl p-6 border-2 border-gray-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                Disease Assessment
              </h4>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {diseaseInfo?.description || `Based on the AI analysis, your ${crop} plant shows signs of ${disease}.`}
              </p>
              
              {diseaseInfo?.symptoms && diseaseInfo.symptoms.length > 0 && (
                <div className="mt-5">
                  <h5 className="font-bold text-gray-900 mb-3">Expected Symptoms:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {diseaseInfo.symptoms.map((symptom, index) => (
                      <div key={index} className="flex items-start gap-2 bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <span className="text-orange-600 mt-1">•</span>
                        <span className="text-sm text-gray-700">{symptom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Diagnostic Tip</p>
                    <p className="text-sm text-blue-800">
                      Compare the visual symptoms on your plant with the expected symptoms listed above. 
                      If symptoms match closely, the diagnosis is likely accurate. For confirmation, 
                      consider consulting with an agricultural extension service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'treatment' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Droplet className="w-6 h-6 text-blue-600" />
                Treatment Plan
              </h4>
              
              {diseaseInfo?.treatment && diseaseInfo.treatment.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-700 font-semibold mb-4">
                    Immediate treatment steps for {disease}:
                  </p>
                  <div className="space-y-3">
                    {diseaseInfo.treatment.map((step, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <p className="text-gray-800 flex-1">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-700">
                  Treatment recommendations are being prepared. Please consult with an agricultural expert 
                  for specific treatment options for {disease} in {crop}.
                </p>
              )}

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-yellow-900 mb-1">Important</p>
                    <p className="text-sm text-yellow-800">
                      Always follow label instructions when applying any treatments. Consider environmental 
                      impact and use Integrated Pest Management (IPM) practices. For severe cases, 
                      consult with certified agricultural professionals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prevention' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                Prevention Strategy
              </h4>
              
              {diseaseInfo?.prevention && diseaseInfo.prevention.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-gray-700 font-semibold mb-4">
                    Long-term prevention measures to protect your {crop} crops:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diseaseInfo.prevention.map((prevention, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-green-200 shadow-sm flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-800 text-sm">{prevention}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-700">
                  Prevention strategies are being developed. General best practices include crop rotation, 
                  proper spacing, and regular monitoring.
                </p>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-900 mb-1">Monitoring Schedule</p>
                    <p className="text-sm text-blue-800">
                      Regular monitoring is key to early detection. Check your {crop} fields weekly, 
                      especially during critical growth stages. Early intervention is more effective 
                      and cost-efficient than treating advanced disease.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Summary */}
      <div className="mt-6 p-5 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border-2 border-primary-200">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary-600" />
          Quick Action Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-700 mb-1">1. Immediate</p>
            <p className="text-gray-600">
              {diseaseInfo?.severity === 'high' 
                ? 'Apply treatment within 24-48 hours'
                : diseaseInfo?.severity === 'medium'
                ? 'Monitor closely and prepare treatment'
                : 'Implement preventive measures'}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">2. Short-term</p>
            <p className="text-gray-600">
              Follow treatment plan and monitor progress over next 7-14 days
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">3. Long-term</p>
            <p className="text-gray-600">
              Implement prevention strategies to avoid future occurrences
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

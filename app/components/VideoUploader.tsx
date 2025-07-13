'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { checkAuthStatus, refreshToken } from '../utils/auth'

interface UploadStatus {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  message?: string
}

export default function VideoUploader() {
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated, error } = await checkAuthStatus()
      setIsAuthenticated(isAuthenticated)
      setAuthError(error || null)
    }
    checkAuth()
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!isAuthenticated) {
      alert('Please sign in with Google first')
      return
    }

    setIsUploading(true)
    
    const videoFiles = acceptedFiles.filter(file => 
      file.type.startsWith('video/')
    )

    if (videoFiles.length === 0) {
      alert('Please select video files only')
      setIsUploading(false)
      return
    }

    // Initialize upload statuses
    const initialStatuses: UploadStatus[] = videoFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }))
    setUploadStatuses(initialStatuses)

    // Upload each file
    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i]
      await uploadFile(file, i)
    }

    setIsUploading(false)
  }, [isAuthenticated])

  const uploadFile = async (file: File, index: number) => {
    const formData = new FormData()
    formData.append('video', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (response.status === 401) {
        // Try to refresh token
        const refreshResult = await refreshToken()
        if (refreshResult.success) {
          // Retry upload with new token
          const retryResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include'
          })
          
          if (retryResponse.ok) {
            const result = await retryResponse.json()
            setUploadStatuses(prev => prev.map((status, i) => 
              i === index 
                ? { ...status, progress: 100, status: 'completed', message: 'Upload successful!' }
                : status
            ))
          } else {
            const error = await retryResponse.text()
            setUploadStatuses(prev => prev.map((status, i) => 
              i === index 
                ? { ...status, status: 'error', message: error }
                : status
            ))
          }
        } else {
          setUploadStatuses(prev => prev.map((status, i) => 
            i === index 
              ? { ...status, status: 'error', message: 'Authentication expired. Please sign in again.' }
              : status
          ))
          setIsAuthenticated(false)
        }
      } else if (response.ok) {
        const result = await response.json()
        setUploadStatuses(prev => prev.map((status, i) => 
          i === index 
            ? { ...status, progress: 100, status: 'completed', message: 'Upload successful!' }
            : status
        ))
      } else {
        const error = await response.text()
        setUploadStatuses(prev => prev.map((status, i) => 
          i === index 
            ? { ...status, status: 'error', message: error }
            : status
        ))
      }
    } catch (error) {
      setUploadStatuses(prev => prev.map((status, i) => 
        i === index 
          ? { ...status, status: 'error', message: 'Upload failed' }
          : status
      ))
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    },
    disabled: isUploading
  })

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="text-6xl">📹</div>
          <div>
            <p className="text-xl font-semibold text-gray-700">
              {isDragActive ? 'Drop your videos here' : 'Drag & drop videos here'}
            </p>
            <p className="text-gray-500 mt-2">
              or click to select video files
            </p>
          </div>
          <p className="text-sm text-gray-400">
            Supports: MP4, AVI, MOV, WMV, FLV, WebM, MKV
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadStatuses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Upload Progress</h3>
          {uploadStatuses.map((status, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700 truncate">
                  {status.file.name}
                </span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  status.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : status.status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {status.status}
                </span>
              </div>
              
              {status.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${status.progress}%` }}
                  ></div>
                </div>
              )}
              
              {status.message && (
                <p className={`text-sm mt-2 ${
                  status.status === 'completed' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {status.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
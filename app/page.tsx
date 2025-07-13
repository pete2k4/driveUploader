'use client'

import { useState, useEffect } from 'react'
import VideoUploader from './components/VideoUploader'
import { checkAuthStatus } from './utils/auth'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [showAuthMessage, setShowAuthMessage] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated, error } = await checkAuthStatus()
      setIsAuthenticated(isAuthenticated)
      setAuthError(error || null)
    }
    checkAuth()
  }, [])

  const handleSignIn = () => {
    window.location.href = '/api/auth/google'
  }

  const handleSignOut = async () => {
    // Clear cookies by setting them to expire
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    setIsAuthenticated(false)
    setAuthError(null)
  }

  // Show auth message if there's an error or success message in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const success = urlParams.get('success')
    
    if (error || success) {
      setShowAuthMessage(true)
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Google Drive Video Uploader
          </h1>
          <p className="text-lg text-gray-600">
            Upload your videos directly to Google Drive with ease
          </p>
        </div>

        {/* Authentication Status */}
        {isAuthenticated === null && (
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Checking authentication...</p>
          </div>
        )}

        {/* Auth Messages */}
        {showAuthMessage && (
          <div className="mb-8 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-yellow-800">
              {authError ? 'Authentication failed. Please try again.' : 'Successfully signed in!'}
            </p>
            <button
              onClick={() => setShowAuthMessage(false)}
              className="mt-2 text-yellow-600 hover:text-yellow-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Authentication Buttons */}
        {isAuthenticated === false && (
          <div className="text-center mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-600 mb-4">Please sign in with Google to upload videos</p>
              <button
                onClick={handleSignIn}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Sign in with Google
              </button>
            </div>
          </div>
        )}

        {isAuthenticated === true && (
          <div className="text-center mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm inline-block">
              <p className="text-green-600 mb-2">✓ Signed in with Google</p>
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
        
        <VideoUploader />
      </div>
    </main>
  )
} 
export async function checkAuthStatus(): Promise<{ isAuthenticated: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/status', {
      method: 'GET',
      credentials: 'include'
    })
    
    if (response.ok) {
      return { isAuthenticated: true }
    } else {
      return { isAuthenticated: false, error: 'Not authenticated' }
    }
  } catch (error) {
    return { isAuthenticated: false, error: 'Failed to check auth status' }
  }
}

export async function refreshToken(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    })
    
    if (response.ok) {
      return { success: true }
    } else {
      return { success: false, error: 'Failed to refresh token' }
    }
  } catch (error) {
    return { success: false, error: 'Failed to refresh token' }
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
)

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token available' }, { status: 401 })
  }

  try {
    oauth2Client.setCredentials({ refresh_token: refreshToken })
    const { credentials } = await oauth2Client.refreshAccessToken()
    
    const response = NextResponse.json({ success: true })
    
    response.cookies.set('access_token', credentials.access_token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    })

    return response
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 })
  }
} 
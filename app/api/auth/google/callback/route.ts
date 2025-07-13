import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    
    // Store tokens in cookies (in production, you might want to use a more secure method)
    const response = NextResponse.redirect(new URL('/?success=auth_success', request.url))
    
    response.cookies.set('access_token', tokens.access_token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    })

    if (tokens.refresh_token) {
      response.cookies.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      })
    }

    return response
  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url))
  }
} 
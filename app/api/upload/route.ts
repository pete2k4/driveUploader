import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { writeFile, unlink } from 'fs/promises'
import { createReadStream } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
)

// Helper function to get authenticated drive instance
async function getAuthenticatedDrive(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value
  
  if (!accessToken) {
    throw new Error('No access token available')
  }

  oauth2Client.setCredentials({ access_token: accessToken })
  return google.drive({ version: 'v3', auth: oauth2Client })
}

export async function POST(request: NextRequest) {
  let tempPath: string | null = null
  
  try {
    // Check authentication first
    const drive = await getAuthenticatedDrive(request)
    
    const formData = await request.formData()
    const file = formData.get('video') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a video' },
        { status: 400 }
      )
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    tempPath = join(tmpdir(), file.name)
    await writeFile(tempPath, buffer)

    // Upload to Google Drive
    const fileMetadata = {
      name: file.name,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    }

    const media = {
      mimeType: file.type,
      body: createReadStream(tempPath),
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,name,webViewLink',
    })

    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink,
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    // Handle authentication errors
    if (error instanceof Error && error.message === 'No access token available') {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in with Google.' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  } finally {
    // Clean up temp file
    if (tempPath) {
      try {
        await unlink(tempPath)
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError)
      }
    }
  }
} 
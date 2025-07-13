# Google Drive Video Uploader

A Next.js application that allows users to upload videos directly to Google Drive using OAuth2 authentication.

## Features

- OAuth2 authentication with Google
- Drag and drop video upload interface
- Support for multiple video formats (MP4, AVI, MOV, WMV, FLV, WebM, MKV)
- Real-time upload progress tracking
- Automatic token refresh
- Secure file handling

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click on it and press "Enable"

### 2. Create OAuth2 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`
5. Click "Create"
6. Note down your **Client ID** and **Client Secret**

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Google Drive Configuration
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

### 4. Get Google Drive Folder ID

1. Go to [Google Drive](https://drive.google.com)
2. Create a folder where you want to upload videos
3. Right-click on the folder and select "Share"
4. Copy the folder ID from the URL (it's the long string after `/folders/`)

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

1. Click "Sign in with Google" to authenticate
2. Grant the necessary permissions to access your Google Drive
3. Drag and drop video files or click to select them
4. Monitor the upload progress
5. Files will be uploaded to your specified Google Drive folder

## Security Notes

- Access tokens are stored in HTTP-only cookies
- Refresh tokens are used to automatically renew access
- All tokens are cleared when signing out
- The application only requests the minimum required scope (`drive.file`)

## Production Deployment

For production deployment:

1. Update the `GOOGLE_REDIRECT_URI` to your production domain
2. Add your production domain to the authorized redirect URIs in Google Cloud Console
3. Set `NODE_ENV=production` in your environment variables
4. Ensure HTTPS is enabled for secure cookie transmission

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**: Make sure the redirect URI in your Google Cloud Console matches exactly with your `GOOGLE_REDIRECT_URI` environment variable.

2. **"Access denied" error**: Ensure the Google Drive API is enabled in your Google Cloud Console project.

3. **Upload fails**: Check that your `GOOGLE_DRIVE_FOLDER_ID` is correct and the folder exists in your Google Drive.

4. **Authentication expires**: The application automatically refreshes tokens, but if it fails, users will need to sign in again.

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Google APIs (googleapis)
- Tailwind CSS
- React Dropzone 
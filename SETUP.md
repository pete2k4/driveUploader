# Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Google OAuth2 Configuration
# Get these from Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Redirect URI for OAuth2 callback
# For development: http://localhost:3000/api/auth/google/callback
# For production: https://yourdomain.com/api/auth/google/callback
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Google Drive Configuration
# Get this from the URL of your Google Drive folder (the long string after /folders/)
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
```

## Step-by-Step Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Navigate to "APIs & Services" > "Library"
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
6. Copy your **Client ID** and **Client Secret**

### 3. Get Google Drive Folder ID

1. Go to [Google Drive](https://drive.google.com)
2. Create a folder where you want to upload videos
3. Right-click on the folder and select "Share"
4. Copy the folder ID from the URL (it's the long string after `/folders/`)

### 4. Update Environment Variables

Replace the placeholder values in your `.env.local` file with your actual credentials.

### 5. Run the Application

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**: 
   - Make sure the redirect URI in your Google Cloud Console matches exactly with your `GOOGLE_REDIRECT_URI` environment variable
   - Check for trailing slashes or missing protocol (http/https)

2. **"Access denied" error**: 
   - Ensure the Google Drive API is enabled in your Google Cloud Console project
   - Verify your OAuth2 credentials are correct

3. **Upload fails**: 
   - Check that your `GOOGLE_DRIVE_FOLDER_ID` is correct
   - Ensure the folder exists in your Google Drive
   - Verify you have write permissions to the folder

4. **Authentication expires**: 
   - The application automatically refreshes tokens
   - If refresh fails, users will need to sign in again

### Security Best Practices

- Never commit your `.env.local` file to version control
- Use different OAuth2 credentials for development and production
- Regularly rotate your client secrets
- Monitor your Google Cloud Console for any suspicious activity 
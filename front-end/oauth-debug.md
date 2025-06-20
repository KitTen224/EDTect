# Google OAuth Debug Information

## Current Configuration
- **App URL**: http://localhost:3000
- **Client ID**: 708944338655-c9ko922jhgpfd3dl04o9jsqk6vttth54.apps.googleusercontent.com
- **Expected Redirect URI**: http://localhost:3000/api/auth/callback/google

## Steps to Fix in Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find OAuth 2.0 Client ID: `708944338655-c9ko922jhgpfd3dl04o9jsqk6vttth54.apps.googleusercontent.com`
3. Click "Edit" (pencil icon)
4. In "Authorized redirect URIs" section, add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Click "Save"

## Common Issues
- Make sure there are no extra spaces in the redirect URI
- Use `http://` (not `https://`) for localhost
- Use exact port number (3000)
- Path must be `/api/auth/callback/google`

## Test After Changes
1. Clear browser cache/cookies
2. Try signing in again
3. Check that redirect URI matches exactly
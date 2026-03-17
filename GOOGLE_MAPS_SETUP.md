# Google Maps API Setup Guide

## Overview
The outbreak reporting map now uses Google Maps API for a more accurate and interactive map experience.

## Getting Your Google Maps API Key

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "CropIntel")
4. Click "Create"

### Step 2: Enable Google Maps JavaScript API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Maps JavaScript API"
3. Click on it and press "Enable"

### Step 3: Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy your API key
4. **Important**: Click "Restrict Key" to secure it:
   - Under "Application restrictions", select **"Websites"**
   - Click "Add an item" and add your domains:
     - `http://localhost:3040/*` (for development on port 3040)
     - `http://localhost:*/*` (for all local ports - optional)
     - `https://yourdomain.com/*` (for production - replace with your domain)
   - Under "API restrictions", select "Restrict key"
   - Choose "Maps JavaScript API"
   - Click "Save"

## Configuration

### Step 4: Add API Key to Your Project
1. Create or edit `.env.local` in your project root:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

2. Replace `your_api_key_here` with your actual API key

### Step 5: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev -- -p 3040
```

## Features

✅ **Interactive Google Maps** - Full Google Maps functionality
✅ **Click to Report** - Click anywhere on the map to report outbreaks
✅ **Custom Markers** - Color-coded markers based on severity
✅ **Info Windows** - Click markers to see outbreak details
✅ **Zoom & Pan** - Full map navigation controls
✅ **Accurate Locations** - Real geographic coordinates

## Fallback Behavior

If no API key is configured:
- The map will show an error message
- You'll be prompted to add the API key
- The app will still function, but the map won't load

## Cost Information

Google Maps JavaScript API has a free tier:
- **$200 free credit per month**
- After free credit: ~$7 per 1,000 map loads
- For most development/testing: **FREE**

## Security Notes

⚠️ **Important**:
- Never commit your API key to git (`.env.local` is already in `.gitignore`)
- Always restrict your API key to specific domains
- Use different keys for development and production
- Monitor your API usage in Google Cloud Console

## Troubleshooting

### Map Not Loading?
1. Check that `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
2. Restart the dev server after adding the key
3. Verify the API key is not restricted incorrectly
4. Check browser console for specific error messages

### "This page can't load Google Maps correctly"?
- Your API key might not be restricted correctly
- Make sure `http://localhost:3040/*` is added under "Websites" restrictions
- Check that "Maps JavaScript API" is enabled
- Verify you're using `http://` (not `https://`) for localhost

### API Key Invalid?
- Verify you copied the full key (no spaces)
- Check that the API is enabled in Google Cloud Console
- Ensure billing is enabled (free tier still requires billing account)

## Need Help?

Check the [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)

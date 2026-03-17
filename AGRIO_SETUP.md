# Agrio API Integration Setup

## Overview
The CropIntel app now includes hyperlocal weather and disease risk alerts powered by the Agrio API.

## Features
- **Weather Dashboard**: Real-time temperature, humidity, and precipitation probability
- **Disease Risk Alerts**: Color-coded alerts (Red/Orange/Green) based on risk levels
- **IPM Advisories**: Integrated Pest Management recommendations
- **Prevention Steps**: Actionable prevention measures for each disease

## Setup Instructions

### 1. Get Your API Key
1. Visit: https://agrio-api-gateway-6it0wqn1.uc.gateway.dev
2. Sign up or log in to get your API key

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_AGRIO_API_KEY=your_actual_api_key_here
```

Or for Vite compatibility:
```bash
VITE_AGRIO_API_KEY=your_actual_api_key_here
```

### 3. Restart Development Server
After adding the API key, restart your Next.js server:
```bash
npm run dev
```

## API Endpoints Used

### Weather Service
- **Endpoint**: `/v1/weather`
- **Parameters**: `crop`, `lat`, `lng` (optional)
- **Returns**: Temperature, humidity, precipitation probability, GDD

### Alerts Service
- **Endpoint**: `/v1/alerts` (or integrated in weather response)
- **Returns**: Disease alerts with risk levels and IPM advisories

## Risk Level Colors
- 🔴 **Red (High Risk)**: Immediate action required
- 🟠 **Orange (Moderate Risk)**: Nearby detections, monitor closely
- 🟢 **Green (Low Risk)**: Clear, no immediate concerns

## Mock Data Mode
If no API key is configured, the app will use mock data for development/testing purposes. This allows you to see the UI and functionality without an API key.

## Troubleshooting

### API Key Not Working
- Ensure the key is prefixed with `NEXT_PUBLIC_` for Next.js
- Restart the dev server after adding the key
- Check browser console for API errors

### No Data Showing
- Check that the API key is correctly set in `.env.local`
- Verify the API endpoint is accessible
- Check network tab for failed requests

## Development Notes
- The API service includes fallback mock data for development
- All API calls are wrapped in try-catch for error handling
- Loading states and error messages are displayed to users

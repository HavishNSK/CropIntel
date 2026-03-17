# CropIntel - AI-Powered Crop Disease Classification

A modern web application for detecting crop diseases using deep learning.

## Features

- 🌾 Support for multiple crops (Corn, Soybean, Wheat, Rice)
- 🤖 AI-powered disease detection using EfficientNet
- 📱 Modern, responsive web interface built with Next.js
- ⚡ Fast inference using TensorFlow Lite
- 🎨 Beautiful UI with Tailwind CSS

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

## Installation

### 1. Install Python Dependencies

```bash
pip install -r ml/requirements.txt
```

### 2. Install Node.js Dependencies

```bash
npm install
```

## Running the Application

### Development Mode

1. Start the Next.js development server:

```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Mode

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## Training Models

Before using the web app, you need to train models for the crops you want to classify:

```bash
# Train a single crop model
python3 -m ml.training.train_crop --crop corn --epochs 40

# Train all crops
python3 -m ml.training.train_all_crops --epochs 40
```

## Project Structure

```
cropintel/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ImageUpload.tsx
│   ├── CropSelector.tsx
│   └── PredictionResults.tsx
├── ml/                    # Machine learning code
│   ├── training/          # Training scripts
│   ├── inference/         # Inference modules
│   └── utils/             # Utilities
├── scripts/               # Utility scripts
│   └── predict.py        # Python prediction script
└── package.json           # Node.js dependencies
```

## Usage

1. Upload a crop leaf image
2. Select the crop type (Corn, Soybean, Wheat, or Rice)
3. Click "Analyze Disease"
4. View the prediction results with confidence scores

## Technologies

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Python, Flask (via API route)
- **ML**: TensorFlow, EfficientNet, TensorFlow Lite
- **Image Processing**: PIL/Pillow

## License

MIT

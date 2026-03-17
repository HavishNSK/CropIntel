# CropIntel ML Pipeline

Machine learning pipeline for crop disease classification using TensorFlow Lite.

## Overview

This ML pipeline trains deep learning models to classify crop diseases from leaf images. Models are trained using transfer learning with EfficientNetB0 and exported to TensorFlow Lite format for efficient production inference.

## Structure

```
ml/
├── config.py              # Configuration and hyperparameters
├── training/              # Training scripts
│   ├── train_crop.py     # Train model for single crop
│   └── train_all_crops.py # Train models for all crops
├── inference/             # Inference modules
│   └── tflite_predictor.py # TFLite predictor for production
├── utils/                 # Utilities
│   ├── data_loader.py    # Dataset loading and preprocessing
│   ├── model_builder.py  # Model architecture
│   ├── evaluation.py     # Model evaluation metrics
│   └── tflite_converter.py # TFLite conversion
├── scripts/               # Utility scripts
│   └── download_datasets.py # Download datasets from Kaggle
├── data/                  # Dataset storage (gitignored)
└── models/                # Trained models (gitignored)
    └── {crop}/
        └── {version}/
            ├── model.tflite
            ├── metadata.json
            ├── label_map.json
            ├── metrics.json
            └── training_info.json
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up Kaggle API credentials:
   - Install Kaggle CLI: `pip install kaggle`
   - Download `kaggle.json` from your Kaggle account settings
   - Place it at `~/.kaggle/kaggle.json`
   - Accept dataset terms on Kaggle website

3. Download datasets:
```bash
python scripts/download_datasets.py
```

## Training

### Train a single crop model:
```bash
python training/train_crop.py --crop corn --epochs 50
```

### Train all crops:
```bash
python training/train_all_crops.py --epochs 50
```

### Options:
- `--crop`: Crop name (corn, soybean, wheat, rice)
- `--epochs`: Number of training epochs
- `--no-fine-tune`: Skip fine-tuning phase

## Model Architecture

- **Base Model**: EfficientNetB0 (pre-trained on ImageNet)
- **Transfer Learning**: Two-phase training
  1. Train classifier head with frozen base model
  2. Fine-tune top layers of base model
- **Output**: Multi-class classification (diseases + healthy)
- **Export Format**: TensorFlow Lite (optimized for mobile/edge)

## Inference

```python
from ml.inference.tflite_predictor import TFLitePredictor
from PIL import Image

# Initialize predictor
predictor = TFLitePredictor(crop="corn")

# Predict from image
image = Image.open("path/to/image.jpg")
result = predictor.predict(image)

print(f"Disease: {result['disease']}")
print(f"Confidence: {result['confidence']:.2%}")
print(f"Is Healthy: {result['is_healthy']}")
```

## Model Versioning

Models are versioned by timestamp: `v1_YYYYMMDD_HHMMSS`

Each version includes:
- `model.tflite`: TensorFlow Lite model
- `metadata.json`: Model metadata and class names
- `label_map.json`: Label to class name mapping
- `metrics.json`: Evaluation metrics
- `training_info.json`: Training configuration and results
- `confusion_matrix.png`: Confusion matrix visualization

## Evaluation Metrics

Models are evaluated on held-out test sets with:
- Accuracy
- Precision, Recall, F1-score (weighted and per-class)
- Confusion matrix
- Classification report

## Production Considerations

- **Confidence Threshold**: 0.7 (configurable in `config.py`)
- **Input Size**: 224x224x3 RGB images
- **Preprocessing**: Normalize to [0, 1] range
- **Quantization**: Float16 by default (can use int8 for smaller models)
- **Model Size**: ~5-15 MB per crop (depending on quantization)

## Supported Crops

- **Corn**: Common Rust, Gray Leaf Spot, Blight, Healthy
- **Soybean**: Multiple diseases including mosaic virus, blight, rust, etc.
- **Wheat**: Rusts, smut, blight, powdery mildew, pests, Healthy
- **Rice**: Blast, bacterial blight, brown spot, Healthy

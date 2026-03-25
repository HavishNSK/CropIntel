# CropIntel ML Pipeline

Machine learning pipeline for crop disease classification using TensorFlow Lite.

## Working without Kaggle (collaborators)

Training datasets are on Kaggle, but **you do not need Kaggle** to run the web app if someone shares trained weights.

1. Install inference deps from repo root: `pip install -r ml/requirements-inference.txt`
2. Download a zip of `ml/models/` (same layout as after training: `corn/<version>/…`, etc.):

```bash
export CROPINTEL_MODELS_URL='https://…/cropintel-models.zip'
python3 -m ml.scripts.fetch_models
```

3. Run Next.js; `/api/predict` will call `scripts/predict.py`.

**Docker:** see repo root `docker-compose.yml` and set `CROPINTEL_MODELS_URL` before `docker compose up`.

**Maintainers:** package your local `ml/models/` for release:

```bash
python3 -m ml.scripts.package_models -o cropintel-models.zip
```

---

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
│   ├── download_datasets.py # Download datasets from Kaggle
│   └── create_synthetic_dataset.py # Random images for pipeline smoke tests (no Kaggle)
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

**Why a fresh `git clone` does not show “paper” accuracy:** `ml/data/` and `ml/models/` are not in git. You need either Kaggle downloads + training, or the synthetic smoke-test path below.

### Option A — Real data (Kaggle)

1. Install dependencies (from repository root):
```bash
pip install -r ml/requirements.txt
```

2. Set up Kaggle API credentials:
   - Install Kaggle CLI: `pip install kaggle`
   - Download `kaggle.json` from your Kaggle account settings
   - Place it at `~/.kaggle/kaggle.json`
   - Accept dataset terms on Kaggle website

3. Download datasets:
```bash
python -m ml.scripts.download_datasets
```

### Option B — No Kaggle (pipeline smoke test only)

Random noise images are **not** diagnostically meaningful; they only prove training, evaluation, and TFLite export run on your machine.

```bash
pip install -r ml/requirements.txt
python -m ml.scripts.create_synthetic_dataset --crop corn --force
python -m ml.training.train_crop --crop corn --epochs 2 --no-fine-tune
```

Use `--crop all` on the synthetic script to populate every crop before `train_all_crops`.

### Option C — Docker (same commands inside a container)

From the repository root:

```bash
docker compose -f docker-compose.ml.yml build
docker compose -f docker-compose.ml.yml run --rm ml \
  python -m ml.scripts.create_synthetic_dataset --crop corn --force
docker compose -f docker-compose.ml.yml run --rm ml \
  python -m ml.training.train_crop --crop corn --epochs 2 --no-fine-tune
```

Download with Kaggle inside Docker (host must have `~/.kaggle/kaggle.json`):

```bash
docker compose -f docker-compose.ml.yml run --rm -v "$HOME/.kaggle:/root/.kaggle:ro" ml \
  python -m ml.scripts.download_datasets
```

### Optional: improve soybean healthy-class coverage

If soybean healthy predictions are weak, add extra healthy soybean images from:
- [Soybean Healthy and Diseased Images Dataset (Mendeley)](https://data.mendeley.com/datasets/w8vm4mm8t4/1)

Place extracted data in one of:
- `ml/data/soybean_mendeley/Healthy/`
- `ml/data/soybean_healthy/Healthy/`
- `ml/data/soybean_extra/Healthy/`

The loader auto-includes these healthy images during soybean training.

By default it also uses **`~/Soybean Healthy and Diseased Images Dataset/Soybean Healthy`** when that folder exists (same class label: **Healthy**). To point elsewhere:

```bash
export CROPINTEL_SOYBEAN_HEALTHY_DIRS="/path/to/Soybean Healthy:/path/to/more/healthy"
python -m ml.training.train_crop --crop soybean
```

(On macOS/Linux, separate multiple folders with `:` in that variable.)

## Training

### Train a single crop model:
```bash
python -m ml.training.train_crop --crop corn --epochs 50
```

### Train all crops:
```bash
python -m ml.training.train_all_crops --epochs 50
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

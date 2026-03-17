"""
Configuration for ML training and inference pipeline.
"""
import os
from pathlib import Path
from typing import Dict, List

# Base paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
TRAINING_DIR = BASE_DIR / "training"

# Create directories if they don't exist
DATA_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)
TRAINING_DIR.mkdir(exist_ok=True)

# Crop configurations
CROPS = {
    "corn": {
        "dataset_name": "smaranjitghose/corn-or-maize-leaf-disease-dataset",
        "diseases": [
            "Common Rust",
            "Gray Leaf Spot",
            "Blight",
            "Healthy"
        ],
        "image_size": (224, 224),
    },
    "soybean": {
        "dataset_name": "sivm205/soybean-diseased-leaf-dataset",
        "diseases": [
            "D Mossaic Virus",
            "Southern blight",
            "Sudden Death Syndrone",
            "Yellow Mosaic",
            "bacterial_blight",
            "ferrugen",
            "powdery_mildew",
            "D septoria",
            "Healthy"
        ],
        "image_size": (224, 224),
    },
    "wheat": {
        "dataset_name": "kushagra3204/wheat-plant-diseases",
        "diseases": [
            "Leaf Rust",
            "Stem Rust",
            "Stripe (Yellow) Rust",
            "Powdery Mildew",
            "Healthy"
        ],
        "image_size": (224, 224),
    },
    "rice": {
        "dataset_name": "anshulm257/rice-disease-dataset",
        "diseases": [
            "Rice Blast",
            "Bacterial Leaf Blight",
            "Brown Spot",
            "Healthy"
        ],
        "image_size": (224, 224),
    },
}

# Training hyperparameters
TRAINING_CONFIG = {
    "batch_size": 32,
    "epochs": 50,
    "learning_rate": 0.001,
    "validation_split": 0.2,
    "test_split": 0.1,
    "image_size": (224, 224),
    "num_channels": 3,
    "augmentation": True,
}

# Model architecture (using EfficientNetB0 for good accuracy/speed balance)
MODEL_CONFIG = {
    "base_model": "EfficientNetB0",
    "include_top": False,
    "weights": "imagenet",
    "input_shape": (224, 224, 3),
    "dropout_rate": 0.5,
    "dense_units": 512,
}

# TensorFlow Lite conversion settings
TFLITE_CONFIG = {
    "optimize": True,
    "quantization": "float16",  # Options: None, "float16", "int8"
    "representative_dataset_size": 100,
}

# Confidence threshold for production inference
CONFIDENCE_THRESHOLD = 0.7

# Model versioning
MODEL_VERSION_FORMAT = "v{version}_{timestamp}"

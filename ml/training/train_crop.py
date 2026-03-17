"""
Training script for individual crop disease classification models.
"""
import argparse
import os
from pathlib import Path
from datetime import datetime
import json
import numpy as np
import tensorflow as tf
from sklearn.utils.class_weight import compute_class_weight
from tensorflow.keras.callbacks import (
    ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, CSVLogger
)

from ml.config import (
    MODELS_DIR, TRAINING_CONFIG, MODEL_VERSION_FORMAT, CROPS
)
from ml.utils.data_loader import CropDatasetLoader
from ml.utils.model_builder import build_model, unfreeze_model, efficientnet_preprocess
from ml.utils.evaluation import evaluate_model
from ml.utils.tflite_converter import convert_to_tflite


def train_crop_model(crop: str, epochs: int = None, fine_tune: bool = True):
    """
    Train a disease classification model for a specific crop.
    
    Args:
        crop: Crop name (corn, soybean, wheat, rice)
        epochs: Number of training epochs (defaults to config)
        fine_tune: Whether to fine-tune base model layers
    """
    if crop not in CROPS:
        raise ValueError(f"Unknown crop: {crop}")
    
    print(f"\n{'='*60}")
    print(f"Training {crop.upper()} Disease Classification Model")
    print(f"{'='*60}\n")
    
    # Create version
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    version = f"v1_{timestamp}"
    model_dir = MODELS_DIR / crop / version
    model_dir.mkdir(parents=True, exist_ok=True)
    
    # Load dataset
    print("Loading dataset...")
    loader = CropDatasetLoader(crop)
    images, labels, class_names = loader.load_dataset()
    
    # Create data generators
    print("Creating data generators...")
    train_gen, val_gen, y_train = loader.create_data_generators(images, labels)
    
    # Calculate class weights to handle imbalance (using training set)
    # Using 'balanced' but capping extreme weights to prevent instability
    train_class_weights = compute_class_weight(
        'balanced',
        classes=np.unique(y_train),
        y=y_train
    )
    # Cap weights at 2.0 to prevent extreme weighting that causes instability
    train_class_weights = np.clip(train_class_weights, 0.5, 2.0)
    train_class_weight_dict = {i: weight for i, weight in enumerate(train_class_weights)}
    print(f"\nClass weights for training (capped at 2.0): {dict(zip(class_names, train_class_weights))}")
    
    # Build model
    print("Building model...")
    model = build_model(num_classes=len(class_names), crop=crop)
    
    # Callbacks - using .keras format for better custom function handling
    checkpoint_path = model_dir / "checkpoint.keras"
    callbacks = [
        ModelCheckpoint(
            checkpoint_path,
            monitor='val_accuracy',
            save_best_only=True,
            save_weights_only=False,
            verbose=1
        ),
        EarlyStopping(
            monitor='val_accuracy',
            patience=15,  # Increased patience to allow model more time to learn
            restore_best_weights=True,
            verbose=1,
            min_delta=0.001  # Minimum change to qualify as improvement
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        ),
        CSVLogger(model_dir / "training_log.csv")
    ]
    
    # Initial training (frozen base model)
    print("\nPhase 1: Training with frozen base model...")
    epochs_phase1 = (epochs or TRAINING_CONFIG["epochs"]) // 2
    
    history1 = model.fit(
        train_gen,
        epochs=epochs_phase1,
        validation_data=val_gen,
        callbacks=callbacks,
        class_weight=train_class_weight_dict,
        verbose=1
    )
    
    # Fine-tuning (unfreeze top layers)
    if fine_tune:
        print("\nPhase 2: Fine-tuning top layers...")
        model = unfreeze_model(model, fine_tune_at=100)
        
        epochs_phase2 = (epochs or TRAINING_CONFIG["epochs"]) - epochs_phase1
        
        history2 = model.fit(
            train_gen,
            epochs=epochs_phase2,
            validation_data=val_gen,
            callbacks=callbacks,
            class_weight=train_class_weight_dict,
            verbose=1
        )
    
    # Load best model with custom objects for custom preprocessing function
    print("\nLoading best model checkpoint...")
    model = tf.keras.models.load_model(
        checkpoint_path,
        custom_objects={'efficientnet_preprocess': efficientnet_preprocess}
    )
    
    # Evaluate on test set
    print("\nEvaluating on test set...")
    X_test, y_test = loader.get_test_set()
    metrics = evaluate_model(model, X_test, y_test, class_names, crop, version)
    
    print(f"\nTest Accuracy: {metrics['accuracy']:.4f}")
    print(f"Test Precision: {metrics['precision']:.4f}")
    print(f"Test Recall: {metrics['recall']:.4f}")
    print(f"Test F1 Score: {metrics['f1_score']:.4f}")
    
    # Convert to TensorFlow Lite
    print("\nConverting to TensorFlow Lite...")
    # Use a sample of test data as representative dataset
    representative_data = X_test[:TRAINING_CONFIG["batch_size"]]
    tflite_path = convert_to_tflite(
        model, crop, version, class_names, representative_data
    )
    
    # Save label mapping
    label_map = {i: name for i, name in enumerate(class_names)}
    with open(model_dir / "label_map.json", "w") as f:
        json.dump(label_map, f, indent=2)
    
    # Save training config
    training_info = {
        "crop": crop,
        "version": version,
        "timestamp": timestamp,
        "epochs": epochs or TRAINING_CONFIG["epochs"],
        "batch_size": TRAINING_CONFIG["batch_size"],
        "image_size": list(TRAINING_CONFIG["image_size"]),
        "num_classes": len(class_names),
        "class_names": class_names,
        "model_architecture": MODEL_CONFIG["base_model"],
        "fine_tuned": fine_tune,
        "metrics": metrics
    }
    
    with open(model_dir / "training_info.json", "w") as f:
        json.dump(training_info, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Training complete! Model saved to: {model_dir}")
    print(f"{'='*60}\n")
    
    return model_dir


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train crop disease classification model")
    parser.add_argument("--crop", type=str, required=True, choices=list(CROPS.keys()),
                       help="Crop to train model for")
    parser.add_argument("--epochs", type=int, default=None,
                       help="Number of training epochs")
    parser.add_argument("--no-fine-tune", action="store_true",
                       help="Skip fine-tuning phase")
    
    args = parser.parse_args()
    
    train_crop_model(
        crop=args.crop,
        epochs=args.epochs,
        fine_tune=not args.no_fine_tune
    )

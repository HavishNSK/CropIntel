"""
Model building utilities for crop disease classification.
"""
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, applications
from tensorflow.keras.applications.efficientnet import preprocess_input as efficientnet_preprocess_input
from typing import Optional

from ml.config import MODEL_CONFIG, CROPS


def efficientnet_preprocess(x):
    """
    Preprocessing function for EfficientNet.
    Uses official EfficientNet preprocessing: expects [0, 255] range, outputs [-1, 1].
    Data should already be in [0, 255] range from data loader.
    """
    # Use official EfficientNet preprocessing (expects [0, 255], outputs [-1, 1])
    return efficientnet_preprocess_input(x)


def build_model(num_classes: int, crop: str, *, from_scratch: bool = False) -> keras.Model:
    """
    Build a transfer learning model for crop disease classification.
    
    Uses EfficientNetB0 as base model for good accuracy/speed balance.
    EfficientNet provides state-of-the-art accuracy with efficient inference.
    
    Args:
        num_classes: Number of disease classes (including healthy)
        crop: Crop name for logging
        from_scratch: If True, ImageNet weights are not loaded; the full EfficientNet
            is trainable from random initialization (accuracy starts low, training is slower).
        
    Returns:
        Compiled Keras model
    """
    config = MODEL_CONFIG

    weights: Optional[str] = None if from_scratch else config["weights"]

    # Load base model (EfficientNetB0)
    base_model = getattr(applications, config["base_model"])(
        include_top=config["include_top"],
        weights=weights,
        input_shape=config["input_shape"]
    )

    if from_scratch or weights is None:
        # Random backbone: must train all layers; forward must follow global training mode
        # so batch norm / dropout behave correctly.
        base_model.trainable = True
    else:
        # Freeze base model initially (will unfreeze later in fine-tuning)
        base_model.trainable = False
    
    # Build model
    inputs = keras.Input(shape=config["input_shape"])
    
    # Preprocessing: Convert from [0, 1] to EfficientNet's expected [-1, 1] range
    # Using registered function so it can be serialized/deserialized properly
    x = layers.Lambda(efficientnet_preprocess, name="efficientnet_preprocess")(inputs)
    
    # Base model: frozen pretrained stacks use inference BN; trainable backbone follows fit/predict mode.
    if base_model.trainable:
        x = base_model(x)
    else:
        x = base_model(x, training=False)
    
    # Global average pooling
    x = layers.GlobalAveragePooling2D()(x)
    
    # Dense layers with L2 regularization (removed BN after GAP to avoid issues with frozen base)
    x = layers.Dense(
        config["dense_units"], 
        activation='relu',
        kernel_regularizer=keras.regularizers.l2(0.0001)  # Reduced L2 regularization
    )(x)
    x = layers.BatchNormalization()(x)  # BN after dense layer
    x = layers.Dropout(config["dropout_rate"])(x)
    
    # Output layer
    outputs = layers.Dense(num_classes, activation='softmax')(x)
    
    model = keras.Model(inputs, outputs, name=f"{crop}_disease_classifier")
    
    # Phase 1 (frozen backbone): moderate LR for classifier head convergence.
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.0001),
        loss=keras.losses.CategoricalCrossentropy(label_smoothing=0.05),
        metrics=['accuracy']
    )
    
    return model


def unfreeze_model(model: keras.Model, fine_tune_at: int = 100):
    """
    Unfreeze top layers of base model for fine-tuning.
    
    Args:
        model: Keras model
        fine_tune_at: Number of layers from top to unfreeze
    """
    base_model = model.layers[2]  # EfficientNet base model
    
    # Unfreeze top layers
    base_model.trainable = True
    for layer in base_model.layers[:-fine_tune_at]:
        layer.trainable = False
    
    # Phase 2 (unfrozen top layers): lower LR to avoid destroying pretrained features.
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.00001),
        loss=keras.losses.CategoricalCrossentropy(label_smoothing=0.05),
        metrics=['accuracy']
    )
    
    return model

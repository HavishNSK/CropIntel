"""
TensorFlow Lite model conversion utilities.
"""
import tensorflow as tf
import numpy as np
from pathlib import Path
from typing import Optional, List
import json

from ml.config import MODELS_DIR, TFLITE_CONFIG, TRAINING_CONFIG


def convert_to_tflite(
    model: tf.keras.Model,
    crop: str,
    version: str,
    class_names: List[str],
    representative_data: Optional[np.ndarray] = None
) -> Path:
    """
    Convert Keras model to TensorFlow Lite format.
    
    Args:
        model: Trained Keras model
        crop: Crop name
        version: Model version
        class_names: List of class names
        representative_data: Optional representative dataset for quantization
        
    Returns:
        Path to saved .tflite file
    """
    model_dir = MODELS_DIR / crop / version
    model_dir.mkdir(parents=True, exist_ok=True)
    
    tflite_path = model_dir / "model.tflite"
    
    # Configure converter
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Apply optimizations
    if TFLITE_CONFIG["optimize"]:
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
    
    # Apply quantization if specified
    if TFLITE_CONFIG["quantization"] == "float16":
        converter.target_spec.supported_types = [tf.float16]
    elif TFLITE_CONFIG["quantization"] == "int8":
        if representative_data is None:
            raise ValueError("Representative data required for int8 quantization")
        
        def representative_dataset_gen():
            """Generator for representative dataset."""
            num_samples = min(
                TFLITE_CONFIG["representative_dataset_size"],
                len(representative_data)
            )
            for i in range(num_samples):
                yield [representative_data[i:i+1]]
        
        converter.representative_dataset = representative_dataset_gen
        converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
        converter.inference_input_type = tf.uint8
        converter.inference_output_type = tf.uint8
    
    # Convert model
    tflite_model = converter.convert()
    
    # Save model
    with open(tflite_path, 'wb') as f:
        f.write(tflite_model)
    
    # Save metadata
    metadata = {
        "crop": crop,
        "version": version,
        "class_names": class_names,
        "input_shape": list(model.input_shape[1:]),
        "num_classes": len(class_names),
        "quantization": TFLITE_CONFIG["quantization"],
        "optimizations": TFLITE_CONFIG["optimize"]
    }
    
    metadata_path = model_dir / "metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    # Calculate model size
    model_size_mb = len(tflite_model) / (1024 * 1024)
    print(f"TensorFlow Lite model saved: {tflite_path}")
    print(f"Model size: {model_size_mb:.2f} MB")
    
    return tflite_path


def load_tflite_model(tflite_path: Path):
    """
    Load TensorFlow Lite model for inference.
    
    Args:
        tflite_path: Path to .tflite file
        
    Returns:
        Interpreter object
    """
    interpreter = tf.lite.Interpreter(model_path=str(tflite_path))
    interpreter.allocate_tensors()
    return interpreter


def predict_tflite(
    interpreter: tf.lite.Interpreter,
    image: np.ndarray
) -> tuple:
    """
    Run inference using TensorFlow Lite model.
    
    Args:
        interpreter: TFLite interpreter
        image: Preprocessed image array (normalized, resized)
        
    Returns:
        Tuple of (predictions, confidence_scores)
    """
    # Get input and output tensors
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    # Prepare input
    if len(image.shape) == 3:
        image = np.expand_dims(image, axis=0)
    
    # Set input tensor
    interpreter.set_tensor(input_details[0]['index'], image.astype(input_details[0]['dtype']))
    
    # Run inference
    interpreter.invoke()
    
    # Get output
    output_data = interpreter.get_tensor(output_details[0]['index'])
    
    # Get predictions
    predictions = np.argmax(output_data, axis=1)[0]
    confidence = float(np.max(output_data))
    
    return predictions, confidence, output_data[0]

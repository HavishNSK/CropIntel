"""
Example usage of the CropIntel ML pipeline.

This script demonstrates how to:
1. Train a model
2. Use the trained model for inference
"""
from pathlib import Path
from PIL import Image
from ml.inference.tflite_predictor import TFLitePredictor


def example_inference():
    """Example of using the trained model for inference."""
    print("Example: Using TFLite Predictor\n")
    
    # Initialize predictor for corn
    try:
        predictor = TFLitePredictor(crop="corn")
        print(f"Loaded model: {predictor.crop} v{predictor.version}")
        print(f"Classes: {predictor.class_names}\n")
        
        # Example: Predict from image path
        # image_path = Path("path/to/corn_leaf.jpg")
        # result = predictor.predict_from_path(image_path)
        
        # Example: Predict from PIL Image
        # image = Image.open("path/to/corn_leaf.jpg")
        # result = predictor.predict(image)
        
        # Print results
        # print(f"Disease: {result['disease']}")
        # print(f"Confidence: {result['confidence']:.2%}")
        # print(f"Is Healthy: {result['is_healthy']}")
        # print(f"Meets Threshold: {result['meets_threshold']}")
        # print("\nAll predictions:")
        # for pred in result['all_predictions'][:3]:
        #     print(f"  {pred['disease']}: {pred['confidence']:.2%}")
        
        print("Note: Uncomment the code above and provide an image path to run inference.")
        
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("\nPlease train a model first:")
        print("  python training/train_crop.py --crop corn")


if __name__ == "__main__":
    example_inference()

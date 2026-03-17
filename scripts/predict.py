#!/usr/bin/env python3
"""
Prediction script for CropIntel API.
Called by Next.js API route to make predictions.
"""
import sys
import json
from pathlib import Path

# Add parent directory to path to import ml module
sys.path.insert(0, str(Path(__file__).parent.parent))

from PIL import Image
from ml.inference.tflite_predictor import TFLitePredictor

def main():
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: predict.py <image_path> <crop>"}), file=sys.stderr)
        sys.exit(1)
    
    image_path = sys.argv[1]
    crop = sys.argv[2]
    
    try:
        # Load image
        image = Image.open(image_path)
        
        # Get predictor
        predictor = TFLitePredictor(crop=crop)
        
        # Make prediction
        result = predictor.predict(image)
        
        # Format response
        response = {
            "success": True,
            "crop": crop,
            "disease": result["disease"],
            "confidence": round(result["confidence"] * 100, 2),
            "is_healthy": result["is_healthy"],
            "meets_threshold": result["meets_threshold"],
            "all_predictions": [
                {
                    "disease": pred["disease"],
                    "confidence": round(pred["confidence"] * 100, 2)
                }
                for pred in result["all_predictions"]
            ]
        }
        
        print(json.dumps(response))
        
    except Exception as e:
        error_response = {
            "error": str(e)
        }
        print(json.dumps(error_response), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

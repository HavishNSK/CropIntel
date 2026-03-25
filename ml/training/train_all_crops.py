"""
Train models for all crops sequentially.
"""
import argparse
from ml.config import CROPS
from ml.training.train_crop import train_crop_model


def train_all_crops(
    epochs: int = None,
    fine_tune: bool = True,
    from_scratch: bool = False,
):
    """
    Train models for all crops.
    
    Args:
        epochs: Number of training epochs per crop
        fine_tune: Whether to run second-phase lower LR training
        from_scratch: If True, random EfficientNet init (no ImageNet) for every crop
    """
    crops = list(CROPS.keys())
    
    print(f"\n{'='*60}")
    print(f"Training models for {len(crops)} crops: {', '.join(crops)}")
    print(f"{'='*60}\n")
    
    results = {}
    
    for crop in crops:
        try:
            model_dir = train_crop_model(
                crop,
                epochs=epochs,
                fine_tune=fine_tune,
                from_scratch=from_scratch,
            )
            results[crop] = {"status": "success", "model_dir": str(model_dir)}
        except Exception as e:
            print(f"\nError training {crop}: {e}\n")
            results[crop] = {"status": "error", "error": str(e)}
    
    # Summary
    print(f"\n{'='*60}")
    print("Training Summary")
    print(f"{'='*60}")
    for crop, result in results.items():
        status = "✓" if result["status"] == "success" else "✗"
        print(f"{status} {crop}: {result['status']}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train models for all crops")
    parser.add_argument("--epochs", type=int, default=None,
                       help="Number of training epochs per crop")
    parser.add_argument("--no-fine-tune", action="store_true",
                       help="Skip fine-tuning phase")
    parser.add_argument(
        "--from-scratch",
        action="store_true",
        help="Train each crop from random EfficientNet init (no ImageNet weights)",
    )

    args = parser.parse_args()

    train_all_crops(
        epochs=args.epochs,
        fine_tune=not args.no_fine_tune,
        from_scratch=args.from_scratch,
    )

"""
Create tiny random JPEG datasets under ml/data/<crop>/ so the training pipeline
runs without Kaggle. Metrics will not match real leaf data — use this to verify
installs, Docker, and end-to-end train → evaluate → TFLite export.

Example:
  python -m ml.scripts.create_synthetic_dataset --crop corn --force
  python -m ml.training.train_crop --crop corn --epochs 2 --no-fine-tune
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image

from ml.config import CROPS, DATA_DIR


def _image_extensions() -> tuple[str, ...]:
    return (".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG")


def _clear_class_folder(folder: Path) -> None:
    if not folder.is_dir():
        return
    for p in folder.iterdir():
        if p.is_file() and p.suffix in _image_extensions():
            p.unlink()


def write_synthetic_crop(
    crop: str,
    images_per_class: int,
    seed: int,
    force: bool,
    image_size: tuple[int, int],
) -> None:
    if crop not in CROPS:
        raise ValueError(f"Unknown crop: {crop}")
    cfg = CROPS[crop]
    root = DATA_DIR / crop
    root.mkdir(parents=True, exist_ok=True)

    rng = np.random.default_rng(seed)
    diseases = cfg["diseases"]

    for disease in diseases:
        folder = root / disease
        folder.mkdir(parents=True, exist_ok=True)
        existing = sum(1 for p in folder.iterdir() if p.suffix in _image_extensions())
        if existing > 0 and not force:
            raise SystemExit(
                f"Refusing to write into non-empty {folder} ({existing} images). "
                "Use --force to remove existing *.jpg/*.jpeg/*.png in each class folder."
            )
        if force:
            _clear_class_folder(folder)
        for i in range(images_per_class):
            h, w = image_size
            rgb = rng.integers(0, 256, size=(h, w, 3), dtype=np.uint8)
            Image.fromarray(rgb, mode="RGB").save(
                folder / f"synthetic_{i:04d}.jpg", quality=90
            )
        print(f"Wrote {images_per_class} images → {folder}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Create random RGB image folders for pipeline smoke tests (not real accuracy)."
    )
    parser.add_argument(
        "--crop",
        choices=list(CROPS.keys()) + ["all"],
        default="all",
        help="Crop to populate (default: all)",
    )
    parser.add_argument(
        "--images-per-class",
        type=int,
        default=48,
        help="Images per disease folder (default 48; enough for stratified splits)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="RNG seed for reproducible noise images",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Delete existing JPEG/PNG in each class folder before writing",
    )
    args = parser.parse_args()

    crops = list(CROPS.keys()) if args.crop == "all" else [args.crop]
    for crop in crops:
        size = tuple(CROPS[crop]["image_size"])
        write_synthetic_crop(
            crop=crop,
            images_per_class=args.images_per_class,
            seed=args.seed,
            force=args.force,
            image_size=size,
        )
    print("\nDone. Train with e.g.:")
    print("  python -m ml.training.train_crop --crop corn --epochs 2 --no-fine-tune")


if __name__ == "__main__":
    main()

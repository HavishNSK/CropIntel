#!/usr/bin/env python3
"""
Zip ml/models/ for sharing (GitHub Release, Drive, etc.).

  python -m ml.scripts.package_models -o ~/Desktop/cropintel-models.zip
"""
import argparse
import zipfile
from pathlib import Path

from ml.config import CROPS, MODELS_DIR


def main() -> None:
    parser = argparse.ArgumentParser(description="Zip trained models for release.")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("cropintel-models.zip"),
        help="Output .zip path",
    )
    args = parser.parse_args()

    if not MODELS_DIR.is_dir():
        raise SystemExit(f"No models directory: {MODELS_DIR}")

    missing = [c for c in CROPS if not (MODELS_DIR / c).is_dir()]
    if missing:
        print(f"Warning: no folder for crops: {missing}")

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.output, "w", zipfile.ZIP_DEFLATED) as zf:
        for crop_dir in MODELS_DIR.iterdir():
            if not crop_dir.is_dir() or crop_dir.name not in CROPS:
                continue
            for path in crop_dir.rglob("*"):
                if path.is_file():
                    zf.write(path, path.relative_to(MODELS_DIR))
    print(f"Wrote {args.output.resolve()}")


if __name__ == "__main__":
    main()

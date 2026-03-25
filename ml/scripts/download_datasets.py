"""
Download datasets from Kaggle.
Requires Kaggle API credentials (kaggle.json) in ~/.kaggle/

Primary: python -m ml.scripts.download_datasets
Extra images: python -m ml.scripts.download_datasets --supplemental --crop soybean [--dataset user/slug]
"""
import argparse
import subprocess
from pathlib import Path
from typing import Optional

from ml.config import DATA_DIR, CROPS


def download_dataset(dataset_name: str, dest_dir: Path):
    """Download a dataset from Kaggle into dest_dir (created if missing)."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {dataset_name} to {dest_dir}...")
    cmd = [
        "kaggle", "datasets", "download",
        "-d", dataset_name,
        "-p", str(dest_dir),
        "--unzip",
    ]
    try:
        subprocess.run(cmd, check=True)
        print(f"✓ Successfully downloaded {dataset_name}")
    except subprocess.CalledProcessError as e:
        print(f"✗ Error downloading {dataset_name}: {e}")
        print("Make sure you have:")
        print("1. Installed kaggle: pip install kaggle")
        print("2. Set up credentials: ~/.kaggle/kaggle.json")
        print("3. Accepted competition/dataset terms on Kaggle website")
        raise
    except FileNotFoundError:
        print("✗ Kaggle CLI not found. Install with: pip install kaggle")
        raise


def download_all_datasets():
    """Download all primary crop datasets."""
    print(f"Downloading datasets to {DATA_DIR}...\n")
    for crop, config in CROPS.items():
        try:
            download_dataset(config["dataset_name"], DATA_DIR / crop)
        except Exception as e:
            print(f"Failed to download {crop} dataset: {e}\n")
            continue
    print("\nDataset download complete!")


def download_supplemental(crop: str, dataset_name: Optional[str] = None):
    """Download extra images into ml/data/<crop>/supplemental/ (merged at train time if folder names match)."""
    if crop not in CROPS:
        raise ValueError(f"Unknown crop: {crop}")
    config = CROPS[crop]
    slug = dataset_name or config.get("supplemental_dataset_name")
    if not slug:
        raise ValueError(
            f"No supplemental dataset for {crop}. Pass --dataset user/slug or set "
            f"supplemental_dataset_name in ml/config.py for this crop."
        )
    dest = DATA_DIR / crop / "supplemental"
    download_dataset(slug, dest)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download Kaggle crop disease datasets")
    parser.add_argument(
        "--supplemental",
        action="store_true",
        help="Download supplemental dataset into ml/data/<crop>/supplemental/",
    )
    parser.add_argument(
        "--crop",
        type=str,
        choices=list(CROPS.keys()),
        help="Crop (required with --supplemental)",
    )
    parser.add_argument(
        "--dataset",
        type=str,
        default=None,
        help="Kaggle dataset slug user/name (overrides config supplemental_dataset_name)",
    )
    args = parser.parse_args()
    if args.supplemental:
        if not args.crop:
            parser.error("--crop is required with --supplemental")
        download_supplemental(args.crop, args.dataset)
    else:
        download_all_datasets()

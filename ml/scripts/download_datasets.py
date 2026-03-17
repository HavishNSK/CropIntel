"""
Download datasets from Kaggle.
Requires Kaggle API credentials (kaggle.json) in ~/.kaggle/
"""
import os
import subprocess
from pathlib import Path
from ml.config import DATA_DIR, CROPS


def download_dataset(dataset_name: str, crop: str):
    """
    Download a dataset from Kaggle.
    
    Args:
        dataset_name: Kaggle dataset name (e.g., "user/dataset-name")
        crop: Crop name for organizing data
    """
    crop_dir = DATA_DIR / crop
    crop_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Downloading {dataset_name} to {crop_dir}...")
    
    # Use Kaggle API to download
    cmd = [
        "kaggle", "datasets", "download",
        "-d", dataset_name,
        "-p", str(crop_dir),
        "--unzip"
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
    """Download all crop datasets."""
    print(f"Downloading datasets to {DATA_DIR}...\n")
    
    for crop, config in CROPS.items():
        try:
            download_dataset(config["dataset_name"], crop)
        except Exception as e:
            print(f"Failed to download {crop} dataset: {e}\n")
            continue
    
    print("\nDataset download complete!")


if __name__ == "__main__":
    download_all_datasets()

#!/usr/bin/env python3
"""
Download wheat dataset from Kaggle using kagglehub.
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    import kagglehub
except ImportError:
    print("Installing kagglehub...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "kagglehub"])
    import kagglehub

from ml.config import DATA_DIR

def download_wheat_dataset():
    """Download wheat plant diseases dataset from Kaggle."""
    print("Downloading wheat dataset from Kaggle...")
    
    # Download dataset
    path = kagglehub.dataset_download("kushagra3204/wheat-plant-diseases")
    
    print(f"Dataset downloaded to: {path}")
    
    # Move to our data directory structure
    wheat_dir = DATA_DIR / "wheat"
    wheat_dir.mkdir(parents=True, exist_ok=True)
    
    # Copy or move files
    import shutil
    if Path(path).exists():
        # If it's a zip file, extract it
        if str(path).endswith('.zip'):
            import zipfile
            with zipfile.ZipFile(path, 'r') as zip_ref:
                zip_ref.extractall(wheat_dir)
            print(f"Extracted dataset to: {wheat_dir}")
        else:
            # If it's a directory, copy contents
            for item in Path(path).iterdir():
                dest = wheat_dir / item.name
                if item.is_dir():
                    if dest.exists():
                        shutil.rmtree(dest)
                    shutil.copytree(item, dest)
                else:
                    shutil.copy2(item, dest)
            print(f"Copied dataset to: {wheat_dir}")
    
    print("✓ Wheat dataset download complete!")
    return wheat_dir

if __name__ == "__main__":
    try:
        download_wheat_dataset()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        print("\nMake sure you have:")
        print("1. Installed kagglehub: pip install kagglehub")
        print("2. Set up Kaggle API credentials")
        print("   - Go to https://www.kaggle.com/settings")
        print("   - Click 'Create New Token' to download kaggle.json")
        print("   - Place it at ~/.kaggle/kaggle.json")
        print("   - Set permissions: chmod 600 ~/.kaggle/kaggle.json")
        sys.exit(1)

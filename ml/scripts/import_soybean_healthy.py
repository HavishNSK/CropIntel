"""
Import a fixed number of validated soybean healthy images into ml/data/soybean_healthy/Healthy.

Uses shutil.move on the same volume to avoid duplicating large files when disk is tight.
Skips unreadable/corrupt images (common after partial zip extraction).

Example:
  python -m ml.scripts.import_soybean_healthy --limit 500 --delete-diseased-sibling --delete-source-after
"""
from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

from PIL import Image

from ml.config import DATA_DIR


def _image_paths(folder: Path) -> list[Path]:
    exts = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}
    return sorted(
        p for p in folder.iterdir() if p.is_file() and p.suffix in exts
    )


def _is_valid_image(path: Path) -> bool:
    try:
        with Image.open(path) as im:
            im.verify()
        with Image.open(path) as im:
            im.convert("RGB")
        return True
    except OSError:
        return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Import soybean healthy images for training")
    parser.add_argument(
        "--source",
        type=Path,
        default=Path.home()
        / "Soybean Healthy and Diseased Images Dataset"
        / "Soybean Healthy",
        help="Folder containing Mendeley 'Soybean Healthy' jpegs",
    )
    parser.add_argument(
        "--dest",
        type=Path,
        default=DATA_DIR / "soybean_healthy" / "Healthy",
        help="Drop-in folder read by CropDatasetLoader",
    )
    parser.add_argument("--limit", type=int, default=500, help="Max images to move")
    parser.add_argument(
        "--delete-diseased-sibling",
        action="store_true",
        help="Remove ../Soybean Diseased (frees disk; user asked to drop non-healthy)",
    )
    parser.add_argument(
        "--delete-source-after",
        action="store_true",
        help="After moving --limit images, delete remaining files in --source",
    )
    args = parser.parse_args()

    source: Path = args.source.expanduser()
    dest: Path = args.dest.expanduser()

    if args.delete_diseased_sibling:
        diseased = source.parent / "Soybean Diseased"
        if diseased.is_dir():
            print(f"Removing diseased folder: {diseased}")
            shutil.rmtree(diseased)

    if not source.is_dir():
        print(f"Source not found: {source}", file=sys.stderr)
        return 1

    dest.mkdir(parents=True, exist_ok=True)

    moved = 0
    skipped = 0
    for path in _image_paths(source):
        if moved >= args.limit:
            break
        if not _is_valid_image(path):
            print(f"Skip corrupt/unreadable: {path.name}")
            skipped += 1
            continue
        target = dest / path.name
        if target.exists():
            stem, suf = path.stem, path.suffix
            n = 1
            while target.exists():
                target = dest / f"{stem}_{n}{suf}"
                n += 1
        shutil.move(str(path), str(target))
        moved += 1

    print(f"Moved {moved} images to {dest} (skipped {skipped} corrupt).")

    if moved < args.limit:
        print(
            f"Warning: only {moved} valid images available (wanted {args.limit}).",
            file=sys.stderr,
        )

    if args.delete_source_after:
        for path in _image_paths(source):
            path.unlink(missing_ok=True)
        for extra in source.iterdir():
            if extra.is_file():
                extra.unlink(missing_ok=True)
        try:
            source.rmdir()
        except OSError:
            pass
        parent = source.parent
        if parent.is_dir() and not any(parent.iterdir()):
            parent.rmdir()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

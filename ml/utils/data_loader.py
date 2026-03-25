"""
Data loading and preprocessing utilities for crop disease datasets.
"""
import os
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Tuple, List, Dict, Optional
from PIL import Image
import tensorflow as tf
from sklearn.model_selection import train_test_split

from ml.config import (
    DATA_DIR,
    CROPS,
    TRAINING_CONFIG,
    SOYBEAN_EXTRA_HEALTHY_IMAGE_DIRS,
)


class CropDatasetLoader:
    """Loads and preprocesses crop disease datasets."""
    
    def __init__(self, crop: str):
        """
        Initialize dataset loader for a specific crop.
        
        Args:
            crop: Crop name (corn, soybean, wheat, rice)
        """
        if crop not in CROPS:
            raise ValueError(f"Unknown crop: {crop}. Available: {list(CROPS.keys())}")
        
        self.crop = crop
        self.config = CROPS[crop]
        self.data_dir = DATA_DIR / crop
        # Check if data is in a subdirectory (common with Kaggle downloads)
        if (self.data_dir / "data").exists():
            self.data_dir = self.data_dir / "data"
        # Check for rice-specific subdirectory
        elif crop == "rice" and (self.data_dir / "Rice_Leaf_AUG").exists():
            self.data_dir = self.data_dir / "Rice_Leaf_AUG"
        # Check for wheat-specific train/test/valid structure
        elif crop == "wheat" and (self.data_dir / "train").exists():
            self.data_dir = self.data_dir / "train"
        self.image_size = self.config["image_size"]
        self.diseases = self.config["diseases"]
    
    def _candidate_folder_names_for_disease(self, disease: str) -> List[str]:
        """Directory names to try under a data root for this config disease label."""
        possible_names = [
            disease,
            disease.lower(),
            disease.replace(" ", "_"),
            disease.replace(" ", "-"),
        ]
        if self.crop == "rice":
            if disease == "Rice Blast":
                possible_names.insert(0, "Leaf Blast")
            elif disease == "Healthy":
                possible_names.insert(0, "Healthy Rice Leaf")
        if self.crop == "soybean":
            if disease == "D Mossaic Virus":
                possible_names.insert(0, "Mossaic Virus")
            elif disease == "D septoria":
                possible_names.insert(0, "septoria")
            elif disease == "Healthy":
                possible_names.insert(0, "healthy")
                possible_names.insert(1, "Healthy Leaf")
                possible_names.insert(2, "crestamento")
        if self.crop == "wheat":
            if disease == "Leaf Rust":
                possible_names.insert(0, "Brown Rust")
            elif disease == "Stem Rust":
                possible_names.insert(0, "Black Rust")
            elif disease == "Stripe (Yellow) Rust":
                possible_names.insert(0, "Yellow Rust")
                possible_names.insert(1, "Stripe Rust")
            elif disease == "Powdery Mildew":
                possible_names.insert(0, "Mildew")
        return possible_names
    
    def _resolve_class_folder(self, root: Path, disease: str) -> Optional[Path]:
        if not root.is_dir():
            return None
        for name in self._candidate_folder_names_for_disease(disease):
            folder_path = root / name
            if folder_path.exists() and folder_path.is_dir():
                return folder_path
        return None
    
    def _append_images_from_folder(
        self,
        folder_path: Path,
        disease_label: str,
        images: list,
        labels: list,
        class_names: list,
    ) -> int:
        """Load all images from folder_path into parallel lists; returns count added."""
        image_files = self._get_image_files(folder_path)
        if not image_files:
            return 0
        print(f"Found {len(image_files)} images in {folder_path}")
        added = 0
        for img_path in image_files:
            try:
                img = Image.open(img_path).convert("RGB")
                img = img.resize(self.image_size)
                img_array = np.array(img, dtype=np.float32)
                images.append(img_array)
                labels.append(disease_label)
                class_names.append(disease_label)
                added += 1
            except Exception as e:
                print(f"Error loading {img_path}: {e}")
                continue
        return added
    
    def _get_image_files(self, folder_path: Path) -> List[Path]:
        """Collect image files from a folder recursively (case-insensitive extensions)."""
        return (
            list(folder_path.rglob("*.jpg")) + list(folder_path.rglob("*.JPG")) +
            list(folder_path.rglob("*.jpeg")) + list(folder_path.rglob("*.JPEG")) +
            list(folder_path.rglob("*.png")) + list(folder_path.rglob("*.PNG"))
        )
        
    def load_dataset(self) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """
        Load images and labels from the dataset directory.
        
        Returns:
            Tuple of (images, labels, class_names)
        """
        images = []
        labels = []
        class_names = []
        
        disease_folders: Dict[str, Path] = {}
        for disease in self.diseases:
            folder_path = self._resolve_class_folder(self.data_dir, disease)
            if folder_path is not None:
                disease_folders[disease] = folder_path
        
        if not disease_folders:
            raise ValueError(f"No disease folders found in {self.data_dir}")
        
        for disease, folder_path in disease_folders.items():
            n = self._append_images_from_folder(folder_path, disease, images, labels, class_names)
            if n == 0:
                print(f"Warning: No images loaded from {folder_path}")
        
        supplemental_root = DATA_DIR / self.crop / "supplemental"
        if supplemental_root.is_dir():
            sup_added = 0
            for disease in self.diseases:
                sup_folder = self._resolve_class_folder(supplemental_root, disease)
                if sup_folder is None:
                    continue
                n = self._append_images_from_folder(
                    sup_folder, disease, images, labels, class_names
                )
                sup_added += n
            if sup_added:
                print(
                    f"Merged {sup_added} supplemental images from {supplemental_root}"
                )
        
        # Optional: include extra healthy soybean images (Mendeley "Soybean Healthy", etc.).
        # Runs even when the Kaggle layout has no in-repo Healthy folder — those images
        # still map to label "Healthy".
        # Drop-in under ml/data:
        # - ml/data/soybean_mendeley/Healthy
        # - ml/data/soybean_healthy/Healthy
        # - ml/data/soybean_extra/Healthy
        # Plus SOYBEAN_EXTRA_HEALTHY_IMAGE_DIRS in ml/config.py (default ~/.../Soybean Healthy).
        if self.crop == "soybean" and "Healthy" in self.diseases:
            extra_roots = [
                DATA_DIR / "soybean_mendeley",
                DATA_DIR / "soybean_healthy",
                DATA_DIR / "soybean_extra",
            ]
            extra_added = 0
            for root in extra_roots:
                if not root.exists() or not root.is_dir():
                    continue
                healthy_candidates = [
                    p for p in root.iterdir()
                    if p.is_dir() and "healthy" in p.name.lower()
                ]
                for healthy_dir in healthy_candidates:
                    extra_files = self._get_image_files(healthy_dir)
                    if not extra_files:
                        continue
                    print(f"Including {len(extra_files)} extra soybean healthy images from {healthy_dir}")
                    for img_path in extra_files:
                        try:
                            img = Image.open(img_path).convert("RGB")
                            img = img.resize(self.image_size)
                            img_array = np.array(img, dtype=np.float32)
                            images.append(img_array)
                            labels.append("Healthy")
                            class_names.append("Healthy")
                            extra_added += 1
                        except Exception as e:
                            print(f"Error loading {img_path}: {e}")
                            continue
            # Explicit healthy folders (env CROPINTEL_SOYBEAN_HEALTHY_DIRS and/or default ~/.../Soybean Healthy)
            for healthy_dir in SOYBEAN_EXTRA_HEALTHY_IMAGE_DIRS:
                if not healthy_dir.is_dir():
                    continue
                extra_files = self._get_image_files(healthy_dir)
                if not extra_files:
                    continue
                print(
                    f"Including {len(extra_files)} extra soybean healthy images from {healthy_dir}"
                )
                for img_path in extra_files:
                    try:
                        img = Image.open(img_path).convert("RGB")
                        img = img.resize(self.image_size)
                        img_array = np.array(img, dtype=np.float32)
                        images.append(img_array)
                        labels.append("Healthy")
                        class_names.append("Healthy")
                        extra_added += 1
                    except Exception as e:
                        print(f"Error loading {img_path}: {e}")
                        continue
            if extra_added > 0:
                print(f"Total supplemental healthy soybean images: {extra_added}")
        
        if not images:
            raise ValueError(f"No images loaded from {self.data_dir}")
        
        # Convert to numpy arrays
        images = np.array(images, dtype=np.float32)
        
        # Create label mapping
        unique_diseases = sorted(list(set(labels)))
        disease_to_idx = {disease: idx for idx, disease in enumerate(unique_diseases)}
        label_indices = np.array([disease_to_idx[label] for label in labels])
        
        # Shuffle data to prevent class ordering bias (all Healthy first, etc.)
        # This is critical to prevent the model from learning class order instead of features
        indices = np.arange(len(images))
        np.random.seed(42)  # For reproducibility
        np.random.shuffle(indices)
        images = images[indices]
        label_indices = label_indices[indices]
        
        print(f"Loaded {len(images)} images for {self.crop}")
        print(f"Diseases: {unique_diseases}")
        print(f"Class distribution: {pd.Series([unique_diseases[idx] for idx in label_indices]).value_counts().to_dict()}")
        
        return images, label_indices, unique_diseases
    
    def create_data_generators(
        self, 
        images: np.ndarray, 
        labels: np.ndarray,
        augment: bool = True
    ) -> Tuple[tf.keras.preprocessing.image.ImageDataGenerator, 
               tf.keras.preprocessing.image.ImageDataGenerator, np.ndarray]:
        """
        Create data generators for training and validation.
        
        Args:
            images: Image array
            labels: Label array
            augment: Whether to use data augmentation
            
        Returns:
            Tuple of (train_generator, val_generator, y_train_labels)
        """
        # Split data. Fall back to non-stratified splits when a class is too small
        # for sklearn's stratified split requirements.
        label_counts = np.bincount(labels.astype(int))
        can_stratify_first_split = np.all(label_counts[label_counts > 0] >= 2)
        X_train, X_temp, y_train, y_temp = train_test_split(
            images, labels,
            test_size=TRAINING_CONFIG["test_split"] + TRAINING_CONFIG["validation_split"],
            stratify=labels if can_stratify_first_split else None,
            random_state=42
        )
        
        val_size = TRAINING_CONFIG["validation_split"] / (
            TRAINING_CONFIG["test_split"] + TRAINING_CONFIG["validation_split"]
        )
        temp_label_counts = np.bincount(y_temp.astype(int))
        can_stratify_second_split = np.all(temp_label_counts[temp_label_counts > 0] >= 2)
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp,
            test_size=1 - val_size,
            stratify=y_temp if can_stratify_second_split else None,
            random_state=42
        )
        
        # Save test set for later evaluation
        self.X_test = X_test
        self.y_test = y_test
        # Save training labels for class weight calculation
        self.y_train = y_train
        
        # Data augmentation for training
        if augment and TRAINING_CONFIG["augmentation"]:
            train_datagen = tf.keras.preprocessing.image.ImageDataGenerator(
                rotation_range=30,  # Increased from 20
                width_shift_range=0.2,
                height_shift_range=0.2,
                shear_range=0.2,
                zoom_range=0.3,  # Increased from 0.2
                horizontal_flip=True,
                vertical_flip=True,  # Added vertical flip
                brightness_range=[0.8, 1.2],  # Added brightness variation
                fill_mode='nearest'
            )
        else:
            train_datagen = tf.keras.preprocessing.image.ImageDataGenerator()
        
        # No augmentation for validation
        val_datagen = tf.keras.preprocessing.image.ImageDataGenerator()
        
        # Convert to categorical - use actual number of classes found, not config
        num_classes = len(np.unique(y_train))
        y_train_cat = tf.keras.utils.to_categorical(y_train, num_classes=num_classes)
        y_val_cat = tf.keras.utils.to_categorical(y_val, num_classes=num_classes)
        
        train_generator = train_datagen.flow(
            X_train, y_train_cat,
            batch_size=TRAINING_CONFIG["batch_size"],
            shuffle=True
        )
        
        val_generator = val_datagen.flow(
            X_val, y_val_cat,
            batch_size=TRAINING_CONFIG["batch_size"],
            shuffle=False
        )
        
        return train_generator, val_generator, y_train
    
    def get_test_set(self) -> Tuple[np.ndarray, np.ndarray]:
        """Get the held-out test set."""
        if not hasattr(self, 'X_test'):
            raise ValueError("Test set not created. Call create_data_generators first.")
        return self.X_test, self.y_test

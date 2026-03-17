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

from ml.config import DATA_DIR, CROPS, TRAINING_CONFIG


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
        
    def load_dataset(self) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """
        Load images and labels from the dataset directory.
        
        Returns:
            Tuple of (images, labels, class_names)
        """
        images = []
        labels = []
        class_names = []
        
        # Find all disease folders
        disease_folders = {}
        for disease in self.diseases:
            # Try different possible folder name formats
            possible_names = [
                disease,
                disease.lower(),
                disease.replace(" ", "_"),
                disease.replace(" ", "-"),
            ]
            
            # Rice-specific mappings
            if self.crop == "rice":
                if disease == "Rice Blast":
                    possible_names.insert(0, "Leaf Blast")
                elif disease == "Healthy":
                    possible_names.insert(0, "Healthy Rice Leaf")
            
            # Soybean-specific mappings
            if self.crop == "soybean":
                if disease == "D Mossaic Virus":
                    possible_names.insert(0, "Mossaic Virus")
                elif disease == "D septoria":
                    possible_names.insert(0, "septoria")
            
            # Wheat-specific mappings
            if self.crop == "wheat":
                if disease == "Leaf Rust":
                    # Leaf Rust maps to Brown Rust in the dataset
                    possible_names.insert(0, "Brown Rust")
                elif disease == "Stem Rust":
                    # Stem Rust maps to Black Rust in the dataset
                    possible_names.insert(0, "Black Rust")
                elif disease == "Stripe (Yellow) Rust":
                    # Stripe/Yellow Rust maps to Yellow Rust in the dataset
                    possible_names.insert(0, "Yellow Rust")
                    possible_names.insert(1, "Stripe Rust")
                elif disease == "Powdery Mildew":
                    # Powdery Mildew maps to Mildew in the dataset
                    possible_names.insert(0, "Mildew")
            
            for name in possible_names:
                folder_path = self.data_dir / name
                if folder_path.exists() and folder_path.is_dir():
                    disease_folders[disease] = folder_path
                    break
        
        if not disease_folders:
            raise ValueError(f"No disease folders found in {self.data_dir}")
        
        # Load images from each disease folder
        for disease, folder_path in disease_folders.items():
            # Check for case-insensitive image extensions
            image_files = (
                list(folder_path.glob("*.jpg")) + list(folder_path.glob("*.JPG")) +
                list(folder_path.glob("*.jpeg")) + list(folder_path.glob("*.JPEG")) +
                list(folder_path.glob("*.png")) + list(folder_path.glob("*.PNG"))
            )
            
            if not image_files:
                print(f"Warning: No images found in {folder_path}")
                continue
            
            print(f"Found {len(image_files)} images in {folder_path.name}")
            
            for img_path in image_files:
                try:
                    img = Image.open(img_path).convert("RGB")
                    img = img.resize(self.image_size)
                    # Keep images in [0, 255] range - EfficientNet preprocessing will handle normalization
                    # This prevents double-scaling issues that cause model divergence
                    img_array = np.array(img, dtype=np.float32)  # Keep as [0, 255]
                    
                    images.append(img_array)
                    labels.append(disease)
                    class_names.append(disease)
                except Exception as e:
                    print(f"Error loading {img_path}: {e}")
                    continue
        
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
        # Split data
        X_train, X_temp, y_train, y_temp = train_test_split(
            images, labels, 
            test_size=TRAINING_CONFIG["test_split"] + TRAINING_CONFIG["validation_split"],
            stratify=labels,
            random_state=42
        )
        
        val_size = TRAINING_CONFIG["validation_split"] / (
            TRAINING_CONFIG["test_split"] + TRAINING_CONFIG["validation_split"]
        )
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp,
            test_size=1 - val_size,
            stratify=y_temp,
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

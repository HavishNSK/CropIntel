#!/usr/bin/env python3
"""
Visualize training progress for corn, rice, and soybean models.
Creates graphs showing accuracy and loss over epochs.
"""

import pandas as pd
import matplotlib.pyplot as plt
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Model paths
MODELS_DIR = Path(__file__).parent.parent / "ml" / "models"

# Latest model versions for each crop (using best performing versions)
MODEL_PATHS = {
    "corn": MODELS_DIR / "corn" / "v1_20260118_144945" / "training_log.csv",
    "rice": MODELS_DIR / "rice" / "v1_20260118_161225" / "training_log.csv",  # Best performing rice model (99%+ accuracy)
    "soybean": MODELS_DIR / "soybean" / "v1_20260118_225345" / "training_log.csv",
}

def load_training_log(crop: str) -> pd.DataFrame:
    """Load training log CSV for a crop."""
    path = MODEL_PATHS.get(crop)
    if not path or not path.exists():
        raise FileNotFoundError(f"Training log not found for {crop}: {path}")
    
    df = pd.read_csv(path)
    
    # Check if this looks like Phase 2 only (high starting accuracy suggests Phase 1 already happened)
    # If starting accuracy > 0.7, likely Phase 2, so adjust epoch numbers to show as 21-40
    if len(df) > 0 and 'accuracy' in df.columns and df['accuracy'].iloc[0] > 0.7:
        # This is likely Phase 2 only - Phase 1 logs were overwritten
        # Adjust epochs to show as Phase 2 (assuming 40 total epochs: Phase 1 = 0-19, Phase 2 = 20-39)
        phase1_epochs = len(df)  # Assume Phase 1 had same number of epochs
        if 'epoch' in df.columns:
            df['epoch'] = df['epoch'] + phase1_epochs  # Shift to show as Phase 2 epochs (20-39)
    
    return df

def create_training_plots():
    """Create training visualization plots."""
    crops = ["corn", "rice", "soybean"]
    colors = {"corn": "#FFA500", "rice": "#4169E1", "soybean": "#32CD32"}
    
    # Create figure with subplots
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle("Training Progress: Corn, Rice, and Soybean Models", fontsize=16, fontweight='bold')
    
    # Plot 1: Training Accuracy
    ax1 = axes[0, 0]
    for crop in crops:
        try:
            df = load_training_log(crop)
            if 'epoch' in df.columns:
                epochs = df['epoch']
            else:
                epochs = range(1, len(df) + 1)
            
            if 'accuracy' in df.columns:
                ax1.plot(epochs, df['accuracy'], label=f"{crop.capitalize()} (Train)", 
                        color=colors[crop], linestyle='-', linewidth=2, alpha=0.8)
            if 'val_accuracy' in df.columns:
                ax1.plot(epochs, df['val_accuracy'], label=f"{crop.capitalize()} (Val)", 
                        color=colors[crop], linestyle='--', linewidth=2, alpha=0.8)
        except Exception as e:
            print(f"Warning: Could not plot {crop} accuracy: {e}")
    
    ax1.set_xlabel("Epoch", fontsize=12)
    ax1.set_ylabel("Accuracy", fontsize=12)
    ax1.set_title("Accuracy Over Epochs", fontsize=14, fontweight='bold')
    ax1.legend(loc='best', fontsize=10)
    ax1.grid(True, alpha=0.3)
    ax1.set_ylim([0, 1])
    
    # Plot 2: Training Loss
    ax2 = axes[0, 1]
    for crop in crops:
        try:
            df = load_training_log(crop)
            if 'epoch' in df.columns:
                epochs = df['epoch']
            else:
                epochs = range(1, len(df) + 1)
            
            if 'loss' in df.columns:
                ax2.plot(epochs, df['loss'], label=f"{crop.capitalize()} (Train)", 
                        color=colors[crop], linestyle='-', linewidth=2, alpha=0.8)
            if 'val_loss' in df.columns:
                ax2.plot(epochs, df['val_loss'], label=f"{crop.capitalize()} (Val)", 
                        color=colors[crop], linestyle='--', linewidth=2, alpha=0.8)
        except Exception as e:
            print(f"Warning: Could not plot {crop} loss: {e}")
    
    ax2.set_xlabel("Epoch", fontsize=12)
    ax2.set_ylabel("Loss", fontsize=12)
    ax2.set_title("Loss Over Epochs", fontsize=14, fontweight='bold')
    ax2.legend(loc='best', fontsize=10)
    ax2.grid(True, alpha=0.3)
    
    # Plot 3: Validation Accuracy Comparison
    ax3 = axes[1, 0]
    for crop in crops:
        try:
            df = load_training_log(crop)
            if 'epoch' in df.columns:
                epochs = df['epoch']
            else:
                epochs = range(1, len(df) + 1)
            
            if 'val_accuracy' in df.columns:
                ax3.plot(epochs, df['val_accuracy'], label=crop.capitalize(), 
                        color=colors[crop], linewidth=2.5, marker='o', markersize=4, alpha=0.8)
        except Exception as e:
            print(f"Warning: Could not plot {crop} validation accuracy: {e}")
    
    ax3.set_xlabel("Epoch", fontsize=12)
    ax3.set_ylabel("Validation Accuracy", fontsize=12)
    ax3.set_title("Validation Accuracy Comparison", fontsize=14, fontweight='bold')
    ax3.legend(loc='best', fontsize=10)
    ax3.grid(True, alpha=0.3)
    ax3.set_ylim([0, 1])
    
    # Plot 4: Validation Loss Comparison
    ax4 = axes[1, 1]
    for crop in crops:
        try:
            df = load_training_log(crop)
            if 'epoch' in df.columns:
                epochs = df['epoch']
            else:
                epochs = range(1, len(df) + 1)
            
            if 'val_loss' in df.columns:
                ax4.plot(epochs, df['val_loss'], label=crop.capitalize(), 
                        color=colors[crop], linewidth=2.5, marker='s', markersize=4, alpha=0.8)
        except Exception as e:
            print(f"Warning: Could not plot {crop} validation loss: {e}")
    
    ax4.set_xlabel("Epoch", fontsize=12)
    ax4.set_ylabel("Validation Loss", fontsize=12)
    ax4.set_title("Validation Loss Comparison", fontsize=14, fontweight='bold')
    ax4.legend(loc='best', fontsize=10)
    ax4.grid(True, alpha=0.3)
    
    plt.tight_layout()
    
    # Save the figure
    output_path = Path(__file__).parent.parent / "training_plots.png"
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"✓ Training plots saved to: {output_path}")
    
    # Also save individual plots
    for crop in crops:
        try:
            fig_ind, axes_ind = plt.subplots(1, 2, figsize=(12, 5))
            fig_ind.suptitle(f"{crop.capitalize()} Model Training Progress", fontsize=14, fontweight='bold')
            
            df = load_training_log(crop)
            if 'epoch' in df.columns:
                epochs = df['epoch']
            else:
                epochs = range(1, len(df) + 1)
            
            # Accuracy plot
            ax_acc = axes_ind[0]
            if 'accuracy' in df.columns:
                ax_acc.plot(epochs, df['accuracy'], label='Training', 
                           color=colors[crop], linewidth=2, alpha=0.8)
            if 'val_accuracy' in df.columns:
                ax_acc.plot(epochs, df['val_accuracy'], label='Validation', 
                           color=colors[crop], linestyle='--', linewidth=2, alpha=0.8)
            ax_acc.set_xlabel("Epoch", fontsize=11)
            ax_acc.set_ylabel("Accuracy", fontsize=11)
            ax_acc.set_title("Accuracy", fontsize=12, fontweight='bold')
            ax_acc.legend()
            ax_acc.grid(True, alpha=0.3)
            ax_acc.set_ylim([0, 1])
            
            # Loss plot
            ax_loss = axes_ind[1]
            if 'loss' in df.columns:
                ax_loss.plot(epochs, df['loss'], label='Training', 
                            color=colors[crop], linewidth=2, alpha=0.8)
            if 'val_loss' in df.columns:
                ax_loss.plot(epochs, df['val_loss'], label='Validation', 
                            color=colors[crop], linestyle='--', linewidth=2, alpha=0.8)
            ax_loss.set_xlabel("Epoch", fontsize=11)
            ax_loss.set_ylabel("Loss", fontsize=11)
            ax_loss.set_title("Loss", fontsize=12, fontweight='bold')
            ax_loss.legend()
            ax_loss.grid(True, alpha=0.3)
            
            plt.tight_layout()
            output_path_ind = Path(__file__).parent.parent / f"{crop}_training_plot.png"
            plt.savefig(output_path_ind, dpi=300, bbox_inches='tight')
            print(f"✓ {crop.capitalize()} plot saved to: {output_path_ind}")
            plt.close(fig_ind)
        except Exception as e:
            print(f"Warning: Could not create individual plot for {crop}: {e}")
    
    plt.close(fig)
    print("\n✓ All training visualizations created successfully!")

if __name__ == "__main__":
    create_training_plots()

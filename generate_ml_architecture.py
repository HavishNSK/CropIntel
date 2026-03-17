"""
Generate ML Architecture Diagram for CropIntel
"""
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, ConnectionPatch
import numpy as np

# Create figure
fig, ax = plt.subplots(1, 1, figsize=(16, 10))
ax.set_xlim(0, 10)
ax.set_ylim(0, 12)
ax.axis('off')

# Colors
input_color = '#E3F2FD'
preprocess_color = '#FFF3E0'
model_color = '#F3E5F5'
output_color = '#E8F5E9'
arrow_color = '#1976D2'

# Title
ax.text(5, 11.5, 'CropIntel ML Architecture: Disease Detection Pipeline', 
        ha='center', va='center', fontsize=20, fontweight='bold', color='#1a1a1a')

# ========== INPUT LAYER ==========
input_box = FancyBboxPatch((0.5, 9), 2, 1.5, 
                           boxstyle="round,pad=0.1", 
                           facecolor=input_color, 
                           edgecolor='#1976D2', 
                           linewidth=2)
ax.add_patch(input_box)
ax.text(1.5, 10, 'Input Image', ha='center', va='center', fontsize=12, fontweight='bold')
ax.text(1.5, 9.5, 'Crop Leaf Photo', ha='center', va='center', fontsize=10)
ax.text(1.5, 9.2, '(JPEG/PNG)', ha='center', va='center', fontsize=9, style='italic')

# Arrow 1
arrow1 = FancyArrowPatch((2.5, 9.75), (3.5, 9.75), 
                         arrowstyle='->', lw=2, color=arrow_color)
ax.add_patch(arrow1)

# ========== PREPROCESSING LAYER ==========
preprocess_box = FancyBboxPatch((3.5, 8.5), 2.5, 2, 
                                boxstyle="round,pad=0.1", 
                                facecolor=preprocess_color, 
                                edgecolor='#FF9800', 
                                linewidth=2)
ax.add_patch(preprocess_box)
ax.text(5.25, 10.2, 'Preprocessing', ha='center', va='center', fontsize=12, fontweight='bold')
ax.text(5.25, 9.8, '• Format Conversion', ha='center', va='center', fontsize=9)
ax.text(5.25, 9.5, '• Resize to 224×224', ha='center', va='center', fontsize=9)
ax.text(5.25, 9.2, '• Normalize [0,1]', ha='center', va='center', fontsize=9)
ax.text(5.25, 8.9, '• Quality Enhancement', ha='center', va='center', fontsize=9)

# Arrow 2
arrow2 = FancyArrowPatch((6, 9.5), (6.8, 9.5), 
                         arrowstyle='->', lw=2, color=arrow_color)
ax.add_patch(arrow2)

# ========== EFFICIENTNET MODEL ==========
model_box = FancyBboxPatch((6.8, 7), 2.5, 5, 
                          boxstyle="round,pad=0.1", 
                          facecolor=model_color, 
                          edgecolor='#9C27B0', 
                          linewidth=3)
ax.add_patch(model_box)
ax.text(8.05, 11.7, 'EfficientNet-B0', ha='center', va='center', fontsize=14, fontweight='bold', color='#7B1FA2')

# Feature Extraction Layers
feat_box = FancyBboxPatch((7.2, 10.2), 1.7, 0.8, 
                         boxstyle="round,pad=0.05", 
                         facecolor='white', 
                         edgecolor='#9C27B0', 
                         linewidth=1.5)
ax.add_patch(feat_box)
ax.text(8.05, 10.6, 'Feature Extraction', ha='center', va='center', fontsize=10, fontweight='bold')
ax.text(8.05, 10.3, 'Convolutional Layers', ha='center', va='center', fontsize=8)

# Arrow within model
arrow3 = FancyArrowPatch((8.05, 10), (8.05, 9.5), 
                         arrowstyle='->', lw=1.5, color='#7B1FA2')
ax.add_patch(arrow3)

# Global Average Pooling
gap_box = FancyBboxPatch((7.2, 8.8), 1.7, 0.6, 
                        boxstyle="round,pad=0.05", 
                        facecolor='white', 
                        edgecolor='#9C27B0', 
                        linewidth=1.5)
ax.add_patch(gap_box)
ax.text(8.05, 9.1, 'Global Avg Pooling', ha='center', va='center', fontsize=9, fontweight='bold')
ax.text(8.05, 8.9, 'Dimension Reduction', ha='center', va='center', fontsize=7)

# Arrow within model
arrow4 = FancyArrowPatch((8.05, 8.8), (8.05, 8.4), 
                         arrowstyle='->', lw=1.5, color='#7B1FA2')
ax.add_patch(arrow4)

# Classification Head
class_box = FancyBboxPatch((7.2, 7.5), 1.7, 0.8, 
                          boxstyle="round,pad=0.05", 
                          facecolor='white', 
                          edgecolor='#9C27B0', 
                          linewidth=1.5)
ax.add_patch(class_box)
ax.text(8.05, 7.9, 'Classification Head', ha='center', va='center', fontsize=10, fontweight='bold')
ax.text(8.05, 7.6, 'Fully Connected + Softmax', ha='center', va='center', fontsize=8)

# Arrow 5
arrow5 = FancyArrowPatch((6.8, 7.9), (6, 7.9), 
                         arrowstyle='->', lw=2, color=arrow_color)
ax.add_patch(arrow5)

# ========== POST-PROCESSING ==========
post_box = FancyBboxPatch((3.5, 7.2), 2.5, 1.4, 
                         boxstyle="round,pad=0.1", 
                         facecolor=preprocess_color, 
                         edgecolor='#FF9800', 
                         linewidth=2)
ax.add_patch(post_box)
ax.text(5.25, 8.2, 'Post-Processing', ha='center', va='center', fontsize=12, fontweight='bold')
ax.text(5.25, 7.9, '• Confidence Threshold', ha='center', va='center', fontsize=9)
ax.text(5.25, 7.6, '• Crop-Specific Routing', ha='center', va='center', fontsize=9)
ax.text(5.25, 7.3, '• Result Formatting', ha='center', va='center', fontsize=9)

# Arrow 6
arrow6 = FancyArrowPatch((3.5, 7.9), (2.5, 7.9), 
                         arrowstyle='->', lw=2, color=arrow_color)
ax.add_patch(arrow6)

# ========== OUTPUT LAYER ==========
output_box = FancyBboxPatch((0.5, 6.2), 2, 3.4, 
                            boxstyle="round,pad=0.1", 
                            facecolor=output_color, 
                            edgecolor='#4CAF50', 
                            linewidth=2)
ax.add_patch(output_box)
ax.text(1.5, 9.2, 'Output', ha='center', va='center', fontsize=12, fontweight='bold')
ax.text(1.5, 8.8, 'Disease Prediction', ha='center', va='center', fontsize=10, fontweight='bold')
ax.text(1.5, 8.5, '• Disease Name', ha='center', va='center', fontsize=9)
ax.text(1.5, 8.2, '• Confidence %', ha='center', va='center', fontsize=9)
ax.text(1.5, 7.9, '• Health Status', ha='center', va='center', fontsize=9)
ax.text(1.5, 7.6, '• Treatment Info', ha='center', va='center', fontsize=9)
ax.text(1.5, 7.3, '• Prevention Tips', ha='center', va='center', fontsize=9)
ax.text(1.5, 7.0, '• Severity Level', ha='center', va='center', fontsize=9)
ax.text(1.5, 6.5, 'Response Time:', ha='center', va='center', fontsize=8, style='italic')
ax.text(1.5, 6.3, '< 2 seconds', ha='center', va='center', fontsize=9, fontweight='bold', color='#2E7D32')

# ========== SIDE INFORMATION ==========
# Transfer Learning Info
transfer_box = FancyBboxPatch((6.8, 4.5), 2.5, 1.8, 
                             boxstyle="round,pad=0.1", 
                             facecolor='#FFF9C4', 
                             edgecolor='#FBC02D', 
                             linewidth=2)
ax.add_patch(transfer_box)
ax.text(8.05, 6, 'Transfer Learning', ha='center', va='center', fontsize=11, fontweight='bold')
ax.text(8.05, 5.6, 'Pre-trained on ImageNet', ha='center', va='center', fontsize=9)
ax.text(8.05, 5.3, 'Fine-tuned on Agricultural', ha='center', va='center', fontsize=9)
ax.text(8.05, 5.0, 'Disease Datasets', ha='center', va='center', fontsize=9)

# Model Specifications
spec_box = FancyBboxPatch((3.5, 4.5), 2.5, 1.8, 
                         boxstyle="round,pad=0.1", 
                         facecolor='#E1F5FE', 
                         edgecolor='#0288D1', 
                         linewidth=2)
ax.add_patch(spec_box)
ax.text(5.25, 6, 'Model Specifications', ha='center', va='center', fontsize=11, fontweight='bold')
ax.text(5.25, 5.6, 'Architecture: EfficientNet-B0', ha='center', va='center', fontsize=9)
ax.text(5.25, 5.3, 'Input Size: 224×224×3', ha='center', va='center', fontsize=9)
ax.text(5.25, 5.0, 'Accuracy: 87-92%', ha='center', va='center', fontsize=9)

# Data Flow
data_box = FancyBboxPatch((0.5, 4.5), 2, 1.8, 
                         boxstyle="round,pad=0.1", 
                         facecolor='#FCE4EC', 
                         edgecolor='#C2185B', 
                         linewidth=2)
ax.add_patch(data_box)
ax.text(1.5, 6, 'Training Data', ha='center', va='center', fontsize=11, fontweight='bold')
ax.text(1.5, 5.6, 'Thousands of labeled', ha='center', va='center', fontsize=9)
ax.text(1.5, 5.3, 'crop disease images', ha='center', va='center', fontsize=9)
ax.text(1.5, 5.0, 'Augmented & Balanced', ha='center', va='center', fontsize=9)

# ========== LEGEND ==========
legend_y = 3.5
legend_items = [
    ('Input/Output', input_color, output_color),
    ('Preprocessing', preprocess_color, None),
    ('ML Model', model_color, None),
    ('Data Flow', arrow_color, None),
]

ax.text(5, 3.8, 'Legend', ha='center', va='center', fontsize=11, fontweight='bold')
for i, (label, color1, color2) in enumerate(legend_items):
    x_pos = 1 + i * 2.5
    if color2:
        rect1 = mpatches.Rectangle((x_pos-0.15, legend_y-0.1), 0.2, 0.15, 
                                   facecolor=color1, edgecolor='black', linewidth=1)
        rect2 = mpatches.Rectangle((x_pos-0.15, legend_y-0.25), 0.2, 0.15, 
                                   facecolor=color2, edgecolor='black', linewidth=1)
        ax.add_patch(rect1)
        ax.add_patch(rect2)
    else:
        rect = mpatches.Rectangle((x_pos-0.15, legend_y-0.2), 0.2, 0.2, 
                                  facecolor=color1, edgecolor='black', linewidth=1)
        ax.add_patch(rect)
    ax.text(x_pos, legend_y-0.35, label, ha='center', va='top', fontsize=8)

# Footer
ax.text(5, 0.5, 'CropIntel: AI-Powered Crop Disease Detection System', 
        ha='center', va='center', fontsize=10, style='italic', color='#666666')

plt.tight_layout()
plt.savefig('ml_architecture.png', dpi=300, bbox_inches='tight', facecolor='white')
print("✅ ML Architecture diagram saved as 'ml_architecture.png'")
plt.close()

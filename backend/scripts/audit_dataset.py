import os
import random

dataset_path = r'c:\Users\karti\Downloads\ML_PROJECT\ML_PROJECT\backend\dataset_lite'

if not os.path.exists(dataset_path):
    print(f"Error: Dataset path not found at {dataset_path}")
else:
    classes = [d for d in os.listdir(dataset_path) if os.path.isdir(os.path.join(dataset_path, d))]
    print(f"Found {len(classes)} classes: {classes}\n")
    
    for cls in classes:
        cls_path = os.path.join(dataset_path, cls)
        images = [f for f in os.listdir(cls_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        print(f"Class: {cls} ({len(images)} images)")
        if len(images) > 0:
            sample_size = min(5, len(images))
            samples = random.sample(images, sample_size)
            for i, s in enumerate(samples):
                print(f"  {i+1}. {s}")
        else:
            print("  [!] EMPTY FOLDER")
        print("-" * 30)

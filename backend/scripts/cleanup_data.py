import os
from pathlib import Path
from PIL import Image

dataset_path = Path(r'c:\Users\karti\Downloads\ML_PROJECT\ML_PROJECT\backend\dataset_lite')

if not dataset_path.exists():
    print(f"Error: Path {dataset_path} does not exist.")
else:
    for folder in dataset_path.iterdir():
        if folder.is_dir():
            images = list(folder.glob('*.j*pg')) + list(folder.glob('*.png'))
            print(f"Folder: {folder.name} | Total Images: {len(images)}")
            
            # Open first 3 images to verify
            for img_path in images[:3]:
                print(f"  Opening {img_path.name} for verification...")
                try:
                    # On Windows, this opens the default system image viewer
                    os.startfile(img_path)
                except Exception as e:
                    print(f"  Could not open image: {e}")
    
    print("\n[!] Please manually delete any wrong images from the folders above.")
    print("[!] Once done, run the reset_models.py script.")

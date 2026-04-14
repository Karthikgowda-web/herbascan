import os
import shutil

# Paths
source_base = r'c:\Users\karti\Downloads\ML_PROJECT\ML_PROJECT\backend\backend\CroppedMedLeaves\CroppedMedLeaves'
dest_base = r'c:\Users\karti\Downloads\ML_PROJECT\ML_PROJECT\backend\dataset_lite'

# Mapping from Folder ID to Plant Name
MAPPING = {
    "0": "Aloe_Vera",
    "1": "Amla",
    "9": "Betel",
    "10": "Brahmi",
    "14": "Curry_Leaf",
    "19": "Hibiscus",
    "26": "Mint",
    "27": "Neem",
    "28": "Tulsi"
}

def populate():
    for folder_id, plant_name in MAPPING.items():
        dest_dir = os.path.join(dest_base, plant_name)
        if not os.path.exists(dest_dir):
            os.makedirs(dest_dir)
        
        # We'll copy from train, valid, and test to maximize data for the 9 plants
        for split in ['train', 'valid', 'test']:
            src_dir = os.path.join(source_base, split, folder_id)
            if not os.path.exists(src_dir):
                print(f"Warning: Source dir {src_dir} not found. Skipping {split} for {plant_name}.")
                continue
            
            files = [f for f in os.listdir(src_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            print(f"Copying {len(files)} files from {split}/{folder_id} to {plant_name}...")
            
            for f in files:
                shutil.copy2(os.path.join(src_dir, f), os.path.join(dest_dir, f))

    print("Population complete.")

if __name__ == "__main__":
    populate()

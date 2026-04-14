import os
import shutil

models_dir = r'c:\Users\karti\Downloads\ML_PROJECT\ML_PROJECT\backend\models'

if os.path.exists(models_dir):
    print(f"Clearing all files in {models_dir}...")
    for filename in os.listdir(models_dir):
        file_path = os.path.join(models_dir, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.is_dir(file_path):
                shutil.rmtree(file_path)
            print(f"  Deleted: {filename}")
        except Exception as e:
            print(f'  Failed to delete {file_path}. Reason: {e}')
    print("Models directory reset complete.")
else:
    print("Models directory not found. Nothing to reset.")

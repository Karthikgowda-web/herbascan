import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Paths
base_dir = r'c:\Users\karti\Downloads\ML_PROJECT\ML_PROJECT\backend'
model_path = os.path.join(base_dir, 'models', 'plant_model_lite.h5')
dataset_dir = os.path.join(base_dir, 'dataset_lite')

def analyze():
    model = load_model(model_path, compile=False)
    plants = sorted([d for d in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, d))])
    
    # In binary classification it would be easier, but here we have 9 classes.
    # We want to see: For each TRUE class, what are the predicted class counts?
    
    print(f"{'True Label':<15} | {'Predictions (Index: Count)':<50}")
    print("-" * 70)
    
    for plant in plants:
        plant_path = os.path.join(dataset_dir, plant)
        images = [f for f in os.listdir(plant_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        sample_size = min(len(images), 30)
        counts = {}
        
        for i in range(sample_size):
            img_path = os.path.join(plant_path, images[i])
            img = image.load_img(img_path, target_size=(224, 224))
            img_array = image.img_to_array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            
            pred = model.predict(img_array, verbose=0)
            idx = int(np.argmax(pred[0]))
            counts[idx] = counts.get(idx, 0) + 1
            
        sorted_counts = dict(sorted(counts.items(), key=lambda item: item[1], reverse=True))
        counts_str = ", ".join([f"{k}: {v}" for k, v in sorted_counts.items()])
        print(f"{plant:<15} | {counts_str}")

if __name__ == "__main__":
    analyze()

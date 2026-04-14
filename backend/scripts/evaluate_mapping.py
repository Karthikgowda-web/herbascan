import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# Paths
base_dir = r'c:\Users\karti\Downloads\ML_PROJECT\ML_PROJECT\backend'
model_path = os.path.join(base_dir, 'models', 'plant_model_lite.h5')
dataset_dir = os.path.join(base_dir, 'dataset_lite')

def discover_mapping():
    if not os.path.exists(model_path):
        print("Error: Model not found.")
        return
    
    print("Loading model...")
    model = load_model(model_path, compile=False)
    
    plants = [d for d in os.listdir(dataset_dir) if os.path.isdir(os.path.join(dataset_dir, d))]
    
    print(f"{'Folder Name':<20} | {'Predicted Index (Majority)':<15} | {'Confidence':<10}")
    print("-" * 50)

    for plant in sorted(plants):
        plant_path = os.path.join(dataset_dir, plant)
        images = [f for f in os.listdir(plant_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        # Test up to 10 images from each folder to find majority prediction
        sample_size = min(len(images), 10)
        predictions = []
        confidences = []
        
        for i in range(sample_size):
            img_path = os.path.join(plant_path, images[i])
            img_width, img_height = 224, 224
            
            try:
                img = image.load_img(img_path, target_size=(img_width, img_height))
                img_array = image.img_to_array(img)
                img_array = np.expand_dims(img_array, axis=0)
                img_array = preprocess_input(img_array)
                
                pred = model.predict(img_array, verbose=0)
                idx = np.argmax(pred[0])
                predictions.append(idx)
                confidences.append(pred[0][idx])
            except Exception as e:
                continue
        
        if predictions:
            majority_idx = max(set(predictions), key=predictions.count)
            avg_conf = sum(confidences) / len(confidences)
            print(f"{plant:<20} | {majority_idx:<15} | {avg_conf:.4f}")
        else:
            print(f"{plant:<20} | {'No predictions':<15} | N/A")

if __name__ == "__main__":
    discover_mapping()

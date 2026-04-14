import os
import sys
import json
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, RandomFlip, RandomRotation, RandomZoom, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input

# 1. Setup paths for the NEW Kaggle dataset (40 classes)
dataset_dir = r'c:\Users\karti\Downloads\ML_PROJECT\ML_PROJECT\backend\archive (1)\Medicinal plant dataset'
models_dir = r'c:\Users\karti\Downloads\ML_PROJECT\ML_PROJECT\backend\models'
model_path = os.path.join(models_dir, 'plant_model_lite.keras')
labels_json_path = os.path.join(models_dir, 'labels.json')

img_width, img_height = 224, 224
batch_size = 32

if not os.path.exists(models_dir):
    os.makedirs(models_dir)

# 2. Data Preparation
print(f"Loading new dataset from: {dataset_dir}")
datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    validation_split=0.2
)

train_generator = datagen.flow_from_directory(
    dataset_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical',
    subset='training',
    shuffle=True
)

valid_generator = datagen.flow_from_directory(
    dataset_dir,
    target_size=(img_width, img_height),
    batch_size=batch_size,
    class_mode='categorical',
    subset='validation',
    shuffle=False
)

num_classes = train_generator.num_classes
class_indices = train_generator.class_indices
print(f"Detected {num_classes} classes.")

# Save updated labels for the new 40-class set
with open(labels_json_path, 'w') as f:
    json.dump(class_indices, f, indent=4)

# 3. Model Architecture (MobileNetV2 Fine-Tuning Upgrade)
base_model = MobileNetV2(input_shape=(img_width, img_height, 3), include_top=False, weights='imagenet')

# Unfreeze the base_model
base_model.trainable = True

# Freeze all layers except the last 20 layers for stable fine-tuning
fine_tune_at = len(base_model.layers) - 20
for layer in base_model.layers[:fine_tune_at]:
    layer.trainable = False

model = Sequential([
    RandomFlip("horizontal", input_shape=(img_width, img_height, 3)),
    RandomRotation(0.1),
    RandomZoom(0.1),
    base_model,
    GlobalAveragePooling2D(),
    Dropout(0.5), 
    Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.00001), # ultra-low LR for fine-tuning
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# 4. Train the model
epochs = 30
print(f"Starting High-Accuracy Fine-Tuning for {epochs} epochs...")

history = model.fit(
    train_generator,
    validation_data=valid_generator,
    epochs=epochs
)

# 5. Save results and generate metrics
model.save(model_path)
print(f"New 40-class model saved to {model_path}")

# Accuracy Graph
plt.figure(figsize=(10, 6))
plt.plot(history.history['accuracy'], label='Training Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.title('Kaggle Dataset Training Curve')
plt.legend()
plt.savefig(os.path.join(models_dir, 'learning_curve.png'))

# Confusion Matrix (Limited to top classes if too crowded, but showing all for now)
valid_generator.reset()
predictions = model.predict(valid_generator)
y_pred = np.argmax(predictions, axis=1)
y_true = valid_generator.classes
ordered_labels = [k for k, v in sorted(class_indices.items(), key=lambda item: item[1])]

cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(20, 20))
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=ordered_labels)
disp.plot(cmap=plt.cm.Blues, xticks_rotation='vertical', ax=plt.gca(), values_format='d')
plt.title('Confusion Matrix (40 Classes)')
plt.tight_layout()
plt.savefig(os.path.join(models_dir, 'confusion_matrix.png'))

print("Retraining on Kaggle dataset complete!")

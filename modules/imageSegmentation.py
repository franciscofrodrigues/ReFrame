from transformers import AutoImageProcessor, Mask2FormerForUniversalSegmentation
from PIL import Image
import torch
import numpy as np
import cv2

# Load Mask2Former model and processor
image_processor = AutoImageProcessor.from_pretrained("facebook/mask2former-swin-large-ade-semantic")
model = Mask2FormerForUniversalSegmentation.from_pretrained("facebook/mask2former-swin-large-ade-semantic")

# Get the ADE20k class labels
id2label = model.config.id2label

IMAGE_FILENAME = 'img7'
IMAGE_PATH = f'./assets/inputs/{IMAGE_FILENAME}.jpg'
DEVICE = 'cpu'

# Load original image using OpenCV
original_image = cv2.imread(IMAGE_PATH)

# Open image with PIL and preprocess
image = Image.open(IMAGE_PATH)
inputs = image_processor(image, return_tensors="pt")

# Inferência
with torch.no_grad():
    outputs = model(**inputs)

pred_instance_map = image_processor.post_process_semantic_segmentation(
    outputs, target_sizes=[image.size[::-1]]
)[0]

pred_map_numpy = pred_instance_map.numpy()

# Máscaras
unique_instances = np.unique(pred_map_numpy)

mask_counter = 0
for result in unique_instances:    
    mask = (pred_map_numpy == result).astype(np.uint8) * 255 # Máscaras binárias
    
    result_image = cv2.bitwise_and(original_image, original_image, mask=mask) # Máscara de corte à imagem
    
    # Convert to RGBA to preserve transparency for non-masked areas
    result_image_rgba = cv2.cvtColor(result_image, cv2.COLOR_BGR2BGRA)
    result_image_rgba[mask == 0] = [0, 0, 0, 0] # Preto para transparente

    semantic_label = id2label.get(result, "")

    mask_counter += 1
    cv2.imwrite(f'./assets/results/{IMAGE_FILENAME}_{mask_counter}_{semantic_label}.png', result_image_rgba) # Guardar ficheiro de máscara

from transformers import AutoImageProcessor, Mask2FormerForUniversalSegmentation
import os
import cv2
import torch
import numpy as np

# Localização de ficheiros
inputs_path = './res/inputs'
outputs_path = './res/segmentation/mask2former'

# Inicializar o modelo
image_processor = AutoImageProcessor.from_pretrained("facebook/mask2former-swin-large-ade-semantic")
model = Mask2FormerForUniversalSegmentation.from_pretrained("facebook/mask2former-swin-large-ade-semantic")

id2label = model.config.id2label
labels = []

device = 'cpu'
model.to(device)

# Segmentação de UMA imagem
def segmentation(img_path):
    original_img = cv2.imread(img_path)
    resized_img = cv2.resize(original_img, None, fx=0.2, fy=0.2) # Reduzir resolução
    
    inputs = image_processor(resized_img, return_tensors="pt").to(device)

    with torch.no_grad():
        outputs = model(**inputs)
    
    pred_instance_map = image_processor.post_process_semantic_segmentation(
        outputs, target_sizes=[resized_img.shape[:2]]
    )[0]

    pred_map_numpy = pred_instance_map.numpy()
    instances = np.unique(pred_map_numpy)

    mask_counter = 0        
    for instance in instances:
        mask = (pred_map_numpy == instance).astype(np.uint8) * 255            
                    
        instance_label = id2label.get(instance, "") # Categoria
        if instance_label:
            labels.append(instance_label)

        result_image = cv2.bitwise_and(resized_img, resized_img, mask=mask)
        result_img_rgba = cv2.cvtColor(result_image, cv2.COLOR_BGR2BGRA)
        result_img_rgba[mask == 0] = [0, 0, 0, 0]

        basename = os.path.splitext(os.path.basename(img_path))[0]
        cv2.imwrite(f'{outputs_path}/{basename}_{mask_counter}.png', result_img_rgba)
        mask_counter += 1

# ------------------------------------------------------------------------------

def main():
    # Segmentação de um CONJUNTO de images da pasta "inputs"
    for root, dirs, files in os.walk(inputs_path):
        for file in files:
            img_path = os.path.join(root, file)
            segmentation(img_path)

    return labels

if __name__ == "__main__":
    main()    
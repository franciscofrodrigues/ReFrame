from ultralytics import YOLO
import os
import cv2

# Localização de ficheiros
segmentation_model = 'fastsam'
weights_path = './weights/yolo11n.pt'
inputs_path = f'./modules/assets/outputs/{segmentation_model}'
# inputs_path = f'./modules/assets/inputs/'
outputs_path = './modules/assets/outputs/fastsam'

# Inicializar o modelo
model = YOLO(weights_path)

# Lista de imagens de input
def img_list(inputs_path):
    path_list = []
    for root, dirs, files in os.walk(inputs_path):
        for file in files:
            img_path = os.path.join(root, file)
            path_list.append(img_path)
    return path_list

# Classificação de VÁRIAS imagens
def classification_batch(img_paths):
    results = model(img_paths, conf=0.2)

    for result in results:
        # labels = result.names
        # print(labels)
        result.show()  # Display image with bounding boxes

# ------------------------------------------------------------------------------

def main():
    image_paths = img_list(inputs_path)
    classification_batch(image_paths)

main()

# probs = result.probs  # Probs object for classification outputs
# boxes = result.boxes  # Boxes object for bounding box outputs
# masks = result.masks  # Masks object for segmentation masks outputs
# keypoints = result.keypoints  # Keypoints object for pose outputs
# obb = result.obb  # Oriented boxes object for OBB outputs
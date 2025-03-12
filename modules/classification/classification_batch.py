from ultralytics import YOLO
import os
import json

# Localização de ficheiros
segmentation_model = 'fastsam'
weights_path = './weights/yolo11x.pt'
inputs_path = f'./modules/assets/outputs/{segmentation_model}'
outputs_path = './classification_results'

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

def get_labels(json_file):
    result_list = json.loads(json_file)
    return result_list[0]['name'] if result_list else ""

# Classificação de VÁRIAS imagens
def classification_batch(img_paths):
    results = model(img_paths, device='cpu', imgsz=320, conf=0.2, iou=0.7) # Inferência

    labels = []
    for result in results:                        
        json_file = result.to_json() # "name", "class", "confidence", "box" (x1,y1,x2,y2)        
        instance_label = get_labels(json_file) # Categoria
        if instance_label:
            labels.append(instance_label)

        # result.show()

    # print("Categorias:", labels)
    return labels

# ------------------------------------------------------------------------------

def main():
    image_paths = img_list(inputs_path)
    labels = classification_batch(image_paths)
    return labels

if __name__ == "__main__":
    main()

# probs = result.probs  # Probs object for classification outputs
# boxes = result.boxes  # Boxes object for bounding box outputs
# masks = result.masks  # Masks object for segmentation masks outputs
# keypoints = result.keypoints  # Keypoints object for pose outputs
# obb = result.obb  # Oriented boxes object for OBB outputs
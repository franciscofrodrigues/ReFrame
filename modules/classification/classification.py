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

# Classificação de UMA imagem
def classification(img_path):
    original_img = cv2.imread(img_path)
    resized_img = cv2.resize(original_img, None, fx=0.2, fy=0.2) # Reduzir resolução

    results = model(img_path, device='cpu', imgsz=320, conf=0.2, iou=0.9) # Inferência
    
    # labels = []
    for result in results:
        # print(result.names)

        # result.show()
        # result.save()
        # result.save_txt('prediction.txt')
        labels = result.to_json()
        print(labels)

# def get_labels():



# ------------------------------------------------------------------------------

def main():
    # Classificação de um CONJUNTO de images da pasta "outputs"
    for root, dirs, files in os.walk(inputs_path):
        for file in files:
            img_path = os.path.join(root, file)
            classification(img_path)

if __name__ == "__main__":
    main()

# probs = result.probs  # Probs object for classification outputs
# boxes = result.boxes  # Boxes object for bounding box outputs
# masks = result.masks  # Masks object for segmentation masks outputs
# keypoints = result.keypoints  # Keypoints object for pose outputs
# obb = result.obb  # Oriented boxes object for OBB outputs
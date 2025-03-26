from ultralytics import YOLO
import cv2
import os

# Get list of image paths
def img_list(inputs_path):
    path_list = []
    for root, dirs, files in os.walk(inputs_path):
        for file in files:
            img_path = os.path.join(root, file)
            path_list.append(img_path)
    return path_list

def get_label(box, model):
    return model.names[int(box.cls.item())] 

def get_confidence(box):
    return float(box.conf.item())

def get_bbox(box):
    box_coords = box.xyxy[0]
    x1, y1, x2, y2 = map(int, box_coords)
    return x1, y1, x2, y2

def crop_objects(padding, img, x1, y1, x2, y2):
    x1 = max(0, x1 - padding)
    y1 = max(0, y1 - padding)
    x2 = min(img.shape[1], x2 + padding)
    y2 = min(img.shape[0], y2 + padding)
    return img[y1:y2, x1:x2]

def output_name(outputs_path, counter):
    return f'{outputs_path}/output_{counter}.jpg'

# Classificação de VÁRIAS imagens
def classification_batch(model, img_paths, outputs_path, padding=10):
    results = model(img_paths, device='cpu', imgsz=320, conf=0.2, iou=0.7)

    data = []
    counter = 0
    for img_path, result in zip(img_paths, results):
        img = cv2.imread(img_path)

        for box in result.boxes:
            label = get_label(box, model)
            confidence = get_confidence(box)
            x1, y1, x2, y2 = get_bbox(box)
            cropped_img = crop_objects(padding, img, x1, y1, x2, y2)

            output_file = output_name(outputs_path, counter)
            cv2.imwrite(output_file, cropped_img)

            data.append({
                "input_path": img_path,
                "output_path": output_file,
                "label": label,
                "confidence": confidence,
                "coords": [x1, y1, x2, y2]
            })
        
            counter += 1

    return data

# ------------------------------------------------------------------------------

def main(weights_path, inputs_path, outputs_path):
    model = YOLO(weights_path)
    img_paths = img_list(inputs_path)
    labels = classification_batch(model, img_paths, outputs_path)
    return labels

if __name__ == "__main__":
    weights_path = "yolo11x.pt"
    inputs_path = "./server/res/class_inputs"
    outputs_path = "./server/res/class_outputs"

    results = main(weights_path, inputs_path, outputs_path)
    print(results)

import cv2
from ultralytics import YOLO
import os
import time

class Detection:
    def __init__(self, weights_path, input_files, outputs_path):
        self.model = YOLO(weights_path)
        self.input_files = input_files
        self.outputs_path = outputs_path
        
        # Padding do CROP
        self.padding = 10

        # Configuração do modelo
        self.device = 'cpu'
        self.save = False
        self.imgsz = 320
        self.conf = 0.2
        self.iou = 0.7

    def get_label(self, box):
        return self.model.names[int(box.cls.item())] 
    
    def get_confidence(self, box):
        return float(box.conf.item())

    def get_bbox(self, box):
        box_coords = box.xyxy[0]
        x1, y1, x2, y2 = map(int, box_coords)
        return x1, y1, x2, y2

    def crop_object(self, img, x1, y1, x2, y2):
        x1 = max(0, x1 - self.padding)
        y1 = max(0, y1 - self.padding)
        x2 = min(img.shape[1], x2 + self.padding)
        y2 = min(img.shape[0], y2 + self.padding)
        return img[y1:y2, x1:x2]
    
    def get_filename(self, path):
        filename = os.path.splitext(path)
        return os.path.basename(filename[0])
    
    def save_crop(self, input_filename, crop_img):
        output_dir = os.path.join(self.outputs_path, input_filename)
        os.makedirs(output_dir, exist_ok=True)

        output_path = os.path.join(output_dir, f"crop_{time.time()}.jpg")
        cv2.imwrite(output_path, crop_img)

    # OBJECT DETECTION de VÁRIAS imagens
    def run(self):
        # Inferência
        results = self.model(self.input_files, device=self.device, save=self.save, imgsz=self.imgsz, conf=self.conf, iou=self.iou)
        
        for result in results:            
            for box in result.boxes:
                label = self.get_label(box) # LABEL
                confidence = self.get_confidence(box) # CONFIDENCE
                x1, y1, x2, y2 = self.get_bbox(box) # BBOX
                
                img = cv2.imread(result.path)
                input_filename = self.get_filename(result.path)
                
                # Lógica de CROP
                cropped_img = self.crop_object(img, x1, y1, x2, y2)
                self.save_crop(input_filename, cropped_img)
                    
        return {
            "label": label,
            "confidence": confidence,
            "bbox": [x1, y1, x2, y2]
        }

# ------------------------------------------------------------------------------

if __name__ == "__main__":
    detection = Detection('weights/yolo11x.pt', 'res', 'res')
    print(detection.run())
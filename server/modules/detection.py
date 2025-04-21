from utils.file_export import get_filename, folder_structure, save_output

import cv2
from ultralytics import YOLO

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
        raw_conf = float(box.conf.item())
        conf = round(raw_conf*100)
        return conf

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

    # OBJECT DETECTION de VÁRIAS imagens
    def run(self):
        # Inferência
        results = self.model(self.input_files, device=self.device, save=self.save, imgsz=self.imgsz, conf=self.conf, iou=self.iou)
        
        if results:
            inputs_data = []
            data = []
            folders_data = []

            for i, result in enumerate(results):
                input_file = result.path
                input_filename = get_filename(input_file)            
                img = cv2.imread(input_file)
                img_height, img_width, _ = img.shape

                inputs_data.append({
                    "path": input_file,
                    "size": [img_width, img_height],
                })
                
                # Criação da estrutura de pastas
                outputs_folder, crops_folder, segmentation_folder = folder_structure(self.outputs_path, input_filename)

                folders_data.append({
                    "outputs_folder": outputs_folder,
                    "crops_folder": crops_folder,
                    "segmentation_folder": segmentation_folder
                })

                for box in result.boxes:
                    label = self.get_label(box) # LABEL
                    confidence = self.get_confidence(box) # CONFIDENCE
                    x1, y1, x2, y2 = self.get_bbox(box) # BBOX                                        
                    
                    # Lógica de CROP
                    cropped_img = self.crop_object(img, x1, y1, x2, y2)
                    output_path = save_output(crops_folder, cropped_img, f'x{x1}_y{y1}_x{x2}_y{y2}_conf{confidence}', "crops")
                        
                    data.append({
                        "input_image_index": i,
                        "label": label,
                        "confidence": confidence,
                        "bbox": [x1, y1, x2, y2],
                        "result_image_path": output_path,                    
                    })                

            return folders_data, inputs_data, data

# ------------------------------------------------------------------------------

if __name__ == "__main__":
    detection = Detection('weights/yolo11x.pt', 'res/uploads', 'res/outputs')
    print(detection.run())
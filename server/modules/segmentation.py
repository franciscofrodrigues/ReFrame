from utils.file_export import get_filename, save_output

import cv2
import numpy as np
from ultralytics import FastSAM

class Segmentation:
    def __init__(self, weights_path, input_files, outputs_path):
        self.model = FastSAM(weights_path)
        self.input_files = input_files
        self.outputs_path = outputs_path

        # Configuração do modelo
        self.device = 'cpu'
        self.retina_masks = True
        self.save = False
        self.imgsz = 512
        self.conf = 0.4
        self.iou = 0.9

    def get_confidence(self, box):
        return float(box.conf.item())
    
    def mask_img(self, mask, original_img):
        mask_np = mask.cpu().numpy()  # Converter de tensor para numpy
        mask_binary = (mask_np > 0).astype(np.uint8) * 255  # Máscara binária

        result_img = cv2.bitwise_and(original_img, original_img, mask=mask_binary) # Máscara de corte à imagem
        
        result_img_rgba = cv2.cvtColor(result_img, cv2.COLOR_BGR2BGRA)        
        result_img_rgba[mask_binary == 0] = [0, 0, 0, 0] # Preto para transparente
        return result_img_rgba

    # SEGMENTAÇÃO DE IMAGEM de VÁRIAS imagens
    def run(self):
        # Inferência
        results = self.model(self.input_files, device=self.device, retina_masks=self.retina_masks, save=self.save, imgsz=self.imgsz, conf=self.conf, iou=self.iou)        

        data = []

        for result in results:
            input_file = result.path
            input_filename = get_filename(input_file)
            original_img = cv2.imread(input_file)
            
            for mask in result.masks.data:                    
                masked_img = self.mask_img(mask, original_img)                
                output_path = save_output(self.outputs_path, masked_img, input_filename, "segmentation")
                
                data.append({
                    "input_filename": input_filename,
                    "confidence": self.conf,
                    # "mask": mask,
                    "output_path": output_path                    
                })  

        return data

# ------------------------------------------------------------------------------

if __name__ == "__main__":
    segmentation = Segmentation('weights/FastSAM-x.pt', 'res/uploads', 'res/outputs')
    print(segmentation.run())
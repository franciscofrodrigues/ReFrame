import cv2
import numpy as np
import os
import time
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
        self.imgsz = 1024
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

    def get_filename(self, path):
        filename = os.path.splitext(path)
        return os.path.basename(filename[0])

    def save_segmentation(self, input_filename, mask_img):
        output_dir = os.path.join(self.outputs_path, input_filename)
        os.makedirs(output_dir, exist_ok=True)

        output_path = os.path.join(output_dir, f"mask_{time.time()}.png")
        cv2.imwrite(output_path, mask_img)

    # SEGMENTAÇÃO DE IMAGEM de VÁRIAS imagens
    def run(self):
        # Inferência
        results = self.model(self.input_files, device=self.device, retina_masks=self.retina_masks, save=self.save, imgsz=self.imgsz, conf=self.conf, iou=self.iou)        

        for result in results:
            original_img = cv2.imread(result.path)
            input_filename = self.get_filename(result.path)
            
            for mask in result.masks.data:                    
                masked_img = self.mask_img(mask, original_img)
                output_path = self.save_segmentation(input_filename, masked_img)
                    
        return {
            "input_filename": input_filename,
            "confidence": self.conf,
            "mask": mask,
            "output_path": output_path
        }

# ------------------------------------------------------------------------------

if __name__ == "__main__":
    segmentation = Segmentation('weights/FastSAM-x.pt', 'res/uploads', 'res/outputs')
    print(segmentation.run())
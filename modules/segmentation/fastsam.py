from fastsam import FastSAM, FastSAMPrompt
import os
import cv2
import numpy as np

model = FastSAM('./weights/FastSAM-x.pt')
DEVICE = 'cpu'

for root, dirs, files in os.walk('./modules/assets/inputs'):
    for file in files:
        img_path = os.path.join(root, file)
        original_img = cv2.imread(img_path)

        resized_img = cv2.resize(original_img, None, fx=0.2, fy=0.2)

        everything_results = model(resized_img, device=DEVICE, retina_masks=True, imgsz=1024, conf=0.4, iou=0.9)
        prompt_process = FastSAMPrompt(resized_img, everything_results, device=DEVICE)

        mask_counter = 0
        for instance in everything_results:
            masks = instance.masks
            
            for mask in masks.data:
                mask_np = mask.cpu().numpy()  # Converter de tensor para numpy
                mask_binary = (mask_np > 0).astype(np.uint8) * 255  # Máscara binária

                result_img = cv2.bitwise_and(resized_img, resized_img, mask=mask_binary) # Máscara de corte à imagem
                
                result_img_rgba = cv2.cvtColor(result_img, cv2.COLOR_BGR2BGRA)
                result_img_rgba[mask_binary == 0] = [0, 0, 0, 0] # Preto para transparente
                
                basename = os.path.splitext(os.path.basename(img_path))[0]
                cv2.imwrite(f'./modules/assets/outputs/fastsam/{basename}_{mask_counter}.png', result_img_rgba) # Guardar ficheiro de máscara
                mask_counter += 1
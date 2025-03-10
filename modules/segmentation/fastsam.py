from fastsam import FastSAM, FastSAMPrompt
import cv2
import numpy as np

model = FastSAM('./weights/FastSAM-x.pt')
IMAGE_FILENAME = 'img23'
IMAGE_PATH = './assets/inputs/' + IMAGE_FILENAME + '.jpg'
DEVICE = 'cpu'

original_image = cv2.imread(IMAGE_PATH)

everything_results = model(IMAGE_PATH, device=DEVICE, retina_masks=True, imgsz=1024, conf=0.4, iou=0.9,)
prompt_process = FastSAMPrompt(IMAGE_PATH, everything_results, device=DEVICE)

mask_counter = 0
for result in everything_results:
    print(result.masks)
    masks = result.masks # Máscaras do objeto results

    for mask in masks.data:        
        mask_np = mask.cpu().numpy()  # Converter de tensor para numpy
        mask_binary = (mask_np > 0).astype(np.uint8) * 255  # Máscara binária

        result_image = cv2.bitwise_and(original_image, original_image, mask=mask_binary) # Máscara de corte à imagem
        
        result_image_rgba = cv2.cvtColor(result_image, cv2.COLOR_BGR2BGRA)
        result_image_rgba[mask_binary == 0] = [0, 0, 0, 0] # Preto para transparente

        mask_counter += 1
        cv2.imwrite(f'./assets/results/{IMAGE_FILENAME}_{mask_counter}.png', result_image_rgba) # Guardar ficheiro de máscara
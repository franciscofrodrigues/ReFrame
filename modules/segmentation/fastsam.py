from ultralytics import FastSAM
import os
import cv2
import numpy as np

# Localização de ficheiros
weights_path = './weights/FastSAM-x.pt'
inputs_path = './modules/assets/inputs'
outputs_path = './modules/assets/outputs/fastsam'

# Inicializar o modelo
model = FastSAM(weights_path)

# Segmentação de UMA imagem
def segmentation(img_path):
    original_img = cv2.imread(img_path)
    # resized_img = cv2.resize(original_img, None, fx=0.2, fy=0.2) # Reduzir resolução

    everything_results = model(original_img, device="cpu", retina_masks=True, imgsz=512, conf=0.8, iou=0.9) # Inferência
    # everything_results = model(original_img, device="cpu", retina_masks=True, imgsz=1024, conf=0.8, iou=0.9) # Inferência (Melhor resolução)

    mask_counter = 0
    for instance in everything_results:
        masks = instance.masks
                
        for mask in masks.data:
            mask_np = mask.cpu().numpy()  # Converter de tensor para numpy
            mask_binary = (mask_np > 0).astype(np.uint8) * 255  # Máscara binária

            result_img = cv2.bitwise_and(original_img, original_img, mask=mask_binary) # Máscara de corte à imagem
                    
            result_img_rgba = cv2.cvtColor(result_img, cv2.COLOR_BGR2BGRA)
            result_img_rgba[mask_binary == 0] = [0, 0, 0, 0] # Preto para transparente
                    
            basename = os.path.splitext(os.path.basename(img_path))[0]
            cv2.imwrite(f'{outputs_path}/{basename}_{mask_counter}.png', result_img_rgba) # Guardar ficheiro de máscara
            mask_counter += 1

# ------------------------------------------------------------------------------

def main():
    # Segmentação de um CONJUNTO de images da pasta "inputs"
    for root, dirs, files in os.walk(inputs_path):
        for file in files:
            img_path = os.path.join(root, file)
            segmentation(img_path)

if __name__ == "__main__":
    main()

# # Run inference with bboxes prompt
# results = model(source, bboxes=[439, 437, 524, 709])
# # Run inference with points prompt
# results = model(source, points=[[200, 200]], labels=[1])
# # Run inference with texts prompt
# results = model(source, texts="a photo of a dog")
# # Run inference with bboxes and points and texts prompt at the same time
# results = model(source, bboxes=[439, 437, 524, 709], points=[[200, 200]], labels=[1], texts="a photo of a dog")
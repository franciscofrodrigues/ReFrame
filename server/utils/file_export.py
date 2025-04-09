import cv2
import os
import time

def get_filename(path):
    filename = os.path.splitext(path)
    return os.path.basename(filename[0])

# Criação da estrutura de pastas
def folder_structure(outputs_path, filename):    
    timestamp = int(time.time())
    outputs_folder = os.path.join(outputs_path, f"{filename}_{timestamp}") # PASTA IMG

    crops_folder = os.path.join(outputs_folder, "crops") # CROPS
    segmentation_folder = os.path.join(outputs_folder, "segmentation") # SEGMENTATION

    os.makedirs(crops_folder, exist_ok=True)
    os.makedirs(segmentation_folder, exist_ok=True)

    return outputs_folder, crops_folder, segmentation_folder

# Nomenclatura de EXPORTAÇÃO
def save_output(outputs_path, file, filename, label):
    if label == "segmentation" or label == "crops":
        path = os.path.join(outputs_path, f'{label}_{filename}_{int(time.time())}.png')
        cv2.imwrite(path, file)
        return path
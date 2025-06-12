import cv2
import os
import datetime

def get_filename(path):
    filename = os.path.splitext(path)
    return os.path.basename(filename[0])

def get_date():
    current_time = datetime.datetime.now()
    date = current_time.strftime('%y-%m-%d_%H-%M-%S-%f')
    return date

# Criar PASTA
def create_folder(folder_location, folder_name):
    folder = os.path.join(folder_location, folder_name)
    os.makedirs(folder, exist_ok=True)
    return folder

# Criação da ESTRUTURA DE PASTAS
# Pastas para exportação de outputs da pipeline
def folder_structure(outputs_path, filename):    
    # PASTA IMG
    outputs_folder = create_folder(outputs_path, f'{filename}_{get_date()}')
    # PASTA CROPS
    crops_folder = create_folder(outputs_folder, 'crops')
    # PASTA SEGMENTATION
    segmentation_folder = create_folder(outputs_folder, 'segmentation')
    return outputs_folder, crops_folder, segmentation_folder

def filter_folder_structure(outputs_folder):
    # PASTA INVERSE
    inverse_folder = create_folder(outputs_folder, 'inverse')
    # PASTA CONTAINED
    contained_folder = create_folder(outputs_folder, 'contained')
    return inverse_folder, contained_folder

# Nomenclatura de EXPORTAÇÃO
def save_output(outputs_path, file, filename, label):
    date = get_date()

    if label in ("crops", "segmentation", "inverse", "contained"):
        path = os.path.join(outputs_path, f'{date}_{label}_{filename}.png')            
        cv2.imwrite(path, file)

    return path
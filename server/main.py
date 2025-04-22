from utils.json_export import save_json
from utils.file_export import get_filename, get_date, create_folder
import config
from modules import Detection, Segmentation, Concept

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse

from typing import List
import os
import json


'''
1. Criar PASTA LOTE
2. Criar JSON LOTE
3. Devolver path da PASTA e JSON
4. Executar PIPELINE na PASTA
5. Escrever DADOS no JSON
6. Devolver JSON ao CLIENT-SIDE
'''

# Criar pasta e JSON de LOTE
def create_group():
    folder_name = f'{get_date()}'
    group_path = create_folder(config.OUTPUTS_PATH, folder_name)

    # Estrutura do JSON
    group_data = []    
    group_data = {
        "input_images": [],
        "detection": [],
        "segmentation": [],
        "concepts": []
    }
    return group_path, group_data

def pipeline(uploads_path, outputs_path, json_structure):
    # OBJECT DETECTION
    detection = Detection(config.YOLO_WEIGHTS, uploads_path, outputs_path)
    folders_data, inputs_data, detection_data = detection.run()
    
    # Estrutura do JSON (INPUTS e módulo OBJECT DETECTION)
    json_structure["input_images"].extend(inputs_data)
    json_structure["detection"].extend(detection_data)

    # Instâncias da pasta UPLOADS_PATH
    for folder_data in folders_data:

        # Pastas de determinado output
        outputs_folder = folder_data["outputs_folder"]
        crops_folder = folder_data["crops_folder"]
        segmentation_folder = folder_data["segmentation_folder"]

        # SEGMENTAÇÃO
        segmentation = Segmentation(config.FASTSAM_WEIGHTS, crops_folder, segmentation_folder)
        segmentation_data = segmentation.run()

        # CONCEPT NET
        labels_list = [detection["label"] for detection in detection_data]
        concepts = Concept(labels_list)
        concepts_data = concepts.run()
        
        # Estrutura do JSON (Módulos SEGMENTAÇÃO e CONCEPT NET)
        json_structure["segmentation"].extend(segmentation_data)
        json_structure["concepts"].extend(concepts_data)

    # Exportar ficheiro JSON de LOTE
    filename = get_filename(outputs_path)
    save_json(json_structure, outputs_path, filename)


# ------------------------------------------------------------------------------


app = FastAPI()

@app.get("/")
def index():
    return {"message": "index"}

@app.post("/upload")
def upload(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):    
    # Guardar FICHEIROS de UPLOAD
    paths = []
    for file in files:
        try:
            content = file.file.read()

            # Pasta UPLOADS
            path = os.path.join(config.UPLOADS_PATH, file.filename)
            paths.append(path)

            # Guardar ficheiro
            with open(path, 'wb') as f:
                f.write(content)

        except Exception:
            raise HTTPException(status_code=500, detail='Something went wrong')
        finally:
            file.file.close()

    # Criar pasta de LOTE
    group_path, group_data = create_group()

    # Executar PIPELINE
    background_tasks.add_task(pipeline, paths, group_path, group_data)

    return {"Os ficheiros importados": [file.filename for file in files]}

# @app.get("/upload/{filename}")
# def get_images(filename: str):
#     # Carregar o JSON
#     json_path = os.path.join(config.OUTPUTS_PATH, filename, f'{filename}.json')
#     with open(json_path, 'r') as f:
#         data = json.load(f)
    
#     paths = [mask["output_path"] for mask in data["segmentation"]]
#     return paths

@app.get("/masks/{folder_name}")
def get_image_paths(folder_name):
    # Carregar JSON
    json_path = os.path.join(config.OUTPUTS_PATH, folder_name, f'{folder_name}.json')
    with open(json_path) as f:
        data = json.load(f)

    # Obter todos os "result_image_path"
    paths = [mask["result_image_path"] for mask in data["segmentation"]]
    return paths

@app.get("/masks/{folder_name}/{index}")
async def get_image_file(folder_name: str, index: int):
    # Carregar JSON
    json_path = os.path.join(config.OUTPUTS_PATH, folder_name, f'{folder_name}.json')
    with open(json_path) as f:
        data = json.load(f)

    # Obter "result_image_path" para o index especificado
    path = data["segmentation"][index]["result_image_path"]
    return FileResponse(path)


# ------------------------------------------------------------------------------


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
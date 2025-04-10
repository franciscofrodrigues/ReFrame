from utils.json_export import save_json
from utils.file_export import get_filename
import config
from modules import Detection, Segmentation, Concept

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks

from typing import List
import os
import json


def pipeline(uploads_path, outputs_path):
    # OBJECT DETECTION
    detection = Detection(config.YOLO_WEIGHTS, uploads_path, outputs_path)
    folders_data, detection_data = detection.run()

    # Instâncias da pasta UPLOADS
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

        # Estrutura do JSON
        data = {
            "img_path": folder_data["input_path"],
            "detection": detection_data,
            "segmentation": segmentation_data,
            "concepts": concepts_data
        }

        # Exportar ficheiro JSON para determinado output
        filename = get_filename(outputs_folder)
        save_json(data, outputs_folder, filename)


# ------------------------------------------------------------------------------


app = FastAPI()

@app.get("/")
def index():
    return {"message": "index"}

@app.post("/upload")
def upload(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    for file in files:
        try:
            contents = file.file.read()
            
            # Pasta UPLOADS
            path = os.path.join(config.UPLOADS_PATH, file.filename)

            # Guardar ficheiro
            with open(path, 'wb') as f:
                f.write(contents)

            # Executar PIPELINE
            background_tasks.add_task(pipeline, config.UPLOADS_PATH, config.OUTPUTS_PATH)
        except Exception:
            raise HTTPException(status_code=500, detail='Something went wrong')
        finally:
            file.file.close()

    return {"message": f"Uploaded {[file.filename for file in files]}."} 

@app.get("/upload/{filename}")
def get_images(filename: str):
    # Carregar o JSON
    json_path = os.path.join(config.OUTPUTS_PATH, filename, f'{filename}.json')
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    paths = [mask["output_path"] for mask in data["segmentation"]]
    return paths


# ------------------------------------------------------------------------------


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
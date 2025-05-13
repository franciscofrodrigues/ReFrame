from utils.json_export import save_json
from utils.file_export import get_filename, get_date, create_folder
import config
from modules import Detection, Segmentation, Concept

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse

from typing import List
import os
import json

# ------------------------------------------------------------------------------


# Criar pasta e JSON de LOTE
def create_group():
    folder_name = f"{get_date()}"
    group_path = create_folder(config.OUTPUTS_PATH, folder_name)

    # Estrutura do JSON
    group_data = []
    group_data = {
        "input_images": [],
        "detection": [],
        "segmentation": [],
        "concepts": [],
    }
    return folder_name, group_path, group_data


def pipeline(uploads_path, outputs_path, json_structure):
    # OBJECT DETECTION
    detection = Detection(config.YOLO_WEIGHTS, uploads_path, outputs_path)
    folders_data, inputs_data, detection_data = detection.run()

    # Estrutura do JSON (INPUTS e módulo OBJECT DETECTION)
    json_structure["input_images"].extend(inputs_data)
    json_structure["detection"].extend(detection_data)

    # Instâncias da pasta UPLOADS_PATH
    for i, folder_data in enumerate(folders_data):

        # Pastas de determinado output
        crops_folder = folder_data["crops_folder"]
        segmentation_folder = folder_data["segmentation_folder"]

        # Se existirem deteções na pasta CROPS
        if len(os.listdir(crops_folder)) != 0:
            # SEGMENTAÇÃO
            segmentation = Segmentation(
                config.FASTSAM_WEIGHTS, crops_folder, segmentation_folder, i
            )
            segmentation_data = segmentation.run()

            # Estrutura do JSON (Módulos de SEGMENTAÇÃO DE IMAGEM)
            json_structure["segmentation"].extend(segmentation_data)

    # CONCEPT NET
    labels_data = []
    for segmentation in json_structure["segmentation"]:
        detection_index = segmentation["detection_index"]

        labels_data.append(
            {
                "input_image_index": segmentation["input_image_index"],
                "detection_index": detection_index,
                "mask_index": segmentation["mask_index"],
                "label": detection_data[detection_index]["label"],
            }
        )

    concepts = Concept(labels_data)
    concepts_data = concepts.run()

    # Estrutura do JSON (Módulos de Semântica (CONCEPT NET))
    json_structure["concepts"].append(concepts_data)

    # Exportar ficheiro JSON de LOTE
    filename = get_filename(outputs_path)
    save_json(json_structure, outputs_path, filename)

    return {"message": "As imagens foram processadas."}


# ------------------------------------------------------------------------------


app = FastAPI()


@app.get("/")
def index():
    return {"message": "index"}


@app.post("/upload")
def upload_images(
    background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)
):
    # Guardar FICHEIROS de UPLOAD
    paths = []
    for file in files:
        try:
            content = file.file.read()

            # Pasta UPLOADS
            path = os.path.join(config.UPLOADS_PATH, file.filename)
            paths.append(path)

            # Guardar ficheiro
            with open(path, "wb") as f:
                f.write(content)

        except Exception:
            raise HTTPException(status_code=500, detail="Something went wrong")
        finally:
            file.file.close()

    # Criar pasta de LOTE
    folder_name, group_path, group_data = create_group()

    # Executar PIPELINE
    background_tasks.add_task(pipeline, paths, group_path, group_data)

    # return {"Os ficheiros foram importados": [file.filename for file in files]}
    return folder_name


def read_json(folder_name):
    # Carregar JSON
    json_path = os.path.join(config.OUTPUTS_PATH, folder_name, f"{folder_name}.json")
    with open(json_path, "r") as f:
        data = json.load(f)
    return data


# Obter os PATHS das máscaras
@app.get("/masks/{folder_name}")
def get_image_paths(folder_name: str):
    # Carregar JSON
    data = read_json(folder_name)

    # Obter todos os "result_image_path"
    # paths = [mask["result_image_path"] for mask in data["segmentation"]]
    # return len(paths)
    return JSONResponse(content=data)


# Obter FICHEIROS de máscaras
@app.get("/masks/{folder_name}/{index}.png")
def get_image_file(folder_name: str, index: int):
    # Carregar JSON
    data = read_json(folder_name)

    # Obter "result_image_path" para o index especificado
    path = data["segmentation"][index]["result_image_path"]
    return FileResponse(path, media_type="image/png", filename=f"{index}.png")


@app.get("/masks/{folder_name}/related")
def get_related_masks(folder_name: str):
    # Carregar JSON
    data = read_json(folder_name)

    for relation in data["concepts"][0]["relations"]:
        related_input_indexes = relation["related"]["input_image_indexes"]
        related_detection_indexes = relation["related"]["detection_indexes"]
        related_mask_indexes = relation["related"]["mask_indexes"]

        masks_indexes = []
        for i in range(len(related_mask_indexes)):
            for mask_index, segmentation in enumerate(data["segmentation"]):
                if (
                    segmentation["input_image_index"] == related_input_indexes[i]
                    and segmentation["detection_index"] == related_detection_indexes[i]
                    and segmentation["mask_index"] == related_mask_indexes[i]
                ):
                    masks_indexes.append(mask_index)

        return masks_indexes


# ------------------------------------------------------------------------------


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

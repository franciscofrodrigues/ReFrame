from utils.json_export import save_json
from utils.file_export import (
    get_filename,
    get_date,
    create_folder,
    filter_folder_structure,
)
import config
from modules import Detection, Segmentation, Concept, MaskFilter

import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

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
        "result": [],
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

    # Estrutura do JSON (Módulo de Semântica (CONCEPT NET))
    json_structure["concepts"].extend(concepts_data)

    inverse_folder, contained_folder = filter_folder_structure(outputs_path)
    # # MASK FILTER
    mask_filter = MaskFilter(
        json_structure["detection"],
        json_structure["segmentation"],
        json_structure["concepts"],
        inverse_folder,
        contained_folder,
    )
    mask_filter_data = mask_filter.run()

    # Estrutura do JSON (Módulo de Filtragem de Máscaras (MASK FILTER))
    json_structure["result"].extend(mask_filter_data)

    # Exportar ficheiro JSON de LOTE
    filename = get_filename(outputs_path)
    save_json(json_structure, outputs_path, filename)

    return {"Os ficheiros foram processados."}


# ------------------------------------------------------------------------------


app = FastAPI()


app.mount("/static", StaticFiles(directory=config.CLIENT_PATH, html=True), name="static")


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
    group_path, group_data = create_group()

    # Executar PIPELINE
    background_tasks.add_task(pipeline, paths, group_path, group_data)

    return {"Os ficheiros foram importados": [file.filename for file in files]}


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

    # Obter o ficheiro JSON para determinado "folder_name"
    return JSONResponse(content=data)


# Obter FICHEIROS de máscaras
@app.get("/masks/{folder_name}/{index}.png")
def get_image_file(folder_name: str, index: int):
    # Carregar JSON
    data = read_json(folder_name)

    # Obter "result_image_path" para o index especificado
    path = data["segmentation"][index]["result_image_path"]
    return FileResponse(path, media_type="image/png", filename=f"{index}.png")


@app.get("/masks/{folder_name}/result")
def get_result_data(folder_name: str):
    # Carregar JSON
    data = read_json(folder_name)
    return data["result"]


@app.get("/masks/{folder_name}/result/{group_index}/{result_index}.png")
def get_result_mask(
    folder_name: str, group_index: int, result_index: int, inverse: bool
):
    # Carregar JSON
    data = read_json(folder_name)

    # Obter "result_image_path"/"inverse" para os indexes especificados
    if not inverse:
        path = data["result"][group_index][result_index]["result_image_path"]
    else:
        path = data["result"][group_index][result_index]["inverse"]
    filename = get_filename(path)

    return FileResponse(path, media_type="image/png", filename=f"{filename}.png")


@app.get(
    "/masks/{folder_name}/result/{group_index}/{result_index}/contained/{contained_index}.png"
)
def get_result_contained(
    folder_name: str, group_index: int, result_index: int, contained_index: int
):
    # Carregar JSON
    data = read_json(folder_name)

    # Obter "contained" para os indexes especificados
    path = data["result"][group_index][result_index]["contained"][contained_index]
    filename = get_filename(path)

    return FileResponse(path, media_type="image/png", filename=f"{filename}.png")


# ------------------------------------------------------------------------------


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, reload_dirs=[config.CLIENT_PATH])

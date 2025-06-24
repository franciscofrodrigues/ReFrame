import config
from utils.file_export import get_filename

from fastapi import APIRouter, Request
from fastapi.responses import FileResponse, JSONResponse
from functools import lru_cache
import json
import os


router = APIRouter(prefix="/masks", tags=["masks"])


@lru_cache()
def read_json(folder_name):
    # Carregar JSON
    json_path = os.path.join(config.OUTPUTS_PATH, folder_name, f"{folder_name}.json")
    with open(json_path, "r") as f:
        data = json.load(f)
    return data


@router.get("/{folder_name}/result")
def get_result_data(folder_name: str):
    # Carregar JSON
    data = read_json(folder_name)
    return JSONResponse(content=data["result"])


@router.get("/{folder_name}/result/{group_index}/{result_index}.png")
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


@router.get(
    "/{folder_name}/result/{group_index}/{result_index}/contained/{contained_index}.png"
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
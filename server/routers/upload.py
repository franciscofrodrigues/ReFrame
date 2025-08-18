import config
from pipeline import pipeline
from utils.json_export import create_group

from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
import os
from pydantic import BaseModel, Field
from typing import Dict, List
from uuid import UUID, uuid4

class Upload(BaseModel):
    uuid: UUID = Field(default_factory=uuid4)
    folder_name: str
    status: str = "Process Start"
    step: str = "Upload"
    labels: str = "No elements found"


router = APIRouter(prefix="/upload", tags=["upload"])
uploads: Dict[UUID, Upload] = {}


@router.post("")
async def upload_images(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
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
    folder_name, group_path, group_data = create_group(config.OUTPUTS_PATH)

    # Adicionar nova tarefa à QUEUE
    new_upload = Upload(folder_name=folder_name)
    uploads[new_upload.uuid] = new_upload
    
    # Executar PIPELINE
    background_tasks.add_task(pipeline, paths, group_path, group_data, new_upload.uuid, uploads)

    return new_upload


@router.get("/{uuid}/status")
async def get_status(uuid: UUID):
    return uploads[uuid]
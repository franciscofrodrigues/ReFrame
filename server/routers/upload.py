import config
from pipeline import pipeline
from utils.json_export import create_group

from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
import os
from pydantic import BaseModel, Field
from typing import Dict, List
from uuid import UUID, uuid4

    
class Task(BaseModel):
    uuid: UUID = Field(default_factory=uuid4)
    folder_name: str
    status: str = "Process Start"
    step: str = "Upload"
    result: Dict = Field(default_factory=dict)


router = APIRouter(prefix="/upload", tags=["upload"])
tasks: Dict[UUID, Task] = {}


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
    new_task = Task(folder_name=folder_name)
    tasks[new_task.uuid] = new_task
    
    # Executar PIPELINE
    background_tasks.add_task(pipeline, paths, group_path, group_data, new_task.uuid, tasks)

    return new_task


@router.get("/{uuid}/status")
async def status_handler(uuid: UUID):
    return tasks[uuid]
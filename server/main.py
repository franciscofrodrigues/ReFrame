import config
from routers import upload, masks

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

import os
import shutil


os.makedirs(config.UPLOADS_PATH, exist_ok=True) # Uploads
os.makedirs(config.OUTPUTS_PATH, exist_ok=True) # Outputs

app = FastAPI()
app.include_router(upload.router) # Endpoint "upload"
app.include_router(masks.router) # Endpoint "masks"
app.mount("/", StaticFiles(directory=config.CLIENT_PATH, html=True), name="static") # Static

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
def remove_folders():
    shutil.rmtree(config.UPLOADS_PATH) # Uploads
    shutil.rmtree(config.OUTPUTS_PATH) # Outputs


# ------------------------------------------------------------------------------


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[config.CLIENT_PATH],
    )

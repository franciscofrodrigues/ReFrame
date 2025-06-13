import config
from routers import upload, masks

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn


app = FastAPI()
app.include_router(upload.router)
app.include_router(masks.router)
app.mount("/", StaticFiles(directory=config.CLIENT_PATH, html=True), name="static")


# ------------------------------------------------------------------------------


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[config.CLIENT_PATH],
    )

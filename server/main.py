from uuid import uuid4
from fastapi.responses import FileResponse
from fastapi import BackgroundTasks, FastAPI, File, HTTPException, UploadFile

import config
from modules import segmentation, classification, concept, scene_graph

app = FastAPI()

# def main(individual: bool, batch_mode: bool, debug: bool):
def pipeline(img_paths: list[str]):
    # Segmentação de Imagem
    print("1. Segmentação")
    # segmentation.seg_fastsam(config.FASTSAM_WEIGHTS, config.SEG_INPUTS, config.SEG_OUTPUTS)
    
    # Classificação
    print("2. Classificação")
    concepts = classification.classify('fastsam', config.YOLO_WEIGHTS, config.SEG_OUTPUTS, config.CLASS_OUPUTS)

    # ConceptNet
    print("3. Rede Conceptual")
    # concepts = {"person", "cat", "dog", "horse", "book", "library", ""}    
    edges = concept.conceptRelations(concepts)
    # print(edges)

    # Scene Graph
    print("4. Scene Graph")
    scene_graph.drawGraph(concepts, edges)


@app.get('/')
async def get():
    return FileResponse('./app/index.html')


@app.post("/upload")
async def upload_image(background_tasks: BackgroundTasks, files: list[UploadFile] = File(...)):
    img_paths = []
    for file in files:
        try:
            file.filename = f'{uuid4()}.jpg'

            with open(f'{UPLOAD_PATH}/{file.filename}', 'wb') as uploaded_img:
                while content := file.file.read(1024 * 1024):
                    uploaded_img.write(content)

            img_paths.append(f'{UPLOAD_PATH}/{file.filename}')
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            await file.close()

        background_tasks.add_task(pipeline, img_paths)

    return {'message': f"Uploaded {img_paths}"}
from utils.json_export import save_json
from utils.file_export import (
    get_filename,
    filter_folder_structure
)
import config
from modules import Detection, Segmentation, Concept, MaskFilter

import os


def pipeline(uploads_path, outputs_path, json_structure, task_uuid, tasks):
    # INPUT + CLASSIFICAÇÃO DE ELEMENTOS
    tasks[task_uuid].step = "Running Object Detection..."
    folders_data = object_detection(uploads_path, outputs_path, json_structure)

    # EXTRAÇÃO DE MÁSCARAS
    tasks[task_uuid].step = "Running Image Segmentation..."
    image_segmentation(folders_data, json_structure)

    # ANÁLISE SEMÂNTICA
    tasks[task_uuid].step = "Checking for Semantic Relations..."
    semantic_relations(json_structure)

    # FILTRO DE ELEMENTOS
    tasks[task_uuid].step = "Filtering Masks..."
    labels_info = mask_filter(outputs_path, json_structure)

    # Exportar ficheiro JSON de LOTE
    tasks[task_uuid].step = "Saving Results..."
    filename = get_filename(outputs_path)
    save_json(json_structure, outputs_path, filename)

    tasks[task_uuid].folder_name = filename
    tasks[task_uuid].status = "Process End"
    tasks[task_uuid].labels = format_labels_list(labels_info)


# ------------------------------------------------------------------------------


# Módulo de CLASSIFICAÇÃO DE ELEMENTOS (detection)
def object_detection(uploads_path, outputs_path, json_structure):
    detection = Detection(config.YOLO_WEIGHTS, uploads_path, outputs_path)
    folders_data, inputs_data, detection_data = detection.run()

    # Estrutura do JSON
    json_structure["input_images"].extend(inputs_data) # Inputs
    json_structure["detection"].extend(detection_data) # Detection
    return folders_data

# Módulo de EXTRAÇÃO DE MÁSCARAS (segmentation)
def image_segmentation(folders_data, json_structure):
    # Instâncias da pasta UPLOADS_PATH
    for i, folder_data in enumerate(folders_data):
        # Pastas de um determinado output
        crops_folder = folder_data["crops_folder"]
        segmentation_folder = folder_data["segmentation_folder"]

        # Se existirem deteções na pasta CROPS
        if len(os.listdir(crops_folder)) != 0:
            segmentation = Segmentation(config.FASTSAM_WEIGHTS,
                                        crops_folder,
                                        segmentation_folder,
                                        i)
            segmentation_data = segmentation.run()

            # Estrutura do JSON
            json_structure["segmentation"].extend(segmentation_data) # Segmentation

# Módulo de ANÁLISE SEMÂNTICA (concept)
def semantic_relations(json_structure):
    labels_data = []
    for segmentation in json_structure["segmentation"]:

        key = (segmentation["input_image_index"],
               segmentation["detection_index"])
        label = ""
        for detection in json_structure["detection"]:
            if (detection["input_image_index"], detection["detection_index"]) == key:
                label = detection["label"]

        labels_data.append(
            {
                "input_image_index": segmentation["input_image_index"],
                "detection_index": segmentation["detection_index"],
                "mask_index": segmentation["mask_index"],
                "label": label
            }
        )

    concepts = Concept(labels_data)
    concepts_data = concepts.run()

    # Estrutura do JSON
    json_structure["concepts"].extend(concepts_data) # Análise Semântica

# Módulo de FILTRO DE ELEMENTOS (mask_filter)
def mask_filter(outputs_path, json_structure):
    inverse_folder, contained_folder = filter_folder_structure(outputs_path)
    mask_filter = MaskFilter(
        json_structure["detection"],
        json_structure["segmentation"],
        json_structure["concepts"],
        inverse_folder,
        contained_folder
    )
    mask_filter_data, labels_info = mask_filter.run()

    # Estrutura do JSON
    json_structure["result"].extend(mask_filter_data) # Filtro de Elementos
    return labels_info


# ------------------------------------------------------------------------------


def format_labels_list(labels_list):
    if not labels_list:
        return "No elements found"
    else:
        return ", ".join(label.capitalize() for label in labels_list)

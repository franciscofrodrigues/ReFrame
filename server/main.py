from utils.json_export import save_json
from utils.file_export import get_filename

import config
from modules import Detection, Segmentation, Concept

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
            "detection": detection_data,
            "segmentation": segmentation_data,
            "concepts": concepts_data
        }

        # Exportar ficheiro JSON para determinado output
        filename = get_filename(outputs_folder)
        save_json(data, outputs_folder, filename)

# ------------------------------------------------------------------------------

if __name__ == "__main__":
    pipeline(config.UPLOADS_PATH, config.OUTPUTS_PATH)
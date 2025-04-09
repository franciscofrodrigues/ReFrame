import config
from modules import Detection, Segmentation

detection = Detection(config.YOLO_WEIGHTS, config.UPLOADS_PATH, config.OUTPUTS_PATH)
detection_data = detection.run()

crops_folder = detection_data["crops_folder"]
segmentation_folder = detection_data["segmentation_folder"]

segmentation = Segmentation(config.FASTSAM_WEIGHTS, crops_folder, segmentation_folder)
segmentation_data = segmentation.run()

data = {
    "detection": detection_data,
    "segmentation": segmentation_data
}

print(data)
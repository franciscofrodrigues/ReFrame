import cv2
import os
import time

def get_filename(path):
    filename = os.path.splitext(path)
    return os.path.basename(filename[0])

# Nomenclatura de EXPORTAÇÃO
def save_output(outputs_dir, file, filename, label):
    counter = 0

    # PASTA IMG
    output_filename = f'{filename}_{time.time()}_{counter}'
    img_dir = os.path.join(outputs_dir, output_filename)
    os.makedirs(img_dir, exist_ok=True)
    counter += 1

    # CROPS
    crops_dir = os.path.join(img_dir, "crops")
    os.makedirs(crops_dir, exist_ok=True)

    # SEGMENTATION
    segmentation_dir = os.path.join(img_dir, "segmentation")
    os.makedirs(segmentation_dir, exist_ok=True)

    if label == "segmentation":
        path = os.path.join(segmentation_dir, f'{filename}_{time.time()}_{label}.png')
    elif label == "crops":
        path = os.path.join(crops_dir, f'{filename}_{time.time()}_{label}.png')

    cv2.imwrite(path, file)


    """
    outputs 
        img_timestamp_label_counter
            crops
            segmentation
            img_timestamp_label_counter.json

    crop_x_y_w_h_conf.png
    mask_x_y_w_h_conf.png

    img_timestamp_label_counter.json
        path: "res/uploads/..."
        detection
        crop
        segmentation
        semantic
        scene_graph
    
    """
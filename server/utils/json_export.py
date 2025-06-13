import json
import os
from utils.file_export import get_date, create_folder

def save_json(data, path, filename):
    output_path = os.path.join(path, filename)
    with open(f"{output_path}.json", "w") as f:
        json.dump(data, f, indent=2)


# Criar pasta e JSON de LOTE
def create_group(outputs_path):
    folder_name = f"{get_date()}"
    group_path = create_folder(outputs_path, folder_name)

    # Estrutura do JSON
    group_data = []
    group_data = {
        "input_images": [],
        "detection": [],
        "segmentation": [],
        "concepts": [],
        "result": [],
    }
    return folder_name, group_path, group_data

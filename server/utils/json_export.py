import json
import os

def save_json(data, path, filename):
    output_path = os.path.join(path, filename)
    with open(f'{output_path}.json', 'w') as f:
        json.dump(data, f, indent=4)
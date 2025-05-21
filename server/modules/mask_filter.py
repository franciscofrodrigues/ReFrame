from utils.file_export import save_output

import numpy as np
import cv2


class MaskFilter:
    def __init__(self, detection_data, segmentation_data, concepts_data, inverse_outputs_path, contained_outputs_path):
        self.detection_data = detection_data
        self.segmentation_data = segmentation_data
        self.concepts_data = concepts_data
        self.inverse_outputs_path = inverse_outputs_path
        self.contained_outputs_path = contained_outputs_path

    # Agrupar máscaras por grupos de uma mesma "key"
    def create_key_groups(self, segmentation_data, concepts_data):
        key_groups = {}
        for concept_data in concepts_data:
            for relation in concept_data["relations"]:

                num_relations = len(relation["related"]["input_image_indexes"])
                for i in range(num_relations):
                    key = (
                        relation["related"]["input_image_indexes"][i],
                        relation["related"]["detection_indexes"][i],
                    )

                    key_groups[key] = []

                    for segmentation in segmentation_data:
                        if (segmentation["input_image_index"], segmentation["detection_index"]) == key:
                            key_groups[key].append(segmentation)

        return key_groups

    # Obter a maior máscara de determinado crop
    def get_largest_mask(self, masks):
        largest_mask_pixels = -1
        
        for mask in masks:
            if mask["mask_pixels"] > largest_mask_pixels:
                largest_mask_pixels = mask["mask_pixels"]                
                largest_mask = mask
        return largest_mask

    # Verificar se a máscara está contida na "largest_mask"
    def check_contained(self, current_mask, largest_mask):
        result = np.isin(current_mask, largest_mask)
        return np.all(result)

    def run(self):
        key_groups = self.create_key_groups(self.segmentation_data, self.concepts_data)
        data = []
        
        # Para cada grupo com determinada key
        for i, (key, masks) in enumerate(key_groups.items()):
            largest_mask = self.get_largest_mask(masks)                    
            
            # Obter máscara binária
            largest_mask_mask = np.array(largest_mask["mask"]) 
            largest_binary_mask = largest_mask_mask.astype(np.uint8)
        
            # Inverter a máscara
            largest_mask_inverted = cv2.bitwise_not(largest_binary_mask)
            inverse_output_path = save_output(self.inverse_outputs_path, largest_mask_inverted, f'[{key[0]}_{key[1]}_{largest_mask["mask_index"]}]', "inverse")
            
            shape_data = []
            label = ""            
            data.append({
                "result_image_path": largest_mask["result_image_path"],
                "label": label,
                "shape": shape_data            
            })
                        
            for mask in masks:
                current_mask_mask = np.array(mask["mask"])                                   
                
                # Verificar se há máscaras contidas
                # Quando não se trata da "largest_mask"
                if not np.array_equal(current_mask_mask, largest_mask_mask):

                    current_binary_mask = current_mask_mask.astype(np.uint8)
                    contained_output_path = save_output(self.contained_outputs_path, current_binary_mask, f'[{key[0]}_{key[1]}_{largest_mask["mask_index"]}]', "contained")

                    # Verificar se a máscara está contida na "largest_mask"
                    if self.check_contained(current_mask_mask, largest_mask_mask):
                        print("Máscara está contida na maior.")     

                        shape_data.append({
                            "contained": contained_output_path,
                            "inverse": inverse_output_path
                        })
                                            
                else:                                    
                    for detection in self.detection_data:
                        if (detection["input_image_index"], detection["detection_index"]) == key:
                            data[i]["label"] = detection["label"]

        return data
from utils.file_export import save_output

import numpy as np
import cv2


class MaskFilter:
    def __init__(
        self,
        detection_data,
        segmentation_data,
        concepts_data,
        inverse_outputs_path,
        contained_outputs_path,
    ):
        self.detection_data = detection_data
        self.segmentation_data = segmentation_data
        self.concepts_data = concepts_data
        self.inverse_outputs_path = inverse_outputs_path
        self.contained_outputs_path = contained_outputs_path

    # Agrupar máscaras por grupos de uma mesma "key"
    def create_key_groups(self, segmentation_data, concepts_data):
        groups = []
        registed_keys = set()

        # Para cada relação semântica encontrada
        for concept_data in concepts_data:
            for relation in concept_data["relations"]:
                key_groups = {}

                num_relations = len(relation["related"]["input_image_indexes"])
                for i in range(num_relations):
                    key = (
                        relation["related"]["input_image_indexes"][i],
                        relation["related"]["detection_indexes"][i],
                    )

                    # Prevenir keys repetidas
                    if key in registed_keys:
                        continue
                    registed_keys.add(key)

                    if key not in key_groups:
                        key_groups[key] = []

                    # Adicionar informação de Segmentação de Imagem
                    for segmentation in segmentation_data:
                        if (
                            segmentation["input_image_index"],
                            segmentation["detection_index"],
                        ) == key:
                            key_groups[key].append(segmentation)

                groups.append(key_groups)

        return groups

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
        # return np.all((current_mask == 255) <= (largest_mask == 255))
        tolerance = 200;
        difference = np.sum((current_mask == 255) & (largest_mask != 255))            
        return difference <= tolerance

    def run(self):
        groups = self.create_key_groups(self.segmentation_data, self.concepts_data)
        data = []

        for key_groups in groups:
            group_data = []
            # Para cada grupo com determinada key
            for i, (key, masks) in enumerate(key_groups.items()):
                largest_mask = self.get_largest_mask(masks)

                # Obter máscara binária
                largest_mask_binary = cv2.imread(
                    largest_mask["mask"], cv2.IMREAD_GRAYSCALE
                )
                ret, largest_mask_mask = cv2.threshold(
                    largest_mask_binary, 127, 255, cv2.THRESH_BINARY
                )

                # Inverter a máscara
                largest_mask_inverted = cv2.bitwise_not(largest_mask_mask)
                inverse_output_path = save_output(
                    self.inverse_outputs_path,
                    largest_mask_mask,
                    f'[{key[0]}_{key[1]}_{largest_mask["mask_index"]}]',
                    "inverse",
                )

                # Criar estrutura de dados para cada "key"
                contained_data = []
                label = ""
                group_data.append(
                    {
                        "label": label,
                        "result_image_path": largest_mask["result_image_path"],
                        "inverse": inverse_output_path,
                        "contained": contained_data,
                    }
                )

                for mask in masks:
                    # Obter a máscara atual
                    current_mask_binary = cv2.imread(mask["mask"], cv2.IMREAD_GRAYSCALE)
                    ret, current_mask_mask = cv2.threshold(
                        current_mask_binary, 127, 255, cv2.THRESH_BINARY
                    )

                    # Quando não se trata da "largest_mask"
                    if not np.array_equal(current_mask_mask, largest_mask_mask):
                        contained_output_path = save_output(
                            self.contained_outputs_path,
                            current_mask_mask,
                            f'[{key[0]}_{key[1]}_{largest_mask["mask_index"]}]',
                            "contained",
                        )

                        # Verificar se a máscara está contida na "largest_mask"
                        if self.check_contained(current_mask_mask, largest_mask_mask):
                            contained_data.append(contained_output_path)

                    # Quando se trata da "largest_mask"
                    else:
                        for detection in self.detection_data:
                            if (
                                detection["input_image_index"],
                                detection["detection_index"],
                            ) == key:
                                # Adicionar label da "largest_mask"
                                group_data[i]["label"] = detection["label"]

            data.append(group_data)

        return data

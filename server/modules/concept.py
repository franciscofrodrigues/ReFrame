from itertools import combinations
import requests


class Concept:
    def __init__(self, labels_data):
        self.labels_data = labels_data

    def get_related_concepts(self, label):
        # Obter todos os conceitos relacionados para determinada label
        try:            
            response = requests.get(f"http://api.conceptnet.io/c/en/{label}").json()
            return [edge["end"]["label"] for edge in response["edges"]]
        except requests.RequestException:
            return []

    def get_concepts_structure(self, labels_data):
        concepts = []
        # Para cada label
        for label_data in labels_data:
            # Obter os conceitos relacionados
            related_concepts = self.get_related_concepts(label_data["label"])

            # Criar estrutura de dados
            concepts.append(
                {
                    "input_image_index": label_data["input_image_index"],
                    "detection_index": label_data["detection_index"],
                    "mask_index": label_data["mask_index"],
                    "label": label_data["label"],
                    "related_concepts": related_concepts,
                }
            )

        return concepts

    def get_intersections_structure(self, concepts_data):
        intersections = []
        # Verificar todas as combinções de labels
        for label_1, label_2 in combinations(concepts_data, 2):
            # Lista de conceitos em comum
            common_concepts = list(
                set(label_1["related_concepts"]) & set(label_2["related_concepts"])
            )

            if common_concepts:
                # Criar estrutura de dados
                intersections.append(
                    {
                        "input_image_indexes": [
                            label_1["input_image_index"],
                            label_2["input_image_index"],
                        ],
                        "detection_indexes": [
                            label_1["detection_index"],
                            label_2["detection_index"],
                        ],
                        "mask_indexes": [label_1["mask_index"], label_2["mask_index"]],
                        "labels": [label_1["label"], label_2["label"]],
                        "concepts": common_concepts,
                    }
                )

        return intersections

    def get_relations_structure(self, intersections_data):
        relations = []
        related_dict = {}
        for intersection in intersections_data:
            # Criar estrutura inicial
            for label in intersection["labels"]:
                if label not in related_dict:
                    related_dict[label] = {
                        "labels": [],
                        "input_image_indexes": [],
                        "detection_indexes": [],
                        "mask_indexes": []                        
                    }

            # Obter as labels e indexes
            label_1, label_2 = intersection["labels"]
            mask_index_1, mask_index_2 = intersection["mask_indexes"]
            detection_index_1, detection_index_2 = intersection["detection_indexes"]
            input_index_1, input_index_2 = intersection["input_image_indexes"]

            # Verificar se o index já se encontra no "related_dict"
            # Adicionar labels e indexes
            if mask_index_2 not in related_dict[label_1]["mask_indexes"]:
                related_dict[label_1]["labels"].append(label_2)

                related_dict[label_1]["input_image_indexes"].append(input_index_2)
                related_dict[label_1]["detection_indexes"].append(detection_index_2)
                related_dict[label_1]["mask_indexes"].append(mask_index_2)

            if mask_index_1 not in related_dict[label_2]["mask_indexes"]:
                related_dict[label_2]["labels"].append(label_1)

                related_dict[label_2]["input_image_indexes"].append(input_index_1)
                related_dict[label_2]["detection_indexes"].append(detection_index_1)
                related_dict[label_2]["mask_indexes"].append(mask_index_1)

        # Para cada label que contenha interseções
        for label, related in related_dict.items():
            # Criar a estrutura de dados
            relations.append(
                {
                    "label": label,
                    "related": {
                        "labels": related["labels"],
                        "input_image_indexes": related["input_image_indexes"],
                        "detection_indexes": related["detection_indexes"],
                        "mask_indexes": related["mask_indexes"]
                    }
                }
            )

        return relations

    def run(self):
        concepts = self.get_concepts_structure(self.labels_data)
        intersections = self.get_intersections_structure(concepts)
        relations = self.get_relations_structure(intersections)

        data = []
        data.append({
            "concepts": concepts,
            "intersections": intersections,
            "relations": relations,
        })

        return data


# ------------------------------------------------------------------------------

if __name__ == "__main__":
    concept = Concept(
        [
            {
                "input_image_index": 0,
                "detection_index": 0,
                "mask_index": 0,
                "label": "dog",
            },
            {
                "input_image_index": 1,
                "detection_index": 0,
                "mask_index": 1,
                "label": "dog",
            },
            {
                "input_image_index": 0,
                "detection_index": 1,
                "mask_index": 2,
                "label": "cat",
            },
            {
                "input_image_index": 0,
                "detection_index": 2,
                "mask_index": 3,
                "label": "cow",
            },
            {
                "input_image_index": 0,
                "detection_index": 3,
                "mask_index": 4,
                "label": "car",
            },
        ]
    )
    concepts = concept.run()
    print(concepts)

from itertools import combinations
import requests


class Concept:
    def __init__(self, labels_data):
        self.labels_data = labels_data

    def get_related_concepts(self, label):
        relation_type = "RelatedTo"
        limit = 50
        
        # Obter todos os conceitos relacionados para determinada label
        try:
            response = requests.get(f"https://api.conceptnet.io/query?node=/c/en/{label}&rel=/r/{relation_type}&filter=/c/en&limit={limit}").json()            
            concepts = {edge["end"]["label"] for edge in response["edges"]}
            return list(concepts)
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
                        "common_concepts": common_concepts,
                    }
                )

        return intersections

    def get_relations_structure(self, intersections_data, concepts_data):
            relations = []
            related_dict = {}
            
            # Criar dict para cada uma das labels provenientes da deteção
            for concept in concepts_data:
                label = concept["label"]
                input_image_index = concept["input_image_index"]
                detection_index = concept["detection_index"]
                
                if label in related_dict:
                    related_dict[label]["labels"].append(label)
                    related_dict[label]["input_image_indexes"].append(input_image_index)
                    related_dict[label]["detection_indexes"].append(detection_index)
                else:
                    related_dict[label] = {
                        "labels": [label],
                        "input_image_indexes": [input_image_index],
                        "detection_indexes": [detection_index]
                    }                    

            # Verificar interseções
            for intersection in intersections_data:
                label_1, label_2 = intersection["labels"]
                input_index_1, input_index_2 = intersection["input_image_indexes"]
                detection_index_1, detection_index_2 = intersection["detection_indexes"]
                
                if label_2 in related_dict:
                    related_dict[label_2]["labels"].append(label_1)
                    related_dict[label_2]["input_image_indexes"].append(input_index_1)
                    related_dict[label_2]["detection_indexes"].append(detection_index_1)
                
                if label_1 in related_dict:
                    related_dict[label_1]["labels"].append(label_2)
                    related_dict[label_1]["input_image_indexes"].append(input_index_2)
                    related_dict[label_1]["detection_indexes"].append(detection_index_2)
                
            # Criar estrutura de relações
            for label, related in related_dict.items():
                relations.append({
                    "label": label,
                    "related": {
                        "labels": related["labels"],
                        "input_image_indexes": related["input_image_indexes"],
                        "detection_indexes": related["detection_indexes"]
                    }
                })
                
            return relations
        
    def run(self):
        concepts = self.get_concepts_structure(self.labels_data)
        intersections = self.get_intersections_structure(concepts)
        relations = self.get_relations_structure(intersections, self.labels_data)

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
                "detection_index": 1,
                "mask_index": 0,
                "label": "cat",
            },
            {
                "input_image_index": 2,
                "detection_index": 2,
                "mask_index": 1,
                "label": "cow",
            },
            {
                "input_image_index": 3,
                "detection_index": 3,
                "mask_index": 0,
                "label": "car",
            },
        ]
    )
    concepts = concept.run()
    print(concepts)
import config
from modules import segmentation, classification, concept, scene_graph

# def main(individual: bool, batch_mode: bool, debug: bool):
def pipeline(img_paths):
    
    # Classificação
    print("1. Classificação")
    class_output_json = classification.classify(config.YOLO_WEIGHTS, img_paths, config.CLASS_OUPUTS)
    
    concepts = [label["label"] for label in class_output_json]
    print(concepts)

    # Segmentação de Imagem
    print("2. Segmentação")
    segmentation.seg_fastsam(config.FASTSAM_WEIGHTS, img_paths, config.SEG_OUTPUTS)

    # ConceptNet
    print("3. Rede Conceptual")
    # concepts = {"person", "cat", "dog", "horse", "book", "library", ""}    
    edges = concept.conceptRelations(concepts)
    # print(edges)

    # Scene Graph
    print("4. Scene Graph")
    graph_json = scene_graph.drawGraph(concepts, edges)
    print(graph_json)
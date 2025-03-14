import config
from modules import segmentation, classification, concept, scene_graph

# def main(individual: bool, batch_mode: bool, debug: bool):
def main():
    # Segmentação de Imagem
    print("1. Segmentação")
    # segmentation.seg_fastsam(config.FASTSAM_WEIGHTS, config.SEG_INPUTS, config.SEG_OUTPUTS)
    # concepts = mask2former()
    
    # Classificação
    print("2. Classificação")
    concepts = classification.classify('fastsam', config.YOLO_WEIGHTS, config.SEG_OUTPUTS, config.CLASS_OUPUTS)

    # ConceptNet
    print("3. Rede Conceptual")
    # concepts = {"person", "cat", "dog", "horse", "book", "library", ""}    
    edges = concept.conceptRelations(concepts)
    # print(edges)

    # Scene Graph
    print("4. Scene Graph")
    scene_graph.drawGraph(concepts, edges)

main()
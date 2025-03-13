from modules import segmentation, classification, concept, scene_graph

# def main(individual: bool, batch_mode: bool, debug: bool):
def main():
    # Segmentação de Imagem
    print("1. Segmentação")
    segmentation.seg_fastsam()
    # concepts = mask2former()
    
    # Classificação
    print("2. Classificação")
    concepts = classification.classify()

    # ConceptNet
    print("3. Rede Conceptual")
    concepts = {"person", "cat", "dog", "horse", "book", "library", ""}    
    edges = concept.conceptRelations(concepts)
    print(edges)

    # Scene Graph
    print("4. Scene Graph")
    scene_graph.drawGraph(concepts, edges)

main()
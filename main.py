from modules import fastsam, classification, concept_relations
from modules.scene_graph import drawGraph

def main():
    # Segmentação de Imagem
    print("1. Segmentação")
    # fastsam()
    # concepts = mask2former()
    
    # Classificação
    print("2. Classificação")
    # concepts = classification()

    # ConceptNet
    print("3. Rede Conceptual")
    concepts = {"person", "cat", "dog", "horse", "book", "library", ""}    
    edges = concept_relations(concepts)

    # Scene Graph
    print("4. Scene Graph")
    drawGraph(concepts, edges)

main()
from modules import fastsam, classification
from modules.concept import getConcepts, checkRelations
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
    concepts = ["person", "cat", "dog", "horse", "book", "library", ""]
    related = getConcepts(concepts)    
    
    # Scene Graph
    print("4. Scene Graph")
    edges = checkRelations(concepts, related)
    drawGraph(concepts, edges)

main()
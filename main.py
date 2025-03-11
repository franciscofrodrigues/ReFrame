from modules import fastsam, mask2former, classification, getConcepts, checkRelations, drawGraph

def main():
    # Segmentação de Imagem
    print("1. Segmentação")
    # fastsam()
    # concepts = mask2former()
    
    # Object Classification
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
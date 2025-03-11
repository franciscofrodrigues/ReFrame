from modules import fastsam, classification, getConcepts, checkRelations, drawGraph

def main():
    # Segmentação de Imagem
    print("1 - Segmentação")
    # fastsam()
    
    # Object Classification
    print("2 - Classificação")
    concepts = classification()

    # ConceptNet
    print("3 - Rede Conceptual")
    # concepts = ["person", "cat", "dog", "horse", "book", "library", ""]
    related = getConcepts(concepts)    
    
    # Scene Graph
    print("4 - Scene Graph")
    edges = checkRelations(concepts, related)
    drawGraph(concepts, edges)

main()
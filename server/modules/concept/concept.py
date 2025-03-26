import requests
from itertools import combinations

# Conceitos relacionados a determinada palavra
def relatedConcepts(word: str) -> set[str]:
    response = requests.get(f'http://api.conceptnet.io/c/en/{word}').json()
    return {edge['end']['label'] for edge in response['edges']}

# Guardar todos os conceitos relacionados
def getConcepts(concepts: set[str]) -> dict[str, set[str]]:
    return {concept: relatedConcepts(concept) for concept in concepts}

# Verificar relações entre palavras
def checkRelations(concepts: set[str], related: dict[str, set[str]]) -> list[tuple[str,str]]:
    edges = []
    for c1, c2 in combinations(concepts, 2):
        if related[c1] & related[c2]:
            edges.append((c1, c2)) # Ligações do Gráfico
    return edges

# ------------------------------------------------------------------------------

def main(concepts: set[str]):
    related = getConcepts(concepts)
    edges = checkRelations(concepts, related)
    return edges

if __name__ == "__main__":
    main()

# response.keys()
## dict_keys(['@context', '@id', 'edges', 'version', 'view'])
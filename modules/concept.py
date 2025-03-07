import requests
from itertools import combinations

# Conceitos relacionados a determinada palavra
def relatedConcepts(word):
    response = requests.get(f'http://api.conceptnet.io/c/en/{word}').json()
    related = set()

    for edge in response['edges']:
        related.add(edge['end']['label'])
    return related

# Guardar todos os conceitos relacionados
def getConcepts(concepts):
    related = {}
    for concept in concepts:
        related[concept] = relatedConcepts(concept)
    return related

# Verificar relações entre palavras
def checkRelations(concepts, related):
    edges = []
    for c1, c2 in combinations(concepts, 2):
        if related[c1].intersection(related[c2]):
            edges.append((c1, c2)) # Ligações do Gráfico

    return edges

# response.keys()
## dict_keys(['@context', '@id', 'edges', 'version', 'view'])
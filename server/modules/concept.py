from itertools import combinations
import requests

class Concept:
    def __init__(self, concepts):
        self.concepts = set(concepts)
        self.related = {}

    # Conceitos relacionados a determinada palavra
    def related_concepts(self, word):
        try:
            response = requests.get(f'http://api.conceptnet.io/c/en/{word}').json()
            return {edge['end']['label'] for edge in response['edges']}
        except requests.RequestException:
            return {}

    def get_concepts(self):
        self.related = {concept: self.related_concepts(concept) for concept in self.concepts}
        return self.related

    # Verificar relações entre palavras
    def check_relations(self):
        edges = []
        for c1, c2 in combinations(self.concepts, 2):
            if self.related[c1] & self.related[c2]:
                edges.append((c1, c2))  # Ligações do Gráfico
        return edges

    def run(self):
        concepts = self.get_concepts()
        edges = self.check_relations()

        return {
            "concepts": concepts,
            "edges": edges
        }

# ------------------------------------------------------------------------------

if __name__ == "__main__":
    graph = Concept(["dog", "cat"])
    edges = graph.run()
    print(edges)
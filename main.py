from modules import getConcepts, checkRelations # Concept
from modules import drawGraph # Scene Graph

concepts = ["person", "cat", "dog", "horse", "book", "library"]
related = getConcepts(concepts) # ConceptNet

edges = checkRelations(concepts, related)

drawGraph(concepts, edges) # Scene Graph
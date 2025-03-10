from modules.concept.concept import getConcepts, checkRelations
from modules.scene_graph.scene_graph import drawGraph

concepts = ["person", "cat", "dog", "horse", "book", "library"]
related = getConcepts(concepts)

edges = checkRelations(concepts, related)

drawGraph(concepts, edges)
from modules.concept import getConcepts, checkRelations
from modules.sceneGraph import drawGraph

concepts = ["person", "cat", "dog", "horse", "book", "library"]
related = getConcepts(concepts)

edges = checkRelations(concepts, related)

drawGraph(concepts, edges)
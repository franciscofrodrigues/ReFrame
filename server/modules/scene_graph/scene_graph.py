# import networkx as nx
# import matplotlib.pyplot as plt
import json

# # Gráfico
# def drawGraph(concepts, edges):
#     G = nx.Graph()
#     G.add_nodes_from(concepts) # Nodes
#     G.add_edges_from(edges) # Edges

#     plt.figure(figsize=(5, 5))
#     nx.draw(G, with_labels=True, node_color='white', edge_color='black', edgecolors='black', node_size=1000, font_size=10)
#     plt.show()


def drawGraph(concepts, edges):
    data = {
        "nodes": [{"id": concept} for concept in concepts],
        "edges": [{"node 1": origin, "node 2": destination} for origin, destination in edges]
    }
    
    return json.dumps(data, indent=2)
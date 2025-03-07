import networkx as nx
import matplotlib.pyplot as plt

# Gráfico
def drawGraph(concepts, edges):
    G = nx.Graph()
    G.add_nodes_from(concepts) # Nodes
    G.add_edges_from(edges) # Edges

    plt.figure(figsize=(5, 5))
    nx.draw(G, with_labels=True, node_color='white', edge_color='black', node_size=1000, font_size=10)
    plt.show()
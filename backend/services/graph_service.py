from typing import Dict, List, Optional
from models import Graph, Node, Edge, GraphType
from algorithms import BFSAlgorithm, DFSAlgorithm, get_neighbor_order_function


class GraphService:
    def __init__(self):
        self.graphs: Dict[str, Graph] = {}
        self.bfs_sessions: Dict[str, BFSAlgorithm] = {}

    def create_graph(self, graph_id: str, name: str, graph_type: GraphType = GraphType.UNDIRECTED) -> Graph:
        graph = Graph(id=graph_id, name=name, graph_type=graph_type)
        self.graphs[graph_id] = graph
        return graph

    def get_graph(self, graph_id: str) -> Optional[Graph]:
        return self.graphs.get(graph_id)

    def get_all_graphs(self) -> List[Graph]:
        return list(self.graphs.values())

    def update_graph(self, graph_id: str, graph: Graph) -> Graph:
        self.graphs[graph_id] = graph
        return graph

    def delete_graph(self, graph_id: str) -> bool:
        if graph_id in self.graphs:
            del self.graphs[graph_id]
            if graph_id in self.bfs_sessions:
                del self.bfs_sessions[graph_id]
            return True
        return False

    def add_node(self, graph_id: str, node: Node) -> Graph:
        graph = self.get_graph(graph_id)
        if not graph:
            raise ValueError(f"Graph {graph_id} not found")

        graph.add_node(node)
        return graph

    def remove_node(self, graph_id: str, node_id: str) -> Graph:
        graph = self.get_graph(graph_id)
        if not graph:
            raise ValueError(f"Graph {graph_id} not found")

        graph.remove_node(node_id)
        return graph

    def add_edge(self, graph_id: str, edge: Edge) -> Graph:
        graph = self.get_graph(graph_id)
        if not graph:
            raise ValueError(f"Graph {graph_id} not found")

        graph.add_edge(edge)
        return graph

    def remove_edge(self, graph_id: str, edge_id: str) -> Graph:
        graph = self.get_graph(graph_id)
        if not graph:
            raise ValueError(f"Graph {graph_id} not found")

        graph.remove_edge(edge_id)
        return graph

    def prepare_bfs(self, graph_id: str, start: str, goal: str, order_type: str = "id_asc"):
        return self.prepare_search(graph_id, start, goal, order_type, "bfs")

    def prepare_search(self, graph_id: str, start: str, goal: str, order_type: str = "id_asc", algorithm_type: str = "bfs"):
        graph = self.get_graph(graph_id)
        if not graph:
            raise ValueError(f"Graph {graph_id} not found")

        validation = graph.validate()
        if not validation.valid:
            raise ValueError(f"Graph validation failed: {', '.join(validation.errors)}")

        if not graph.are_nodes_connected(start, goal):
            raise ValueError(f"Path does not exist: nodes {start} and {goal} are in different connected components")

        algorithm_classes = {
            "bfs": BFSAlgorithm,
            "dfs": DFSAlgorithm,
        }
        algorithm_class = algorithm_classes.get(algorithm_type)
        if algorithm_class is None:
            raise ValueError(f"Unsupported algorithm: {algorithm_type}")

        algorithm = algorithm_class()
        neighbor_fn = get_neighbor_order_function(order_type, graph)
        result = algorithm.search(graph, start, goal, neighbor_fn)

        if isinstance(algorithm, BFSAlgorithm):
            self.bfs_sessions[graph_id] = algorithm
        return result


graph_service = GraphService()

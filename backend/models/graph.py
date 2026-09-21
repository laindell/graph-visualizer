from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from enum import Enum
from collections import deque, defaultdict
from .node import Node
from .edge import Edge


class GraphType(str, Enum):
    UNDIRECTED = "undirected"
    DIRECTED = "directed"
    TREE = "tree"
    MIXED = "mixed"


class ValidationResult(BaseModel):
    valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)


class Graph(BaseModel):
    id: str
    name: str
    nodes: Dict[str, Node] = Field(default_factory=dict)
    edges: Dict[str, Edge] = Field(default_factory=dict)
    graph_type: GraphType = Field(default=GraphType.UNDIRECTED)
    adjacency_list: Dict[str, List[str]] = Field(default_factory=dict)

    class Config:
        use_enum_values = True

    def add_node(self, node: Node) -> None:
        self.nodes[node.id] = node
        if node.id not in self.adjacency_list:
            self.adjacency_list[node.id] = []

    def add_edge(self, edge: Edge) -> None:
        if edge.source not in self.nodes:
            raise ValueError(f"Source node {edge.source} does not exist")
        if edge.target not in self.nodes:
            raise ValueError(f"Target node {edge.target} does not exist")

        self.edges[edge.id] = edge
        self.build_adjacency_list()

    def remove_node(self, node_id: str) -> None:
        if node_id not in self.nodes:
            raise ValueError(f"Node {node_id} does not exist")

        del self.nodes[node_id]
        edges_to_remove = [
            edge_id for edge_id, edge in self.edges.items()
            if edge.source == node_id or edge.target == node_id
        ]
        for edge_id in edges_to_remove:
            del self.edges[edge_id]

        self.build_adjacency_list()

    def remove_edge(self, edge_id: str) -> None:
        if edge_id not in self.edges:
            raise ValueError(f"Edge {edge_id} does not exist")

        del self.edges[edge_id]
        self.build_adjacency_list()

    def build_adjacency_list(self) -> None:
        self.adjacency_list = {node_id: [] for node_id in self.nodes.keys()}

        for edge in self.edges.values():
            if edge.directed:
                self.adjacency_list[edge.source].append(edge.target)
            else:
                self.adjacency_list[edge.source].append(edge.target)
                self.adjacency_list[edge.target].append(edge.source)

    def validate(self) -> ValidationResult:
        errors = []
        warnings = []

        if len(self.nodes) > 1000:
            errors.append(f"Graph exceeds maximum node limit: {len(self.nodes)} nodes (max 1000)")

        if len(self.edges) > 5000:
            errors.append(f"Graph exceeds maximum edge limit: {len(self.edges)} edges (max 5000)")

        for edge_id, edge in self.edges.items():
            if edge.source not in self.nodes:
                errors.append(f"Edge {edge_id} references non-existent source node {edge.source}")
            if edge.target not in self.nodes:
                errors.append(f"Edge {edge_id} references non-existent target node {edge.target}")

        if self.graph_type == GraphType.TREE:
            has_cycle = self._detect_cycle()
            if has_cycle:
                errors.append("Tree contains cycles")

            if len(self.edges) != len(self.nodes) - 1 and len(self.nodes) > 0:
                warnings.append(f"Tree should have n-1 edges for n nodes. Current: {len(self.nodes)} nodes, {len(self.edges)} edges")

        return ValidationResult(valid=len(errors) == 0, errors=errors, warnings=warnings)

    def _detect_cycle(self) -> bool:
        visited = set()
        rec_stack = set()

        def dfs(node: str, parent: Optional[str] = None) -> bool:
            visited.add(node)
            rec_stack.add(node)

            for neighbor in self.adjacency_list.get(node, []):
                if neighbor not in visited:
                    if dfs(neighbor, node):
                        return True
                elif neighbor in rec_stack and neighbor != parent:
                    return True

            rec_stack.remove(node)
            return False

        for node_id in self.nodes.keys():
            if node_id not in visited:
                if dfs(node_id):
                    return True

        return False

    def find_connected_components(self) -> List[List[str]]:
        visited = set()
        components = []

        def bfs(start: str) -> List[str]:
            component = []
            queue = deque([start])
            visited.add(start)

            while queue:
                node = queue.popleft()
                component.append(node)

                for neighbor in self.adjacency_list.get(node, []):
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)

            return component

        for node_id in self.nodes.keys():
            if node_id not in visited:
                components.append(bfs(node_id))

        return components

    def are_nodes_connected(self, start: str, goal: str) -> bool:
        if start not in self.nodes or goal not in self.nodes:
            return False

        components = self.find_connected_components()
        for component in components:
            if start in component and goal in component:
                return True

        return False

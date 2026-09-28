from pydantic import BaseModel, Field
from typing import List, Dict, Set, Optional, Callable
from collections import deque
from enum import Enum
import time


class BFSAction(str, Enum):
    VISIT = "VISIT"
    ENQUEUE = "ENQUEUE"
    COMPLETE = "COMPLETE"
    NO_PATH = "NO_PATH"


class BFSStep(BaseModel):
    step_number: int
    current_node: str
    queue: List[str]
    visited: List[str]
    parent: Dict[str, Optional[str]]
    action: BFSAction

    class Config:
        use_enum_values = True


class BFSResult(BaseModel):
    path: List[str]
    path_length: int
    steps_count: int
    visited_nodes: int
    execution_time_ms: float
    start_node: str
    goal_node: str
    history: List[BFSStep]
    algorithm_type: str = "bfs"

    class Config:
        json_schema_extra = {
            "example": {
                "path": ["n0", "n3", "n7", "n15"],
                "path_length": 4,
                "steps_count": 42,
                "visited_nodes": 23,
                "execution_time_ms": 0.153,
                "start_node": "n0",
                "goal_node": "n15",
                "history": []
            }
        }


class SearchAlgorithm:
    def search(self, graph, start: str, goal: str, **kwargs):
        raise NotImplementedError

    def get_steps(self) -> List[BFSStep]:
        raise NotImplementedError


class BFSAlgorithm(SearchAlgorithm):
    def __init__(self):
        self.history: List[BFSStep] = []

    def search(
        self,
        graph,
        start: str,
        goal: str,
        neighbor_order_fn: Optional[Callable[[List[str]], List[str]]] = None
    ) -> BFSResult:
        if neighbor_order_fn is None:
            neighbor_order_fn = lambda x: sorted(x)

        if start not in graph.nodes:
            raise ValueError(f"Start node {start} does not exist in graph")
        if goal not in graph.nodes:
            raise ValueError(f"Goal node {goal} does not exist in graph")

        if not graph.are_nodes_connected(start, goal):
            return BFSResult(
                path=[],
                path_length=0,
                steps_count=0,
                visited_nodes=0,
                execution_time_ms=0.0,
                start_node=start,
                goal_node=goal,
                history=[BFSStep(
                    step_number=0,
                    current_node=start,
                    queue=[],
                    visited=[start],
                    parent={start: None},
                    action=BFSAction.NO_PATH
                )]
            )

        start_time = time.time()

        queue = deque([start])
        visited = {start}
        parent = {start: None}
        self.history = []
        step = 0

        while queue:
            current = queue.popleft()

            self.history.append(BFSStep(
                step_number=step,
                current_node=current,
                queue=list(queue),
                visited=list(visited),
                parent=parent.copy(),
                action=BFSAction.VISIT
            ))

            if current == goal:
                path = self._reconstruct_path(parent, start, goal)
                execution_time = (time.time() - start_time) * 1000

                self.history.append(BFSStep(
                    step_number=step + 1,
                    current_node=goal,
                    queue=[],
                    visited=list(visited),
                    parent=parent.copy(),
                    action=BFSAction.COMPLETE
                ))

                return BFSResult(
                    path=path,
                    path_length=len(path),
                    steps_count=step + 1,
                    visited_nodes=len(visited),
                    execution_time_ms=round(execution_time, 3),
                    start_node=start,
                    goal_node=goal,
                    history=self.history
                )

            neighbors = graph.adjacency_list.get(current, [])
            neighbors = neighbor_order_fn(neighbors)

            for neighbor in neighbors:
                if neighbor not in visited:
                    visited.add(neighbor)
                    parent[neighbor] = current
                    queue.append(neighbor)

                    self.history.append(BFSStep(
                        step_number=step,
                        current_node=neighbor,
                        queue=list(queue),
                        visited=list(visited),
                        parent=parent.copy(),
                        action=BFSAction.ENQUEUE
                    ))

            step += 1

        execution_time = (time.time() - start_time) * 1000

        return BFSResult(
            path=[],
            path_length=0,
            steps_count=step,
            visited_nodes=len(visited),
            execution_time_ms=round(execution_time, 3),
            start_node=start,
            goal_node=goal,
            history=self.history
        )

    def _reconstruct_path(self, parent: Dict[str, Optional[str]], start: str, goal: str) -> List[str]:
        path = []
        current = goal

        while current is not None:
            path.append(current)
            current = parent[current]

        path.reverse()
        return path

    def get_steps(self) -> List[BFSStep]:
        return self.history


class DFSAlgorithm(SearchAlgorithm):
    def __init__(self):
        self.history: List[BFSStep] = []

    def search(
        self,
        graph,
        start: str,
        goal: str,
        neighbor_order_fn: Optional[Callable[[List[str]], List[str]]] = None
    ) -> BFSResult:
        if neighbor_order_fn is None:
            neighbor_order_fn = lambda neighbors: sorted(neighbors)

        if start not in graph.nodes:
            raise ValueError(f"Start node {start} does not exist in graph")
        if goal not in graph.nodes:
            raise ValueError(f"Goal node {goal} does not exist in graph")

        start_time = time.time()
        stack = [start]
        visited = {start}
        parent = {start: None}
        self.history = []
        step = 0

        while stack:
            current = stack.pop()
            self.history.append(BFSStep(
                step_number=step,
                current_node=current,
                queue=list(stack),
                visited=list(visited),
                parent=parent.copy(),
                action=BFSAction.VISIT
            ))

            if current == goal:
                path = BFSAlgorithm()._reconstruct_path(parent, start, goal)
                execution_time = (time.time() - start_time) * 1000
                self.history.append(BFSStep(
                    step_number=step + 1,
                    current_node=goal,
                    queue=[],
                    visited=list(visited),
                    parent=parent.copy(),
                    action=BFSAction.COMPLETE
                ))
                return BFSResult(
                    path=path,
                    path_length=len(path),
                    steps_count=step + 1,
                    visited_nodes=len(visited),
                    execution_time_ms=round(execution_time, 3),
                    start_node=start,
                    goal_node=goal,
                    history=self.history,
                    algorithm_type="dfs"
                )

            neighbors = neighbor_order_fn(graph.adjacency_list.get(current, []))
            for neighbor in reversed(neighbors):
                if neighbor not in visited:
                    visited.add(neighbor)
                    parent[neighbor] = current
                    stack.append(neighbor)
                    self.history.append(BFSStep(
                        step_number=step,
                        current_node=neighbor,
                        queue=list(stack),
                        visited=list(visited),
                        parent=parent.copy(),
                        action=BFSAction.ENQUEUE
                    ))
            step += 1

        execution_time = (time.time() - start_time) * 1000
        return BFSResult(
            path=[],
            path_length=0,
            steps_count=step,
            visited_nodes=len(visited),
            execution_time_ms=round(execution_time, 3),
            start_node=start,
            goal_node=goal,
            history=self.history,
            algorithm_type="dfs"
        )

    def get_steps(self) -> List[BFSStep]:
        return self.history


def get_neighbor_order_function(order_type: str, graph) -> Callable[[List[str]], List[str]]:
    order_functions = {
        "id_asc": lambda neighbors: sorted(neighbors),
        "id_desc": lambda neighbors: sorted(neighbors, reverse=True),
        "x_asc": lambda neighbors: sorted(neighbors, key=lambda n: graph.nodes[n].x),
        "x_desc": lambda neighbors: sorted(neighbors, key=lambda n: graph.nodes[n].x, reverse=True),
        "y_asc": lambda neighbors: sorted(neighbors, key=lambda n: graph.nodes[n].y),
        "y_desc": lambda neighbors: sorted(neighbors, key=lambda n: graph.nodes[n].y, reverse=True),
    }

    return order_functions.get(order_type, lambda neighbors: sorted(neighbors))

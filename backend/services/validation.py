from models import Graph, ValidationResult


class ValidationService:
    @staticmethod
    def validate_graph(graph: Graph) -> ValidationResult:
        return graph.validate()

    @staticmethod
    def validate_bfs_request(graph: Graph, start: str, goal: str) -> ValidationResult:
        errors = []
        warnings = []

        if start not in graph.nodes:
            errors.append(f"Start node '{start}' does not exist in graph")

        if goal not in graph.nodes:
            errors.append(f"Goal node '{goal}' does not exist in graph")

        if start == goal:
            warnings.append("Start and goal nodes are identical")

        if len(errors) == 0:
            if not graph.are_nodes_connected(start, goal):
                errors.append(f"Path does not exist: nodes '{start}' and '{goal}' are in different connected components")

        return ValidationResult(valid=len(errors) == 0, errors=errors, warnings=warnings)


validation_service = ValidationService()

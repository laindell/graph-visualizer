from models import Graph, Node, Edge, GraphType
import math
import random


def check_collision(x: float, y: float, existing_positions: list, min_distance: float = 80) -> bool:
    """Перевіряє чи нова позиція не перекривається з існуючими"""
    for ex, ey in existing_positions:
        distance = math.sqrt((x - ex) ** 2 + (y - ey) ** 2)
        if distance < min_distance:
            return True
    return False


def find_valid_position(base_x: float, base_y: float, existing_positions: list,
                        max_offset: float = 150, max_attempts: int = 50) -> tuple:
    """Знаходить валідну позицію поблизу базової точки без перекриттів"""
    for _ in range(max_attempts):
        offset_x = random.uniform(-max_offset, max_offset)
        offset_y = random.uniform(-max_offset, max_offset)
        new_x = base_x + offset_x
        new_y = base_y + offset_y

        if not check_collision(new_x, new_y, existing_positions):
            return new_x, new_y

    # Якщо не знайшли за max_attempts, повертаємо базову позицію з невеликим зсувом
    return base_x + random.uniform(-50, 50), base_y + random.uniform(-50, 50)


def generate_default_graph() -> Graph:
    """Неорієнтований граф - 35 вершин, 5 гілок (розкидані позиції)"""
    random.seed(42)

    graph = Graph(
        id="undirected_graph",
        name="Неорієнтований граф - 35 вершин",
        graph_type=GraphType.UNDIRECTED
    )

    width, height = 1400, 900
    center_x, center_y = width / 2, height / 2

    positions = []

    # Центральна вершина
    central_node = Node(id="n0", label="n0", x=center_x, y=center_y)
    graph.add_node(central_node)
    positions.append((center_x, center_y))

    node_counter = 1
    branches = 5
    nodes_per_branch = 6

    for branch_idx in range(branches):
        angle_base = (2 * math.pi / branches) * branch_idx

        for level in range(1, nodes_per_branch + 1):
            # Базова позиція з варіаціями
            radius = 120 + (level * 100)
            angle_variation = random.uniform(-0.3, 0.3)
            angle = angle_base + angle_variation

            base_x = center_x + radius * math.cos(angle)
            base_y = center_y + radius * math.sin(angle)

            # Знаходимо валідну позицію без перекриттів
            x, y = find_valid_position(base_x, base_y, positions, max_offset=120)
            positions.append((x, y))

            node_id = f"n{node_counter}"
            node = Node(id=node_id, label=node_id, x=x, y=y)
            graph.add_node(node)

            if level == 1:
                parent_id = "n0"
            else:
                parent_id = f"n{node_counter - 1}"

            edge_id = f"e_{parent_id}_{node_id}"
            edge = Edge(id=edge_id, source=parent_id, target=node_id, directed=False)
            graph.add_edge(edge)

            node_counter += 1

    # Крос-з'єднання між гілками для створення циклів
    cross_connections = [
        (1, 7), (3, 9), (5, 11), (8, 14), (10, 16),
        (12, 18), (15, 21), (17, 23), (19, 25), (22, 28), (24, 30)
    ]

    for idx, (source_num, target_num) in enumerate(cross_connections):
        source_id = f"n{source_num}"
        target_id = f"n{target_num}"

        if source_id in graph.nodes and target_id in graph.nodes:
            edge_id = f"e_cross_{idx}"
            edge = Edge(id=edge_id, source=source_id, target=target_id, directed=False)
            graph.add_edge(edge)

    return graph


def generate_tree_graph() -> Graph:
    """Дерево - 31 вершина, бінарне дерево"""
    graph = Graph(
        id="tree_graph",
        name="Дерево - 31 вершина",
        graph_type=GraphType.TREE
    )

    width, height = 1600, 700
    root_x, root_y = width / 2, 80
    level_height = 120

    def build_tree(node_id: int, level: int, x: float, y: float, h_spacing: float):
        if level >= 5 or node_id >= 31:
            return

        label = f"t{node_id}"
        node = Node(id=label, label=label, x=x, y=y)
        graph.add_node(node)

        if level < 4:
            left_id = 2 * node_id + 1
            right_id = 2 * node_id + 2

            next_y = y + level_height
            next_spacing = h_spacing / 2

            if left_id < 31:
                left_x = x - h_spacing
                build_tree(left_id, level + 1, left_x, next_y, next_spacing)
                edge = Edge(
                    id=f"te_{node_id}_{left_id}",
                    source=label,
                    target=f"t{left_id}",
                    directed=False
                )
                graph.add_edge(edge)

            if right_id < 31:
                right_x = x + h_spacing
                build_tree(right_id, level + 1, right_x, next_y, next_spacing)
                edge = Edge(
                    id=f"te_{node_id}_{right_id}",
                    source=label,
                    target=f"t{right_id}",
                    directed=False
                )
                graph.add_edge(edge)

    build_tree(0, 0, root_x, root_y, 300)

    return graph


def generate_directed_graph() -> Graph:
    """Орієнтований граф - 35 вершин, 5 гілок (розкидані позиції)"""
    random.seed(43)

    graph = Graph(
        id="directed_graph",
        name="Орієнтований граф - 35 вершин",
        graph_type=GraphType.DIRECTED
    )

    width, height = 1400, 900
    center_x, center_y = width / 2, height / 2

    positions = []

    central_node = Node(id="d0", label="d0", x=center_x, y=center_y)
    graph.add_node(central_node)
    positions.append((center_x, center_y))

    node_counter = 1
    branches = 5
    nodes_per_branch = 6

    for branch_idx in range(branches):
        angle_base = (2 * math.pi / branches) * branch_idx

        for level in range(1, nodes_per_branch + 1):
            radius = 120 + (level * 100)
            angle_variation = random.uniform(-0.3, 0.3)
            angle = angle_base + angle_variation

            base_x = center_x + radius * math.cos(angle)
            base_y = center_y + radius * math.sin(angle)

            x, y = find_valid_position(base_x, base_y, positions, max_offset=120)
            positions.append((x, y))

            node_id = f"d{node_counter}"
            node = Node(id=node_id, label=node_id, x=x, y=y)
            graph.add_node(node)

            if level == 1:
                parent_id = "d0"
            else:
                parent_id = f"d{node_counter - 1}"

            edge_id = f"ed_{parent_id}_{node_id}"
            edge = Edge(id=edge_id, source=parent_id, target=node_id, directed=True)
            graph.add_edge(edge)

            node_counter += 1

    # Додаткові дуги між гілками (однонапрямлені)
    cross_connections = [
        (1, 7), (3, 9), (5, 11), (8, 14), (10, 16),
        (12, 18), (15, 21), (17, 23), (19, 25), (22, 28)
    ]

    for idx, (source_num, target_num) in enumerate(cross_connections):
        source_id = f"d{source_num}"
        target_id = f"d{target_num}"

        if source_id in graph.nodes and target_id in graph.nodes:
            edge_id = f"ed_cross_{idx}"
            edge = Edge(id=edge_id, source=source_id, target=target_id, directed=True)
            graph.add_edge(edge)

    return graph


def generate_mixed_graph() -> Graph:
    """Змішаний граф - 35 вершин, комбінація ребер і дуг (розкидані позиції)"""
    random.seed(44)

    graph = Graph(
        id="mixed_graph",
        name="Змішаний граф - 35 вершин",
        graph_type=GraphType.MIXED
    )

    width, height = 1400, 900
    center_x, center_y = width / 2, height / 2

    positions = []

    central_node = Node(id="m0", label="m0", x=center_x, y=center_y)
    graph.add_node(central_node)
    positions.append((center_x, center_y))

    node_counter = 1
    branches = 5
    nodes_per_branch = 6

    for branch_idx in range(branches):
        angle_base = (2 * math.pi / branches) * branch_idx

        for level in range(1, nodes_per_branch + 1):
            radius = 120 + (level * 100)
            angle_variation = random.uniform(-0.3, 0.3)
            angle = angle_base + angle_variation

            base_x = center_x + radius * math.cos(angle)
            base_y = center_y + radius * math.sin(angle)

            x, y = find_valid_position(base_x, base_y, positions, max_offset=120)
            positions.append((x, y))

            node_id = f"m{node_counter}"
            node = Node(id=node_id, label=node_id, x=x, y=y)
            graph.add_node(node)

            if level == 1:
                parent_id = "m0"
            else:
                parent_id = f"m{node_counter - 1}"

            edge_id = f"em_{parent_id}_{node_id}"
            # Перші 3 гілки - неорієнтовані, останні 2 - орієнтовані
            is_directed = branch_idx >= 3
            edge = Edge(id=edge_id, source=parent_id, target=node_id, directed=is_directed)
            graph.add_edge(edge)

            node_counter += 1

    # Крос-з'єднання - комбінація ребер і дуг
    cross_connections = [
        (1, 7, False), (3, 9, True), (5, 11, False), (8, 14, True), (10, 16, False),
        (12, 18, True), (15, 21, False), (17, 23, True), (19, 25, False), (22, 28, True)
    ]

    for idx, (source_num, target_num, is_directed) in enumerate(cross_connections):
        source_id = f"m{source_num}"
        target_id = f"m{target_num}"

        if source_id in graph.nodes and target_id in graph.nodes:
            edge_id = f"em_cross_{idx}"
            edge = Edge(id=edge_id, source=source_id, target=target_id, directed=is_directed)
            graph.add_edge(edge)

    return graph


graph_generator = {
    "default": generate_default_graph,
    "undirected": generate_default_graph,
    "tree": generate_tree_graph,
    "directed": generate_directed_graph,
    "mixed": generate_mixed_graph
}

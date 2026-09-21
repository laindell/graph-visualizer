from lxml import etree
from typing import Dict
from models import Graph, Node, Edge, GraphType


class GraphMLParser:
    GRAPHML_NS = "http://graphml.graphdrawing.org/xmlns"
    NSMAP = {None: GRAPHML_NS}

    @staticmethod
    def to_graphml(graph: Graph) -> str:
        graphml = etree.Element("{%s}graphml" % GraphMLParser.GRAPHML_NS, nsmap=GraphMLParser.NSMAP)

        key_x = etree.SubElement(graphml, "key", id="x", **{"for": "node", "attr.name": "x", "attr.type": "double"})
        key_y = etree.SubElement(graphml, "key", id="y", **{"for": "node", "attr.name": "y", "attr.type": "double"})
        key_label = etree.SubElement(graphml, "key", id="label", **{"for": "node", "attr.name": "label", "attr.type": "string"})
        key_weight = etree.SubElement(graphml, "key", id="weight", **{"for": "edge", "attr.name": "weight", "attr.type": "double"})
        key_directed = etree.SubElement(graphml, "key", id="directed", **{"for": "edge", "attr.name": "directed", "attr.type": "boolean"})

        edge_default = "directed" if graph.graph_type == GraphType.DIRECTED else "undirected"
        graph_elem = etree.SubElement(graphml, "graph", id=graph.id, edgedefault=edge_default)

        for node in graph.nodes.values():
            node_elem = etree.SubElement(graph_elem, "node", id=node.id)
            etree.SubElement(node_elem, "data", key="x").text = str(node.x)
            etree.SubElement(node_elem, "data", key="y").text = str(node.y)
            etree.SubElement(node_elem, "data", key="label").text = node.label

        for edge in graph.edges.values():
            edge_elem = etree.SubElement(graph_elem, "edge", id=edge.id, source=edge.source, target=edge.target)
            etree.SubElement(edge_elem, "data", key="weight").text = str(edge.weight)
            etree.SubElement(edge_elem, "data", key="directed").text = str(edge.directed).lower()

        return etree.tostring(graphml, pretty_print=True, xml_declaration=True, encoding='UTF-8').decode('utf-8')

    @staticmethod
    def from_graphml(xml_content: str) -> Graph:
        try:
            root = etree.fromstring(xml_content.encode('utf-8'))
        except etree.XMLSyntaxError as e:
            raise ValueError(f"Invalid XML syntax: {e}")

        ns = {'gml': GraphMLParser.GRAPHML_NS}
        graph_elem = root.find('.//gml:graph', ns)

        if graph_elem is None:
            raise ValueError("No graph element found in GraphML")

        graph_id = graph_elem.get('id', 'imported_graph')
        edge_default = graph_elem.get('edgedefault', 'undirected')
        graph_type = GraphType.DIRECTED if edge_default == 'directed' else GraphType.UNDIRECTED

        graph = Graph(id=graph_id, name=graph_id, graph_type=graph_type)

        for node_elem in graph_elem.findall('.//gml:node', ns):
            node_id = node_elem.get('id')
            if not node_id:
                raise ValueError("Node missing required 'id' attribute")

            x = 0.0
            y = 0.0
            label = node_id

            for data_elem in node_elem.findall('.//gml:data', ns):
                key = data_elem.get('key')
                value = data_elem.text

                if key == 'x':
                    x = float(value)
                elif key == 'y':
                    y = float(value)
                elif key == 'label':
                    label = value

            node = Node(id=node_id, label=label, x=x, y=y)
            graph.add_node(node)

        for edge_elem in graph_elem.findall('.//gml:edge', ns):
            edge_id = edge_elem.get('id')
            source = edge_elem.get('source')
            target = edge_elem.get('target')

            if not all([edge_id, source, target]):
                raise ValueError("Edge missing required attributes (id, source, target)")

            weight = 1.0
            directed = (edge_default == 'directed')

            for data_elem in edge_elem.findall('.//gml:data', ns):
                key = data_elem.get('key')
                value = data_elem.text

                if key == 'weight':
                    weight = float(value)
                elif key == 'directed':
                    directed = value.lower() == 'true'

            edge = Edge(id=edge_id, source=source, target=target, directed=directed, weight=weight)
            graph.add_edge(edge)

        return graph


graphml_parser = GraphMLParser()

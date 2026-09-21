from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from models import Graph, Node, Edge, GraphType, ValidationResult
from services.graph_service import graph_service
from services.validation import validation_service

router = APIRouter(prefix="/api/graphs", tags=["graphs"])


class CreateGraphRequest(BaseModel):
    name: str
    graph_type: GraphType = GraphType.UNDIRECTED


class BFSRequest(BaseModel):
    start_node: str
    goal_node: str
    order_type: str = "id_asc"


@router.post("", response_model=Graph)
async def create_graph(request: CreateGraphRequest):
    import uuid
    graph_id = str(uuid.uuid4())
    return graph_service.create_graph(graph_id, request.name, request.graph_type)


@router.get("", response_model=List[Graph])
async def get_graphs():
    return graph_service.get_all_graphs()


@router.get("/{graph_id}", response_model=Graph)
async def get_graph(graph_id: str):
    graph = graph_service.get_graph(graph_id)
    if not graph:
        raise HTTPException(status_code=404, detail=f"Graph {graph_id} not found")
    return graph


@router.put("/{graph_id}", response_model=Graph)
async def update_graph(graph_id: str, graph: Graph):
    if graph_id != graph.id:
        raise HTTPException(status_code=400, detail="Graph ID mismatch")
    return graph_service.update_graph(graph_id, graph)


@router.delete("/{graph_id}")
async def delete_graph(graph_id: str):
    success = graph_service.delete_graph(graph_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Graph {graph_id} not found")
    return {"message": "Graph deleted successfully"}


@router.post("/{graph_id}/nodes", response_model=Graph)
async def add_node(graph_id: str, node: Node):
    try:
        return graph_service.add_node(graph_id, node)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{graph_id}/nodes/{node_id}", response_model=Graph)
async def remove_node(graph_id: str, node_id: str):
    try:
        return graph_service.remove_node(graph_id, node_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{graph_id}/edges", response_model=Graph)
async def add_edge(graph_id: str, edge: Edge):
    try:
        return graph_service.add_edge(graph_id, edge)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{graph_id}/edges/{edge_id}", response_model=Graph)
async def remove_edge(graph_id: str, edge_id: str):
    try:
        return graph_service.remove_edge(graph_id, edge_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{graph_id}/validate", response_model=ValidationResult)
async def validate_graph(graph_id: str):
    graph = graph_service.get_graph(graph_id)
    if not graph:
        raise HTTPException(status_code=404, detail=f"Graph {graph_id} not found")
    return validation_service.validate_graph(graph)


@router.post("/{graph_id}/bfs")
async def run_bfs(graph_id: str, request: BFSRequest):
    graph = graph_service.get_graph(graph_id)
    if not graph:
        raise HTTPException(status_code=404, detail=f"Graph {graph_id} not found")

    validation = validation_service.validate_bfs_request(graph, request.start_node, request.goal_node)
    if not validation.valid:
        raise HTTPException(status_code=400, detail={"errors": validation.errors, "warnings": validation.warnings})

    try:
        result = graph_service.prepare_bfs(graph_id, request.start_node, request.goal_node, request.order_type)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

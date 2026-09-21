from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response
from typing import Optional
from pydantic import BaseModel
from services.export_service import export_service
from services.graph_service import graph_service
from utils.graphml_parser import graphml_parser
from utils.graph_generator import graph_generator

router = APIRouter(prefix="/api/graphs", tags=["import-export"])


@router.post("/import")
async def import_graph(file: UploadFile = File(...)):
    try:
        content = await file.read()
        xml_content = content.decode('utf-8')

        graph = graphml_parser.from_graphml(xml_content)
        graph_service.graphs[graph.id] = graph

        return {"message": "Graph imported successfully", "graph": graph}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid XML: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import failed: {str(e)}")


@router.get("/{graph_id}/export/xml")
async def export_xml(graph_id: str):
    graph = graph_service.get_graph(graph_id)
    if not graph:
        raise HTTPException(status_code=404, detail=f"Graph {graph_id} not found")

    xml_content = export_service.export_xml(graph)
    return Response(content=xml_content, media_type="application/xml", headers={
        "Content-Disposition": f"attachment; filename={graph.name}.graphml"
    })


@router.get("/{graph_id}/export/json")
async def export_json(graph_id: str):
    graph = graph_service.get_graph(graph_id)
    if not graph:
        raise HTTPException(status_code=404, detail=f"Graph {graph_id} not found")

    json_content = export_service.export_json(graph)
    return Response(content=json_content, media_type="application/json", headers={
        "Content-Disposition": f"attachment; filename={graph.name}.json"
    })


@router.get("/{graph_id}/export/cytoscape")
async def export_cytoscape(graph_id: str):
    graph = graph_service.get_graph(graph_id)
    if not graph:
        raise HTTPException(status_code=404, detail=f"Graph {graph_id} not found")

    cytoscape_json = export_service.export_cytoscape_json(graph)
    return Response(content=cytoscape_json, media_type="application/json", headers={
        "Content-Disposition": f"attachment; filename={graph.name}_cytoscape.json"
    })


class ReportRequest(BaseModel):
    bfs_result_forward: dict
    bfs_result_backward: Optional[dict] = None


@router.post("/{graph_id}/export/report")
async def export_report(graph_id: str, request: ReportRequest):
    graph = graph_service.get_graph(graph_id)
    if not graph:
        raise HTTPException(status_code=404, detail=f"Graph {graph_id} not found")

    from algorithms import BFSResult

    bfs_forward = BFSResult(**request.bfs_result_forward)
    bfs_backward = BFSResult(**request.bfs_result_backward) if request.bfs_result_backward else None

    markdown_content = export_service.export_markdown_report(graph, bfs_forward, bfs_backward)
    return Response(content=markdown_content, media_type="text/markdown", headers={
        "Content-Disposition": f"attachment; filename={graph.name}_report.md"
    })


@router.post("/load-example/{example_name}")
async def load_example_graph(example_name: str):
    if example_name not in graph_generator:
        raise HTTPException(status_code=404, detail=f"Example graph '{example_name}' not found")

    graph = graph_generator[example_name]()
    graph_service.graphs[graph.id] = graph

    return {"message": f"Example graph '{example_name}' loaded successfully", "graph": graph}

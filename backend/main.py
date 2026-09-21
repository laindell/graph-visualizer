from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from api.graphs import router as graphs_router
from api.import_export import router as import_export_router
from api.websocket import sio
from utils.graph_generator import graph_generator
from services.graph_service import graph_service

app = FastAPI(
    title="BFS Graph Visualizer API",
    description="Backend API for BFS graph search visualization",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graphs_router)
app.include_router(import_export_router)

socket_app = socketio.ASGIApp(sio, app)


@app.on_event("startup")
async def startup_event():
    # Завантажуємо всі приклади графів
    for graph_name in ["undirected", "directed", "tree", "mixed"]:
        graph = graph_generator[graph_name]()
        graph_service.graphs[graph.id] = graph
        print(f"Loaded {graph.name} with {len(graph.nodes)} nodes and {len(graph.edges)} edges")


@app.get("/")
async def root():
    return {
        "message": "BFS Graph Visualizer API",
        "version": "1.0.0",
        "endpoints": {
            "graphs": "/api/graphs",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)

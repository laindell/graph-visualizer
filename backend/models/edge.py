from pydantic import BaseModel, Field


class Edge(BaseModel):
    id: str = Field(..., description="Unique identifier for the edge")
    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    directed: bool = Field(default=False, description="True for directed edge (arc), False for undirected edge")
    weight: float = Field(default=1.0, description="Edge weight for weighted graph algorithms")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "e0",
                "source": "n0",
                "target": "n1",
                "directed": False,
                "weight": 1.0
            }
        }

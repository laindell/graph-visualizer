from pydantic import BaseModel, Field
from typing import Optional


class Node(BaseModel):
    id: str = Field(..., description="Unique identifier for the node")
    label: str = Field(..., description="Display label for the node")
    x: float = Field(..., description="X coordinate for visualization")
    y: float = Field(..., description="Y coordinate for visualization")
    metadata: dict = Field(default_factory=dict, description="Additional metadata for future algorithms")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "n0",
                "label": "Start",
                "x": 100.0,
                "y": 200.0,
                "metadata": {}
            }
        }

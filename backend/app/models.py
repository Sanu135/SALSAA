from pydantic import BaseModel
from typing import Optional

# --- New Models for Structure Builder ---

class StructureAnalysisRequest(BaseModel):
    shape: str
    structure_type: str
    diameter: float
    weight: float

class Stats(BaseModel):
    strength: float
    max_load: float
    material: float
    efficiency: float
    failure_point: float
    failed: bool
    load_ratio: float

class StructureAnalysisResponse(BaseModel):
    stats: Stats
    sim_result: Optional[str] = None

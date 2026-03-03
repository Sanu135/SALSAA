from fastapi import APIRouter
from app.models import StructureAnalysisRequest, StructureAnalysisResponse, Stats

router = APIRouter()

BASE_STATS = {
  "Pyramid": { "strength": 92, "maxLoad": 4200, "material": 1.8, "efficiency": 88, "failurePoint": 5100 },
  "Cube": { "strength": 78, "maxLoad": 6800, "material": 2.4, "efficiency": 72, "failurePoint": 7200 },
  "Cuboid": { "strength": 74, "maxLoad": 7200, "material": 2.8, "efficiency": 68, "failurePoint": 7900 },
  "Sphere": { "strength": 96, "maxLoad": 5400, "material": 2.1, "efficiency": 94, "failurePoint": 5800 },
  "Cylinder": { "strength": 84, "maxLoad": 5900, "material": 2.2, "efficiency": 80, "failurePoint": 6400 },
  "Cone": { "strength": 88, "maxLoad": 3800, "material": 1.6, "efficiency": 85, "failurePoint": 4200 },
}

TYPE_MODIFIERS = {
  "Solid": { "strength": 1.0, "maxLoad": 1.0, "material": 1.0, "efficiency": 1.0 },
  "Honeycomb": { "strength": 0.88, "maxLoad": 0.82, "material": 0.55, "efficiency": 1.28 },
  "Bone": { "strength": 0.93, "maxLoad": 0.91, "material": 0.62, "efficiency": 1.18 },
  "Mesh": { "strength": 0.76, "maxLoad": 0.72, "material": 0.40, "efficiency": 1.14 },
}

def calc_stats(shape: str, structure_type: str, diameter: float, weight: float) -> Stats:
    base = BASE_STATS[shape]
    mod = TYPE_MODIFIERS[structure_type]
    diam_factor = diameter / 200
    
    max_load_calc = base["maxLoad"] * mod["maxLoad"] * diam_factor
    failed = (weight * 100) > max_load_calc

    return Stats(
        strength=round(base["strength"] * mod["strength"] * diam_factor * 10) / 10,
        max_load=round(max_load_calc),
        material=round(base["material"] * mod["material"] * diam_factor * 100) / 100,
        efficiency=round(base["efficiency"] * mod["efficiency"] * 10) / 10,
        failure_point=round(base["failurePoint"] * mod["maxLoad"] * diam_factor),
        failed=failed,
        load_ratio=min(1, (weight * 100) / max_load_calc if max_load_calc > 0 else 1),
    )

@router.post("/analyze-structure", response_model=StructureAnalysisResponse)
async def analyze_structure(request: StructureAnalysisRequest):
    """
    Analyzes the given structure and returns a set of metrics.
    """
    stats = calc_stats(request.shape, request.structure_type, request.diameter, request.weight)
    
    sim_result = "failure" if stats.failed else "pass"

    return StructureAnalysisResponse(
        stats=stats,
        sim_result=sim_result
    )

import json
from typing import List, Dict, Any
from app.engine.honeycomb import create_honeycomb_structure
from app.engine.bone import create_bone_structure

def convert_blueprint(file_path: str, structure_type: str = "solid", hex_size: float = 10.0) -> List[Dict[str, Any]]:
    """
    Reads a JSON blueprint file and returns a list of shapes.
    Optionally converts the structure to a honeycomb or bone pattern.
    """
    with open(file_path, "r") as f:
        data = json.load(f)
    
    shapes = data.get("shapes", [])

    if structure_type == "honeycomb":
        return create_honeycomb_structure(shapes, hex_size)
    elif structure_type == "bone":
        return create_bone_structure(shapes)
    
    return shapes



from typing import List, Dict, Any
import numpy as np

def create_honeycomb_structure(shapes: List[Dict[str, Any]], hex_size: float) -> List[Dict[str, Any]]:
    """
    Creates a honeycomb structure within the bounding box of the given shapes.
    """
    if not shapes:
        return []

    # Calculate bounding box of the original structure
    min_x = min(s["position"]["x"] for s in shapes)
    max_x = max(s["position"]["x"] + s["dimensions"]["width"] for s in shapes)
    min_y = min(s["position"]["y"] for s in shapes)
    max_y = max(s["position"]["y"] + s["dimensions"]["height"] for s in shapes)

    new_shapes = []
    
    # Honeycomb pattern logic
    h = np.sqrt(3) * hex_size
    w = 2 * hex_size
    
    nx = int((max_x - min_x) / (w * 0.75))
    ny = int((max_y - min_y) / h)

    for i in range(nx):
        for j in range(ny):
            x = min_x + i * w * 0.75
            y = min_y + j * h
            if i % 2 == 1:
                y += h / 2

            new_shapes.append({
                "id": f"honeycomb_{i}_{j}",
                "type": "hexagon",
                "position": {"x": x, "y": y},
                "dimensions": {"width": hex_size, "height": hex_size},
                "material": "honeycomb_material"
            })

    return new_shapes

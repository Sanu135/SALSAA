from typing import List, Dict, Any

def create_bone_structure(shapes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Creates a bone-like structure within the bounding box of the given shapes.
    """
    if not shapes:
        return []

    # Calculate bounding box of the original structure
    min_x = min(s["position"]["x"] for s in shapes)
    max_x = max(s["position"]["x"] + s["dimensions"]["width"] for s in shapes)
    min_y = min(s["position"]["y"] for s in shapes)
    max_y = max(s["position"]["y"] + s["dimensions"]["height"] for s in shapes)

    new_shapes = []
    
    # Create a few main vertical "bones"
    for i in range(3):
        x = min_x + (i + 1) * (max_x - min_x) / 4
        new_shapes.append({
            "id": f"bone_v_{i}",
            "type": "rectangle",
            "position": {"x": x, "y": min_y},
            "dimensions": {"width": 10, "height": max_y - min_y},
            "material": "bone_material"
        })

    # Create a few horizontal "bones"
    for i in range(4):
        y = min_y + (i + 1) * (max_y - min_y) / 5
        new_shapes.append({
            "id": f"bone_h_{i}",
            "type": "rectangle",
            "position": {"x": min_x, "y": y},
            "dimensions": {"width": max_x - min_x, "height": 5},
            "material": "bone_material"
        })

    return new_shapes

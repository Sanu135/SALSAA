import os
from fastapi import APIRouter, UploadFile, File, Form
import shutil
from app.engine.converter import convert_blueprint
from typing import Optional

router = APIRouter()

@router.post("/upload-blueprint")
async def upload_blueprint(
    file: UploadFile = File(...),
    structure_type: str = Form("solid"),
    hex_size: float = Form(10.0),
):
    """
    Upload a blueprint file, converts it and returns the shapes.
    """
    file_path = f"temp_{file.filename}"
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        shapes = convert_blueprint(file_path, structure_type, hex_size)
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

    return {"filename": file.filename, "shapes": shapes}



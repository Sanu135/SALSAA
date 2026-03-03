from fastapi import FastAPI
from fastapi.responses import FileResponse
import os

app = FastAPI()

build_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "build"))

@app.get("/")
async def read_root():
    return FileResponse(os.path.join(build_dir, "index.html"))


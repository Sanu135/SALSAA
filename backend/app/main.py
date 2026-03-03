from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import analyze, blueprint, blueprint_analyzer

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
app.include_router(blueprint.router, prefix="/api")
app.include_router(blueprint_analyzer.router, prefix="/api")

@app.get("/")
async def read_root():
    return {"message": "SALSA Backend is running", "version": "2.0-cors-fix"}

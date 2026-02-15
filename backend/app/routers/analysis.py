# backend/app/routers/analysis.py

from fastapi import APIRouter, UploadFile, File, Request
from app.services.pipeline_service import run_analysis

router = APIRouter()

@router.post("/api/analyze")
async def analyze_meeting(
    file: UploadFile = File(...),
    request: Request = None
):
    return await run_analysis(file, request)

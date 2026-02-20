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

from app.schemas.analysis import EnhancePointRequest, SummaryPoint
from agents.summarizer import Summarizer

@router.post("/api/enhance-point", response_model=SummaryPoint)
async def enhance_point(request: EnhancePointRequest):
    summarizer = Summarizer()
    return summarizer.enhance_point(request.topic, request.content)

from fastapi import APIRouter, UploadFile, File, Request, HTTPException, Header
from app.services.pipeline_service import run_analysis
from app.services.google_auth_service import verify_google_token
import time

router = APIRouter()

# Simple in-memory rate limiter: {user_id: last_upload_timestamp}
COOLDOWN_SECONDS = 30
user_cooldowns = {}

@router.post("/api/analyze")
async def analyze_meeting(
    file: UploadFile = File(...),
    request: Request = None,
    authorization: str = Header(None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.split(" ")[1]
    user_info = verify_google_token(token)
    
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid Google ID token")
    
    user_id = user_info.get("sub")
    current_time = time.time()
    
    # Check rate limit
    if user_id in user_cooldowns:
        last_upload = user_cooldowns[user_id]
        if current_time - last_upload < COOLDOWN_SECONDS:
            remaining = int(COOLDOWN_SECONDS - (current_time - last_upload))
            raise HTTPException(
                status_code=429, 
                detail=f"Rate limit exceeded. Please wait {remaining} seconds."
            )
            
    # Record current upload and proceed
    user_cooldowns[user_id] = current_time
    return await run_analysis(file, request)


from app.schemas.analysis import EnhancePointRequest, SummaryPoint
from agents.summarizer import Summarizer

@router.post("/api/enhance-point", response_model=SummaryPoint)
async def enhance_point(request: EnhancePointRequest):
    summarizer = Summarizer()
    return summarizer.enhance_point(request.topic, request.content)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.analysis import router as analysis_router
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from contextlib import asynccontextmanager
from faster_whisper import WhisperModel
from core.logger import get_logger

logger = get_logger("Startup")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- STARTING MEET2ACTION BACKEND ---", flush=True)
    logger.info("Loading Faster-Whisper model...")

    app.state.whisper_model = WhisperModel(
        "base",
        device="cuda",
        compute_type="float16"  # VERY IMPORTANT for GPU
    )

    logger.info("Faster-Whisper model loaded.")

    yield

    logger.info("Shutting down application...")

app = FastAPI(lifespan=lifespan)

# Add Session Middleware for OAuth
from starlette.middleware.sessions import SessionMiddleware
import os
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "super-secret-key"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers.auth import router as auth_router

app.include_router(analysis_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Meet2Action API is running", "routes": [route.path for route in app.routes]}

@app.get("/health")
def health():
    return {"status": "backend running"}

# --- New Endpoint for Enhancing Summary Points ---
from pydantic import BaseModel
from core.llm_client import OllamaClient

class EnhancePointRequest(BaseModel):
    topic: str
    content: str

@app.post("/api/enhance-point")
async def enhance_point(request: EnhancePointRequest):
    try:
        llm = OllamaClient()
        prompt = (
            f"Fix grammar and enhance clarity of this meeting summary point. "
            f"Keep it concise and professional. Do not change the underlying meaning.\n\n"
            f"Topic: {request.topic}\n"
            f"Content: {request.content}\n\n"
            f"Return ONLY the enhanced content text. No preamble, no quotes."
        )
        enhanced_content = llm.generate(prompt)
        return {"topic": request.topic, "content": enhanced_content.strip()}
    except Exception as e:
        logger.error(f"Error enhancing point: {e}")
        # Fallback to original content if LLM fails
        return {"topic": request.topic, "content": request.content}


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

app.include_router(analysis_router)


@app.get("/health")
def health():
    return {"status": "backend running"}


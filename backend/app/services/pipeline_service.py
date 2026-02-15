# backend/core/pipeline_service.py

from fastapi import Request
from core.input_processor import InputProcessor
from core.pipeline import run_pipeline
from core.llm_client import OllamaClient
import os
import shutil
from fastapi import UploadFile
from core.logger import get_logger
import time

logger = get_logger("ASR")

async def run_analysis(file: UploadFile, request: Request):

    os.makedirs("temp", exist_ok=True)
    file_path = os.path.join("temp", file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Use whisper model already loaded at startup
    model = request.app.state.whisper_model

    logger.info("Whisper transcription started")
    start_time = time.time()

    segments, info = model.transcribe(
        file_path,
        beam_size=5
    )

    transcript = ""
    for segment in segments:
        transcript += segment.text + " "

    transcript = transcript.strip()

    duration = time.time() - start_time
    logger.info(f"Whisper transcription completed in {duration:.3f}s")

    llm = OllamaClient()
    return run_pipeline(transcript, llm)

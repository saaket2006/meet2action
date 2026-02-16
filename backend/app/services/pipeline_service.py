# backend/core/pipeline_service.py

from fastapi import Request, UploadFile
from core.pipeline import run_pipeline
from core.llm_client import OllamaClient
from core.logger import get_logger
import os
import shutil
import time

logger = get_logger("ASR")

async def run_analysis(file: UploadFile, request: Request):

    os.makedirs("temp", exist_ok=True)

    file_extension = os.path.splitext(file.filename)[1].lower()

    # CASE 1: TEXT FILE → Skip ASR
    if file_extension == ".txt":
        logger.info("Text file detected. Skipping Whisper transcription.")

        contents = await file.read()

        if not contents:
            raise ValueError("Uploaded text file is empty.")

        transcript = contents.decode("utf-8").strip()

        logger.info("Text transcript loaded successfully.")

    # CASE 2: AUDIO/VIDEO → Use ASR
    else:
        file_path = os.path.join("temp", file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            raise ValueError("Uploaded audio file is empty or corrupted.")

        model = request.app.state.whisper_model

        logger.info("Whisper transcription started")
        start_time = time.time()

        segments, info = model.transcribe(
            file_path,
            beam_size=5
        )

        transcript = " ".join([segment.text for segment in segments]).strip()

        duration = time.time() - start_time
        logger.info(f"Whisper transcription completed in {duration:.3f}s")

    # LLM PIPELINE
    llm = OllamaClient()
    return run_pipeline(transcript, llm)

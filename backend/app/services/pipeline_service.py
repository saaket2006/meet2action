# backend/core/pipeline_service.py

from fastapi import Request, UploadFile
from core.pipeline import run_pipeline
from core.llm_client import OllamaClient, GeminiClient
from core.logger import get_logger
import os
import shutil
import time

logger = get_logger("ASR")

async def run_analysis(file: UploadFile, request: Request):
    """
    Complete analysis pipeline: Transcribe -> Extract -> Action Items
    """
    logger.info(f"Analyzing uploaded file: {file.filename}")
    
    # 1. TRANSCRIPTION
    if file.filename.lower().endswith('.txt'):
        logger.info("[ASR] Text file detected. Skipping Whisper transcription.")
        content = await file.read()
        transcript = content.decode('utf-8')
    else:
        logger.info("[ASR] Audio file detected. Starting Whisper transcription...")
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)

        start_time = time.time()
        
        # USE the pre-initialized model from app.state!
        whisper_model = getattr(request.app.state, 'whisper_model', None)
        if not whisper_model:
            logger.warning("[ASR] Whisper model not found in app.state. Initializing on-the-fly...")
            from faster_whisper import WhisperModel
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"
            whisper_model = WhisperModel("base", device=device, compute_type="float16" if device == "cuda" else "int8")

        segments, _ = whisper_model.transcribe(temp_path)
        transcript = " ".join([s.text for s in segments])
        
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        duration = time.time() - start_time
        logger.info(f"Whisper transcription completed in {duration:.3f}s")


    # LLM PIPELINE - Allow user to force Ollama to save credits
    is_small_content = len(transcript) < 1000
    use_ollama_forced = os.getenv("USE_OLLAMA", "false").lower() == "true"
    api_key = os.getenv("GOOGLE_AI_API_KEY")

    # Policy: Use Ollama for larger files to save credits. Use Gemini for small tasks (<1000 chars) if available.
    if api_key and is_small_content and not use_ollama_forced:
        logger.info(f"Small content detected ({len(transcript)} chars). Using Gemini for speed.")
        llm = GeminiClient()
    else:
        logger.info(f"Content length is {len(transcript)} chars. Using Ollama as the primary engine.")
        llm = OllamaClient()

    
    try:
        return run_pipeline(transcript, llm)
    except Exception as e:
        logger.warning(f"Primary LLM failed: {e}")
        # If Ollama failed and we have Gemini available, try it as a fallback
        if isinstance(llm, OllamaClient) and api_key and not use_ollama_forced:
            logger.info("Local LLM failed or timed out. Falling back to Gemini...")
            fallback_llm = GeminiClient()
            return run_pipeline(transcript, fallback_llm)
        raise e


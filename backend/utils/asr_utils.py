# utils/asr_utils.py
import whisper
import torch
from utils.logger import get_logger

logger = get_logger("ASR")

def transcribe_audio(file_path: str, model_size: str = "base") -> str:
    logger.info(f"Loading Whisper model: {model_size}")

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = whisper.load_model(model_size, device=device)

    logger.info(f"Using device: {device}")
    logger.info(f"Transcribing file: {file_path}")

    result = model.transcribe(file_path)
    transcript = result.get("text", "").strip()

    logger.info("ASR transcription complete")
    return transcript


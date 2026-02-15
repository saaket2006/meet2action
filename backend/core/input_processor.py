# backend/core/input_processor.py

import base64
import tempfile
import os
from fastapi import Request

class InputProcessor:
    """
    Handles raw input and returns transcript text.
    Uses openai-whisper model loaded at app startup (CUDA enabled).
    """
    def __init__(self, request: Request):
        self.model = request.app.state.whisper_model

    def process(self, file_input) -> str:

        # Direct text
        if file_input.text:
            return file_input.text

        # Base64 audio
        if file_input.base64:
            return self._transcribe_base64(file_input.base64)

        return ""

    def _transcribe_base64(self, base64_string: str) -> str:

        audio_bytes = base64.b64decode(base64_string)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        try:
            print("Running transcription on:", self.model.device)
            # openai-whisper returns a dict, not segments
            result = self.model.transcribe(
                tmp_path,
                fp16=True  # ensures CUDA float16 inference
            )

            transcript = result["text"]
            return transcript.strip()

        finally:
            os.remove(tmp_path)

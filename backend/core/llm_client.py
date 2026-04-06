import requests
import json
import logging

logger = logging.getLogger("LLMClient")

from google import genai
import os

class GeminiClient:
    def __init__(self, model_name: str = "gemini-2.5-flash"):
        api_key = os.getenv("GOOGLE_AI_API_KEY") 
        if not api_key:
            raise RuntimeError("GOOGLE_AI_API_KEY is not set in environment variables.")
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name


    def generate(self, prompt: str, temperature: float = 0.1) -> str:
        logger.info(f"Calling Gemini ({self.model_name}) via new SDK with JSON mode...")
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "temperature": temperature,
                    "top_p": 0.95,
                    "max_output_tokens": 4096
                }
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini error: {str(e)}")
            raise e



class OllamaClient:

    def __init__(self, model: str = "qwen2.5:3b"):
        self.model = model
        self.url = "http://localhost:11434/api/generate"

    def generate(self, prompt: str, temperature: float = 0.2) -> str:
        # Note: Ollama's /api/generate expects parameters like 'temperature' 
        # to be inside the "options" object.
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": 1024,
                "temperature": temperature,
                "top_p": 0.9,
            }
        }

        try:
            logger.info(f"Calling Ollama at {self.url} with model {self.model}")
            response = requests.post(self.url, json=payload, timeout=300)
            response.raise_for_status()
            
            result = response.json()
            if "response" not in result:
                logger.error(f"Unexpected response structure from Ollama: {result}")
                raise ValueError("Incomplete response from Ollama")

            return result["response"]
            
        except requests.exceptions.HTTPError as e:
            error_detail = response.text if response is not None else "No response body"
            logger.error(f"Ollama HTTP {e.response.status_code} Error: {error_detail}")
            raise Exception(f"Ollama model '{self.model}' failed: {error_detail}")
        except Exception as e:
            logger.error(f"Ollama connection error: {str(e)}")
            raise e

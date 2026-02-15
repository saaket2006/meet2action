# backend/core/llm_client.py

import requests
import json

class OllamaClient:
    def __init__(self, model: str = "qwen2.5:7b"):
        self.model = model
        self.url = "http://localhost:11434/api/generate"

    def generate(self, prompt: str, temperature: float = 0.2) -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "temperature": temperature,
            "stream": False,
            "options": {
                "num_predict": 800,
                "temperature": temperature,
            }
        }

        response = requests.post(self.url, json=payload)
        response.raise_for_status()
        
        return response.json()["response"]

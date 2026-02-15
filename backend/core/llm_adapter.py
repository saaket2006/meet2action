# backend/core/llm_adapter.py

from abc import ABC, abstractmethod
from typing import Optional


class BaseLLMAdapter(ABC):

    @abstractmethod
    def generate(
        self,
        prompt: str,
        temperature: float = 0.2,
        max_tokens: Optional[int] = None,
    ) -> str:
        pass

import os
from openai import OpenAI


class OpenAIAdapter(BaseLLMAdapter):

    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4o-mini"

    def generate(
        self,
        prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 512,
    ) -> str:

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )

        return response.choices[0].message.content.strip()

def get_llm_adapter() -> BaseLLMAdapter:
    provider = os.getenv("LLM_PROVIDER", "openai")

    if provider == "openai":
        return OpenAIAdapter()

    raise ValueError(f"Unsupported LLM provider: {provider}")


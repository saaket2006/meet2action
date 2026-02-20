from app.schemas.analysis import SummaryPoint
from core.llm_client import OllamaClient
import json
import re

class Summarizer:
    def __init__(self, llm: OllamaClient = None):
        self.llm = llm or OllamaClient()

    def enhance_point(self, topic: str, content: str) -> SummaryPoint:
        prompt = f"""
        You are an expert editor. 
        Your task is to enhance the following summary point from a meeting.
        
        Input Topic: {topic}
        Input Content: {content}

        Instructions:
        1. Correct any grammatical errors.
        2. Improve the professional tone and clarity.
        3. Keep it concise.
        4. Return ONLY valid JSON in the following format:
        {{
            "topic": "Enhanced Topic (keep original if good)",
            "content": "Enhanced Content",
            "reasoning": "Brief explanation of changes (optional)"
        }}

        JSON:
        """

        response = self.llm.generate(prompt, temperature=0.2)
        
        # Clean response
        cleaned = re.sub(r"```json|```", "", response).strip()
        
        try:
            parsed = json.loads(cleaned)
            return SummaryPoint(
                topic=parsed.get("topic", topic),
                content=parsed.get("content", content),
                reasoning=parsed.get("reasoning")
            )
        except Exception:
            # Fallback to original if parsing fails
            return SummaryPoint(topic=topic, content=content, reasoning="Failed to enhance.")

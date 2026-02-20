# backend/core/pipeline.py

from agents.intent_analyzer import IntentAnalyzer
from agents.summarizer import Summarizer
from agents.action_extractor import ActionExtractor
from agents.prioritizer import Prioritizer
from agents.validator import Validator
from core.response_mapper import map_to_api_response
import time
from core.logger import get_logger

logger = get_logger("Pipeline")

def compress_transcript(transcript: str, max_chars: int = 4000) -> str:
    if len(transcript) <= max_chars:
        return transcript

    head = transcript[:1250]
    tail = transcript[-1250:]

    return head + "\n...\n" + tail

def run_pipeline(transcript: str, llm) -> dict:

    start_time = time.time()
    logger.info("Pipeline started (Single LLM mode)")
    transcript_for_llm = compress_transcript(transcript)

    prompt = f"""
    You are an expert meeting intelligence system.
    Analyze the meeting transcript and return STRICT JSON with this structure:
    {{
    "title": "Short, catchy meeting title (5-7 words)",
    "intent": "string",
    "summary": [
        {{
        "topic": "string",
        "content": "string"
        }}
    ],
    "actionItems": [
        {{
        "task": "string",
        "assignee": "string or null",
        "deadline": "string or null",
        "priority": "High | Medium | Low"
        }}
    ],
    "projectContextFound": true or false
    }}

    Rules:
    - Return ONLY valid JSON.
    - "title" should be a professional, short summary of the meeting topic (max 7 words).
    - Summary content should be concise and can contain various valid summarized points that must be well-formed business English along with perfect grammar and punctuation.
    - "intent" must be a professionally written, grammatically correct sentence in Title Case.
    - Action items must be actionable and clearly defined (assignee, task, deadline).
    - No markdown.
    - No explanation text.
    - No extra commentary.

    Transcript:
    {transcript_for_llm}
    """

    t0 = time.time()
    response = llm.generate(prompt, temperature=0.2)
    logger.info(f"LLM call completed in {time.time() - t0:.3f}s")

    import json
    import re

    # Remove markdown code fences if present
    cleaned = re.sub(r"```json|```", "", response).strip()

    try:
        parsed = json.loads(cleaned)
    except Exception:
        logger.error("Invalid JSON returned from LLM")
        logger.error(f"RAW OUTPUT:\n{response}")
        return {
            "error": "Invalid JSON from LLM",
            "raw_output": response
        }


    total_time = time.time() - start_time
    logger.info(f"Pipeline finished in {total_time:.3f}s")

    return map_to_api_response(
        title=parsed.get("title"),
        intent=parsed.get("intent"),
        summary=parsed.get("summary"),
        actions=parsed.get("actionItems"),
        validation=None,
        project_context=parsed.get("projectContextFound")
    )

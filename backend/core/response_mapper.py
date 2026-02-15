# backen/core/response_mapper.py

from app.schemas.analysis import SummaryPoint, ActionItem
from app.schemas.agent_outputs import (
    IntentOutput,
    SummaryOutput,
    PrioritizationOutput,
    ValidationOutput,
)

def map_to_api_response(intent, summary, actions, validation, project_context) -> dict:

    return {
        "intent": intent,
        "summary": summary or [],
        "actionItems": actions or [],
        "priorities": [],
        "projectContextFound": project_context
    }

from pydantic import BaseModel
from typing import List


class IntentOutput(BaseModel):
    main_purpose: str
    discussion_themes: List[str]
    meeting_type: str

class SummaryOutput(BaseModel):
    bullet_points: List[str]

class ActionItemOutput(BaseModel):
    description: str
    owner: str
    deadline: str | None = None

class ActionExtractionOutput(BaseModel):
    action_items: List[ActionItemOutput]

class PrioritizedActionItem(BaseModel):
    description: str
    owner: str
    priority: str  # e.g., High / Medium / Low


class PrioritizationOutput(BaseModel):
    action_items: List[PrioritizedActionItem]

class ValidationIssue(BaseModel):
    task_description: str
    issue: str


class ValidationOutput(BaseModel):
    issues: List[ValidationIssue]
    all_valid: bool

from pydantic import BaseModel
from typing import List, Optional


class SummaryPoint(BaseModel):
    topic: str
    content: str
    reasoning: Optional[str] = None


class ActionItem(BaseModel):
    task: str
    assignee: str
    deadline: Optional[str] = None
    priority: str
    canExport: bool
    reasoning: Optional[str] = None


class MeetingAnalysisResponse(BaseModel):
    title: str = "Meeting Analysis"
    intent: str
    summary: List[SummaryPoint]
    actionItems: List[ActionItem]
    projectContextFound: bool


class EnhancePointRequest(BaseModel):
    topic: str
    content: str


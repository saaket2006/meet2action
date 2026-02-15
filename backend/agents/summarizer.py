# agents/summarizer.py

from app.schemas.agent_outputs import SummaryOutput


class Summarizer:

    def __init__(self, llm=None):
        self.llm = llm

    def summarize(self, transcript: str) -> SummaryOutput:
        # Temporary structured mock output

        return SummaryOutput(
            bullet_points=[
                "Discussion about product launch timeline",
                "Marketing responsibilities assigned",
                "Budget finalization planned"
            ]
        )

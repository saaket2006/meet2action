# agents/action_extractor.py

from app.schemas.agent_outputs import (
    ActionExtractionOutput,
    ActionItemOutput,
)


class ActionExtractor:

    def __init__(self, llm=None):
        self.llm = llm

    def extract(self, transcript: str) -> ActionExtractionOutput:
        # Temporary structured mock output

        return ActionExtractionOutput(
            action_items=[
                ActionItemOutput(
                    description="Prepare marketing plan",
                    owner="John",
                    deadline=None
                ),
                ActionItemOutput(
                    description="Finalize budget",
                    owner="Sarah",
                    deadline=None
                ),
            ]
        )

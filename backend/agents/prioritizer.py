# agents/prioritizer.py

from app.schemas.agent_outputs import (
    ActionExtractionOutput,
    PrioritizedActionItem,
    PrioritizationOutput,
)


class Prioritizer:

    def __init__(self, llm=None):
        self.llm = llm

    def prioritize(
        self,
        actions: ActionExtractionOutput
    ) -> PrioritizationOutput:

        # Temporary rule-based mock prioritization

        prioritized = []

        for item in actions.action_items:
            prioritized.append(
                PrioritizedActionItem(
                    description=item.description,
                    owner=item.owner,
                    priority="High" if "Finalize" in item.description else "Medium"
                )
            )

        return PrioritizationOutput(
            action_items=prioritized
        )

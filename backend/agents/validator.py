# agents/validator.py

from app.schemas.agent_outputs import (
    PrioritizationOutput,
    ValidationIssue,
    ValidationOutput,
)


class Validator:

    def __init__(self, llm=None):
        self.llm = llm

    def validate(
        self,
        actions: PrioritizationOutput
    ) -> ValidationOutput:

        issues = []

        for item in actions.action_items:
            if not item.owner:
                issues.append(
                    ValidationIssue(
                        task_description=item.description,
                        issue="Missing assignee"
                    )
                )

        return ValidationOutput(
            issues=issues,
            all_valid=len(issues) == 0
        )

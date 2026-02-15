# agents/intent_analyzer.py

from app.schemas.agent_outputs import IntentOutput


class IntentAnalyzer:

    def __init__(self, llm):
        self.llm = llm

    def analyze_intent(transcript: str, llm):
        prompt = f"""
        You are an expert meeting analyst.
        Analyze the following meeting transcript and return ONLY a concise one-line intent.
        Transcript: {transcript}
        Return only the intent sentence.
        """

        response = llm.generate(prompt, temperature=0.2)

        return response.strip()


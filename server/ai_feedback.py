from groq import Groq
from typing import Dict, Any
import json

class AIFeedbackService:
    def __init__(self):
        # Initialize Groq client (make sure GROQ_API_KEY is set in your env)
        self.client = Groq()

    async def generate_essay_feedback(self, essay_text: str, rubric: Dict[str, Any]) -> Dict[str, Any]:
        try:
            prompt = f"""
            Analyze this essay and provide feedback based on the following rubric: {rubric}
            
            Essay: {essay_text}
            
            Provide feedback in JSON format with:
            - grammar_score (0-100)
            - clarity_score (0-100)
            - keyword_usage_score (0-100)
            - overall_feedback (string)
            - strengths (list of strings)
            - weaknesses (list of strings)
            - suggestions (list of strings)
            """

            response = self.client.chat.completions.create(
                model="openai/gpt-oss-20b",  # Groq model
                messages=[
                    {"role": "system", "content": "You are an experienced English teacher providing detailed essay feedback."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_completion_tokens=1000,
                top_p=1,
                reasoning_effort="medium",
                stream=False  # disable streaming for easier parsing
            )

            feedback_text = response.choices[0].message.content
            return self._parse_feedback(feedback_text)

        except Exception as e:
            return {
                "grammar_score": 75,
                "clarity_score": 70,
                "keyword_usage_score": 65,
                "overall_feedback": "Basic feedback generated",
                "strengths": ["Good structure", "Clear introduction"],
                "weaknesses": ["Need more examples", "Grammar needs improvement"],
                "suggestions": ["Add more supporting evidence", "Review grammar rules"],
                "error": str(e)
            }

    def _parse_feedback(self, feedback_text: str) -> Dict[str, Any]:
        try:
            return json.loads(feedback_text)
        except:
            return {"error": "Could not parse AI feedback", "raw": feedback_text}


# Usage
ai_feedback_service = AIFeedbackService()

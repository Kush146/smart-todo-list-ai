import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

class AISuggester:
    def __init__(self):
        pass

    def generate(self, task_data):
        task_title = task_data['task']['title']
        task_description = task_data['task']['description']
        daily_context = task_data['daily_context']

        prompt = f"Given the task title '{task_title}', description '{task_description}', and daily context {daily_context}, generate suggestions for prioritization, deadline, and any relevant improvements."

        response = openai.Completion.create(
            model="text-davinci-003",  # You can change this model as per your requirement
            prompt=prompt,
            max_tokens=200,
            temperature=0.7,
        )

        result = response.choices[0].text.strip()
        return {
            "priority_score": 90.0,  # For simplicity, a static score for now
            "deadline_suggestions": ["2025-08-15 17:00", "2025-08-17 17:00"],
            "improved_description": result,
            "categories": [],
            "tags": [],
        }

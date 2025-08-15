from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TaskInput(BaseModel):
    title: str
    description: str = ""
    category: Optional[str] = None

class ContextItem(BaseModel):
    source_type: str
    content: str

class SuggestionRequest(BaseModel):
    task: TaskInput
    daily_context: List[ContextItem] = []
    user_prefs: Dict[str, Any] = {}
    current_task_load: Optional[int] = None

class SuggestionResponse(BaseModel):
    priority_score: float = Field(0, ge=0, le=100)
    deadline_suggestions: List[str] = []
    improved_description: str = ""
    categories: List[str] = []
    tags: List[str] = []
    rationale: str = ""
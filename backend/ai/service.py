import os, json, math
from datetime import datetime, timedelta
from typing import Dict, Any, List

from .contracts import SuggestionRequest, SuggestionResponse
from .providers.openai_provider import OpenAICompatibleProvider
from .providers.anthropic_provider import AnthropicProvider
from .providers.lmstudio_provider import LMStudioProvider

_KEYWORDS_URGENT = {"urgent", "asap", "immediately", "today", "blocker"}
_KEYWORDS_IMPORTANT = {"review", "payment", "invoice", "deadline", "submit", "client"}
_CATEGORY_HINTS = {
    "engineering": ["bug", "deploy", "api", "database", "migrate", "build"],
    "communication": ["email", "reply", "follow up", "call", "meeting"],
    "planning": ["plan", "roadmap", "spec", "write", "doc"],
}

class AISuggester:
    def __init__(self):
        provider = os.getenv("AI_PROVIDER", "none").lower()
        if provider == "openai":
            self.provider = OpenAICompatibleProvider()
        elif provider == "anthropic":
            self.provider = AnthropicProvider()
        elif provider == "lmstudio":
            self.provider = LMStudioProvider()
        else:
            self.provider = None

    def generate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        req = SuggestionRequest(**payload)
        heuristics = self._heuristics(req)

        if self.provider:
            try:
                llm = self._llm_suggest(req)
                for k, v in llm.items():
                    if v:
                        heuristics[k] = v
                heuristics.setdefault("rationale", llm.get("rationale", heuristics.get("rationale", "")))
            except Exception as e:
                heuristics["rationale"] += f"\n(LLM fallback used due to error: {e})"
        return SuggestionResponse(**heuristics).model_dump()

    def _heuristics(self, req: SuggestionRequest) -> Dict[str, Any]:
        text = (req.task.title + " \n" + (req.task.description or "")).lower()
        ctx = "\n".join([c.content for c in req.daily_context]).lower()
        score = 10
        if any(k in text or k in ctx for k in _KEYWORDS_URGENT):
            score += 60
        if any(k in text or k in ctx for k in _KEYWORDS_IMPORTANT):
            score += 20
        if req.current_task_load:
            score += min(10, math.log2(1 + req.current_task_load))
        score = max(0, min(100, score))

        base_days = 1 if score >= 70 else 3
        length_factor = min(2, max(0, len(text) // 120))
        days = base_days + length_factor
        suggestions = [
            (datetime.utcnow() + timedelta(days=days)).strftime("%Y-%m-%d 17:00"),
            (datetime.utcnow() + timedelta(days=days+2)).strftime("%Y-%m-%d 17:00"),
        ]

        buckets: List[str] = []
        for cat, kws in _CATEGORY_HINTS.items():
            if any(k in text or k in ctx for k in kws):
                buckets.append(cat)
        if req.task.category and req.task.category not in buckets:
            buckets.insert(0, req.task.category)

        improved = req.task.description or req.task.title
        if ctx:
            improved += "\n\nContext signals: " + "; ".join({w for w in ctx.split() if w in _KEYWORDS_URGENT | _KEYWORDS_IMPORTANT})

        rationale = "Heuristic: urgency/keywords from task+context; deadline ~ complexity; tags from hints."

        return {
            "priority_score": float(score),
            "deadline_suggestions": suggestions,
            "improved_description": improved.strip(),
            "categories": buckets[:3],
            "tags": buckets[:5],
            "rationale": rationale,
        }

    def _llm_suggest(self, req: SuggestionRequest) -> Dict[str, Any]:
        sys_prompt = (
            "You are an assistant that improves task management. "
            "Return concise JSON with keys: priority_score (0-100), deadline_suggestions (array of 'YYYY-MM-DD HH:MM'), "
            "improved_description, categories (array), tags (array), rationale (short)."
        )
        user_prompt = (
            "Task: " + json.dumps(req.task.model_dump()) + "\n" +
            "Context: " + json.dumps([c.model_dump() for c in req.daily_context]) + "\n" +
            "Prefs: " + json.dumps(req.user_prefs) + "\n" +
            f"Current load: {req.current_task_load} \n" +
            "Respond ONLY with JSON."
        )
        raw = self.provider.chat(sys_prompt, user_prompt)
        raw = raw.strip().strip("` ")
        start = raw.find("{")
        end = raw.rfind("}")
        import json as _json
        parsed = _json.loads(raw[start:end+1])
        parsed["priority_score"] = float(parsed.get("priority_score", 0))
        parsed["deadline_suggestions"] = parsed.get("deadline_suggestions", [])
        parsed["improved_description"] = parsed.get("improved_description", "")
        parsed["categories"] = parsed.get("categories", [])
        parsed["tags"] = parsed.get("tags", [])
        parsed["rationale"] = parsed.get("rationale", "")
        return parsed
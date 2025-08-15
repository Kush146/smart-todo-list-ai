from abc import ABC, abstractmethod
class AIProvider(ABC):
    @abstractmethod
    def chat(self, system_prompt: str, user_prompt: str) -> str:
        ...
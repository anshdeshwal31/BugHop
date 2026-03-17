from typing import Optional

from pydantic import BaseModel


class WebhookPayload(BaseModel):
    event: str
    payload: dict


class WebhookResponse(BaseModel):
    status: str
    message: Optional[str] = None


class ChatPayload(BaseModel):
    question: str
    repo: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str

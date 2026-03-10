from beanie import Document
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = datetime.utcnow()


class ChatSession(Document):
    user_id: str
    title: str = "New Chat"
    messages: List[ChatMessage] = []
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    expires_at: Optional[datetime] = None

    class Settings:
        name = "chat_sessions"


class ChatMessageRequest(BaseModel):
    session_id: Optional[str] = None
    message: str

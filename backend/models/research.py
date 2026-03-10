from beanie import Document
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ResearchSection(BaseModel):
    title: str
    content: str


class ResearchReport(Document):
    user_id: str
    topic: str
    subtopics: List[str] = []
    sections: List[ResearchSection] = []
    references: List[str] = []
    raw_content: str = ""
    status: str = "pending"  # pending | processing | completed | failed
    word_count: int = 0
    created_at: datetime = datetime.utcnow()
    expires_at: Optional[datetime] = None

    class Settings:
        name = "research_reports"


class ResearchRequest(BaseModel):
    topic: str

from beanie import Document
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class User(Document):
    name: str
    email: str
    hashed_password: str
    is_verified: bool = False
    avatar_color: str = "#06b6d4"
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "users"


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

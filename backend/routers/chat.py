from fastapi import APIRouter, HTTPException, Depends
from models.chat import ChatSession, ChatMessage, ChatMessageRequest
from models.user import User
from utils.auth  import get_current_user
from agents.orchestrator import chat_agent
from datetime import datetime, timedelta

router = APIRouter()


@router.post("/message")
async def send_message(data: ChatMessageRequest, user: User = Depends(get_current_user)):
    uid = str(user.id)
    if data.session_id:
        session = await ChatSession.get(data.session_id)
        if not session or session.user_id != uid:
            raise HTTPException(404, "Session not found")
    else:
        session = ChatSession(
            user_id=uid,
            title=data.message[:60] + ("…" if len(data.message) > 60 else ""),
            expires_at=datetime.utcnow() + timedelta(days=30),
        )
        await session.insert()

    session.messages.append(ChatMessage(role="user", content=data.message))
    history = [{"role": m.role, "content": m.content} for m in session.messages[:-1]]
    reply   = await chat_agent(data.message, history)

    session.messages.append(ChatMessage(role="assistant", content=reply))
    session.updated_at = datetime.utcnow()
    await session.save()
    return {"session_id": str(session.id), "message": reply, "title": session.title}


@router.get("/sessions")
async def get_sessions(user: User = Depends(get_current_user)):
    sessions = (
        await ChatSession.find(ChatSession.user_id == str(user.id))
        .sort(-ChatSession.updated_at)
        .to_list()
    )
    return [
        {
            "id":            str(s.id),
            "title":         s.title,
            "message_count": len(s.messages),
            "updated_at":    s.updated_at,
            "created_at":    s.created_at,
        }
        for s in sessions
    ]


@router.get("/session/{session_id}")
async def get_session(session_id: str, user: User = Depends(get_current_user)):
    s = await ChatSession.get(session_id)
    if not s or s.user_id != str(user.id):
        raise HTTPException(404, "Session not found")
    return {
        "id":         str(s.id),
        "title":      s.title,
        "messages":   [{"role": m.role, "content": m.content, "timestamp": m.timestamp} for m in s.messages],
        "created_at": s.created_at,
        "updated_at": s.updated_at,
    }


@router.delete("/session/{session_id}")
async def delete_session(session_id: str, user: User = Depends(get_current_user)):
    s = await ChatSession.get(session_id)
    if not s or s.user_id != str(user.id):
        raise HTTPException(404, "Session not found")
    await s.delete()
    return {"message": "Deleted"}

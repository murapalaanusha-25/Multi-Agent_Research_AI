from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from models.user import User, UserUpdate
from utils.auth  import get_current_user, hash_password, verify_password
from datetime    import datetime

router = APIRouter()


class ChangePwRequest(BaseModel):
    old_password: str
    new_password: str


@router.get("/profile")
async def profile(user: User = Depends(get_current_user)):
    return {
        "id":          str(user.id),
        "name":        user.name,
        "email":       user.email,
        "is_verified": user.is_verified,
        "created_at":  user.created_at,
    }


@router.put("/update")
async def update(data: UserUpdate, user: User = Depends(get_current_user)):
    if data.name:
        user.name = data.name
    if data.email and data.email != user.email:
        if await User.find_one(User.email == data.email):
            raise HTTPException(400, "Email already in use")
        user.email       = data.email
        user.is_verified = False
    user.updated_at = datetime.utcnow()
    await user.save()
    return {"message": "Updated", "name": user.name, "email": user.email}


@router.post("/change-password")
async def change_password(data: ChangePwRequest, user: User = Depends(get_current_user)):
    if not verify_password(data.old_password, user.hashed_password):
        raise HTTPException(400, "Incorrect current password")
    user.hashed_password = hash_password(data.new_password)
    await user.save()
    return {"message": "Password changed"}


@router.delete("/delete")
async def delete_account(user: User = Depends(get_current_user)):
    from models.research import ResearchReport
    from models.chat     import ChatSession
    await ResearchReport.find(ResearchReport.user_id == str(user.id)).delete()
    await ChatSession.find(ChatSession.user_id == str(user.id)).delete()
    await user.delete()
    return {"message": "Account deleted"}

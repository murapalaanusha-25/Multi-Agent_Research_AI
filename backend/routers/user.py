from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from models.user  import User, UserUpdate
from models.token import EmailVerificationToken
from utils.auth   import get_current_user, hash_password, verify_password
from emails.email_service import send_verification_email
from datetime import datetime, timedelta
import secrets

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
async def update(
    data: UserUpdate,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
):
    email_changed = False

    if data.name and data.name.strip():
        user.name = data.name.strip()

    if data.email and data.email.strip() and data.email.strip().lower() != user.email.lower():
        new_email = data.email.strip().lower()
        existing = await User.find_one(User.email == new_email)
        if existing and str(existing.id) != str(user.id):
            raise HTTPException(400, "Email already in use by another account")
        token = secrets.token_urlsafe(32)
        await EmailVerificationToken(
            user_id=str(user.id),
            token=token,
            expires_at=datetime.utcnow() + timedelta(hours=24),
            new_email=new_email,
        ).insert()
        background_tasks.add_task(send_verification_email, new_email, user.name, token)
        email_changed = True

    user.updated_at = datetime.utcnow()
    await user.save()

    msg = "Profile updated successfully!"
    if email_changed:
        msg = "Name saved. A verification link has been sent to your new email — click it to apply the change."

    return {
        "message":       msg,
        "name":          user.name,
        "email":         user.email,
        "email_changed": email_changed,
    }


@router.post("/change-password")
async def change_password(data: ChangePwRequest, user: User = Depends(get_current_user)):
    if not verify_password(data.old_password, user.hashed_password):
        raise HTTPException(400, "Incorrect current password")
    if data.old_password == data.new_password:
        raise HTTPException(400, "New password must be different from current")
    if len(data.new_password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    user.hashed_password = hash_password(data.new_password)
    user.updated_at = datetime.utcnow()
    await user.save()
    return {"message": "Password changed successfully!"}


@router.delete("/delete")
async def delete_account(user: User = Depends(get_current_user)):
    from models.research import ResearchReport
    from models.chat     import ChatSession
    await ResearchReport.find(ResearchReport.user_id == str(user.id)).delete()
    await ChatSession.find(ChatSession.user_id == str(user.id)).delete()
    await user.delete()
    return {"message": "Account deleted"}
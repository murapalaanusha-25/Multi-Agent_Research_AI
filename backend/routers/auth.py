from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from models.user  import User, UserCreate, UserLogin
from models.token import PasswordResetToken, EmailVerificationToken
from utils.auth   import hash_password, verify_password, create_access_token
from emails.email_service import send_verification_email, send_password_reset_email
import secrets
from datetime import datetime, timedelta

router = APIRouter()


class ForgotRequest(BaseModel):
    email: str


class ResetRequest(BaseModel):
    token: str
    new_password: str


def _user_out(user: User) -> dict:
    return {
        "id":          str(user.id),
        "name":        user.name,
        "email":       user.email,
        "is_verified": user.is_verified,
        "created_at":  user.created_at,
    }


@router.post("/signup")
async def signup(data: UserCreate, bg: BackgroundTasks):
    if await User.find_one(User.email == data.email):
        raise HTTPException(400, "Email already registered")
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    await user.insert()
    token = secrets.token_urlsafe(32)
    await EmailVerificationToken(
        user_id=str(user.id),
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=24),
    ).insert()
    bg.add_task(send_verification_email, data.email, data.name, token)
    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "user":         _user_out(user),
        "message":      "Account created! Check your email to verify.",
    }


@router.post("/login")
async def login(data: UserLogin):
    user = await User.find_one(User.email == data.email)
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")
    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "user":         _user_out(user),
    }


@router.post("/verify-email")
async def verify_email(token: str):
    rec = await EmailVerificationToken.find_one(
        EmailVerificationToken.token == token,
        EmailVerificationToken.used  == False,
    )
    if not rec or rec.expires_at < datetime.utcnow():
        raise HTTPException(400, "Invalid or expired link")
    user = await User.get(rec.user_id)
    if not user:
        raise HTTPException(404, "User not found")

    if rec.new_email:
        # This is an email-change verification — apply the new email
        user.email = rec.new_email
        user.is_verified = True
        await user.save()
        rec.used = True
        await rec.save()
        return {"message": "Email updated and verified!"}
    else:
        # This is a signup verification
        user.is_verified = True
        await user.save()
        rec.used = True
        await rec.save()
        return {"message": "Email verified!"}


@router.post("/forgot-password")
async def forgot_password(data: ForgotRequest, bg: BackgroundTasks):
    user = await User.find_one(User.email == data.email)
    if user:
        token = secrets.token_urlsafe(32)
        await PasswordResetToken(
            user_id=str(user.id),
            token=token,
            expires_at=datetime.utcnow() + timedelta(hours=1),
        ).insert()
        bg.add_task(send_password_reset_email, user.email, user.name, token)
    return {"message": "If that email exists you will receive a reset link."}


class DirectResetRequest(BaseModel):
    email: str
    new_password: str


@router.post("/direct-reset")
async def direct_reset(data: DirectResetRequest):
    """Dev/local only — reset password directly with just email, no token needed."""
    print(f"[DIRECT-RESET] Attempting for email: {data.email}")
    user = await User.find_one(User.email == data.email)
    if not user:
        print(f"[DIRECT-RESET] No user found for: {data.email}")
        raise HTTPException(404, "No account found with that email address")
    if len(data.new_password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    user.hashed_password = hash_password(data.new_password)
    await user.save()
    print(f"[DIRECT-RESET] Password updated for: {data.email}")
    return {"message": "Password reset successfully!"}


@router.post("/forgot-password-dev")
async def forgot_password_dev(data: ForgotRequest):
    """Local dev only — returns the reset token directly instead of sending email."""
    user = await User.find_one(User.email == data.email)
    if not user:
        raise HTTPException(404, "No account found with that email")
    token = secrets.token_urlsafe(32)
    await PasswordResetToken(
        user_id=str(user.id),
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=1),
    ).insert()
    return {"token": token, "message": "Token generated (dev mode)"}


@router.post("/reset-password")
async def reset_password(data: ResetRequest):
    print(f"[RESET] Attempting reset with token: {data.token[:20]}... (len={len(data.token)})")
    
    # Find token (used or not) for debugging
    any_rec = await PasswordResetToken.find_one(PasswordResetToken.token == data.token)
    if not any_rec:
        print(f"[RESET] Token not found in DB at all")
        raise HTTPException(400, "Reset link is invalid. Please request a new one.")
    if any_rec.used:
        print(f"[RESET] Token already used")
        raise HTTPException(400, "This reset link has already been used. Please request a new one.")
    if any_rec.expires_at < datetime.utcnow():
        print(f"[RESET] Token expired at {any_rec.expires_at}")
        raise HTTPException(400, "This reset link has expired (1 hour limit). Please request a new one.")
    
    user = await User.get(any_rec.user_id)
    if not user:
        raise HTTPException(404, "User not found")
    user.hashed_password = hash_password(data.new_password)
    await user.save()
    any_rec.used = True
    await any_rec.save()
    print(f"[RESET] Password reset successfully for {user.email}")
    return {"message": "Password reset successfully!"}
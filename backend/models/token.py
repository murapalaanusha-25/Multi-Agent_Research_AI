from beanie import Document
from datetime import datetime


class PasswordResetToken(Document):
    user_id: str
    token: str
    expires_at: datetime
    used: bool = False

    class Settings:
        name = "password_reset_tokens"


class EmailVerificationToken(Document):
    user_id: str
    token: str
    expires_at: datetime
    used: bool = False
    new_email: str = ""   # set when verifying an email change (empty for signup verify)

    class Settings:
        name = "email_verification_tokens"
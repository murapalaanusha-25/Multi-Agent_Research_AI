from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL   = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "researchai")

client: AsyncIOMotorClient = None


async def connect_db():
    global client
    from models.user     import User
    from models.research import ResearchReport
    from models.chat     import ChatSession
    from models.token    import PasswordResetToken, EmailVerificationToken

    client = AsyncIOMotorClient(MONGODB_URL)
    await init_beanie(
        database=client[DATABASE_NAME],
        document_models=[
            User,
            ResearchReport,
            ChatSession,
            PasswordResetToken,
            EmailVerificationToken,
        ],
    )
    print(f"✅ MongoDB connected — database: {DATABASE_NAME}")


async def disconnect_db():
    global client
    if client:
        client.close()
        print("MongoDB disconnected")

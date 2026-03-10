from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from database import connect_db, disconnect_db
from routers  import auth, research, chat, user

app = FastAPI(title="ResearchAI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_error(request: Request, exc: RequestValidationError):
    print("VALIDATION ERROR:", exc.errors())
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.on_event("startup")
async def startup():
    await connect_db()


@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()


app.include_router(auth.router,     prefix="/auth",     tags=["Auth"])
app.include_router(research.router, prefix="/research", tags=["Research"])
app.include_router(chat.router,     prefix="/chat",     tags=["Chat"])
app.include_router(user.router,     prefix="/user",     tags=["User"])


@app.get("/")
async def root():
    return {"status": "ResearchAI API running", "docs": "/docs"}

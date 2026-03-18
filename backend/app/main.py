"""
EduLearn - Gamified Learning Platform
Backend API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.database import engine, Base
from app.api import auth, lessons, quiz, gamification, payment, news, admin, leaderboard, friends, bookmarks, certificates, search, challenges, ai_chat
from app.tasks.premium_tasks import check_premium_expiry
from app.config import settings

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Scheduler
    scheduler.add_job(check_premium_expiry, 'cron', hour=9, minute=0)
    scheduler.start()
    print("⏰ Scheduler ishga tushdi")
    print("🚀 Backend ishga tushdi!")
    
    yield
    
    # Shutdown
    scheduler.shutdown()
    print("⏰ Scheduler to'xtatildi")
    print("👋 Backend to'xtatildi!")


app = FastAPI(
    title="EduLearn API",
    description="Gamified Learning Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (payment screenshots)
os.makedirs("uploads/payments", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["lessons"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])
app.include_router(gamification.router, prefix="/api/gamification", tags=["gamification"])
app.include_router(payment.router, prefix="/api/payment", tags=["payment"])
app.include_router(news.router, prefix="/api/news", tags=["news"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["leaderboard"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(friends.router, prefix="/api/friends", tags=["friends"])
app.include_router(bookmarks.router, prefix="/api/bookmarks", tags=["bookmarks"])
app.include_router(certificates.router, prefix="/api/certificates", tags=["certificates"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(challenges.router, prefix="/api/challenges", tags=["challenges"])
app.include_router(ai_chat.router, prefix="/api/ai", tags=["ai"])


@app.get("/")
async def root():
    return {
        "name": "EduLearn API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}

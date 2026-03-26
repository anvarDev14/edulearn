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
from sqlalchemy import text

from app.database import engine, Base
from app.api import auth, lessons, quiz, gamification, payment, news, admin, leaderboard, friends, bookmarks, certificates, search, challenges, ai_chat, audio, books, battle
from app.tasks.premium_tasks import check_premium_expiry
from app.config import settings

scheduler = AsyncIOScheduler()


async def run_migrations(conn):
    """Eski DB tablalarga yangi ustunlarni qo'shish (Alembic o'rniga)"""

    async def add_col(table, column, col_type, default=None):
        result = await conn.execute(text(f"PRAGMA table_info({table})"))
        existing = [row[1] for row in result.fetchall()]
        if column not in existing:
            default_sql = f" DEFAULT {default}" if default is not None else ""
            await conn.execute(text(
                f"ALTER TABLE {table} ADD COLUMN {column} {col_type}{default_sql}"
            ))
            print(f"🔧 Migration: {table}.{column} qo'shildi")

    # users
    await add_col("users", "total_xp",      "INTEGER",  0)
    await add_col("users", "level",          "INTEGER",  1)
    await add_col("users", "streak_days",    "INTEGER",  0)
    await add_col("users", "last_activity",  "DATETIME")
    await add_col("users", "is_premium",     "BOOLEAN",  0)
    await add_col("users", "premium_until",  "DATETIME")
    await add_col("users", "is_active",      "BOOLEAN",  1)
    await add_col("users", "updated_at",     "DATETIME")

    # modules
    await add_col("modules", "is_active",    "BOOLEAN",  1)
    await add_col("modules", "image_url",    "VARCHAR(500)")
    await add_col("modules", "emoji",        "VARCHAR(10)", "'📚'")

    # lessons
    await add_col("lessons", "is_active",    "BOOLEAN",  1)
    await add_col("lessons", "duration_min", "INTEGER",  10)
    await add_col("lessons", "content",      "TEXT")

    # news
    await add_col("news", "media_type",  "VARCHAR(20)", "'text'")
    await add_col("news", "media_url",   "VARCHAR(500)")
    await add_col("news", "is_pinned",   "BOOLEAN",     0)
    await add_col("news", "is_active",   "BOOLEAN",     1)
    await add_col("news", "views_count", "INTEGER",     0)

    # quizzes
    await add_col("quizzes", "pass_percentage",  "INTEGER", 70)
    await add_col("quizzes", "time_limit_sec",   "INTEGER", 300)
    await add_col("quizzes", "xp_reward",        "INTEGER", 100)

    # questions
    await add_col("questions", "explanation",   "TEXT")
    await add_col("questions", "order_index",   "INTEGER", 0)
    await add_col("questions", "question_type", "VARCHAR(30)", "'multiple_choice'")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await run_migrations(conn)

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
os.makedirs("uploads/videos", exist_ok=True)
os.makedirs("uploads/audio", exist_ok=True)
os.makedirs("uploads/books", exist_ok=True)
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
app.include_router(audio.router, prefix="/api/audio", tags=["audio"])
app.include_router(books.router, prefix="/api/books", tags=["books"])
app.include_router(battle.router, prefix="/api/battle", tags=["battle"])


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

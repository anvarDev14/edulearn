"""
Admin API
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import uuid
import os

from app.database import get_db
from app.models.user import User
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.quiz import Quiz, Question
from app.models.payment import Payment
from app.models.progress import UserProgress
from app.models.audio import AudioCategory, Audio
from app.models.book import BookCategory, Book
from app.api.deps import get_current_admin

router = APIRouter()


# Schemas
class ModuleCreate(BaseModel):
    title: str
    description: Optional[str] = None
    emoji: str = "📚"
    image_url: Optional[str] = None
    is_premium: bool = False
    order_index: int = 0


class LessonCreate(BaseModel):
    module_id: int
    title: str
    description: Optional[str] = None
    content: Optional[str] = None
    video_url: Optional[str] = None
    xp_reward: int = 50
    order_index: int = 0
    is_premium: bool = False
    duration_min: int = 10


class QuizCreate(BaseModel):
    lesson_id: int
    title: str
    description: Optional[str] = None
    xp_reward: int = 100
    pass_percentage: int = 70
    time_limit_sec: int = 300


class QuestionCreate(BaseModel):
    question_text: str
    question_type: str = "multiple_choice"
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None
    order_index: int = 0


class GrantPremium(BaseModel):
    days: int = 30


# Audio schemas
class AudioCategoryCreate(BaseModel):
    title: str
    description: Optional[str] = None
    emoji: str = "🎧"
    order_index: int = 0


class AudioCreate(BaseModel):
    category_id: int
    title: str
    description: Optional[str] = None
    audio_url: str
    cover_url: Optional[str] = None
    duration_sec: int = 0
    author: Optional[str] = None
    language: Optional[str] = None
    is_premium: bool = False
    order_index: int = 0


# Book schemas
class BookCategoryCreate(BaseModel):
    title: str
    description: Optional[str] = None
    emoji: str = "📖"
    order_index: int = 0


class BookCreate(BaseModel):
    category_id: int
    title: str
    description: Optional[str] = None
    file_url: Optional[str] = None
    cover_url: Optional[str] = None
    author: Optional[str] = None
    language: Optional[str] = None
    pages: Optional[int] = None
    is_premium: bool = False
    order_index: int = 0


# Dashboard
@router.get("/stats")
async def get_dashboard_stats(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Dashboard statistikasi"""
    # Users count
    result = await db.execute(select(func.count(User.id)))
    total_users = result.scalar() or 0
    
    result = await db.execute(
        select(func.count(User.id))
        .where(User.is_premium == True)
    )
    premium_users = result.scalar() or 0
    
    # Today's active users
    today_start = datetime.combine(datetime.utcnow().date(), datetime.min.time())
    result = await db.execute(
        select(func.count(User.id))
        .where(User.last_activity >= today_start)
    )
    active_today = result.scalar() or 0
    
    # Content stats
    result = await db.execute(select(func.count(Module.id)))
    total_modules = result.scalar() or 0
    
    result = await db.execute(select(func.count(Lesson.id)))
    total_lessons = result.scalar() or 0
    
    result = await db.execute(select(func.count(Quiz.id)))
    total_quizzes = result.scalar() or 0
    
    # Payments
    result = await db.execute(
        select(func.count(Payment.id))
        .where(Payment.status == "pending")
    )
    pending_payments = result.scalar() or 0
    
    result = await db.execute(
        select(func.sum(Payment.amount))
        .where(Payment.status == "approved")
    )
    total_revenue = result.scalar() or 0
    
    return {
        "users": {
            "total": total_users,
            "premium": premium_users,
            "free": total_users - premium_users,
            "active_today": active_today
        },
        "content": {
            "modules": total_modules,
            "lessons": total_lessons,
            "quizzes": total_quizzes
        },
        "payments": {
            "pending": pending_payments,
            "total_revenue": total_revenue
        }
    }


# Users management
@router.get("/users")
async def get_users(
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Foydalanuvchilar ro'yxati"""
    result = await db.execute(
        select(User)
        .order_by(desc(User.created_at))
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    
    return [
        {
            "id": u.id,
            "telegram_id": u.telegram_id,
            "username": u.username,
            "full_name": u.full_name,
            "total_xp": u.total_xp,
            "level": u.level,
            "is_premium": u.is_premium,
            "premium_until": u.premium_until.isoformat() if u.premium_until else None,
            "is_admin": u.is_admin,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat()
        }
        for u in users
    ]


@router.post("/users/{user_id}/grant-premium")
async def grant_premium(
    user_id: int,
    data: GrantPremium,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Qo'lda premium berish"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(404, "User topilmadi")
    
    user.is_premium = True
    user.premium_until = datetime.utcnow() + timedelta(days=data.days)
    await db.commit()
    
    return {
        "success": True,
        "premium_until": user.premium_until.isoformat(),
        "message": f"{data.days} kunlik premium berildi"
    }


@router.post("/users/{user_id}/revoke-premium")
async def revoke_premium(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Premiumni bekor qilish"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(404, "User topilmadi")
    
    user.is_premium = False
    user.premium_until = None
    await db.commit()
    
    return {"success": True, "message": "Premium bekor qilindi"}


@router.post("/users/{user_id}/toggle-admin")
async def toggle_admin(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Admin statusni o'zgartirish"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(404, "User topilmadi")
    
    if user.id == admin.id:
        raise HTTPException(400, "O'zingizni admin statusini o'zgartira olmaysiz")
    
    user.is_admin = not user.is_admin
    await db.commit()
    
    return {
        "success": True,
        "is_admin": user.is_admin,
        "message": "Admin qilindi" if user.is_admin else "Admin statusdan chiqarildi"
    }


# Module CRUD
@router.post("/modules")
async def create_module(
    data: ModuleCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Modul yaratish"""
    module = Module(**data.model_dump())
    db.add(module)
    await db.commit()
    await db.refresh(module)
    
    return {"id": module.id, "title": module.title}


@router.get("/modules")
async def get_all_modules(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Barcha modullar"""
    result = await db.execute(
        select(Module).order_by(Module.order_index)
    )
    modules = result.scalars().all()
    
    return [
        {
            "id": m.id,
            "title": m.title,
            "emoji": m.emoji,
            "is_premium": m.is_premium,
            "is_active": m.is_active,
            "order_index": m.order_index
        }
        for m in modules
    ]


@router.delete("/modules/{module_id}")
async def delete_module(
    module_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Modulni o'chirish"""
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()
    
    if not module:
        raise HTTPException(404, "Modul topilmadi")
    
    await db.delete(module)
    await db.commit()
    
    return {"success": True}


# Video upload for lessons
@router.post("/lessons/upload-video")
async def upload_lesson_video(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin)
):
    """Dars videosini yuklash"""
    allowed = {"mp4", "webm", "mov", "avi", "mkv"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed:
        raise HTTPException(400, "Faqat video fayllar qabul qilinadi (mp4, webm, mov, avi, mkv)")

    os.makedirs("uploads/videos", exist_ok=True)
    filename = f"{uuid.uuid4()}.{ext}"
    path = f"uploads/videos/{filename}"

    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)

    return {"url": f"uploads/videos/{filename}"}


# Lesson CRUD
@router.post("/lessons")
async def create_lesson(
    data: LessonCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Dars yaratish"""
    lesson = Lesson(**data.model_dump())
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    
    return {"id": lesson.id, "title": lesson.title}


@router.delete("/lessons/{lesson_id}")
async def delete_lesson(
    lesson_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Darsni o'chirish"""
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    
    if not lesson:
        raise HTTPException(404, "Dars topilmadi")
    
    await db.delete(lesson)
    await db.commit()
    
    return {"success": True}


# Quiz CRUD
@router.post("/quizzes")
async def create_quiz(
    data: QuizCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Quiz yaratish"""
    quiz = Quiz(**data.model_dump())
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    
    return {"id": quiz.id, "title": quiz.title}


@router.post("/quizzes/{quiz_id}/questions")
async def add_question(
    quiz_id: int,
    data: QuestionCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Savol qo'shish"""
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalar_one_or_none()
    
    if not quiz:
        raise HTTPException(404, "Quiz topilmadi")
    
    question = Question(quiz_id=quiz_id, **data.model_dump())
    db.add(question)
    await db.commit()
    await db.refresh(question)
    
    return {"id": question.id}


@router.delete("/quizzes/{quiz_id}")
async def delete_quiz(
    quiz_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Quizni o'chirish"""
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalar_one_or_none()

    if not quiz:
        raise HTTPException(404, "Quiz topilmadi")

    await db.delete(quiz)
    await db.commit()

    return {"success": True}


# ─── Audio Library Admin ───────────────────────────────────────────────────────

@router.get("/audio/categories")
async def get_audio_categories(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AudioCategory).order_by(AudioCategory.order_index))
    cats = result.scalars().all()
    return [{"id": c.id, "title": c.title, "emoji": c.emoji, "order_index": c.order_index, "is_active": c.is_active} for c in cats]


@router.post("/audio/categories")
async def create_audio_category(
    data: AudioCategoryCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    cat = AudioCategory(**data.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return {"id": cat.id, "title": cat.title}


@router.delete("/audio/categories/{cat_id}")
async def delete_audio_category(
    cat_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AudioCategory).where(AudioCategory.id == cat_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(404, "Kategoriya topilmadi")
    await db.delete(cat)
    await db.commit()
    return {"success": True}


@router.get("/audio/categories/{cat_id}/audios")
async def get_category_audios_admin(
    cat_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Audio).where(Audio.category_id == cat_id).order_by(Audio.order_index)
    )
    audios = result.scalars().all()
    return [{"id": a.id, "title": a.title, "author": a.author, "is_premium": a.is_premium, "duration_sec": a.duration_sec, "order_index": a.order_index} for a in audios]


@router.post("/audio")
async def create_audio(
    data: AudioCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    audio = Audio(**data.model_dump())
    db.add(audio)
    await db.commit()
    await db.refresh(audio)
    return {"id": audio.id, "title": audio.title}


@router.delete("/audio/{audio_id}")
async def delete_audio(
    audio_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Audio).where(Audio.id == audio_id))
    audio = result.scalar_one_or_none()
    if not audio:
        raise HTTPException(404, "Audio topilmadi")
    await db.delete(audio)
    await db.commit()
    return {"success": True}


@router.post("/audio/upload")
async def upload_audio_file(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin)
):
    """Audio fayl yuklash"""
    allowed = {"mp3", "wav", "ogg", "m4a", "aac", "flac"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed:
        raise HTTPException(400, "Faqat audio fayllar qabul qilinadi (mp3, wav, ogg, m4a, aac)")
    os.makedirs("uploads/audio", exist_ok=True)
    filename = f"{uuid.uuid4()}.{ext}"
    path = f"uploads/audio/{filename}"
    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)
    return {"url": f"uploads/audio/{filename}"}


# ─── Books Library Admin ───────────────────────────────────────────────────────

@router.get("/books/categories")
async def get_book_categories(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BookCategory).order_by(BookCategory.order_index))
    cats = result.scalars().all()
    return [{"id": c.id, "title": c.title, "emoji": c.emoji, "order_index": c.order_index, "is_active": c.is_active} for c in cats]


@router.post("/books/categories")
async def create_book_category(
    data: BookCategoryCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    cat = BookCategory(**data.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return {"id": cat.id, "title": cat.title}


@router.delete("/books/categories/{cat_id}")
async def delete_book_category(
    cat_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(BookCategory).where(BookCategory.id == cat_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(404, "Kategoriya topilmadi")
    await db.delete(cat)
    await db.commit()
    return {"success": True}


@router.get("/books/categories/{cat_id}/books")
async def get_category_books_admin(
    cat_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Book).where(Book.category_id == cat_id).order_by(Book.order_index)
    )
    books = result.scalars().all()
    return [{"id": b.id, "title": b.title, "author": b.author, "is_premium": b.is_premium, "pages": b.pages, "order_index": b.order_index} for b in books]


@router.post("/books")
async def create_book(
    data: BookCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    book = Book(**data.model_dump())
    db.add(book)
    await db.commit()
    await db.refresh(book)
    return {"id": book.id, "title": book.title}


@router.delete("/books/{book_id}")
async def delete_book(
    book_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(404, "Kitob topilmadi")
    await db.delete(book)
    await db.commit()
    return {"success": True}


@router.post("/books/upload")
async def upload_book_file(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_admin)
):
    """Kitob fayl yuklash (PDF va boshqalar)"""
    allowed = {"pdf", "epub", "fb2", "djvu", "doc", "docx"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed:
        raise HTTPException(400, "Faqat kitob fayllar qabul qilinadi (pdf, epub, fb2)")
    os.makedirs("uploads/books", exist_ok=True)
    filename = f"{uuid.uuid4()}.{ext}"
    path = f"uploads/books/{filename}"
    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)
    return {"url": f"uploads/books/{filename}"}

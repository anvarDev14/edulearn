"""
Admin API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.quiz import Quiz, Question
from app.models.payment import Payment
from app.models.progress import UserProgress
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

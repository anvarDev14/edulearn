"""
Lessons API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.progress import UserProgress
from app.models.xp_history import XPHistory
from app.api.deps import get_current_user, get_premium_user
from app.core.xp_engine import XPEngine
from app.core.level_engine import LevelEngine

router = APIRouter()
xp_engine = XPEngine()
level_engine = LevelEngine()


@router.get("/modules")
async def get_modules(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Modullar ro'yxati"""
    result = await db.execute(
        select(Module)
        .where(Module.is_active == True)
        .order_by(Module.order_index)
    )
    modules = result.scalars().all()
    
    # User progress
    progress_result = await db.execute(
        select(UserProgress)
        .where(UserProgress.user_id == current_user.id)
    )
    user_progress = {p.lesson_id: p for p in progress_result.scalars().all()}
    
    modules_data = []
    for module in modules:
        # Count lessons and completed
        lessons_result = await db.execute(
            select(Lesson)
            .where(and_(Lesson.module_id == module.id, Lesson.is_active == True))
        )
        lessons = lessons_result.scalars().all()
        
        total_lessons = len(lessons)
        completed_lessons = sum(1 for l in lessons if l.id in user_progress and user_progress[l.id].is_completed)
        
        modules_data.append({
            "id": module.id,
            "title": module.title,
            "description": module.description,
            "emoji": module.emoji,
            "image_url": module.image_url,
            "is_premium": module.is_premium,
            "is_locked": module.is_premium and not current_user.is_premium and not current_user.is_admin,
            "total_lessons": total_lessons,
            "completed_lessons": completed_lessons,
            "progress": round((completed_lessons / total_lessons * 100) if total_lessons > 0 else 0, 1)
        })
    
    return modules_data


@router.get("/modules/{module_id}/lessons")
async def get_module_lessons(
    module_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Modul darslari"""
    # Check module exists
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()
    
    if not module:
        raise HTTPException(status_code=404, detail="Modul topilmadi")
    
    # Check premium access
    if module.is_premium and not current_user.is_premium and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail={"error": "premium_required", "message": "Bu modul faqat Premium uchun"}
        )
    
    # Get lessons
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.quiz))
        .where(and_(Lesson.module_id == module_id, Lesson.is_active == True))
        .order_by(Lesson.order_index)
    )
    lessons = result.scalars().all()
    
    # User progress
    progress_result = await db.execute(
        select(UserProgress)
        .where(UserProgress.user_id == current_user.id)
    )
    user_progress = {p.lesson_id: p for p in progress_result.scalars().all()}
    
    lessons_data = []
    previous_completed = True  # First lesson is always unlocked
    
    for lesson in lessons:
        is_completed = lesson.id in user_progress and user_progress[lesson.id].is_completed
        
        # Lock logic
        is_locked = False
        lock_reason = None
        
        if not previous_completed:
            is_locked = True
            lock_reason = "previous_incomplete"
        
        if lesson.is_premium and not current_user.is_premium and not current_user.is_admin:
            is_locked = True
            lock_reason = "premium_required"
        
        lessons_data.append({
            "id": lesson.id,
            "title": lesson.title,
            "description": lesson.description,
            "duration_min": lesson.duration_min,
            "xp_reward": lesson.xp_reward,
            "is_premium": lesson.is_premium,
            "is_completed": is_completed,
            "is_locked": is_locked,
            "lock_reason": lock_reason,
            "has_quiz": lesson.quiz is not None,
            "quiz_score": user_progress[lesson.id].quiz_score if lesson.id in user_progress else None
        })
        
        previous_completed = is_completed
    
    return {
        "module": {
            "id": module.id,
            "title": module.title,
            "emoji": module.emoji
        },
        "lessons": lessons_data
    }


@router.get("/{lesson_id}")
async def get_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Dars tafsilotlari"""
    result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.module), selectinload(Lesson.quiz))
        .where(Lesson.id == lesson_id)
    )
    lesson = result.scalar_one_or_none()
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Dars topilmadi")
    
    # Check premium
    if lesson.is_premium and not current_user.is_premium and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail={"error": "premium_required", "message": "Bu dars faqat Premium uchun"}
        )
    
    # Get progress
    progress_result = await db.execute(
        select(UserProgress)
        .where(and_(
            UserProgress.user_id == current_user.id,
            UserProgress.lesson_id == lesson_id
        ))
    )
    progress = progress_result.scalar_one_or_none()
    
    return {
        "id": lesson.id,
        "title": lesson.title,
        "description": lesson.description,
        "content": lesson.content,
        "video_url": lesson.video_url,
        "duration_min": lesson.duration_min,
        "xp_reward": lesson.xp_reward,
        "is_premium": lesson.is_premium,
        "module": {
            "id": lesson.module.id,
            "title": lesson.module.title,
            "emoji": lesson.module.emoji
        },
        "has_quiz": lesson.quiz is not None,
        "quiz_id": lesson.quiz.id if lesson.quiz else None,
        "is_completed": progress.is_completed if progress else False,
        "quiz_score": progress.quiz_score if progress else None
    }


@router.post("/{lesson_id}/complete")
async def complete_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Darsni tugatish"""
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Dars topilmadi")
    
    # Check if already completed
    progress_result = await db.execute(
        select(UserProgress)
        .where(and_(
            UserProgress.user_id == current_user.id,
            UserProgress.lesson_id == lesson_id
        ))
    )
    progress = progress_result.scalar_one_or_none()
    
    if progress and progress.is_completed:
        return {"message": "Dars allaqachon tugatilgan", "xp_gained": 0}
    
    # Create or update progress
    if not progress:
        progress = UserProgress(
            user_id=current_user.id,
            lesson_id=lesson_id
        )
        db.add(progress)
    
    progress.is_completed = True
    progress.completed_at = datetime.utcnow()
    
    # Award XP
    xp_amount = xp_engine.calculate_lesson_xp(lesson.xp_reward)
    old_level = current_user.level
    current_user.total_xp += xp_amount
    new_level = level_engine.calculate_level(current_user.total_xp)
    current_user.level = new_level
    
    # XP History
    xp_history = XPHistory(
        user_id=current_user.id,
        amount=xp_amount,
        source="lesson",
        source_id=lesson_id,
        description=f"Dars tugatildi: {lesson.title}"
    )
    db.add(xp_history)
    
    await db.commit()
    
    level_info = level_engine.get_level_info(current_user.total_xp)
    
    return {
        "success": True,
        "xp_gained": xp_amount,
        "total_xp": current_user.total_xp,
        "level_up": new_level > old_level,
        "old_level": old_level,
        "new_level": new_level,
        "level_info": level_info
    }

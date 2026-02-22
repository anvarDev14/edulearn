"""
Gamification API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, date

from app.database import get_db
from app.models.user import User
from app.models.xp_history import XPHistory
from app.models.progress import UserProgress
from app.api.deps import get_current_user
from app.core.xp_engine import XPEngine
from app.core.level_engine import LevelEngine

router = APIRouter()
xp_engine = XPEngine()
level_engine = LevelEngine()


@router.get("/stats")
async def get_gamification_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Gamification statistikasi"""
    level_info = level_engine.get_level_info(current_user.total_xp)
    
    # Total completed lessons
    result = await db.execute(
        select(func.count(UserProgress.id))
        .where(and_(
            UserProgress.user_id == current_user.id,
            UserProgress.is_completed == True
        ))
    )
    completed_lessons = result.scalar() or 0
    
    # XP this week
    from datetime import timedelta
    week_ago = datetime.utcnow() - timedelta(days=7)
    result = await db.execute(
        select(func.sum(XPHistory.amount))
        .where(and_(
            XPHistory.user_id == current_user.id,
            XPHistory.created_at >= week_ago
        ))
    )
    weekly_xp = result.scalar() or 0
    
    # XP today
    today_start = datetime.combine(date.today(), datetime.min.time())
    result = await db.execute(
        select(func.sum(XPHistory.amount))
        .where(and_(
            XPHistory.user_id == current_user.id,
            XPHistory.created_at >= today_start
        ))
    )
    today_xp = result.scalar() or 0
    
    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "photo_url": current_user.photo_url,
            "is_premium": current_user.is_premium
        },
        "level": level_info,
        "stats": {
            "completed_lessons": completed_lessons,
            "streak_days": current_user.streak_days,
            "weekly_xp": weekly_xp,
            "today_xp": today_xp
        }
    }


@router.get("/xp-history")
async def get_xp_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """XP tarixi"""
    result = await db.execute(
        select(XPHistory)
        .where(XPHistory.user_id == current_user.id)
        .order_by(XPHistory.created_at.desc())
        .limit(limit)
    )
    history = result.scalars().all()
    
    return [
        {
            "id": h.id,
            "amount": h.amount,
            "source": h.source,
            "description": h.description,
            "created_at": h.created_at.isoformat()
        }
        for h in history
    ]


@router.post("/daily-challenge")
async def claim_daily_challenge(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Kunlik challenge XP olish"""
    today_start = datetime.combine(date.today(), datetime.min.time())
    
    # Check if already claimed today
    result = await db.execute(
        select(XPHistory)
        .where(and_(
            XPHistory.user_id == current_user.id,
            XPHistory.source == "daily_challenge",
            XPHistory.created_at >= today_start
        ))
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="Bugun allaqachon oldingiz")
    
    # Award XP
    xp_amount = xp_engine.calculate_daily_challenge_xp(current_user.streak_days)
    old_level = current_user.level
    
    current_user.total_xp += xp_amount
    current_user.streak_days += 1
    new_level = level_engine.calculate_level(current_user.total_xp)
    current_user.level = new_level
    current_user.last_activity = datetime.utcnow()
    
    # XP History
    xp_history = XPHistory(
        user_id=current_user.id,
        amount=xp_amount,
        source="daily_challenge",
        description=f"Kunlik bonus (Streak: {current_user.streak_days} kun)"
    )
    db.add(xp_history)
    
    await db.commit()
    
    level_info = level_engine.get_level_info(current_user.total_xp)
    
    return {
        "success": True,
        "xp_gained": xp_amount,
        "streak_days": current_user.streak_days,
        "total_xp": current_user.total_xp,
        "level_up": new_level > old_level,
        "level_info": level_info
    }

"""
Leaderboard API
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.user import User
from app.api.deps import get_current_user
from app.core.level_engine import LevelEngine

router = APIRouter()
level_engine = LevelEngine()


@router.get("/global")
async def get_global_leaderboard(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Global leaderboard"""
    result = await db.execute(
        select(User)
        .where(User.is_active == True)
        .order_by(desc(User.total_xp))
        .limit(limit)
    )
    users = result.scalars().all()
    
    leaderboard = []
    for rank, user in enumerate(users, 1):
        leaderboard.append({
            "rank": rank,
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "photo_url": user.photo_url,
            "total_xp": user.total_xp,
            "level": user.level,
            "level_badge": level_engine.get_level_badge(user.level),
            "is_premium": user.is_premium,
            "is_current_user": user.id == current_user.id
        })
    
    # Get current user's rank if not in top
    current_user_in_top = any(u["is_current_user"] for u in leaderboard)
    current_user_rank = None
    
    if not current_user_in_top:
        # Count users with more XP
        rank_result = await db.execute(
            select(User)
            .where(User.total_xp > current_user.total_xp)
        )
        users_above = len(rank_result.scalars().all())
        current_user_rank = users_above + 1
    
    return {
        "leaderboard": leaderboard,
        "current_user": {
            "rank": current_user_rank,
            "total_xp": current_user.total_xp,
            "level": current_user.level,
            "level_badge": level_engine.get_level_badge(current_user.level)
        } if not current_user_in_top else None
    }


@router.get("/weekly")
async def get_weekly_leaderboard(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Haftalik leaderboard - so'nggi 7 kunlik XP bo'yicha"""
    from datetime import datetime, timedelta
    from sqlalchemy import func
    from app.models.xp_history import XPHistory
    
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    result = await db.execute(
        select(
            User.id,
            User.username,
            User.full_name,
            User.photo_url,
            User.level,
            User.is_premium,
            func.sum(XPHistory.amount).label("weekly_xp")
        )
        .join(XPHistory, XPHistory.user_id == User.id)
        .where(XPHistory.created_at >= week_ago)
        .group_by(User.id)
        .order_by(desc("weekly_xp"))
        .limit(limit)
    )
    users = result.all()
    
    leaderboard = []
    for rank, user in enumerate(users, 1):
        leaderboard.append({
            "rank": rank,
            "user_id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "photo_url": user.photo_url,
            "weekly_xp": user.weekly_xp or 0,
            "level": user.level,
            "level_badge": level_engine.get_level_badge(user.level),
            "is_premium": user.is_premium,
            "is_current_user": user.id == current_user.id
        })
    
    return {"leaderboard": leaderboard}

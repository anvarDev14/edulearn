"""
Search API
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from app.database import get_db
from app.models.user import User
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.news import News
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/")
async def search(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    q_clean = q.strip().lstrip("@")
    if not q_clean:
        return {"modules": [], "lessons": [], "news": [], "users": []}

    pattern = f"%{q_clean}%"

    # Search modules
    modules_result = await db.execute(
        select(Module).where(
            Module.is_active == True,
            or_(
                func.lower(Module.title).contains(func.lower(q_clean)),
                Module.title.ilike(pattern),
                Module.description.ilike(pattern),
            )
        ).limit(6)
    )
    modules = modules_result.scalars().all()

    # Search lessons
    lessons_result = await db.execute(
        select(Lesson).where(
            Lesson.is_active == True,
            or_(
                Lesson.title.ilike(pattern),
                func.lower(Lesson.title).contains(func.lower(q_clean)),
            )
        ).limit(6)
    )
    lessons = lessons_result.scalars().all()

    # Search news
    news_result = await db.execute(
        select(News).where(
            News.is_active == True,
            or_(
                News.title.ilike(pattern),
                News.content.ilike(pattern),
            )
        ).limit(4)
    )
    news_items = news_result.scalars().all()

    # Search users (exclude self)
    users_result = await db.execute(
        select(User).where(
            User.id != current_user.id,
            User.is_active == True,
            or_(
                User.username.ilike(pattern),
                User.full_name.ilike(pattern),
                func.lower(User.full_name).contains(func.lower(q_clean)),
            )
        ).order_by(User.total_xp.desc()).limit(8)
    )
    users = users_result.scalars().all()

    return {
        "modules": [
            {
                "id": m.id,
                "title": m.title,
                "description": m.description,
                "emoji": m.emoji,
                "is_premium": m.is_premium,
            }
            for m in modules
        ],
        "lessons": [
            {
                "id": l.id,
                "title": l.title,
                "module_id": l.module_id,
                "is_premium": l.is_premium,
            }
            for l in lessons
        ],
        "news": [
            {"id": n.id, "title": n.title}
            for n in news_items
        ],
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "full_name": u.full_name,
                "photo_url": u.photo_url,
                "total_xp": u.total_xp,
                "level": u.level,
                "is_premium": u.is_premium,
            }
            for u in users
        ],
    }

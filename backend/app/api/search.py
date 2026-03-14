"""
Search API
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
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
    q_lower = f"%{q.lower()}%"

    # Search modules
    modules_result = await db.execute(
        select(Module).where(
            or_(
                Module.title.ilike(q_lower),
                Module.description.ilike(q_lower)
            )
        ).limit(5)
    )
    modules = modules_result.scalars().all()

    # Search lessons
    lessons_result = await db.execute(
        select(Lesson).where(
            or_(
                Lesson.title.ilike(q_lower),
                Lesson.content.ilike(q_lower)
            )
        ).limit(5)
    )
    lessons = lessons_result.scalars().all()

    # Search news
    news_result = await db.execute(
        select(News).where(
            or_(
                News.title.ilike(q_lower),
                News.content.ilike(q_lower)
            )
        ).limit(5)
    )
    news_items = news_result.scalars().all()

    # Search users
    users_result = await db.execute(
        select(User).where(
            or_(
                User.username.ilike(q_lower),
                User.full_name.ilike(q_lower)
            )
        ).limit(5)
    )
    users = users_result.scalars().all()

    return {
        "modules": [{"id": m.id, "title": m.title, "description": m.description, "icon": getattr(m, 'icon', '📚')} for m in modules],
        "lessons": [{"id": l.id, "title": l.title, "module_id": l.module_id} for l in lessons],
        "news": [{"id": n.id, "title": n.title} for n in news_items],
        "users": [{"id": u.id, "username": u.username, "full_name": u.full_name, "photo_url": u.photo_url, "total_xp": u.total_xp} for u in users],
    }

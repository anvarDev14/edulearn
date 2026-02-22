"""
News API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.news import News
from app.api.deps import get_current_user, get_current_admin

router = APIRouter()


class NewsCreate(BaseModel):
    title: str
    content: Optional[str] = None
    media_type: str = "text"
    media_url: Optional[str] = None
    is_pinned: bool = False


class NewsUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_active: Optional[bool] = None


@router.get("")
async def get_news(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Yangiliklar ro'yxati"""
    result = await db.execute(
        select(News)
        .where(News.is_active == True)
        .order_by(desc(News.is_pinned), desc(News.created_at))
        .offset(skip)
        .limit(limit)
    )
    news = result.scalars().all()
    
    return [
        {
            "id": n.id,
            "title": n.title,
            "content": n.content,
            "media_type": n.media_type,
            "media_url": n.media_url,
            "is_pinned": n.is_pinned,
            "views_count": n.views_count,
            "created_at": n.created_at.isoformat()
        }
        for n in news
    ]


@router.get("/pinned")
async def get_pinned_news(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Pin qilingan yangiliklar"""
    result = await db.execute(
        select(News)
        .where(and_(News.is_active == True, News.is_pinned == True))
        .order_by(desc(News.created_at))
    )
    news = result.scalars().all()
    
    return [
        {
            "id": n.id,
            "title": n.title,
            "content": n.content,
            "media_type": n.media_type,
            "media_url": n.media_url,
            "created_at": n.created_at.isoformat()
        }
        for n in news
    ]


@router.get("/{news_id}")
async def get_news_detail(
    news_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Yangilik batafsil"""
    result = await db.execute(select(News).where(News.id == news_id))
    news = result.scalar_one_or_none()
    
    if not news:
        raise HTTPException(404, "Yangilik topilmadi")
    
    # Increment views
    news.views_count += 1
    await db.commit()
    
    return {
        "id": news.id,
        "title": news.title,
        "content": news.content,
        "media_type": news.media_type,
        "media_url": news.media_url,
        "is_pinned": news.is_pinned,
        "views_count": news.views_count,
        "created_at": news.created_at.isoformat()
    }


# Admin endpoints
@router.post("")
async def create_news(
    data: NewsCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Yangilik yaratish"""
    news = News(
        title=data.title,
        content=data.content,
        media_type=data.media_type,
        media_url=data.media_url,
        is_pinned=data.is_pinned
    )
    db.add(news)
    await db.commit()
    await db.refresh(news)
    
    return {
        "id": news.id,
        "title": news.title,
        "created_at": news.created_at.isoformat()
    }


@router.put("/{news_id}")
async def update_news(
    news_id: int,
    data: NewsUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Yangilikni tahrirlash"""
    result = await db.execute(select(News).where(News.id == news_id))
    news = result.scalar_one_or_none()
    
    if not news:
        raise HTTPException(404, "Yangilik topilmadi")
    
    if data.title is not None:
        news.title = data.title
    if data.content is not None:
        news.content = data.content
    if data.media_type is not None:
        news.media_type = data.media_type
    if data.media_url is not None:
        news.media_url = data.media_url
    if data.is_pinned is not None:
        news.is_pinned = data.is_pinned
    if data.is_active is not None:
        news.is_active = data.is_active
    
    await db.commit()
    
    return {"success": True, "message": "Yangilik yangilandi"}


@router.delete("/{news_id}")
async def delete_news(
    news_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Yangilikni o'chirish"""
    result = await db.execute(select(News).where(News.id == news_id))
    news = result.scalar_one_or_none()
    
    if not news:
        raise HTTPException(404, "Yangilik topilmadi")
    
    await db.delete(news)
    await db.commit()
    
    return {"success": True, "message": "Yangilik o'chirildi"}


@router.post("/{news_id}/pin")
async def toggle_pin(
    news_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Yangilikni pin/unpin qilish"""
    result = await db.execute(select(News).where(News.id == news_id))
    news = result.scalar_one_or_none()
    
    if not news:
        raise HTTPException(404, "Yangilik topilmadi")
    
    news.is_pinned = not news.is_pinned
    await db.commit()
    
    return {
        "success": True,
        "is_pinned": news.is_pinned,
        "message": "Pin qilindi" if news.is_pinned else "Pin olib tashlandi"
    }

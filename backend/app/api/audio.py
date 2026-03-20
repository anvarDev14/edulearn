"""
Audio Library API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.audio import AudioCategory, Audio
from app.api.deps import get_current_user

router = APIRouter()


def format_duration(seconds: int) -> str:
    if not seconds:
        return "0:00"
    m, s = divmod(seconds, 60)
    h, m = divmod(m, 60)
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


@router.get("/categories")
async def get_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Audio kategoriyalar ro'yxati"""
    result = await db.execute(
        select(AudioCategory)
        .where(AudioCategory.is_active == True)
        .order_by(AudioCategory.order_index)
    )
    categories = result.scalars().all()

    return [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "emoji": c.emoji,
            "order_index": c.order_index,
        }
        for c in categories
    ]


@router.get("/categories/{category_id}")
async def get_category_audios(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Kategoriya va uning audiolari"""
    result = await db.execute(
        select(AudioCategory).where(AudioCategory.id == category_id)
    )
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(404, "Kategoriya topilmadi")

    result = await db.execute(
        select(Audio)
        .where(Audio.category_id == category_id, Audio.is_active == True)
        .order_by(Audio.order_index)
    )
    audios = result.scalars().all()

    return {
        "category": {
            "id": category.id,
            "title": category.title,
            "description": category.description,
            "emoji": category.emoji,
        },
        "audios": [
            {
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "audio_url": a.audio_url,
                "cover_url": a.cover_url,
                "duration_sec": a.duration_sec,
                "duration_str": format_duration(a.duration_sec),
                "author": a.author,
                "language": a.language,
                "is_premium": a.is_premium,
            }
            for a in audios
        ]
    }


@router.get("/{audio_id}")
async def get_audio(
    audio_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Audio batafsil"""
    result = await db.execute(select(Audio).where(Audio.id == audio_id))
    audio = result.scalar_one_or_none()

    if not audio:
        raise HTTPException(404, "Audio topilmadi")

    if audio.is_premium and not current_user.is_premium and not current_user.is_admin:
        raise HTTPException(403, "Bu audio faqat premium foydalanuvchilar uchun")

    return {
        "id": audio.id,
        "title": audio.title,
        "description": audio.description,
        "audio_url": audio.audio_url,
        "cover_url": audio.cover_url,
        "duration_sec": audio.duration_sec,
        "duration_str": format_duration(audio.duration_sec),
        "author": audio.author,
        "language": audio.language,
        "is_premium": audio.is_premium,
        "category_id": audio.category_id,
    }

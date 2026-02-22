"""
Auth API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.core.security import verify_telegram_webapp, create_token
from app.core.level_engine import LevelEngine
from app.api.deps import get_current_user
from app.config import settings

router = APIRouter()
level_engine = LevelEngine()


class TelegramAuthRequest(BaseModel):
    init_data: str


class AuthResponse(BaseModel):
    token: str
    user: dict


@router.post("/telegram")
async def telegram_auth(
    data: TelegramAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """Telegram orqali autentifikatsiya"""
    # Verify Telegram data
    telegram_user = verify_telegram_webapp(data.init_data)
    
    if not telegram_user:
        raise HTTPException(status_code=401, detail="Telegram autentifikatsiya xatosi")
    
    telegram_id = telegram_user.get("id")
    
    # Find or create user
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()
    
    if not user:
        # Create new user
        user = User(
            telegram_id=telegram_id,
            username=telegram_user.get("username"),
            full_name=f"{telegram_user.get('first_name', '')} {telegram_user.get('last_name', '')}".strip(),
            photo_url=telegram_user.get("photo_url"),
            is_admin=telegram_id in settings.admin_ids_list
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Update existing user
        user.username = telegram_user.get("username")
        user.full_name = f"{telegram_user.get('first_name', '')} {telegram_user.get('last_name', '')}".strip()
        if telegram_user.get("photo_url"):
            user.photo_url = telegram_user.get("photo_url")
        await db.commit()
    
    # Create token
    token = create_token(user.id)
    
    # Level info
    level_info = level_engine.get_level_info(user.total_xp)
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "telegram_id": user.telegram_id,
            "username": user.username,
            "full_name": user.full_name,
            "photo_url": user.photo_url,
            "total_xp": user.total_xp,
            "level": level_info["level"],
            "level_badge": level_info["badge"],
            "level_title": level_info["title"],
            "level_progress": level_info["progress"],
            "xp_to_next": level_info["xp_to_next"],
            "is_premium": user.is_premium,
            "is_admin": user.is_admin
        }
    }


@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user)
):
    """Current user ma'lumotlari"""
    level_info = level_engine.get_level_info(current_user.total_xp)
    
    return {
        "id": current_user.id,
        "telegram_id": current_user.telegram_id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "photo_url": current_user.photo_url,
        "total_xp": current_user.total_xp,
        "level": level_info["level"],
        "level_badge": level_info["badge"],
        "level_title": level_info["title"],
        "level_progress": level_info["progress"],
        "xp_to_next": level_info["xp_to_next"],
        "streak_days": current_user.streak_days,
        "is_premium": current_user.is_premium,
        "premium_until": current_user.premium_until.isoformat() if current_user.premium_until else None,
        "is_admin": current_user.is_admin,
        "created_at": current_user.created_at.isoformat()
    }

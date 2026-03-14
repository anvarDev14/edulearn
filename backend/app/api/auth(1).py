"""
Auth API - Telegram code-based web login
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
import random
import string
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User
from app.models.login_code import LoginCode
from app.core.security import verify_telegram_webapp, create_token
from app.core.level_engine import LevelEngine
from app.api.deps import get_current_user
from app.config import settings

router = APIRouter()
level_engine = LevelEngine()


def generate_code(length=6) -> str:
    return ''.join(random.choices(string.digits, k=length))


class TelegramAuthRequest(BaseModel):
    init_data: str


class CodeAuthRequest(BaseModel):
    code: str


class GenerateCodeRequest(BaseModel):
    telegram_id: int
    username: str | None = None
    full_name: str | None = None
    photo_url: str | None = None


def build_user_response(user: User) -> dict:
    level_info = level_engine.get_level_info(user.total_xp)
    return {
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
        "streak_days": user.streak_days,
        "is_premium": user.is_premium,
        "premium_until": user.premium_until.isoformat() if user.premium_until else None,
        "is_admin": user.is_admin,
        "created_at": user.created_at.isoformat()
    }


@router.post("/generate-code")
async def generate_login_code(
    data: GenerateCodeRequest,
    db: AsyncSession = Depends(get_db)
):
    """Bot calls this to generate a 6-digit login code"""
    await db.execute(
        delete(LoginCode).where(LoginCode.telegram_id == data.telegram_id)
    )

    result = await db.execute(select(User).where(User.telegram_id == data.telegram_id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            telegram_id=data.telegram_id,
            username=data.username,
            full_name=data.full_name or "User",
            photo_url=data.photo_url,
            is_admin=data.telegram_id in settings.admin_ids_list
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        if data.username:
            user.username = data.username
        if data.full_name:
            user.full_name = data.full_name
        await db.commit()

    code = generate_code(6)
    login_code = LoginCode(
        telegram_id=data.telegram_id,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(login_code)
    await db.commit()
    return {"code": code, "expires_in": 600}


@router.post("/code")
async def login_with_code(
    data: CodeAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """Web login using 6-digit code from Telegram bot"""
    now = datetime.utcnow()
    result = await db.execute(
        select(LoginCode).where(
            LoginCode.code == data.code,
            LoginCode.is_used == False,
            LoginCode.expires_at > now
        )
    )
    login_code = result.scalar_one_or_none()

    if not login_code:
        raise HTTPException(status_code=400, detail="Noto'g'ri yoki muddati o'tgan kod")

    login_code.is_used = True
    await db.commit()

    result = await db.execute(select(User).where(User.telegram_id == login_code.telegram_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")

    token = create_token(user.id)
    return {"token": token, "user": build_user_response(user)}


@router.post("/telegram")
async def telegram_auth(
    data: TelegramAuthRequest,
    db: AsyncSession = Depends(get_db)
):
    """Legacy Telegram WebApp auth"""
    telegram_user = verify_telegram_webapp(data.init_data)
    if not telegram_user:
        raise HTTPException(status_code=401, detail="Telegram autentifikatsiya xatosi")

    telegram_id = telegram_user.get("id")
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()

    if not user:
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
        user.username = telegram_user.get("username")
        user.full_name = f"{telegram_user.get('first_name', '')} {telegram_user.get('last_name', '')}".strip()
        await db.commit()

    token = create_token(user.id)
    return {"token": token, "user": build_user_response(user)}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Current user info"""
    return build_user_response(current_user)

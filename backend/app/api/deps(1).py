"""
API Dependencies
"""
from fastapi import Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.core.security import verify_token


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Current user olish"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Token kerak")
    
    try:
        token = authorization.replace("Bearer ", "")
        user_id = verify_token(token)
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Token yaroqsiz")
        
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=401, detail="User topilmadi")
        
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Akkount bloklangan")
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Autentifikatsiya xatosi")


async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Admin tekshirish"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin huquqi kerak")
    return current_user


async def get_premium_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Premium user tekshirish"""
    # Premium foydalanuvchi yoki admin
    if current_user.is_admin:
        return current_user
    
    if not current_user.is_premium:
        raise HTTPException(
            status_code=403, 
            detail={
                "error": "premium_required",
                "message": "Bu kontent faqat Premium foydalanuvchilar uchun"
            }
        )
    return current_user

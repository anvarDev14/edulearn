"""
Challenges API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.challenge import Challenge, UserChallenge
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/")
async def get_challenges(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    now = datetime.utcnow()
    result = await db.execute(
        select(Challenge).where(
            Challenge.is_active == True
        )
    )
    challenges = result.scalars().all()

    output = []
    for ch in challenges:
        # Get user progress on this challenge
        uc_result = await db.execute(
            select(UserChallenge).where(
                UserChallenge.user_id == current_user.id,
                UserChallenge.challenge_id == ch.id
            )
        )
        uc = uc_result.scalar_one_or_none()

        output.append({
            "id": ch.id,
            "title": ch.title,
            "description": ch.description,
            "challenge_type": ch.challenge_type,
            "xp_reward": ch.xp_reward,
            "target_count": ch.target_count,
            "icon": ch.icon,
            "expires_at": ch.expires_at.isoformat() if ch.expires_at else None,
            "user_progress": {
                "current_count": uc.current_count if uc else 0,
                "is_completed": uc.is_completed if uc else False,
                "completed_at": uc.completed_at.isoformat() if uc and uc.completed_at else None
            }
        })
    return output


@router.get("/active")
async def get_active_challenges(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get only incomplete challenges for current user"""
    result = await db.execute(
        select(Challenge).where(Challenge.is_active == True)
    )
    challenges = result.scalars().all()

    output = []
    for ch in challenges:
        uc_result = await db.execute(
            select(UserChallenge).where(
                UserChallenge.user_id == current_user.id,
                UserChallenge.challenge_id == ch.id,
                UserChallenge.is_completed == False
            )
        )
        uc = uc_result.scalar_one_or_none()
        if not uc:
            # Not started yet or not completed
            output.append({
                "id": ch.id,
                "title": ch.title,
                "description": ch.description,
                "challenge_type": ch.challenge_type,
                "xp_reward": ch.xp_reward,
                "target_count": ch.target_count,
                "icon": ch.icon,
                "current_count": 0,
                "is_completed": False
            })
    return output

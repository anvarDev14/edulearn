"""
Friends API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from app.database import get_db
from app.models.user import User
from app.models.friendship import Friendship
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/")
async def get_friends(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get accepted friends list"""
    result = await db.execute(
        select(Friendship).where(
            or_(
                and_(Friendship.requester_id == current_user.id, Friendship.status == "accepted"),
                and_(Friendship.receiver_id == current_user.id, Friendship.status == "accepted")
            )
        )
    )
    friendships = result.scalars().all()

    friends = []
    for f in friendships:
        friend_id = f.receiver_id if f.requester_id == current_user.id else f.requester_id
        user_result = await db.execute(select(User).where(User.id == friend_id))
        friend = user_result.scalar_one_or_none()
        if friend:
            friends.append({
                "id": friend.id,
                "username": friend.username,
                "full_name": friend.full_name,
                "photo_url": friend.photo_url,
                "total_xp": friend.total_xp,
                "level": friend.level,
                "is_premium": friend.is_premium,
                "friendship_id": f.id
            })
    return friends


@router.get("/search")
async def search_users(
    q: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Search users to add as friends, excluding self, existing friends, and pending requests"""
    if not q.strip():
        return []

    q_pattern = f"%{q.strip().lower()}%"

    # Get all existing friendship user IDs (both directions)
    friendships_result = await db.execute(
        select(Friendship).where(
            or_(
                Friendship.requester_id == current_user.id,
                Friendship.receiver_id == current_user.id
            )
        )
    )
    friendships = friendships_result.scalars().all()

    excluded_ids = {current_user.id}
    for f in friendships:
        excluded_ids.add(f.requester_id)
        excluded_ids.add(f.receiver_id)

    users_result = await db.execute(
        select(User).where(
            and_(
                ~User.id.in_(excluded_ids),
                User.is_active == True,
                or_(
                    User.username.ilike(q_pattern),
                    User.full_name.ilike(q_pattern)
                )
            )
        ).limit(10)
    )
    users = users_result.scalars().all()

    return [
        {
            "id": u.id,
            "username": u.username,
            "full_name": u.full_name,
            "photo_url": u.photo_url,
            "total_xp": u.total_xp,
            "level": u.level,
        }
        for u in users
    ]


@router.get("/requests")
async def get_friend_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get pending friend requests"""
    result = await db.execute(
        select(Friendship).where(
            Friendship.receiver_id == current_user.id,
            Friendship.status == "pending"
        )
    )
    requests = result.scalars().all()

    output = []
    for f in requests:
        user_result = await db.execute(select(User).where(User.id == f.requester_id))
        requester = user_result.scalar_one_or_none()
        if requester:
            output.append({
                "friendship_id": f.id,
                "user": {
                    "id": requester.id,
                    "username": requester.username,
                    "full_name": requester.full_name,
                    "photo_url": requester.photo_url,
                    "total_xp": requester.total_xp,
                    "level": requester.level
                }
            })
    return output


@router.post("/request/{user_id}")
async def send_friend_request(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="O'zingizga do'stlik so'rovi yubora olmaysiz")

    # Check existing
    result = await db.execute(
        select(Friendship).where(
            or_(
                and_(Friendship.requester_id == current_user.id, Friendship.receiver_id == user_id),
                and_(Friendship.requester_id == user_id, Friendship.receiver_id == current_user.id)
            )
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Do'stlik so'rovi allaqachon yuborilgan")

    friendship = Friendship(requester_id=current_user.id, receiver_id=user_id, status="pending")
    db.add(friendship)
    await db.commit()
    return {"message": "Do'stlik so'rovi yuborildi"}


@router.post("/accept/{friendship_id}")
async def accept_friend_request(
    friendship_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Friendship).where(
            Friendship.id == friendship_id,
            Friendship.receiver_id == current_user.id,
            Friendship.status == "pending"
        )
    )
    friendship = result.scalar_one_or_none()
    if not friendship:
        raise HTTPException(status_code=404, detail="So'rov topilmadi")

    friendship.status = "accepted"
    await db.commit()
    return {"message": "Do'stlik so'rovi qabul qilindi"}


@router.delete("/{friendship_id}")
async def remove_friend(
    friendship_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Friendship).where(
            Friendship.id == friendship_id,
            or_(
                Friendship.requester_id == current_user.id,
                Friendship.receiver_id == current_user.id
            )
        )
    )
    friendship = result.scalar_one_or_none()
    if not friendship:
        raise HTTPException(status_code=404, detail="Topilmadi")

    await db.delete(friendship)
    await db.commit()
    return {"message": "Do'stlikdan o'chirildi"}

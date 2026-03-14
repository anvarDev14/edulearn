"""
Bookmarks API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.bookmark import Bookmark
from app.api.deps import get_current_user

router = APIRouter()


class BookmarkCreate(BaseModel):
    content_type: str  # lesson, quiz, module
    content_id: int
    title: str


@router.get("/")
async def get_bookmarks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Bookmark).where(Bookmark.user_id == current_user.id).order_by(Bookmark.created_at.desc())
    )
    return result.scalars().all()


@router.post("/")
async def add_bookmark(
    data: BookmarkCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check duplicate
    result = await db.execute(
        select(Bookmark).where(
            and_(
                Bookmark.user_id == current_user.id,
                Bookmark.content_type == data.content_type,
                Bookmark.content_id == data.content_id
            )
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bu allaqachon saqlangan")

    bookmark = Bookmark(
        user_id=current_user.id,
        content_type=data.content_type,
        content_id=data.content_id,
        title=data.title
    )
    db.add(bookmark)
    await db.commit()
    await db.refresh(bookmark)
    return bookmark


@router.delete("/{bookmark_id}")
async def remove_bookmark(
    bookmark_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Bookmark).where(
            Bookmark.id == bookmark_id,
            Bookmark.user_id == current_user.id
        )
    )
    bookmark = result.scalar_one_or_none()
    if not bookmark:
        raise HTTPException(status_code=404, detail="Topilmadi")

    await db.delete(bookmark)
    await db.commit()
    return {"message": "Saqlangandan o'chirildi"}

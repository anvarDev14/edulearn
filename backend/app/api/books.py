"""
Books Library API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.models.book import BookCategory, Book
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/categories")
async def get_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Kitob kategoriyalar ro'yxati"""
    result = await db.execute(
        select(BookCategory)
        .where(BookCategory.is_active == True)
        .order_by(BookCategory.order_index)
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
async def get_category_books(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Kategoriya va uning kitoblari"""
    result = await db.execute(
        select(BookCategory).where(BookCategory.id == category_id)
    )
    category = result.scalar_one_or_none()

    if not category:
        raise HTTPException(404, "Kategoriya topilmadi")

    result = await db.execute(
        select(Book)
        .where(Book.category_id == category_id, Book.is_active == True)
        .order_by(Book.order_index)
    )
    books = result.scalars().all()

    return {
        "category": {
            "id": category.id,
            "title": category.title,
            "description": category.description,
            "emoji": category.emoji,
        },
        "books": [
            {
                "id": b.id,
                "title": b.title,
                "description": b.description,
                "cover_url": b.cover_url,
                "file_url": b.file_url,
                "author": b.author,
                "language": b.language,
                "pages": b.pages,
                "is_premium": b.is_premium,
            }
            for b in books
        ]
    }


@router.get("/{book_id}")
async def get_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Kitob batafsil"""
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()

    if not book:
        raise HTTPException(404, "Kitob topilmadi")

    if book.is_premium and not current_user.is_premium and not current_user.is_admin:
        raise HTTPException(403, "Bu kitob faqat premium foydalanuvchilar uchun")

    return {
        "id": book.id,
        "title": book.title,
        "description": book.description,
        "cover_url": book.cover_url,
        "file_url": book.file_url,
        "author": book.author,
        "language": book.language,
        "pages": book.pages,
        "is_premium": book.is_premium,
        "category_id": book.category_id,
    }
